"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useInterwovenKit } from "@initia/interwovenkit-react";
import LudoBoardWrapper from "@/components/LudoBoardWrapper";
import Dice, { DiceHandle } from "@/components/Dice";
import Navbar from "@/components/Navbar";
import LiveChat from "@/components/LiveChat";

import { useLanguage } from "@/context/LanguageContext";

if (globalThis.window !== undefined) {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}
import { useLudoGame } from "@/hooks/useLudoGame";
import { GameMode } from "@/types/ludo";
import {
  buildCreateGamePayload,
  createGameSession,
  CreateGameMovePayload,
  modeToMaxPlayers,
} from "@/lib/gameContractAdapter";
import {
  commitDiceRoom,
  getDiceRoomHistory,
  DiceRollResponse,
  registerDicePlayerSeed,
  revealDiceRoom,
  rollDiceFromServer,
} from "@/lib/diceRealtimeApi";
import { connectGameRealtime } from "@/lib/gameRealtimeSocket";
import { sha256Hex, verifyDiceRoll } from "@/lib/diceFairness";
import { claimWinnerNft } from "@/lib/rewardApi";

type ModeOption = {
  mode: GameMode;
  title: string;
  subtitle: string;
  accent: string;
  summary: string;
  details: string;
};

const MODE_OPTIONS: Pick<ModeOption, "mode" | "accent">[] = [
  {
    mode: "2player",
    accent: "from-[#2563EB] via-[#8B5CF6] to-[#22C55E]",
  },
  {
    mode: "4player",
    accent: "from-[#F97316] via-[#EF4444] to-[#EAB308]",
  },
];

const TURN_COLORS: Record<string, string> = {
  blue: "#1C489E",
  red: "#DF1921",
  green: "#0B9B43",
  yellow: "#D97706",
};

const DUMMY_START_BALANCE_USD = 20;
const FEE_RATE = 0.05;
const PRESET_STAKES_USD = [1, 2, 5, 10];
const DEFAULT_MATCH_MODE: GameMode = "2player";
const DEFAULT_MATCH_STAKE_USD = 1;

type ActiveSession = {
  mode: GameMode;
  stakeUsd: number;
  id: number;
  sessionRef: string;
  txHash: string;
  chainStakeUnits: number;
  maxPlayers: 2 | 4;
  createPayload: CreateGameMovePayload;
};

type SettlementSummary = {
  stakeUsd: number;
  totalPotUsd: number;
  taxUsd: number;
  winnerPayoutUsd: number;
  playerWon: boolean;
};

const formatUsd = (value: number) => `$${value.toFixed(2)}`;
const roundUsd = (value: number) => Number(value.toFixed(2));
const createSessionRef = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};
const normalizeNumber = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};
const createGuestWalletAddress = (): string => `init1${Math.random().toString(36).slice(2, 14)}`;

function GameScreen({
  mode,
  stakeUsd,
  chainStakeUnits,
  maxPlayers,
  sessionRef,
  txHash,
  createPayload,
  balanceUsd,
  onBackToMenu,
  onGameSettled,
  onRequestRematchStake,
}: {
  mode: GameMode;
  stakeUsd: number;
  chainStakeUnits: number;
  maxPlayers: 2 | 4;
  sessionRef: string;
  txHash: string;
  createPayload: CreateGameMovePayload;
  balanceUsd: number;
  onBackToMenu: () => void;
  onGameSettled: (summary: SettlementSummary) => void;
  onRequestRematchStake: (stakeUsd: number, mode: GameMode) => Promise<{ ok: boolean; message?: string }>;
}) {
  const { t } = useLanguage();
  const {
    state,
    cfg,
    handleDiceResult,
    handlePawnClick,
    runBotTurn,
    executeBotMove,
    getValidMoves,
  } = useLudoGame(mode);
  const diceRef = useRef<DiceHandle>(null);

  const currentPlayerCfg = cfg.players.find((p) => p.color === state.currentPlayer);
  const pendingPlayerCfg = state.pendingPlayer
    ? cfg.players.find((p) => p.color === state.pendingPlayer)
    : null;
  const isBot = currentPlayerCfg?.type === "bot";
  const displayedDiceValue = state.diceValue ?? state.lastRolledValue;
  const turnColor = TURN_COLORS[state.currentPlayer] ?? "#6D28D9";
  const currentTurnLabel = currentPlayerCfg?.label ?? state.currentPlayer;
  const totalPlayers = cfg.players.filter((p) => p.active).length;
  const totalPotUsd = roundUsd(totalPlayers * stakeUsd);
  const taxUsd = roundUsd(totalPotUsd * FEE_RATE);
  const winnerPayoutUsd = roundUsd(totalPotUsd - taxUsd);
  const humanPlayer = cfg.players.find((p) => p.type === "human" && p.active);
  const playerWon = humanPlayer ? state.winner === humanPlayer.color : false;
  const settlementReportedRef = useRef(false);
  const revealReportedRef = useRef(false);
  const processedNonceRef = useRef<Set<number>>(new Set());
  const [restartNotice, setRestartNotice] = useState<string | null>(null);
  const [isRematchStarting, setIsRematchStarting] = useState(false);
  const [isDiceSyncReady, setIsDiceSyncReady] = useState(false);
  const [isServerRollPending, setIsServerRollPending] = useState(false);
  const [diceSyncNotice, setDiceSyncNotice] = useState<string | null>(null);
  const [fairnessNotice, setFairnessNotice] = useState<string | null>(null);
  const [guestWalletAddress, setGuestWalletAddress] = useState("");
  const [isClaimingWinnerNft, setIsClaimingWinnerNft] = useState(false);
  const [winnerNftClaimNotice, setWinnerNftClaimNotice] = useState<string | null>(null);
  const [winnerNftClaimed, setWinnerNftClaimed] = useState(false);
  const { address, initiaAddress, username } = useInterwovenKit();

  const applyServerRoll = useCallback((roll: DiceRollResponse) => {
    if (state.phase !== "waiting_roll") return;
    if (processedNonceRef.current.has(roll.nonce)) return;
    processedNonceRef.current.add(roll.nonce);
    diceRef.current?.rollDice(roll.dice_value);
  }, [state.phase]);

  const requestServerRoll = useCallback(async () => {
    if (!isDiceSyncReady || isServerRollPending) return;

    setIsServerRollPending(true);
    try {
      const payload = await rollDiceFromServer(sessionRef, state.currentPlayer);
      applyServerRoll(payload);
      setDiceSyncNotice(null);
    } catch {
      setDiceSyncNotice("Failed to fetch dice result from backend.");
    } finally {
      setIsServerRollPending(false);
    }
  }, [applyServerRoll, isDiceSyncReady, isServerRollPending, sessionRef, state.currentPlayer]);

  useEffect(() => {
    let cancelled = false;

    processedNonceRef.current.clear();
    setIsDiceSyncReady(false);
    setDiceSyncNotice("Syncing fair dice room...");
    setFairnessNotice(null);

    const bootstrap = async () => {
      try {
        const commitPayload = await commitDiceRoom(sessionRef);
        const activePlayerKeys = cfg.players.filter((player) => player.active).map((player) => player.color);

        await Promise.all(activePlayerKeys.map((playerKey) => registerDicePlayerSeed(sessionRef, playerKey)));

        if (cancelled) return;

        setIsDiceSyncReady(true);
        setDiceSyncNotice(`Fair dice ready (${commitPayload.server_seed_hash.slice(0, 10)}...)`);
      } catch {
        if (cancelled) return;
        setDiceSyncNotice("Failed to sync fair dice. Check backend connection.");
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [cfg.players, sessionRef]);

  useEffect(() => {
    return connectGameRealtime(sessionRef, (eventName, payload) => {
      if (eventName !== "dice.rolled") return;

      const nonce = normalizeNumber(payload.nonce);
      const diceValue = normalizeNumber(payload.dice_value);
      const playerKey = typeof payload.player_key === "string" ? payload.player_key : null;
      const serverSeedHash = typeof payload.server_seed_hash === "string" ? payload.server_seed_hash : "";
      const resultHash = typeof payload.result_hash === "string" ? payload.result_hash : "";

      if (!nonce || !diceValue || !playerKey) return;
      if (diceValue < 1 || diceValue > 6) return;

      applyServerRoll({
        room_id: sessionRef,
        player_key: playerKey,
        server_seed_hash: serverSeedHash,
        nonce,
        result_hash: resultHash,
        dice_value: diceValue,
      });
    });
  }, [applyServerRoll, sessionRef]);

  useEffect(() => {
    if (state.phase === "waiting_roll" && isBot && isDiceSyncReady && !isServerRollPending) {
      const timer = setTimeout(() => {
        void requestServerRoll();
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (state.phase === "bot_thinking" && isBot) {
      const timer = setTimeout(() => {
        runBotTurn(state.diceValue!);
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (state.phase === "bot_moving" && isBot) {
      const timer = setTimeout(() => {
        executeBotMove();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.phase, isBot, runBotTurn, executeBotMove, state.diceValue, isDiceSyncReady, isServerRollPending, requestServerRoll]);

  useEffect(() => {
    if (state.phase !== "game_over" || settlementReportedRef.current) return;
    settlementReportedRef.current = true;
    onGameSettled({
      stakeUsd,
      totalPotUsd,
      taxUsd,
      winnerPayoutUsd,
      playerWon,
    });
  }, [state.phase, onGameSettled, stakeUsd, totalPotUsd, taxUsd, winnerPayoutUsd, playerWon]);

  useEffect(() => {
    if (state.phase !== "game_over" || revealReportedRef.current) return;
    revealReportedRef.current = true;

    const runRevealAndVerify = async () => {
      try {
        const revealed = await revealDiceRoom(sessionRef);
        const localHash = await sha256Hex(revealed.server_seed);
        if (localHash !== revealed.server_seed_hash) {
          setFairnessNotice("Fairness failed: reveal hash mismatch.");
          return;
        }

        const history = await getDiceRoomHistory(sessionRef);
        const checks = await Promise.all(history.rolls.map((roll) => verifyDiceRoll(revealed.server_seed, roll)));
        const allValid = checks.every((check) => check.hashMatches && check.diceMatches);

        setFairnessNotice(allValid ? "Fairness check passed for all dice rolls." : "Fairness check failed for one or more rolls.");
      } catch {
        setFairnessNotice("Fairness verification unavailable (backend/network issue).");
      }
    };

    void runRevealAndVerify();
  }, [sessionRef, state.phase]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storageKey = "paradice_guest_wallet";
    const existing = window.localStorage.getItem(storageKey);

    if (existing) {
      setGuestWalletAddress(existing);
      return;
    }

    const generated = createGuestWalletAddress();
    window.localStorage.setItem(storageKey, generated);
    setGuestWalletAddress(generated);
  }, []);

  const winnerWalletAddress = (initiaAddress || address || guestWalletAddress || "").trim();
  const winnerUsername = (username || "Paradice Player").trim();

  const isPlayerTurn = currentPlayerCfg?.type === "human";
  const canRoll = isPlayerTurn && state.phase === "waiting_roll" && isDiceSyncReady && !isServerRollPending;
  const validMoves =
    state.phase === "waiting_move" && state.diceValue
      ? getValidMoves(state.pawns, state.currentPlayer, state.diceValue)
      : [];
  const movablePawnIds = validMoves.map((m) => m.pawn.id);
  const modeLabel = mode === "2player" ? "2 Players" : "4 Players";
  const diceMessage = !isDiceSyncReady
    ? "SYNCING..."
    : isServerRollPending
      ? "WAITING SERVER..."
      : isBot
        ? "BOT TURN"
        : (canRoll ? "HOLD TO ROLL" : "WAITING...");
  const compactSessionRef =
    sessionRef.length > 16 ? `${sessionRef.slice(0, 12)}...` : sessionRef;
  const compactTxHash =
    txHash.length > 16 ? `${txHash.slice(0, 12)}...${txHash.slice(-4)}` : txHash;

  const handleClaimWinnerNft = useCallback(async () => {
    if (state.phase !== "game_over" || !playerWon) return;
    if (!winnerWalletAddress) {
      setWinnerNftClaimNotice("Wallet belum terdeteksi. Silakan connect wallet dulu.");
      return;
    }

    setIsClaimingWinnerNft(true);
    setWinnerNftClaimNotice(null);

    try {
      const response = await claimWinnerNft({
        walletAddress: winnerWalletAddress,
        username: winnerUsername,
        sessionRef,
        mode,
        stakeUsd,
        playerWon,
      });

      setWinnerNftClaimed(true);
      setWinnerNftClaimNotice(
        response.already_claimed
          ? `Winner NFT sudah pernah diklaim. Tx: ${response.mint_tx_hash}`
          : `Winner NFT berhasil di-mint. Tx: ${response.mint_tx_hash}`
      );
    } catch (error) {
      setWinnerNftClaimNotice(error instanceof Error ? error.message : "Gagal claim winner NFT.");
    } finally {
      setIsClaimingWinnerNft(false);
    }
  }, [mode, playerWon, sessionRef, stakeUsd, state.phase, winnerUsername, winnerWalletAddress]);

  const handleRestart = async () => {
    setIsRematchStarting(true);
    const result = await onRequestRematchStake(stakeUsd, mode);

    if (!result.ok) {
      setIsRematchStarting(false);
      setRestartNotice(result.message ?? `Saldo dummy tidak cukup. Butuh ${formatUsd(stakeUsd)} untuk rematch.`);
      return;
    }

    settlementReportedRef.current = false;
    revealReportedRef.current = false;
    processedNonceRef.current.clear();
    setRestartNotice(null);
    setFairnessNotice(null);
    setWinnerNftClaimed(false);
    setWinnerNftClaimNotice(null);
  };

  return (
    <div className="flex min-h-screen flex-col pt-20 bg-[#0a0520] relative overflow-hidden text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.15),_transparent_50%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.1),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
      </div>
      <Navbar balanceUsd={balanceUsd} />

      <div
        className={`w-full px-4 py-2 text-center text-xs font-black tracking-[0.3em] uppercase ${isPlayerTurn ? "bg-blue-500/10 text-blue-300 border-y border-blue-500/20" : "bg-emerald-500/10 text-emerald-300 border-y border-emerald-500/20"
          } backdrop-blur-md relative z-10`}
      >
        {state.message}
      </div>

      <main className="mx-auto grid w-full max-w-[1600px] flex-1 gap-6 px-4 py-6 lg:px-6 xl:grid-cols-[360px_minmax(0,1fr)_320px] xl:items-start relative z-10">
        <section className="w-full rounded-[2.5rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-3xl">
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-400">
                Live Match
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white">
                {modeLabel}
              </h2>
            </div>
            <button
              onClick={handleRestart}
              disabled={isRematchStarting}
              className="rounded-full bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-70 border border-white/10"
            >
              {isRematchStarting ? "Starting..." : "Rematch"}
            </button>
          </div>
          {restartNotice && (
            <p className="mb-4 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300">
              {restartNotice}
            </p>
          )}
          {diceSyncNotice && (
            <p className="mb-4 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-200">
              {diceSyncNotice}
            </p>
          )}
          {fairnessNotice && (
            <p className={`mb-4 rounded-xl border px-3 py-2 text-xs font-semibold ${fairnessNotice.includes("passed")
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                : "border-rose-400/30 bg-rose-500/10 text-rose-200"
              }`}>
              {fairnessNotice}
            </p>
          )}

          <div
            className="mb-5 rounded-[1.75rem] border bg-white/5 p-4 shadow-inner"
            style={{
              borderColor: `${turnColor}44`,
            }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
              Current Turn
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span
                className="h-4 w-4 rounded-full ring-4 ring-white/10"
                style={{ backgroundColor: turnColor }}
              />
              <div>
                <p className="text-2xl font-black tracking-tight text-white">
                  {currentTurnLabel}
                </p>
                <p className="text-[11px] font-semibold text-white/50">
                  {currentPlayerCfg?.type === "human" ? "Your move is live now." : `${currentTurnLabel} is making a move.`}
                </p>
              </div>
            </div>
            {pendingPlayerCfg && (
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                Up next: <span className="text-white/60">{pendingPlayerCfg.label}</span>
              </p>
            )}
          </div>

          <Dice
            ref={diceRef}
            onRollResult={handleDiceResult}
            disabled={!canRoll}
            value={displayedDiceValue}
            isBot={isBot}
            message={diceMessage}
            serverAuthoritative
            onRollRequest={requestServerRoll}
          />

          <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-xs text-white/70">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white/40 uppercase tracking-widest text-[9px]">Phase</span>
              <strong className="font-mono text-cyan-400">{state.phase}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white/40 uppercase tracking-widest text-[9px]">Player</span>
              <strong className="font-mono capitalize text-white">{state.currentPlayer}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white/40 uppercase tracking-widest text-[9px]">Dice</span>
              <strong className="font-mono text-white">{displayedDiceValue ?? "-"}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white/40 uppercase tracking-widest text-[9px]">Movable</span>
              <strong className="font-mono text-white">
                {movablePawnIds.join(", ") || "none"}
              </strong>
            </div>
          </div>

          {state.phase === "game_over" && (
            <>
              <div
                className={`mt-4 rounded-[1.25rem] border px-4 py-3 text-sm font-semibold ${playerWon
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-rose-500/40 bg-rose-500/10 text-rose-300"
                  }`}
              >
                {playerWon
                  ? t('bet_win_toast').replace('${amount}', formatUsd(winnerPayoutUsd))
                  : t('bet_lose_toast').replace('${amount}', formatUsd(stakeUsd))}
              </div>

              {playerWon && (
                <div className="mt-3 rounded-[1.25rem] border border-amber-400/35 bg-amber-500/10 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">Winner NFT</p>
                      <p className="mt-1 text-xs font-semibold text-amber-100/90">Klaim NFT pemenang untuk match ini.</p>
                    </div>
                    <button
                      onClick={() => void handleClaimWinnerNft()}
                      disabled={winnerNftClaimed || isClaimingWinnerNft}
                      className="rounded-full border border-amber-300/40 bg-amber-400/20 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-amber-100 transition hover:bg-amber-300/30 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {winnerNftClaimed ? "Claimed" : isClaimingWinnerNft ? "Claiming..." : "Claim NFT"}
                    </button>
                  </div>
                  {winnerNftClaimNotice && (
                    <p className="mt-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold text-white/85">
                      {winnerNftClaimNotice}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        <section className="flex w-full justify-center xl:justify-start relative">
          <LudoBoardWrapper
            gameState={state}
            cfg={cfg}
            movablePawnIds={movablePawnIds}
            onPawnClick={handlePawnClick}
          />
        </section>

        <aside className="w-full xl:w-[320px] xl:justify-self-end flex flex-col gap-6">
          <LiveChat />
          
          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/40">
                Payload
              </p>
              <div className="mt-3 grid gap-2 text-[11px] text-white/60">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">Session</span>
                  <strong className="font-mono text-cyan-400">{compactSessionRef}</strong>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">Tx</span>
                  <strong className="font-mono text-emerald-400">{compactTxHash}</strong>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">Call</span>
                  <strong className="font-mono text-white/80">{createPayload.functionName}</strong>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-md hidden md:block">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/40">
                Bet Info
              </p>
              <div className="mt-3 grid gap-2 text-[11px] text-white/60">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Stake</span>
                  <strong className="font-black text-white">{formatUsd(stakeUsd)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Pot</span>
                  <strong className="font-black text-emerald-400">{formatUsd(totalPotUsd)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Payout</span>
                  <strong className="font-black text-orange-400">{formatUsd(winnerPayoutUsd)}</strong>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function StatsSection() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLElement>(null);
  useGSAP(() => {
    if (!containerRef.current) return;
    gsap.fromTo(".stat-card",
      { opacity: 0, x: (index) => (index % 2 === 0 ? -80 : 80) },
      {
        opacity: 1, x: 0, duration: 0.7, stagger: 0.1, ease: "power2.out",
        scrollTrigger: { trigger: containerRef.current, start: "top 85%", toggleActions: "play none none reset" }
      }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 md:px-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
        <div className="stat-card rounded-[1.5rem] bg-gradient-to-br from-[#FF7A45] to-[#FF4D4F] p-5 text-white shadow-lg transition hover:-translate-y-1 border border-white/20 backdrop-blur">
          <div className="mb-4 text-2xl">👥</div>
          <p className="text-xs font-black uppercase tracking-widest text-white/85">{t('st_active')}</p>
          <h4 className="mt-1 text-3xl font-black drop-shadow-md">12.5K</h4>
        </div>
        <div className="stat-card rounded-[1.5rem] bg-gradient-to-br from-[#06B6D4] to-[#10B981] p-5 text-white shadow-lg transition hover:-translate-y-1 border border-white/20 backdrop-blur">
          <div className="mb-4 text-2xl">🎮</div>
          <p className="text-xs font-black uppercase tracking-widest text-white/85">{t('st_today')}</p>
          <h4 className="mt-1 text-3xl font-black drop-shadow-md">48.2K</h4>
        </div>
        <div className="stat-card rounded-[1.5rem] bg-gradient-to-br from-[#F59E0B] to-[#EF4444] p-5 text-white shadow-lg transition hover:-translate-y-1 border border-white/20 backdrop-blur">
          <div className="mb-4 text-2xl">💰</div>
          <p className="text-xs font-black uppercase tracking-widest text-white/85">{t('st_total_win')}</p>
          <h4 className="mt-1 text-3xl font-black drop-shadow-md">$2.4M</h4>
        </div>
        <div className="stat-card rounded-[1.5rem] bg-gradient-to-br from-[#10B981] to-[#06B6D4] p-5 text-white shadow-lg transition hover:-translate-y-1 border border-white/20 backdrop-blur">
          <div className="mb-4 text-2xl">📈</div>
          <p className="text-xs font-black uppercase tracking-widest text-white/85">{t('st_win_rate')}</p>
          <h4 className="mt-1 text-3xl font-black drop-shadow-md">42.5%</h4>
        </div>
      </div>
    </section>
  );
}

function PrizePoolSection() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLElement>(null);
  useGSAP(() => {
    gsap.fromTo(".prize-item",
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power2.out", scrollTrigger: { trigger: containerRef.current, start: "top 80%", toggleActions: "play none none reset" } }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative z-10 mx-auto w-full max-w-7xl px-4 py-14 md:px-8">
      <div className="mb-10 text-center">
        <span className="inline-block rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-300 backdrop-blur">{t('pz_transparency')}</span>
        <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">{t('pz_title_1')} <span className="bg-gradient-to-r from-emerald-300 to-cyan-400 bg-clip-text text-transparent">{t('pz_title_2')}</span></h2>
        <p className="mt-2 text-white/55 font-medium">{t('pz_desc')}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="prize-item rounded-[1.75rem] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
          <div className="text-3xl mb-3">🏆</div>
          <p className="text-xs font-black uppercase tracking-widest text-white/50">{t('pz_pot_label')}</p>
          <h3 className="mt-1 text-4xl font-black text-white">$40.00</h3>
          <p className="mt-2 text-sm text-white/50">{t('pz_pot_desc')}</p>
          <div className="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-300">⛓️ On-chain: create_game(mode, stake)</div>
        </div>
        <div className="prize-item rounded-[1.75rem] border border-rose-400/20 bg-rose-500/10 p-6 backdrop-blur-xl">
          <div className="text-3xl mb-3">🧳</div>
          <p className="text-xs font-black uppercase tracking-widest text-rose-300/70">{t('pz_fee_label')}</p>
          <h3 className="mt-1 text-4xl font-black text-rose-300">5%</h3>
          <p className="mt-2 text-sm text-white/50">{t('pz_fee_desc')}</p>
          <div className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-300">⛓️ On-chain: fee_bps = 500</div>
        </div>
        <div className="prize-item rounded-[1.75rem] border border-amber-400/20 bg-amber-500/10 p-6 backdrop-blur-xl">
          <div className="text-3xl mb-3">💸</div>
          <p className="text-xs font-black uppercase tracking-widest text-amber-300/70">{t('pz_win_label')}</p>
          <h3 className="mt-1 text-4xl font-black text-amber-300">$38.00</h3>
          <p className="mt-2 text-sm text-white/50">{t('pz_win_desc')}</p>
          <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs font-semibold text-amber-300">⛓️ On-chain: settle_game(winner)</div>
        </div>
      </div>
      <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
        <p className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-3">{t('tx_realtime')}</p>
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { label: t('tx_block_height'), val: "#4,821,003", color: "text-cyan-300" },
            { label: t('tx_contract'), val: "initia1...a8f9", color: "text-purple-300" },
            { label: t('tx_status'), val: t('tx_confirmed'), color: "text-emerald-300" },
            { label: t('tx_gas'), val: "0.00042 INIT", color: "text-amber-300" },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white/40">{label}</span>
              <span className={`font-black text-sm ${color}`}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MatchHistorySection() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLElement>(null);
  const matches = [
    { id: "0xa1f3", mode: "4P", stake: "$5.00", result: "WIN", payout: "+$19.00", nft: true, time: "2m ago" },
    { id: "0xb2e4", mode: "2P", stake: "$2.00", result: "LOSS", payout: "-$2.00", nft: false, time: "15m ago" },
    { id: "0xc5d9", mode: "4P", stake: "$10.00", result: "WIN", payout: "+$38.00", nft: true, time: "1h ago" },
    { id: "0xd7e1", mode: "2P", stake: "$1.00", result: "LOSS", payout: "-$1.00", nft: false, time: "3h ago" },
    { id: "0xe9f2", mode: "4P", stake: "$5.00", result: "WIN", payout: "+$19.00", nft: true, time: "5h ago" },
  ];

  useGSAP(() => {
    gsap.fromTo(".match-row",
      { opacity: 0, x: -60 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.08, ease: "power2.out", scrollTrigger: { trigger: containerRef.current, start: "top 80%", toggleActions: "play none none reset" } }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative z-10 mx-auto w-full max-w-7xl px-4 py-14 md:px-8">
      <div className="mb-10 text-center md:text-left">
        <span className="inline-block rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.4em] text-blue-300 backdrop-blur">{t('tx_onchain')}</span>
        <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">{t('tx_match_history')}</h2>
        <p className="mt-2 text-white/55 font-medium">{t('tx_history_desc')}</p>
      </div>
      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="grid grid-cols-7 gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/10">
          <span className="col-span-2">{t('tx_hash')}</span>
          <span>{t('tx_mode')}</span>
          <span>{t('tx_stake')}</span>
          <span>{t('tx_result')}</span>
          <span>{t('tx_payout')}</span>
          <span>{t('tx_nft')}</span>
        </div>
        {matches.map((m) => (
          <div key={m.id} className="match-row grid grid-cols-7 gap-2 items-center px-5 py-4 text-sm border-b border-white/5 hover:bg-white/5 transition-colors">
            <span className="col-span-2 font-mono text-xs text-purple-300">{m.id}...{" "}<span className="text-white/30">{m.time}</span></span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-black text-white/70 w-fit">{m.mode}</span>
            <span className="font-semibold text-white/70">{m.stake}</span>
            <span className={`font-black text-xs rounded-full px-2 py-1 w-fit ${m.result === "WIN" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>{m.result}</span>
            <span className={`font-black ${m.result === "WIN" ? "text-emerald-300" : "text-rose-400"}`}>{m.payout}</span>
            <span>{m.nft ? <span className="text-lg" title="NFT Earned">🎨</span> : <span className="text-white/20">—</span>}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <button className="rounded-full border border-white/20 bg-white/10 px-6 py-2.5 text-sm font-black text-white/70 backdrop-blur transition hover:bg-white/20 hover:text-white">
          {t('tx_view_explorer')}
        </button>
      </div>
    </section>
  );
}

function LeaderboardSection() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLElement>(null);
  const [tab, setTab] = useState<"weekly" | "monthly">("weekly");

  const weekly = [
    { rank: 1, wallet: "0xA1b2...9f", wins: 47, earnings: "$842", nfts: 12 },
    { rank: 2, wallet: "0xC3d4...7e", wins: 41, earnings: "$720", nfts: 9 },
    { rank: 3, wallet: "0xE5f6...3a", wins: 38, earnings: "$614", nfts: 8 },
    { rank: 4, wallet: "0xG7h8...1c", wins: 31, earnings: "$501", nfts: 6 },
    { rank: 5, wallet: "0xI9j0...5b", wins: 29, earnings: "$480", nfts: 5 },
  ];
  const monthly = [
    { rank: 1, wallet: "0xZ1y2...4k", wins: 201, earnings: "$3,240", nfts: 48 },
    { rank: 2, wallet: "0xA1b2...9f", wins: 188, earnings: "$3,010", nfts: 42 },
    { rank: 3, wallet: "0xX3w4...2m", wins: 172, earnings: "$2,750", nfts: 37 },
    { rank: 4, wallet: "0xC3d4...7e", wins: 155, earnings: "$2,480", nfts: 31 },
    { rank: 5, wallet: "0xV5u6...9n", wins: 143, earnings: "$2,200", nfts: 28 },
  ];

  const rows = tab === "weekly" ? weekly : monthly;
  const medals = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];

  useGSAP(() => {
    gsap.fromTo(".lb-row",
      { opacity: 0, x: 60 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", scrollTrigger: { trigger: containerRef.current, start: "top 80%", toggleActions: "play none none reset" } }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative z-10 mx-auto w-full max-w-7xl px-4 py-14 md:px-8">
      <div className="mb-10 text-center">
        <span className="inline-block rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.4em] text-amber-300 backdrop-blur">{t('lb_rankings')}</span>
        <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">{t('lb_title_1')}<span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">{t('lb_title_2')}</span></h2>
        <p className="mt-2 text-white/55 font-medium">{t('lb_desc')}</p>
      </div>
      <div className="flex justify-center gap-2 mb-6">
        {(["weekly", "monthly"] as const).map((ti) => (
          <button key={ti} onClick={() => setTab(ti)}
            className={`rounded-full px-5 py-2 text-sm font-black uppercase tracking-wider transition ${tab === ti ? "bg-amber-400 text-white" : "border border-white/20 bg-white/10 text-white/60 hover:text-white"}`}>
            {ti === "weekly" ? `⏳ ${t('lb_weekly')}` : `📅 ${t('lb_monthly')}`}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/30 backdrop-blur-xl">
        {rows.map((row, i) => (
          <div key={row.rank} className={`lb-row flex items-center justify-between gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/5 transition-colors ${i === 0 ? "bg-amber-500/10" : ""}`}>
            <div className="flex items-center gap-4">
              <span className="text-2xl w-8">{medals[i] ?? `#${row.rank}`}</span>
              <span className="font-mono text-sm text-white/80">{row.wallet}</span>
            </div>
            <div className="flex items-center gap-6 text-right">
              <div><p className="text-[10px] text-white/40 font-black uppercase">{t('lb_wins')}</p><p className="font-black text-white">{row.wins}</p></div>
              <div><p className="text-[10px] text-white/40 font-black uppercase">{t('pr_earnings')}</p><p className="font-black text-emerald-300">{row.earnings}</p></div>
              <div><p className="text-[10px] text-white/40 font-black uppercase">NFTs</p><p className="font-black text-purple-300">{row.nfts}</p></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function NFTRewardsSection() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLElement>(null);
  const nfts = [
    { name: "Island Champion", rarity: "Legendary", icon: "🏆", color: "from-amber-400 to-orange-600", condition: t('nft_cond_win_10') },
    { name: "Dice Master", rarity: "Epic", icon: "🎲", color: "from-purple-400 to-violet-700", condition: t('nft_cond_666') },
    { name: "Paradise Raider", rarity: "Rare", icon: "🌴", color: "from-cyan-400 to-blue-600", condition: t('nft_cond_50_games') },
    { name: "Capture King", rarity: "Rare", icon: "⚔️", color: "from-rose-400 to-red-700", condition: t('nft_cond_100_captures') },
    { name: "Lucky Player", rarity: "Common", icon: "🍀", color: "from-emerald-400 to-green-700", condition: t('nft_cond_first_win') },
    { name: "Speedster", rarity: "Epic", icon: "⚡", color: "from-yellow-300 to-amber-500", condition: t('nft_cond_speed') },
  ];
  const rarityColor: Record<string, string> = {
    Legendary: "text-amber-300 border-amber-400/50 bg-amber-400/10",
    Epic: "text-purple-300 border-purple-400/50 bg-purple-400/10",
    Rare: "text-blue-300 border-blue-400/50 bg-blue-400/10",
    Common: "text-green-300 border-green-400/50 bg-green-400/10",
  };

  useGSAP(() => {
    gsap.fromTo(".nft-card",
      { opacity: 0, scale: 0.8, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "back.out(1.5)", scrollTrigger: { trigger: containerRef.current, start: "top 80%", toggleActions: "play none none reset" } }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative z-10 mx-auto w-full max-w-7xl px-4 py-14 md:px-8">
      <div className="mb-10 text-center">
        <span className="inline-block rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.4em] text-purple-300 backdrop-blur">{t('nft_badge')}</span>
        <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">{t('nft_title_1')} <span className="bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent">{t('nft_title_2')}</span></h2>
        <p className="mt-2 text-white/55 font-medium">{t('nft_desc')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {nfts.map((nft) => (
          <div key={nft.name} className={`nft-card relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/30 p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/20`}>
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${nft.color}`} />
            <div className={`text-5xl mb-3 mt-1 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${nft.color}`}>{nft.icon}</div>
            <span className={`text-[10px] font-black uppercase tracking-widest border rounded-full px-2 py-0.5 ${rarityColor[nft.rarity]}`}>{nft.rarity}</span>
            <h4 className="mt-2 text-lg font-black text-white">{nft.name}</h4>
            <p className="mt-1 text-xs text-white/45">{nft.condition}</p>
            <div className="mt-4 flex gap-2">
              <span className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-white/50">{t('nft_minted')}</span>
              <span className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-white/50">{t('nft_tradeable')}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="text-2xl mb-2">😂</div>
          <h4 className="font-black text-white">{t('nft_emotes_t')}</h4>
          <p className="text-sm text-white/50 mt-1">{t('nft_emotes_d')}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="text-2xl mb-2">🪙</div>
          <h4 className="font-black text-white">{t('nft_token_t')}</h4>
          <p className="text-sm text-white/50 mt-1">{t('nft_token_d')}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="text-2xl mb-2">👥</div>
          <h4 className="font-black text-white">{t('nft_invite_t')}</h4>
          <p className="text-sm text-white/50 mt-1">{t('nft_invite_d')}</p>
          <button className="mt-3 rounded-full bg-gradient-to-r from-[#F97316] to-[#8B5CF6] px-4 py-2 text-xs font-black text-white transition hover:-translate-y-0.5">
            {t('nft_invite_btn')}
          </button>
        </div>
      </div>
    </section>
  );
}


function GameRules() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLElement>(null);
  const rules = [
    { id: "gr_obj", icon: "🎯", title: t('gr_obj_t'), content: t('gr_obj_d') },
    { id: "gr_roll", icon: "🎲", title: t('gr_roll_t'), content: t('gr_roll_d') },
    { id: "gr_cap", icon: "⚔️", title: t('gr_cap_t'), content: t('gr_cap_d') },
    { id: "gr_safe", icon: "🛡️", title: t('gr_safe_t'), content: t('gr_safe_d') },
    { id: "gr_home", icon: "🏁", title: t('gr_home_t'), content: t('gr_home_d') },
    { id: "gr_win", icon: "🏆", title: t('gr_win_t'), content: t('gr_win_d') },
  ];

  useGSAP(() => {
    gsap.fromTo(".rule-header",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: containerRef.current, start: "top 80%", toggleActions: "play none none reset" } }
    );
    gsap.fromTo(".rule-card",
      { opacity: 0, x: (i) => (i % 2 === 0 ? -80 : 80) },
      { opacity: 1, x: 0, duration: 0.7, stagger: 0.1, ease: "power2.out", scrollTrigger: { trigger: containerRef.current, start: "top 70%", toggleActions: "play none none reset" } }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative z-10 mx-auto w-full max-w-5xl px-4 py-16 md:px-8">
      <div className="rule-header mb-10 text-center md:text-left">
        <h2 className="text-3xl font-black text-amber-300 md:text-4xl drop-shadow-sm"><span className="mr-2">📖</span> {t('gr_badge')}</h2>
        <p className="mt-2 text-white/60 font-medium">{t('gr_desc')}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 items-start">
        {rules.map((rule) => (
          <details key={rule.id} className="rule-card group rounded-[1.5rem] border border-amber-400/30 bg-white/10 backdrop-blur-xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all hover:bg-white/15 hover:border-amber-400/50">
            <summary className="flex cursor-pointer items-center justify-between font-bold text-white list-none [&::-webkit-details-marker]:hidden">
              <div className="flex items-center gap-3">
                <span className="text-xl">{rule.icon}</span>
                <span className="text-base">{rule.title}</span>
              </div>
              <span className="text-amber-400 transition-transform duration-300 group-open:rotate-180">▼</span>
            </summary>
            <div className="mt-4 border-t border-white/10 pt-3 text-sm font-medium text-white/65">{rule.content}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

function CTAAndFooter() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(".cta-box",
      { opacity: 0, scale: 0.9, y: 60 },
      { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: containerRef.current, start: "top 85%", toggleActions: "play none none reset" } }
    );
    gsap.fromTo(".footer-column",
      { opacity: 0, x: -40 },
      { opacity: 1, x: 0, duration: 0.7, stagger: 0.12, ease: "power2.out", scrollTrigger: { trigger: ".footer-column", start: "top 95%", toggleActions: "play none none reset" } }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="w-full bg-transparent mt-12 relative z-20">
      <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-8">
        <div className="cta-box flex flex-col items-center justify-center text-center gap-8 rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-10 md:p-14 shadow-2xl backdrop-blur-3xl">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-[#F97316] to-[#EAB308] bg-clip-text text-transparent drop-shadow-sm">{t('cta_title')}</h2>
            <p className="text-white/60 font-medium text-lg leading-relaxed">{t('cta_desc')}</p>
          </div>
          <button className="group relative overflow-hidden rounded-full border border-white/25 bg-gradient-to-r from-orange-500 via-orange-550 to-orange-600 px-10 py-5 text-sm font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:-translate-y-1 hover:brightness-110 hover:border-white/40">
            <span className="relative z-10 text-base">{t('cta_btn')}</span>
            <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-20 bg-white" />
          </button>
        </div>
      </section>

      <div className="bg-[#1e1e1e] w-full">
        <footer className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 md:px-8">
          <div className="grid gap-10 md:grid-cols-4 md:gap-8">
            <div className="footer-column">
              <h3 className="text-2xl font-black text-[#F97316] mb-4">Paradise Ludo</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">{t('ft_desc')}</p>
            </div>
            <div className="footer-column">
              <h4 className="text-sm font-black uppercase tracking-widest text-white mb-4">{t('ft_qlinks')}</h4>
              <ul className="space-y-2 text-slate-400 text-sm font-medium">
                <li><button className="hover:text-[#F97316] transition-colors">{t('nav_home')}</button></li>
                <li><button className="hover:text-[#F97316] transition-colors">{t('nav_leaderboard')}</button></li>
                <li><button className="hover:text-[#F97316] transition-colors">{t('pr_t_stats')}</button></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="text-sm font-black uppercase tracking-widest text-white mb-4">{t('ft_support')}</h4>
              <ul className="space-y-2 text-slate-400 text-sm font-medium">
                <li><button className="hover:text-[#F97316] transition-colors">FAQ</button></li>
                <li><button className="hover:text-[#F97316] transition-colors">Terms of Service</button></li>
                <li><button className="hover:text-[#F97316] transition-colors">Privacy Policy</button></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="text-sm font-black uppercase tracking-widest text-white mb-4">{t('ft_follow')}</h4>
              <ul className="space-y-2 text-slate-400 text-sm font-medium">
                <li><button className="hover:text-[#F97316] transition-colors">Twitter/X</button></li>
                <li><button className="hover:text-[#F97316] transition-colors">Discord</button></li>
                <li><button className="hover:text-[#F97316] transition-colors">Medium</button></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-white/10 pt-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('ft_rights')}
          </div>
        </footer>
      </div>
    </div>
  );
}


export default function Home() {
  const { t } = useLanguage();
  const heroSectionRef = useRef<HTMLElement>(null);
  const [selectedMode, setSelectedMode] = useState<GameMode>("2player");
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(() => {
    const payload = buildCreateGamePayload(DEFAULT_MATCH_MODE, DEFAULT_MATCH_STAKE_USD);
    return {
      mode: DEFAULT_MATCH_MODE,
      stakeUsd: DEFAULT_MATCH_STAKE_USD,
      id: Date.now(),
      sessionRef: createSessionRef(),
      txHash: `0xmock${Math.random().toString(16).slice(2, 12)}`,
      chainStakeUnits: payload.args[0],
      maxPlayers: payload.args[1],
      createPayload: payload,
    };
  });
  const [dummyBalanceUsd, setDummyBalanceUsd] = useState(
    roundUsd(DUMMY_START_BALANCE_USD - DEFAULT_MATCH_STAKE_USD)
  );
  const [selectedPresetStake, setSelectedPresetStake] = useState(PRESET_STAKES_USD[0]);
  const [isCustomStake, setIsCustomStake] = useState(false);
  const [customStakeInput, setCustomStakeInput] = useState("");
  const [stakeError, setStakeError] = useState<string | null>(null);
  const [lastSettlement, setLastSettlement] = useState<SettlementSummary | null>(null);
  const [isStartingMatch, setIsStartingMatch] = useState(false);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  const parsedCustomStake = Number(customStakeInput);
  const customStakeUsd =
    Number.isFinite(parsedCustomStake) && parsedCustomStake > 0
      ? roundUsd(parsedCustomStake)
      : null;
  const selectedStakeUsd = isCustomStake ? customStakeUsd : selectedPresetStake;
  const modePlayerCount = modeToMaxPlayers(selectedMode);
  const estimatedPotUsd = selectedStakeUsd ? roundUsd(selectedStakeUsd * modePlayerCount) : 0;
  const estimatedTaxUsd = roundUsd(estimatedPotUsd * FEE_RATE);
  const estimatedPayoutUsd = roundUsd(estimatedPotUsd - estimatedTaxUsd);

  const launchSession = async (mode: GameMode, stakeUsd: number): Promise<{ ok: boolean; message?: string }> => {
    if (dummyBalanceUsd < stakeUsd) {
      return {
        ok: false,
        message: t('bet_insufficient').replace('${amount}', formatUsd(stakeUsd)),
      };
    }

    const session = await createGameSession(mode, stakeUsd);

    setDummyBalanceUsd((prev) => roundUsd(prev - stakeUsd));
    setActiveSession({
      mode,
      stakeUsd,
      id: Date.now(),
      sessionRef: session.sessionRef,
      txHash: session.txHash,
      chainStakeUnits: session.stakeUnits,
      maxPlayers: session.maxPlayers,
      createPayload: session.payload,
    });
    setSessionNotice(
      `Payload siap: create_game(${session.payload.args[0]}, ${session.payload.args[1]}).`
    );

    return { ok: true };
  };

  const handleStartMatch = async () => {
    if (!selectedStakeUsd) {
      setStakeError("Masukkan nominal taruhan yang valid dulu.");
      return;
    }

    setIsStartingMatch(true);
    setStakeError(null);
    setLastSettlement(null);

    try {
      const result = await launchSession(selectedMode, selectedStakeUsd);
      if (!result.ok) {
        setStakeError(result.message ?? t('bet_err_start'));
      }
    } catch {
      setStakeError(t('bet_err_payload'));
    } finally {
      setIsStartingMatch(false);
    }
  };

  const handleRequestRematchStake = async (stakeUsd: number, mode: GameMode) => {
    try {
      const result = await launchSession(mode, stakeUsd);
      return result;
    } catch {
      return {
        ok: false,
        message: t('bet_err_rematch'),
      };
    }
  };

  const handleGameSettled = (summary: SettlementSummary) => {
    setLastSettlement(summary);
    if (summary.playerWon) {
      setDummyBalanceUsd((prev) => roundUsd(prev + summary.winnerPayoutUsd));
    }
  };

  useGSAP(() => {
    if (!heroSectionRef.current) return;

    // (Animations for these cards were removed per user request to keep them static)
  }, { scope: heroSectionRef });

  if (activeSession) {
    return (
      <GameScreen
        key={activeSession.id}
        mode={activeSession.mode}
        stakeUsd={activeSession.stakeUsd}
        chainStakeUnits={activeSession.chainStakeUnits}
        maxPlayers={activeSession.maxPlayers}
        sessionRef={activeSession.sessionRef}
        txHash={activeSession.txHash}
        createPayload={activeSession.createPayload}
        balanceUsd={dummyBalanceUsd}
        onBackToMenu={() => setActiveSession(null)}
        onGameSettled={handleGameSettled}
        onRequestRematchStake={handleRequestRematchStake}
      />
    );
  }


  return (
    <div className="flex flex-col min-h-screen text-white max-w-full overflow-x-hidden">

      {/* ── Video Background ── */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        >
          <source src="/video/ludoboard-animation.mp4" type="video/mp4" />
        </video>
        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(139,92,246,0.25),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(249,115,22,0.2),_transparent_50%)]" />
      </div>


      <main className="relative flex-1 overflow-x-hidden">
        <Navbar balanceUsd={dummyBalanceUsd} />

        {/* ─────────────── HERO SECTION ─────────────── */}
        <section ref={heroSectionRef} className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-4 pb-12 pt-24 md:px-8 lg:grid-cols-[1fr_420px] lg:items-center lg:gap-12">

          {/* LEFT: Hero text + Bet setup */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.4em] text-orange-300 backdrop-blur">
              {t('hero_badge')}
            </span>

            <h1 className="mt-5 text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl drop-shadow-lg">
              {t('hero_title_1')}
              <span className="block bg-gradient-to-r from-[#F97316] via-[#EF4444] to-[#8B5CF6] bg-clip-text text-transparent">
                {t('hero_title_red')}<br />{t('hero_title_purple')}
              </span>
            </h1>

            <p className="mt-4 max-w-lg text-base font-medium leading-7 text-white/65">
              {t('hero_desc')}
            </p>

            {/* ── Bet Setup Card (glassmorphism) ── */}
            <div id="play" className="mt-8 rounded-[1.75rem] border border-white/15 bg-white/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-orange-300">{t('bet_title')}</p>
              <h3 className="mt-1 text-xl font-black text-white">{t('bet_subtitle')}</h3>

              <div className="mt-4 flex flex-wrap gap-2">
                {PRESET_STAKES_USD.map((amount) => {
                  const isActive = !isCustomStake && selectedPresetStake === amount;
                  return (
                    <button
                      key={amount}
                      onClick={() => { setIsCustomStake(false); setSelectedPresetStake(amount); setStakeError(null); setSessionNotice(null); }}
                      className={`rounded-full border px-4 py-2 text-sm font-black transition ${isActive
                        ? "border-orange-400 bg-gradient-to-r from-[#F97316] to-[#EF4444] text-white shadow-lg shadow-orange-500/40"
                        : "border-white/20 bg-white/10 text-white/80 backdrop-blur hover:border-orange-400/60 hover:bg-white/20"
                        }`}
                    >
                      {formatUsd(amount)}
                    </button>
                  );
                })}
                <button
                  onClick={() => { setIsCustomStake(true); setStakeError(null); setSessionNotice(null); }}
                  className={`rounded-full border px-4 py-2 text-sm font-black transition ${isCustomStake
                    ? "border-purple-400 bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white shadow-lg shadow-purple-500/40"
                    : "border-white/20 bg-white/10 text-white/80 backdrop-blur hover:border-purple-400/60 hover:bg-white/20"
                    }`}
                >
                  {t('bet_custom')}
                </button>
              </div>

              {isCustomStake && (
                <div className="mt-4">
                  <input
                    type="number" min="0.1" step="0.1" value={customStakeInput}
                    onChange={(e) => { setCustomStakeInput(e.target.value); setStakeError(null); setSessionNotice(null); }}
                    placeholder={t('bet_placeholder_stake')}
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white placeholder-white/30 outline-none ring-purple-400 backdrop-blur transition focus:ring-2"
                  />
                </div>
              )}

              {/* Estimate table */}
              <div className="mt-4 grid gap-1.5 rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                {[
                  { label: t('bet_stake_player'), val: selectedStakeUsd ? formatUsd(selectedStakeUsd) : "-", color: "text-white" },
                  { label: t('bet_total_pot'), val: formatUsd(estimatedPotUsd), color: "text-white" },
                  { label: t('bet_tax'), val: formatUsd(estimatedTaxUsd), color: "text-rose-400" },
                  { label: t('bet_payout'), val: formatUsd(estimatedPayoutUsd), color: "text-emerald-400" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="font-medium text-white/60">{label}</span>
                    <strong className={`font-black ${color}`}>{val}</strong>
                  </div>
                ))}
              </div>

              {stakeError && <p className="mt-3 rounded-xl border border-rose-400/40 bg-rose-500/15 px-3 py-2 text-sm font-semibold text-rose-300">{stakeError}</p>}
              {sessionNotice && !stakeError && <p className="mt-3 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-300">{sessionNotice}</p>}

              {lastSettlement && (
                <div className={`mt-3 rounded-xl border px-3 py-2 text-sm font-semibold ${lastSettlement.playerWon ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300" : "border-white/15 bg-white/5 text-white/60"}`}>
                  {lastSettlement.playerWon
                    ? t('bet_win_credited').replace('${amount}', formatUsd(lastSettlement.winnerPayoutUsd))
                    : t('bet_lose_pot').replace('${amount}', formatUsd(lastSettlement.stakeUsd))}
                </div>
              )}

              {/* CTA Row */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleStartMatch}
                  disabled={isStartingMatch}
                  className="rounded-full bg-gradient-to-r from-[#F97316] to-[#EF4444] px-7 py-3.5 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[0_12px_40px_rgba(249,115,22,0.45)] transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(249,115,22,0.55)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isStartingMatch ? t('bet_preparing') : t('bet_start')}
                </button>
                <span className="text-sm font-semibold text-white/50">
                  {t('bet_mode')}: <span className="font-black text-white">{selectedMode === "2player" ? t('arena_2p_title') : t('arena_4p_title')}</span>
                  {" & "}{t('bet_stake')}: <span className="font-black text-orange-300">{selectedStakeUsd ? formatUsd(selectedStakeUsd) : "—"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: FloatingDice, FloatingCoin + Mode selector */}
          <div className="flex flex-col gap-5 relative z-10 w-full h-full">
            {/* <FloatingCoin /> */}
            {/* <FloatingDice /> */}

            <img src="/icon/paradice-icon.png" alt="Paradice Icon" style={{ width: "390px", height: "390px", objectFit: "contain" }} className="mx-auto drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]" />


            {/* Mode selector card (glassmorphism) */}
            <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-purple-300">{t('arena_title')}</p>
              <h3 className="mt-1 text-lg font-black text-white">{t('arena_subtitle')}</h3>

              <div className="mt-4 grid gap-3">
                {MODE_OPTIONS.map((option) => {
                  const isSelected = selectedMode === option.mode;
                  const optT = option.mode === '2player' ? {
                    title: t('arena_2p_title'),
                    subtitle: t('arena_2p_subtitle'),
                    desc: t('arena_2p_desc'),
                    detail: t('arena_2p_detail')
                  } : {
                    title: t('arena_4p_title'),
                    subtitle: t('arena_4p_subtitle'),
                    desc: t('arena_4p_desc'),
                    detail: t('arena_4p_detail')
                  };
                  return (
                    <button
                      key={option.mode}
                      onClick={() => setSelectedMode(option.mode)}
                      className={`group relative overflow-hidden rounded-[1.25rem] border p-4 text-left transition ${isSelected
                        ? "border-white/30 bg-white/20 shadow-[0_8px_30px_rgba(255,255,255,0.1)]"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                        }`}
                    >
                      <div className={`absolute inset-x-0 top-0 h-[3px] rounded-t-[1.25rem] bg-gradient-to-r ${option.accent}`} />
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">{optT.subtitle}</p>
                          <h4 className="mt-1 text-xl font-black text-white">{optT.title}</h4>
                          <p className="mt-1 text-xs font-medium text-white/60">{optT.desc}</p>
                          <p className="mt-1 text-xs leading-5 text-white/45">{optT.detail}</p>
                        </div>
                        <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black transition ${isSelected
                          ? "bg-white text-[#8B5CF6] shadow-lg"
                          : "border border-white/20 text-white/50 group-hover:border-white/40 group-hover:text-white"
                          }`}>
                          {isSelected ? "ON" : "GO"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <StatsSection />
        <PrizePoolSection />
        <MatchHistorySection />
        <LeaderboardSection />
        <NFTRewardsSection />
        <GameRules />

      </main>

      <CTAAndFooter />
    </div>
  );
}

