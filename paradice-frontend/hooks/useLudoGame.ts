"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import {
    GameState, Pawn, PlayerColor, PawnStatus, GameMode,
    buildGameConfig, BuiltGameConfig, MAIN_TRACK, SAFE_ZONES
} from "@/types/ludo";

// ─── Movement calculation ────────────────────────────────────────────────────
function calculateMove(
    pawn: Pawn,
    diceValue: number,
    cfg: BuiltGameConfig
): { cell: number; status: PawnStatus; steps: number } | null {
    const pathCfg = cfg.config[pawn.owner];
    if (pawn.status === "base" || pawn.status === "finished") return null;

    const newSteps = pawn.steps + diceValue;
    if (newSteps > pathCfg.totalSteps) return null;

    if (newSteps === pathCfg.totalSteps) {
        return { cell: pathCfg.finalCell, status: "finished", steps: newSteps };
    }

    // Home lane: steps 51-56 → homeLane[0-5]
    // (main track has 51 cells = steps 0-50, then 6 home lane cells)
    if (newSteps >= 51) {
        const idx = newSteps - 51;
        return { cell: pathCfg.homeLane[idx], status: "home_lane", steps: newSteps };
    }

    // On main track (steps 0-50)
    const trackIndex = (cfg.startOffset[pawn.owner] + newSteps) % MAIN_TRACK.length;
    return { cell: MAIN_TRACK[trackIndex], status: "active", steps: newSteps };
}

// ─── Next player ─────────────────────────────────────────────────────────────
function getNextPlayer(current: PlayerColor, turnOrder: PlayerColor[]): PlayerColor {
    const idx = turnOrder.indexOf(current);
    return turnOrder[(idx + 1) % turnOrder.length];
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useLudoGame(mode: GameMode = "2player") {
    const cfg = useMemo(() => buildGameConfig(mode), [mode]);

    const createInitialState = useCallback((): GameState => {
        const pawns: Pawn[] = [];
        for (const sc of cfg.players) {
            if (!sc.active) continue;
            for (let i = 0; i < 4; i++) {
                pawns.push({ id: `${sc.color}_${i}`, owner: sc.color, status: "base", position: null, steps: 0 });
            }
        }
        const first = cfg.turnOrder[0];
        const firstPlayer = cfg.players.find(p => p.color === first);
        return {
            pawns,
            currentPlayer: first,
            diceValue: null,
            diceRolled: false,
            selectedPawnId: null,
            phase: firstPlayer?.type === "human" ? "waiting_roll" : "bot_thinking",
            winner: null,
            message: firstPlayer?.type === "human" ? "Your turn! Hold the dice to roll." : "Bot's turn...",
        };
    }, [cfg]);

    const [state, setState] = useState<GameState>(createInitialState);

    // ── Valid moves ──────────────────────────────────────────────────────────
    const getValidMoves = useCallback((pawns: Pawn[], color: PlayerColor, diceValue: number) => {
        const validMoves: { pawn: Pawn; action: "exit_base" | "move"; targetCell: number; steps: number; status: PawnStatus }[] = [];
        const myPawns = pawns.filter(p => p.owner === color);

        for (const pion of myPawns) {
            if (pion.status === "finished") continue;
            if (pion.status === "base") {
                if (diceValue === 6) {
                    const target = cfg.config[color].startCell;
                    // Ludo allows multiple of your own pawns on the same cell
                    validMoves.push({ pawn: pion, action: "exit_base", targetCell: target, steps: 0, status: "active" });
                }
            } else {
                const result = calculateMove(pion, diceValue, cfg);
                if (result) {
                    validMoves.push({ pawn: pion, action: "move", targetCell: result.cell, steps: result.steps, status: result.status });
                }
            }
        }
        return validMoves;
    }, [cfg]);

    // ── Apply a move ─────────────────────────────────────────────────────────
    const finalizeMove = useCallback((pawnId: string) => {
        setState(prev => {
            const pawn = prev.pawns.find(p => p.id === pawnId);
            if (!pawn || pawn.targetSteps === undefined) return prev;

            const color = prev.currentPlayer;
            const dice = prev.diceValue!;

            let captureOccurred = false;
            let newPawns = prev.pawns.map(p => {
                if (p.id === pawnId) {
                    const { targetSteps, ...rest } = p;
                    return rest; // Clear targetSteps
                }
                return p;
            });

            // Capture enemy pawns on same cell (if not safe zone)
            if (pawn.status === "active" && pawn.position !== null && !SAFE_ZONES.has(pawn.position)) {
                newPawns = newPawns.map(p => {
                    if (p.owner !== color && p.position === pawn.position && p.status === "active") {
                        captureOccurred = true;
                        return { ...p, status: "base" as PawnStatus, position: null, steps: 0 };
                    }
                    return p;
                });
            }

            // Check win
            const allFinished = newPawns.filter(p => p.owner === color).every(p => p.status === "finished");
            if (allFinished) {
                return { ...prev, pawns: newPawns, phase: "game_over", winner: color, message: `${color} wins! 🎉` };
            }

            // Next turn logic
            let nextPlayer = color;
            const playerCfg = cfg.players.find(p => p.color === color)!;
            const isHumanCurrent = playerCfg.type === "human";

            if (dice === 6 || captureOccurred) {
                const msg = dice === 6
                    ? `${isHumanCurrent ? "You" : "Bot"} rolled 6! Roll again.`
                    : `${isHumanCurrent ? "You" : "Bot"} captured! Roll again.`;
                const nextPhase = "waiting_roll";
                return { ...prev, pawns: newPawns, currentPlayer: nextPlayer, diceValue: null, diceRolled: false, selectedPawnId: null, phase: nextPhase, message: msg };
            }

            nextPlayer = getNextPlayer(color, cfg.turnOrder);
            const nextCfg = cfg.players.find(p => p.color === nextPlayer)!;
            const nextIsHuman = nextCfg.type === "human";
            return {
                ...prev,
                pawns: newPawns,
                currentPlayer: nextPlayer,
                diceValue: null,
                diceRolled: false,
                selectedPawnId: null,
                phase: "waiting_roll",
                message: nextIsHuman ? "Your turn! Hold the dice to roll." : "Bot's turn...",
            };
        });
    }, [cfg]);

    const applyMove = useCallback((prevState: GameState, pawnId: string): GameState => {
        const dice = prevState.diceValue!;
        const color = prevState.currentPlayer;
        const validMoves = getValidMoves(prevState.pawns, color, dice);
        const move = validMoves.find(m => m.pawn.id === pawnId);
        if (!move) return prevState;

        const newPawns = prevState.pawns.map(p => {
            if (p.id === pawnId) {
                if (move.action === "exit_base") {
                    // Quick jump for exit_base
                    return { ...p, steps: 0, position: move.targetCell, status: "active" as PawnStatus, targetSteps: 0 };
                } else {
                    // Animation for others
                    return { ...p, targetSteps: p.steps + dice };
                }
            }
            return p;
        });

        return { ...prevState, pawns: newPawns, phase: "bot_moving" }; // phase keeps interactions blocked
    }, [getValidMoves]);

    // ── Dice result handler (human) ──────────────────────────────────────────
    const handleDiceResult = useCallback((value: number) => {
        setState(prev => {
            if (prev.phase !== "waiting_roll" || prev.diceRolled) return prev;
            const validMoves = getValidMoves(prev.pawns, prev.currentPlayer, value);
            const playerCfg = cfg.players.find(p => p.color === prev.currentPlayer);
            const isBot = playerCfg?.type === "bot";

            if (validMoves.length === 0) {
                const nextPlayer = value === 6 ? prev.currentPlayer : getNextPlayer(prev.currentPlayer, cfg.turnOrder);
                const nextCfg = cfg.players.find(p => p.color === nextPlayer)!;
                const nextIsHuman = nextCfg.type === "human";
                return {
                    ...prev,
                    currentPlayer: nextPlayer,
                    diceValue: null,
                    diceRolled: false,
                    phase: "waiting_roll",
                    message: value === 6 ? "No moves available. Roll again!" : `No moves. ${nextIsHuman ? "Your turn!" : "Bot's turn..."}`,
                };
            }

            // Auto-move if only 1 valid move
            if (validMoves.length === 1) {
                const stateWithDice = { ...prev, diceValue: value, diceRolled: true, phase: "waiting_move" as const, message: "Moving..." };
                return applyMove(stateWithDice, validMoves[0].pawn.id);
            }

            // If it's a bot and several moves exist, go to bot_thinking to pick one
            if (isBot) {
                return { ...prev, diceValue: value, diceRolled: true, phase: "bot_thinking" as const, message: "Bot is thinking..." };
            }

            return { ...prev, diceValue: value, diceRolled: true, phase: "waiting_move" as const, message: "Choose a pawn to move." };
        });
    }, [getValidMoves, applyMove, cfg]);

    // ── Pawn click handler (human) ───────────────────────────────────────────
    const handlePawnClick = useCallback((pawnId: string) => {
        setState(prev => {
            if (prev.phase !== "waiting_move") return prev;
            const playerCfg = cfg.players.find(p => p.color === prev.currentPlayer);
            if (playerCfg?.type !== "human") return prev;
            const pawn = prev.pawns.find(p => p.id === pawnId);
            if (!pawn || pawn.owner !== prev.currentPlayer) return prev;
            return applyMove(prev, pawnId);
        });
    }, [applyMove, cfg]);

    // ── Bot turn (roll) ──────────────────────────────────────────────────────
    const runBotTurn = useCallback((diceValue: number) => {
        setState(prev => {
            const playerCfg = cfg.players.find(p => p.color === prev.currentPlayer);
            if (playerCfg?.type !== "bot" || prev.phase !== "bot_thinking") return prev;
            const validMoves = getValidMoves(prev.pawns, prev.currentPlayer, diceValue);

            if (validMoves.length === 0) {
                const nextPlayer = diceValue === 6 ? prev.currentPlayer : getNextPlayer(prev.currentPlayer, cfg.turnOrder);
                const nextCfg = cfg.players.find(p => p.color === nextPlayer)!;
                const nextIsHuman = nextCfg.type === "human";
                return {
                    ...prev,
                    currentPlayer: nextPlayer,
                    diceValue: null,
                    diceRolled: false,
                    phase: "waiting_roll",
                    message: `Bot passed. ${nextIsHuman ? "Your turn!" : "Next bot..."}`,
                };
            }

            // Bot AI: Capture > Finish > Exit base > Move furthest
            const captureMove = validMoves.find(m => {
                if (m.action === "exit_base") return false;
                return prev.pawns.some(p => p.owner !== prev.currentPlayer && p.position === m.targetCell && p.status === "active" && !SAFE_ZONES.has(m.targetCell));
            });
            const finishMove = validMoves.find(m => m.status === "finished");
            const exitMove = validMoves.find(m => m.action === "exit_base");
            const furthest = [...validMoves].sort((a, b) => b.steps - a.steps)[0];
            const chosenMove = captureMove || finishMove || exitMove || furthest;

            return {
                ...prev,
                diceValue: diceValue,
                diceRolled: true,
                selectedPawnId: chosenMove.pawn.id,
                phase: "bot_moving" as const,
                message: `Bot rolled ${diceValue}.`,
            };
        });
    }, [getValidMoves, cfg]);

    // ── Bot execute move ─────────────────────────────────────────────────────
    const executeBotMove = useCallback(() => {
        setState(prev => {
            // For bot, phase transition happens here if we want to wait after roll
            if (prev.phase !== "bot_moving" || !prev.selectedPawnId) return prev;
            return applyMove(prev, prev.selectedPawnId);
        });
    }, [applyMove]);

    // ── Step Animation Logic ─────────────────────────────────────────────────
    const stepForward = useCallback((pawnId: string) => {
        setState(prev => {
            const pawn = prev.pawns.find(p => p.id === pawnId);
            if (!pawn || pawn.targetSteps === undefined || pawn.steps >= pawn.targetSteps) return prev;

            const next = calculateMove(pawn, 1, cfg);
            if (!next) return prev;

            const newPawns = prev.pawns.map(p =>
                p.id === pawnId ? { ...p, steps: next.steps, position: next.cell, status: next.status } : p
            );

            return { ...prev, pawns: newPawns };
        });
    }, [cfg]);

    // Internal animation loop
    useEffect(() => {
        const animatingPawn = state.pawns.find(p => p.targetSteps !== undefined && p.steps < p.targetSteps);
        if (animatingPawn) {
            const timer = setTimeout(() => {
                stepForward(animatingPawn.id);
            }, 400); // 400ms per step
            return () => clearTimeout(timer);
        } else {
            const justFinished = state.pawns.find(p => p.targetSteps !== undefined && p.steps === p.targetSteps);
            if (justFinished) {
                finalizeMove(justFinished.id);
            }
        }
    }, [state.pawns, stepForward, finalizeMove]);

    // ── Reset ────────────────────────────────────────────────────────────────
    const resetGame = useCallback(() => setState(createInitialState()), [createInitialState]);

    return { state, cfg, handleDiceResult, handlePawnClick, runBotTurn, executeBotMove, resetGame, getValidMoves };
}
