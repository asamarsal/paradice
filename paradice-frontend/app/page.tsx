"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import LudoBoard from "@/components/LudoBoard";
import Dice, { DiceHandle } from "@/components/Dice";
import Navbar from "@/components/Navbar";

if (typeof globalThis.window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}
import FloatingDice from "@/components/FloatingDice";
import FloatingCoin from "@/components/FloatingCoin";
import { useLudoGame } from "@/hooks/useLudoGame";
import { GameMode } from "@/types/ludo";
import {
  createGameSession,
  CreateGameMovePayload,
  modeToMaxPlayers,
} from "@/lib/gameContractAdapter";

type ModeOption = {
  mode: GameMode;
  title: string;
  subtitle: string;
  accent: string;
  summary: string;
  details: string;
};

const MODE_OPTIONS: ModeOption[] = [
  {
    mode: "2player",
    title: "2 Players",
    subtitle: "You vs Bot",
    accent: "from-[#2563EB] via-[#8B5CF6] to-[#22C55E]",
    summary: "Duel cepat untuk langsung main.",
    details:
      "Satu pemain lawan satu bot dengan tempo lebih santai dan fokus ke strategi inti.",
  },
  {
    mode: "4player",
    title: "4 Players",
    subtitle: "You vs 3 Bots",
    accent: "from-[#F97316] via-[#EF4444] to-[#EAB308]",
    summary: "Rame, chaos, dan penuh comeback.",
    details:
      "Tiga bot aktif membuat papan lebih hidup dengan lebih banyak block, capture, dan balas dendam.",
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
  const [restartNotice, setRestartNotice] = useState<string | null>(null);
  const [isRematchStarting, setIsRematchStarting] = useState(false);

  useEffect(() => {
    if (state.phase === "waiting_roll" && isBot) {
      const timer = setTimeout(() => {
        diceRef.current?.rollDice();
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
  }, [state.phase, isBot, runBotTurn, executeBotMove, state.diceValue]);

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

  const isPlayerTurn = currentPlayerCfg?.type === "human";
  const canRoll = isPlayerTurn && state.phase === "waiting_roll";
  const validMoves =
    state.phase === "waiting_move" && state.diceValue
      ? getValidMoves(state.pawns, state.currentPlayer, state.diceValue)
      : [];
  const movablePawnIds = validMoves.map((m) => m.pawn.id);
  const modeLabel = mode === "2player" ? "2 Players" : "4 Players";
  const compactSessionRef =
    sessionRef.length > 16 ? `${sessionRef.slice(0, 12)}...` : sessionRef;
  const compactTxHash =
    txHash.length > 16 ? `${txHash.slice(0, 12)}...${txHash.slice(-4)}` : txHash;

  const handleRestart = async () => {
    setIsRematchStarting(true);
    const result = await onRequestRematchStake(stakeUsd, mode);

    if (!result.ok) {
      setIsRematchStarting(false);
      setRestartNotice(result.message ?? `Saldo dummy tidak cukup. Butuh ${formatUsd(stakeUsd)} untuk rematch.`);
      return;
    }

    settlementReportedRef.current = false;
    setRestartNotice(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.8),_transparent_30%),linear-gradient(180deg,_#FFF7D6_0%,_#FFF3C1_46%,_#FFE8B2_100%)]">
      <header className="w-full border-b border-white/60 bg-white/80 px-4 py-4 shadow-[0_8px_30px_rgba(218,165,32,0.12)] backdrop-blur md:px-6">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#FDE68A,_#8B5CF6)] text-xl shadow-lg">
              <span>T</span>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-[#0F766E]">
                Paradice
              </p>
              <h1 className="text-xl font-black tracking-tight text-[#6D28D9] md:text-2xl">
                Tropical Ludo Arena
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full border border-[#C7D2FE] bg-[#EEF2FF] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#3730A3]">
              Demo Balance: {formatUsd(balanceUsd)}
            </div>
            <button
              onClick={onBackToMenu}
              className="rounded-full border border-[#D6BCFA] bg-white px-4 py-2 text-sm font-bold text-[#6D28D9] transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Back to Menu
            </button>
            <button className="rounded-full bg-[#8B5CF6] px-6 py-2 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
              Connect Wallet
            </button>
          </div>
        </div>
      </header>

      <div
        className={`w-full px-4 py-3 text-center text-sm font-black tracking-[0.25em] ${isPlayerTurn ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
          }`}
      >
        {state.message}
      </div>

      <main className="mx-auto grid w-full max-w-[1600px] flex-1 gap-6 px-4 py-6 lg:px-6 xl:grid-cols-[360px_minmax(0,1fr)_240px] xl:items-start">
        <section className="w-full rounded-[2rem] border border-white/70 bg-white/65 p-6 shadow-[0_20px_70px_rgba(124,58,237,0.12)] backdrop-blur">
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-[#0F766E]">
                Live Match
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#1E3A8A]">
                {modeLabel}
              </h2>
            </div>
            <button
              onClick={handleRestart}
              disabled={isRematchStarting}
              className="rounded-full bg-[#EEF2FF] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#4338CA] transition hover:bg-[#E0E7FF] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isRematchStarting ? "Starting..." : "Rematch"}
            </button>
          </div>
          {restartNotice && (
            <p className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              {restartNotice}
            </p>
          )}

          <div
            className="mb-5 rounded-[1.5rem] border bg-white/90 p-4 shadow-sm"
            style={{
              borderColor: `${turnColor}55`,
              boxShadow: `0 0 0 3px ${turnColor}18`,
            }}
          >
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">
              Current Turn
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span
                className="h-4 w-4 rounded-full ring-4 ring-white"
                style={{ backgroundColor: turnColor }}
              />
              <div>
                <p className="text-2xl font-black tracking-tight" style={{ color: turnColor }}>
                  {currentTurnLabel}
                </p>
                <p className="text-sm font-semibold text-slate-600">
                  {currentPlayerCfg?.type === "human" ? "Your move is live now." : `${currentTurnLabel} is making a move.`}
                </p>
              </div>
            </div>
            {pendingPlayerCfg && (
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Up next: <span className="text-slate-800">{pendingPlayerCfg.label}</span>
              </p>
            )}
          </div>

          <Dice
            ref={diceRef}
            onRollResult={handleDiceResult}
            disabled={!canRoll}
            value={displayedDiceValue}
            isBot={isBot}
            message={isBot ? "BOT TURN" : canRoll ? "HOLD TO SPIN" : "WAITING..."}
          />

          <div className="grid gap-3 rounded-[1.5rem] border border-[#E9D5FF] bg-[#FFFDF6] p-4 text-sm text-[#475569]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#64748B]">Phase</span>
              <strong className="font-mono text-[#1E293B]">{state.phase}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#64748B]">Current Player</span>
              <strong className="font-mono capitalize text-[#1E293B]">
                {state.currentPlayer}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#64748B]">Dice</span>
              <strong className="font-mono text-[#1E293B]">{displayedDiceValue ?? "-"}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#64748B]">Movable</span>
              <strong className="font-mono text-[#1E293B]">
                {movablePawnIds.join(", ") || "none"}
              </strong>
            </div>
          </div>

          {state.phase === "game_over" && (
            <div
              className={`mt-4 rounded-[1.25rem] border px-4 py-3 text-sm font-semibold ${playerWon
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-rose-300 bg-rose-50 text-rose-800"
                }`}
            >
              {playerWon
                ? `Kamu menang. +${formatUsd(winnerPayoutUsd)} masuk ke dummy balance.`
                : `Kamu kalah ronde ini. Stake ${formatUsd(stakeUsd)} sudah jadi bagian pot.`}
            </div>
          )}
        </section>

        <section className="flex w-full justify-center xl:justify-start">
          <div className="w-full max-w-[700px] rounded-[2.25rem] border border-white/80 bg-white/70 p-3 shadow-[0_25px_80px_rgba(15,118,110,0.16)] backdrop-blur sm:p-5">
            <LudoBoard
              gameState={state}
              cfg={cfg}
              movablePawnIds={movablePawnIds}
              onPawnClick={handlePawnClick}
            />
          </div>
        </section>

        <aside className="w-full xl:w-[240px] xl:justify-self-end">
          <div className="grid gap-3">
            <div className="rounded-2xl border border-[#D8B4FE] bg-white/88 p-3 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">
                Payload
              </p>
              <div className="mt-2 grid gap-1.5 text-[12px] text-slate-700">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">Session</span>
                  <strong className="font-mono text-[#1E293B]">{compactSessionRef}</strong>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">Tx</span>
                  <strong className="font-mono text-[#1E293B]">{compactTxHash}</strong>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">Call</span>
                  <strong className="font-mono text-[#1E293B]">{createPayload.functionName}</strong>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">Args</span>
                  <strong className="font-mono text-[#1E293B]">
                    {createPayload.args[0]}, {createPayload.args[1]}
                  </strong>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#BFDBFE] bg-white/88 p-3 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">
                Bet Info
              </p>
              <div className="mt-2 grid gap-1.5 text-[12px] text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Stake</span>
                  <strong className="font-black text-[#1E3A8A]">{formatUsd(stakeUsd)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Players</span>
                  <strong className="font-black text-[#1E3A8A]">{totalPlayers}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Max players</span>
                  <strong className="font-black text-[#1E3A8A]">{maxPlayers}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Stake units</span>
                  <strong className="font-black text-[#1E3A8A]">{chainStakeUnits}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Pot</span>
                  <strong className="font-black text-[#1E3A8A]">{formatUsd(totalPotUsd)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Tax</span>
                  <strong className="font-black text-[#E11D48]">{formatUsd(taxUsd)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Payout</span>
                  <strong className="font-black text-[#0F766E]">{formatUsd(winnerPayoutUsd)}</strong>
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
          <p className="text-xs font-black uppercase tracking-widest text-white/85">Active Players</p>
          <h4 className="mt-1 text-3xl font-black drop-shadow-md">12.5K</h4>
        </div>
        <div className="stat-card rounded-[1.5rem] bg-gradient-to-br from-[#06B6D4] to-[#10B981] p-5 text-white shadow-lg transition hover:-translate-y-1 border border-white/20 backdrop-blur">
          <div className="mb-4 text-2xl">🎮</div>
          <p className="text-xs font-black uppercase tracking-widest text-white/85">Games Today</p>
          <h4 className="mt-1 text-3xl font-black drop-shadow-md">48.2K</h4>
        </div>
        <div className="stat-card rounded-[1.5rem] bg-gradient-to-br from-[#F59E0B] to-[#EF4444] p-5 text-white shadow-lg transition hover:-translate-y-1 border border-white/20 backdrop-blur">
          <div className="mb-4 text-2xl">💰</div>
          <p className="text-xs font-black uppercase tracking-widest text-white/85">Total Winnings</p>
          <h4 className="mt-1 text-3xl font-black drop-shadow-md">$2.4M</h4>
        </div>
        <div className="stat-card rounded-[1.5rem] bg-gradient-to-br from-[#10B981] to-[#06B6D4] p-5 text-white shadow-lg transition hover:-translate-y-1 border border-white/20 backdrop-blur">
          <div className="mb-4 text-2xl">📈</div>
          <p className="text-xs font-black uppercase tracking-widest text-white/85">Avg Win Rate</p>
          <h4 className="mt-1 text-3xl font-black drop-shadow-md">42.5%</h4>
        </div>
      </div>
    </section>
  );
}

function PrizePoolSection() {
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
        <span className="inline-block rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-300 backdrop-blur">🔍 On-Chain Transparency</span>
        <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">Real Prize Pool <span className="bg-gradient-to-r from-emerald-300 to-cyan-400 bg-clip-text text-transparent">Breakdown</span></h2>
        <p className="mt-2 text-white/55 font-medium">Every payout is verifiable on Initia Blockchain — no hidden fees.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="prize-item rounded-[1.75rem] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
          <div className="text-3xl mb-3">🏆</div>
          <p className="text-xs font-black uppercase tracking-widest text-white/50">Total Pot</p>
          <h3 className="mt-1 text-4xl font-black text-white">$40.00</h3>
          <p className="mt-2 text-sm text-white/50">Stake per player × number of players. Pooled into smart contract before game starts.</p>
          <div className="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-300">⛓️ On-chain: create_game(mode, stake)</div>
        </div>
        <div className="prize-item rounded-[1.75rem] border border-rose-400/20 bg-rose-500/10 p-6 backdrop-blur-xl">
          <div className="text-3xl mb-3">🧳</div>
          <p className="text-xs font-black uppercase tracking-widest text-rose-300/70">Platform Fee</p>
          <h3 className="mt-1 text-4xl font-black text-rose-300">5%</h3>
          <p className="mt-2 text-sm text-white/50">Fixed fee deducted from total pot to sustain the platform. Sent to treasury wallet automatically.</p>
          <div className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-300">⛓️ On-chain: fee_bps = 500</div>
        </div>
        <div className="prize-item rounded-[1.75rem] border border-amber-400/20 bg-amber-500/10 p-6 backdrop-blur-xl">
          <div className="text-3xl mb-3">💸</div>
          <p className="text-xs font-black uppercase tracking-widest text-amber-300/70">Winner Payout</p>
          <h3 className="mt-1 text-4xl font-black text-amber-300">$38.00</h3>
          <p className="mt-2 text-sm text-white/50">Total pot minus fee. Sent directly to winner wallet on-chain the moment game ends.</p>
          <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs font-semibold text-amber-300">⛓️ On-chain: settle_game(winner)</div>
        </div>
      </div>
      <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
        <p className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-3">⚡ Real-Time On-Chain Read</p>
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { label: "Block Height", val: "#4,821,003", color: "text-cyan-300" },
            { label: "Contract", val: "initia1...a8f9", color: "text-purple-300" },
            { label: "Tx Status", val: "Confirmed", color: "text-emerald-300" },
            { label: "Gas Used", val: "0.00042 INIT", color: "text-amber-300" },
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
        <span className="inline-block rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.4em] text-blue-300 backdrop-blur">📜 On-Chain History</span>
        <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">Match <span className="bg-gradient-to-r from-blue-300 to-purple-400 bg-clip-text text-transparent">History</span></h2>
        <p className="mt-2 text-white/55 font-medium">All games recorded immutably on Initia. Readable by anyone.</p>
      </div>
      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="grid grid-cols-7 gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/10">
          <span className="col-span-2">Tx Hash</span>
          <span>Mode</span>
          <span>Stake</span>
          <span>Result</span>
          <span>Payout</span>
          <span>NFT</span>
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
          View All On Explorer ↗
        </button>
      </div>
    </section>
  );
}

function LeaderboardSection() {
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
        <span className="inline-block rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.4em] text-amber-300 backdrop-blur">🏆 Rankings</span>
        <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">Leaderboard</h2>
        <p className="mt-2 text-white/55 font-medium">Top players this week and month. Updated in real-time.</p>
      </div>
      <div className="flex justify-center gap-2 mb-6">
        {(["weekly", "monthly"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-full px-5 py-2 text-sm font-black uppercase tracking-wider transition ${tab === t ? "bg-amber-400 text-white" : "border border-white/20 bg-white/10 text-white/60 hover:text-white"}`}>
            {t === "weekly" ? "⏳ Weekly" : "📅 Monthly"}
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
              <div><p className="text-[10px] text-white/40 font-black uppercase">Wins</p><p className="font-black text-white">{row.wins}</p></div>
              <div><p className="text-[10px] text-white/40 font-black uppercase">Earnings</p><p className="font-black text-emerald-300">{row.earnings}</p></div>
              <div><p className="text-[10px] text-white/40 font-black uppercase">NFTs</p><p className="font-black text-purple-300">{row.nfts}</p></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function NFTRewardsSection() {
  const containerRef = useRef<HTMLElement>(null);
  const nfts = [
    { name: "Island Champion", rarity: "Legendary", icon: "🏆", color: "from-amber-400 to-orange-600", condition: "Win 10 games" },
    { name: "Dice Master", rarity: "Epic", icon: "🎲", color: "from-purple-400 to-violet-700", condition: "Roll 6 three times in a row" },
    { name: "Paradise Raider", rarity: "Rare", icon: "🌴", color: "from-cyan-400 to-blue-600", condition: "Play 50 games" },
    { name: "Capture King", rarity: "Rare", icon: "⚔️", color: "from-rose-400 to-red-700", condition: "Capture 100 pawns" },
    { name: "Lucky Player", rarity: "Common", icon: "🍀", color: "from-emerald-400 to-green-700", condition: "First win" },
    { name: "Speedster", rarity: "Epic", icon: "⚡", color: "from-yellow-300 to-amber-500", condition: "Win in under 10 minutes" },
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
        <span className="inline-block rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.4em] text-purple-300 backdrop-blur">🎨 NFT Rewards</span>
        <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">Win &amp; <span className="bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent">Earn NFTs</span></h2>
        <p className="mt-2 text-white/55 font-medium">Exclusive collectibles minted on-chain when you achieve milestones.</p>
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
              <span className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-white/50">🧰 On-Chain Mint</span>
              <span className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-white/50">🔁 Tradeable</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="text-2xl mb-2">😂</div>
          <h4 className="font-black text-white">Emotes &amp; Reactions</h4>
          <p className="text-sm text-white/50 mt-1">Unlock emotes you can use during matches to taunt or celebrate.</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="text-2xl mb-2">🪙</div>
          <h4 className="font-black text-white">Token Drops</h4>
          <p className="text-sm text-white/50 mt-1">Earn INIT token rewards as you climb the leaderboard each week.</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="text-2xl mb-2">👥</div>
          <h4 className="font-black text-white">Invite Friends</h4>
          <p className="text-sm text-white/50 mt-1">Send wallet-based invites. Both you and your friend earn bonus tokens on their first win.</p>
          <button className="mt-3 rounded-full bg-gradient-to-r from-[#F97316] to-[#8B5CF6] px-4 py-2 text-xs font-black text-white transition hover:-translate-y-0.5">
            Copy Invite Link
          </button>
        </div>
      </div>
    </section>
  );
}


function GameRules() {
  const containerRef = useRef<HTMLElement>(null);
  const rules = [
    { icon: "🎯", title: "Objective", content: "Pindahkan semua bidak Anda dari base ke tujuan tengah sebelum pemain lain." },
    { icon: "🎲", title: "Rolling the Dice", content: "Lempar dadu untuk menggerakkan bidak. Angka yang muncul menentukan jumlah langkah yang bisa diambil." },
    { icon: "⚔️", title: "Capturing Tokens", content: "Mendarat di atas bidak lawan akan mengembalikannya ke base, kecuali jika berada di Safe Zone." },
    { icon: "🛡️", title: "Safe Zones", content: "Bidak yang berada di Safe Zone ditandai bintang, bidak aman tidak bisa ditangkap lawan." },
    { icon: "🏁", title: "Home Stretch", content: "Setelah mengelilingi papan, bidak harus masuk ke Home Stretch dan mencapai titik tengah persis." },
    { icon: "🏆", title: "Winning", content: "Pemain pertama yang memasukkan ke-4 bidaknya ke tujuan akhir adalah pemenangnya!" },
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
        <h2 className="text-3xl font-black text-amber-300 md:text-4xl drop-shadow-sm"><span className="mr-2">📖</span> GAME RULES</h2>
        <p className="mt-2 text-white/60 font-medium">Pelajari cara bermain dan kuasai Paradise Ludo!</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 items-start">
        {rules.map((rule, idx) => (
          <details key={idx} className="rule-card group rounded-[1.5rem] border border-amber-400/30 bg-white/10 backdrop-blur-xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all hover:bg-white/15 hover:border-amber-400/50">
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
            <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-[#F97316] to-[#EAB308] bg-clip-text text-transparent drop-shadow-sm">Siap untuk Petualangan Tropis?</h2>
            <p className="text-white/60 font-medium text-lg leading-relaxed">Bergabunglah dengan ribuan pemain di Initia Blockchain dan mulai menangkan hadiah NFT eksklusif hari ini!</p>
          </div>
          <button className="group relative overflow-hidden rounded-full border border-white/25 bg-gradient-to-r from-orange-500 via-orange-550 to-orange-600 px-10 py-5 text-sm font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:-translate-y-1 hover:brightness-110 hover:border-white/40">
            <span className="relative z-10 text-base">MAIN SEKARANG →</span>
            <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-20 bg-white" />
          </button>
        </div>
      </section>

      <div className="bg-[#1e1e1e] w-full">
        <footer className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 md:px-8">
          <div className="grid gap-10 md:grid-cols-4 md:gap-8">
            <div className="footer-column">
              <h3 className="text-2xl font-black text-[#F97316] mb-4">Paradise Ludo</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">Main ludo secara on-chain dan menang dengan strategi. Dibangun secara aman di atas Initia Blockchain.</p>
            </div>
            <div className="footer-column">
              <h4 className="text-sm font-black uppercase tracking-widest text-white mb-4">QUICK LINKS</h4>
              <ul className="space-y-2 text-slate-400 text-sm font-medium">
                <li><button className="hover:text-[#F97316] transition-colors">Home</button></li>
                <li><button className="hover:text-[#F97316] transition-colors">Leaderboard</button></li>
                <li><button className="hover:text-[#F97316] transition-colors">My Stats</button></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="text-sm font-black uppercase tracking-widest text-white mb-4">SUPPORT</h4>
              <ul className="space-y-2 text-slate-400 text-sm font-medium">
                <li><button className="hover:text-[#F97316] transition-colors">FAQ</button></li>
                <li><button className="hover:text-[#F97316] transition-colors">Terms of Service</button></li>
                <li><button className="hover:text-[#F97316] transition-colors">Privacy Policy</button></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="text-sm font-black uppercase tracking-widest text-white mb-4">FOLLOW US</h4>
              <ul className="space-y-2 text-slate-400 text-sm font-medium">
                <li><button className="hover:text-[#F97316] transition-colors">Twitter/X</button></li>
                <li><button className="hover:text-[#F97316] transition-colors">Discord</button></li>
                <li><button className="hover:text-[#F97316] transition-colors">Medium</button></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-white/10 pt-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            © 2026 Paradise Ludo. All Rights Reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}


export default function Home() {
  const heroSectionRef = useRef<HTMLElement>(null);
  const [selectedMode, setSelectedMode] = useState<GameMode>("2player");
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [dummyBalanceUsd, setDummyBalanceUsd] = useState(DUMMY_START_BALANCE_USD);
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
        message: `Saldo dummy tidak cukup. Butuh ${formatUsd(stakeUsd)} untuk mulai match.`,
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
        setStakeError(result.message ?? "Gagal memulai match.");
      }
    } catch {
      setStakeError("Gagal menyiapkan payload create_game. Coba lagi.");
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
        message: "Gagal menyiapkan rematch payload.",
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
        <section ref={heroSectionRef} className="mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-7xl gap-8 px-4 pb-12 pt-10 md:px-8 lg:grid-cols-[1fr_420px] lg:items-center lg:gap-12">

          {/* LEFT: Hero text + Bet setup */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.4em] text-orange-300 backdrop-blur">
              🌴 On-Chain Party Board Game
            </span>

            <h1 className="mt-5 text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl drop-shadow-lg">
              Paradice
              <span className="block bg-gradient-to-r from-[#F97316] via-[#EF4444] to-[#8B5CF6] bg-clip-text text-transparent">
                Roll Into The<br />Island Arena
              </span>
            </h1>

            <p className="mt-4 max-w-lg text-base font-medium leading-7 text-white/65">
              Stake INIT, enter the arena, race your pawns to glory. Smart contract settles payouts. 5% fee. Winner takes all.
            </p>

            {/* ── Bet Setup Card (glassmorphism) ── */}
            <div id="play" className="mt-8 rounded-[1.75rem] border border-white/15 bg-white/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-orange-300">💰 Dummy Bet Setup</p>
              <h3 className="mt-1 text-xl font-black text-white">Pilih taruhan sebelum match</h3>

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
                  Custom
                </button>
              </div>

              {isCustomStake && (
                <div className="mt-4">
                  <input
                    type="number" min="0.1" step="0.1" value={customStakeInput}
                    onChange={(e) => { setCustomStakeInput(e.target.value); setStakeError(null); setSessionNotice(null); }}
                    placeholder="Contoh: 3.5"
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white placeholder-white/30 outline-none ring-purple-400 backdrop-blur transition focus:ring-2"
                  />
                </div>
              )}

              {/* Estimate table */}
              <div className="mt-4 grid gap-1.5 rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                {[
                  { label: "Stake / player", val: selectedStakeUsd ? formatUsd(selectedStakeUsd) : "-", color: "text-white" },
                  { label: "Estimated total pot", val: formatUsd(estimatedPotUsd), color: "text-white" },
                  { label: "Estimated tax (5%)", val: formatUsd(estimatedTaxUsd), color: "text-rose-400" },
                  { label: "Estimated winner payout", val: formatUsd(estimatedPayoutUsd), color: "text-emerald-400" },
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
                    ? `🏆 Menang! +${formatUsd(lastSettlement.winnerPayoutUsd)} credited.`
                    : `💀 Kalah. Stake ${formatUsd(lastSettlement.stakeUsd)} → pot.`}
                </div>
              )}

              {/* CTA Row */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleStartMatch}
                  disabled={isStartingMatch}
                  className="rounded-full bg-gradient-to-r from-[#F97316] to-[#EF4444] px-7 py-3.5 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[0_12px_40px_rgba(249,115,22,0.45)] transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(249,115,22,0.55)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isStartingMatch ? "Preparing…" : "▶ Start Match"}
                </button>
                <span className="text-sm font-semibold text-white/50">
                  Mode: <span className="font-black text-white">{selectedMode === "2player" ? "2 Players" : "4 Players"}</span>
                  {" & "}Stake: <span className="font-black text-orange-300">{selectedStakeUsd ? formatUsd(selectedStakeUsd) : "—"}</span>
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
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-purple-300">🎮 Choose Your Arena</p>
              <h3 className="mt-1 text-lg font-black text-white">Select Game Mode</h3>

              <div className="mt-4 grid gap-3">
                {MODE_OPTIONS.map((option) => {
                  const isSelected = selectedMode === option.mode;
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
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">{option.subtitle}</p>
                          <h4 className="mt-1 text-xl font-black text-white">{option.title}</h4>
                          <p className="mt-1 text-xs font-medium text-white/60">{option.summary}</p>
                          <p className="mt-1 text-xs leading-5 text-white/45">{option.details}</p>
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

