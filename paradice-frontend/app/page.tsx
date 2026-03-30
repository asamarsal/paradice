"use client";
import React, { useEffect } from "react";
import LudoBoard from "@/components/LudoBoard";
import Dice from "@/components/Dice";
import { useLudoGame } from "@/hooks/useLudoGame";

export default function Home() {
  const { state, cfg, handleDiceResult, handlePawnClick, runBotTurn, executeBotMove, resetGame, getValidMoves } = useLudoGame("2player");

  const currentPlayerCfg = cfg.players.find(p => p.color === state.currentPlayer);

  // Auto-trigger bot turn
  useEffect(() => {
    if (currentPlayerCfg?.type === "bot" && state.phase === "bot_thinking") {
      const timer = setTimeout(() => {
        const value = Math.floor(Math.random() * 6) + 1;
        runBotTurn(value);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.currentPlayer, state.phase, runBotTurn, currentPlayerCfg]);

  // Visually delay bot's move
  useEffect(() => {
    if (currentPlayerCfg?.type === "bot" && state.phase === "bot_moving") {
      const timer = setTimeout(() => executeBotMove(), 1200);
      return () => clearTimeout(timer);
    }
  }, [state.currentPlayer, state.phase, executeBotMove, currentPlayerCfg]);

  const isPlayerTurn = currentPlayerCfg?.type === "human";
  const canRoll = isPlayerTurn && state.phase === "waiting_roll";

  // Get movable pawn IDs for highlighting
  const validMoves = state.phase === "waiting_move" && state.diceValue
    ? getValidMoves(state.pawns, state.currentPlayer, state.diceValue)
    : [];
  const movablePawnIds = validMoves.map((m: any) => m.pawn.id);

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBEB]">
      <header className="w-full p-4 flex justify-between items-center bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌴</span>
          <h1 className="text-2xl font-black text-[#8B5CF6] tracking-tight">Paradice</h1>
        </div>
        <div className="flex items-center gap-4">
          {state.phase === "game_over" && (
            <button onClick={resetGame} className="text-sm font-bold text-gray-500 hover:text-gray-800">Restart Game</button>
          )}
          <button className="bg-[#8B5CF6] text-white px-6 py-2 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            Connect Wallet
          </button>
        </div>
      </header>

      <div className={`w-full p-2 text-center font-bold text-sm tracking-widest ${isPlayerTurn ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
        {state.message}
      </div>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-12 p-4 sm:p-8">
        <div className="flex-shrink-0 flex flex-col items-center">
          <Dice
            onRollResult={handleDiceResult}
            disabled={!canRoll}
            message={currentPlayerCfg?.type === "bot" ? "BOT TURN" : (canRoll ? "HOLD TO SPIN" : "WAITING...")}
          />
          <div className="mt-4 text-xs text-gray-500 font-mono text-center">
            <div>Phase: <strong>{state.phase}</strong></div>
            <div>Player: <strong>{state.currentPlayer}</strong></div>
            <div>Dice: <strong>{state.diceValue ?? "-"}</strong></div>
            <div>Movable: <strong>{movablePawnIds.join(", ") || "none"}</strong></div>
          </div>
        </div>

        <div className="w-full max-w-[560px]">
          <LudoBoard
            gameState={state}
            cfg={cfg}
            movablePawnIds={movablePawnIds}
            onPawnClick={handlePawnClick}
          />
        </div>

        <div className="hidden lg:block w-[120px]"></div>
      </main>

      <footer className="w-full p-3 text-center text-[#0C4A6E] opacity-60 text-sm">
        Built on Initia Blockchain 🥥
      </footer>
    </div>
  );
}
