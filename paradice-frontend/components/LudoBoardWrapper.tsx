"use client";

import React from "react";
import LudoBoard from "./LudoBoard";
import { GameState, BuiltGameConfig } from "@/types/ludo";

interface LudoBoardWrapperProps {
    gameState: GameState;
    cfg: BuiltGameConfig;
    movablePawnIds: string[];
    onPawnClick: (id: string) => void;
    containerClassName?: string;
}

export default function LudoBoardWrapper({
    gameState,
    cfg,
    movablePawnIds,
    onPawnClick,
    containerClassName = ""
}: LudoBoardWrapperProps) {
    return (
        <div className={`w-full max-w-[550px] rounded-[2rem] border border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-xl sm:p-3 relative ${containerClassName}`}>
            <LudoBoard
                gameState={gameState}
                cfg={cfg}
                movablePawnIds={movablePawnIds}
                onPawnClick={onPawnClick}
            />
        </div>
    );
}
