"use client";

import React, { useEffect, useRef, useState } from "react";
import LudoBoard from "@/components/LudoBoard";
import Dice, { DiceHandle } from "@/components/Dice";
import { useLudoGame } from "@/hooks/useLudoGame";
import { GameMode } from "@/types/ludo";

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

function GameScreen({
  mode,
  onBackToMenu,
}: {
  mode: GameMode;
  onBackToMenu: () => void;
}) {
  const {
    state,
    cfg,
    handleDiceResult,
    handlePawnClick,
    runBotTurn,
    executeBotMove,
    resetGame,
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

  const isPlayerTurn = currentPlayerCfg?.type === "human";
  const canRoll = isPlayerTurn && state.phase === "waiting_roll";
  const validMoves =
    state.phase === "waiting_move" && state.diceValue
      ? getValidMoves(state.pawns, state.currentPlayer, state.diceValue)
      : [];
  const movablePawnIds = validMoves.map((m) => m.pawn.id);
  const modeLabel = mode === "2player" ? "2 Players" : "4 Players";

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
        className={`w-full px-4 py-3 text-center text-sm font-black tracking-[0.25em] ${
          isPlayerTurn ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
        }`}
      >
        {state.message}
      </div>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <section className="w-full max-w-sm rounded-[2rem] border border-white/70 bg-white/65 p-6 shadow-[0_20px_70px_rgba(124,58,237,0.12)] backdrop-blur">
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
              onClick={resetGame}
              className="rounded-full bg-[#EEF2FF] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#4338CA] transition hover:bg-[#E0E7FF]"
            >
              Restart
            </button>
          </div>

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
        </section>

        <section className="flex w-full justify-center">
          <div className="w-full max-w-[700px] rounded-[2.25rem] border border-white/80 bg-white/70 p-3 shadow-[0_25px_80px_rgba(15,118,110,0.16)] backdrop-blur sm:p-5">
            <LudoBoard
              gameState={state}
              cfg={cfg}
              movablePawnIds={movablePawnIds}
              onPawnClick={handlePawnClick}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default function Home() {
  const [selectedMode, setSelectedMode] = useState<GameMode>("2player");
  const [activeMode, setActiveMode] = useState<GameMode | null>(null);

  if (activeMode) {
    return (
      <GameScreen
        key={activeMode}
        mode={activeMode}
        onBackToMenu={() => setActiveMode(null)}
      />
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.75),_transparent_30%),linear-gradient(135deg,_#FEF3C7_0%,_#FDE68A_22%,_#FED7AA_44%,_#E9D5FF_72%,_#BFDBFE_100%)] text-slate-900">
      <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_20%_20%,_rgba(34,197,94,0.22),_transparent_30%),radial-gradient(circle_at_80%_10%,_rgba(139,92,246,0.22),_transparent_24%),radial-gradient(circle_at_50%_60%,_rgba(14,165,233,0.16),_transparent_30%)]" />

      <header className="relative z-10 px-4 pt-6 md:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-full border border-white/50 bg-white/65 px-5 py-3 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#22C55E,_#8B5CF6)] text-xl shadow-lg">
              <span>T</span>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-[#0F766E]">
                Paradice
              </p>
              <h1 className="text-xl font-black tracking-tight text-[#6D28D9] md:text-2xl">
                Roll Into The Island Arena
              </h1>
            </div>
          </div>

          <button className="rounded-full bg-[#8B5CF6] px-6 py-2 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
            Connect Wallet
          </button>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-96px)] w-full max-w-7xl gap-10 px-4 pb-10 pt-10 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-xs font-black uppercase tracking-[0.35em] text-[#0F766E] shadow-sm backdrop-blur">
            <span>On-chain party board game</span>
          </div>

          <h2 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight text-[#0F172A] md:text-7xl">
            Landing dulu,
            <span className="block bg-[linear-gradient(90deg,_#7C3AED,_#0EA5E9,_#16A34A)] bg-clip-text text-transparent">
              baru lempar dadu.
            </span>
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700 md:text-xl">
            Pilih mode permainan, masuk ke arena, lalu mulai race tropis penuh
            capture, bonus turn, dan bot yang siap bikin papan jadi chaos.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveMode(selectedMode)}
              className="rounded-full bg-[#0F766E] px-7 py-4 text-sm font-black uppercase tracking-[0.25em] text-white shadow-[0_18px_45px_rgba(15,118,110,0.28)] transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,118,110,0.34)]"
            >
              Start Match
            </button>
            <div className="rounded-full border border-white/60 bg-white/60 px-5 py-4 text-sm font-semibold text-slate-700 backdrop-blur">
              Selected mode:{" "}
              <span className="font-black text-[#6D28D9]">
                {selectedMode === "2player" ? "2 Players" : "4 Players"}
              </span>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/65 bg-white/55 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#0F766E]">
                Fast setup
              </p>
              <h3 className="mt-3 text-xl font-black text-slate-900">Pick and play</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Masuk dari dashboard utama tanpa langsung dilempar ke papan game.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/65 bg-white/55 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#0F766E]">
                Modes
              </p>
              <h3 className="mt-3 text-xl font-black text-slate-900">2 atau 4 pemain</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Pilih duel cepat lawan bot atau arena ramai melawan tiga bot sekaligus.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/65 bg-white/55 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#0F766E]">
                Match flow
              </p>
              <h3 className="mt-3 text-xl font-black text-slate-900">Back to menu</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Dari arena kamu bisa kembali ke dashboard dan pilih mode lain kapan saja.
              </p>
            </div>
          </div>
        </div>

        <aside className="relative">
          <div className="absolute -left-8 top-10 hidden h-24 w-24 rounded-full bg-[#22C55E]/20 blur-2xl lg:block" />
          <div className="absolute -right-4 bottom-8 hidden h-32 w-32 rounded-full bg-[#8B5CF6]/20 blur-3xl lg:block" />

          <div className="relative rounded-[2rem] border border-white/70 bg-white/60 p-4 shadow-[0_24px_80px_rgba(124,58,237,0.16)] backdrop-blur md:p-6">
            <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,_rgba(15,118,110,0.95),_rgba(59,130,246,0.9),_rgba(124,58,237,0.9))] p-6 text-white">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-white/75">
                Choose your arena
              </p>
              <h3 className="mt-3 text-3xl font-black tracking-tight">
                Main dari dashboard utama
              </h3>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/80">
                Landing page ini jadi pintu masuk sebelum game dimulai. Pilih
                format match, lihat ringkasannya, lalu tekan start saat siap.
              </p>
            </div>

            <div className="mt-5 grid gap-4">
              {MODE_OPTIONS.map((option) => {
                const isSelected = selectedMode === option.mode;
                return (
                  <button
                    key={option.mode}
                    onClick={() => setSelectedMode(option.mode)}
                    className={`group rounded-[1.75rem] border p-5 text-left transition ${
                      isSelected
                        ? "border-[#8B5CF6] bg-white shadow-[0_18px_45px_rgba(139,92,246,0.18)]"
                        : "border-white/70 bg-white/50 hover:border-[#C4B5FD] hover:bg-white/70"
                    }`}
                  >
                    <div
                      className={`h-2 w-full rounded-full bg-gradient-to-r ${option.accent}`}
                    />
                    <div className="mt-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-[#0F766E]">
                          {option.subtitle}
                        </p>
                        <h4 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                          {option.title}
                        </h4>
                      </div>
                      <div
                        className={`mt-1 flex h-7 w-7 items-center justify-center rounded-full border text-xs font-black ${
                          isSelected
                            ? "border-[#8B5CF6] bg-[#8B5CF6] text-white"
                            : "border-slate-300 text-slate-400 group-hover:border-[#8B5CF6] group-hover:text-[#8B5CF6]"
                        }`}
                      >
                        {isSelected ? "ON" : "GO"}
                      </div>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      {option.summary}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {option.details}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
