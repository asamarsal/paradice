"use client";

import React from "react";
import {
    GameState, Pawn, PlayerColor, SlotConfig,
    CELL_COORDS, BuiltGameConfig
} from "@/types/ludo";

const C: Record<string, string> = {
    green: "#0B9B43",
    yellow: "#FFD600",
    red: "#DF1921",
    blue: "#1C489E",
    white: "#FFFFFF",
    black: "#000000",
};

function SVGStar({ cx, cy }: { cx: number; cy: number }) {
    const points = [];
    for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? 3.5 : 1.5;
        points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    return <polygon points={points.join(" ")} fill="none" stroke={C.black} strokeWidth="0.5" strokeLinejoin="miter" />;
}

function SVGArrow({ cx, cy, rot, color }: { cx: number; cy: number; rot: number; color: string }) {
    return (
        <g transform={`rotate(${rot} ${cx} ${cy})`} fill={color}>
            <polygon points={`${cx + 3.5},${cy} ${cx - 0.5},${cy - 3.5} ${cx - 0.5},${cy - 1.5} ${cx - 3.5},${cy - 1.5} ${cx - 3.5},${cy + 1.5} ${cx - 0.5},${cy + 1.5} ${cx - 0.5},${cy + 3.5}`} />
        </g>
    );
}

function SVGPion({ cx, cy, color, id, clickable, selected, onClick }: {
    cx: number; cy: number; color: string; id: string;
    clickable?: boolean; selected?: boolean; onClick?: () => void;
}) {
    return (
        <g
            transform={`translate(${cx}, ${cy})`}
            id={id}
            data-pion-id={id}
            onClick={clickable ? onClick : undefined}
            style={{ cursor: clickable ? "pointer" : "default" }}
        >
            {/* Glow ring when selected/clickable */}
            {selected && <circle cx={0} cy={-6} r={8} fill="none" stroke="gold" strokeWidth="2" opacity="0.9" />}
            {clickable && !selected && <circle cx={0} cy={-6} r={7} fill="rgba(255,255,255,0.4)" stroke="gold" strokeWidth="1" opacity="0.7"><animate attributeName="r" values="6;8;6" dur="1.2s" repeatCount="indefinite" /></circle>}
            {/* Outer border & white padding */}
            <path d="M 0 0 Q -4.5 -5 -4.5 -9 A 4.5 4.5 0 1 1 4.5 -9 Q 4.5 -5 0 0 Z"
                fill={C.white} stroke={C.black} strokeWidth="1" strokeLinejoin="round" />
            {/* Colored Body */}
            <path d="M 0 -1.5 Q -3 -5 -3 -9 A 3 3 0 1 1 3 -9 Q 3 -5 0 -1.5 Z"
                fill={color} stroke={C.black} strokeWidth="0.5" />
            {/* Glossy Highlights */}
            <circle cx="-1.2" cy="-10" r="1.1" fill={C.white} />
            <circle cx="-2.5" cy="-8.5" r="0.4" fill={C.white} />
        </g>
    );
}

function HomeBase({ x, y, color, baseName }: { x: number; y: number; color: string; baseName: string }) {
    return (
        <g id={`base-${baseName}`}>
            <rect x={x} y={y} width="60" height="60" fill={color} />
            <rect x={x + 10} y={y + 10} width="40" height="40" fill={C.white} stroke={C.black} strokeWidth="1" />
            {/* Starting Slots (empty circles) */}
            <circle cx={x + 20} cy={y + 20} r="6" fill={color} stroke={C.black} strokeWidth="1" />
            <circle cx={x + 40} cy={y + 20} r="6" fill={color} stroke={C.black} strokeWidth="1" />
            <circle cx={x + 20} cy={y + 40} r="6" fill={color} stroke={C.black} strokeWidth="1" />
            <circle cx={x + 40} cy={y + 40} r="6" fill={color} stroke={C.black} strokeWidth="1" />
        </g>
    );
}

// ─── Slot layout data (fixed board positions) ────────────────────────────────
const SLOT_VISUAL = {
    TL: { baseX: 0, baseY: 0, laneRect: { x: 10, y: 70, w: 50, h: 10 }, startRect: { x: 10, y: 60, w: 10, h: 10 }, arrowCx: 5, arrowCy: 75, arrowRot: 0, starCx: 25, starCy: 85, trianglePoints: "60,60 60,90 75,75", homeSlots: [[20, 20], [40, 20], [20, 40], [40, 40]] },
    TR: { baseX: 90, baseY: 0, laneRect: { x: 70, y: 10, w: 10, h: 50 }, startRect: { x: 80, y: 10, w: 10, h: 10 }, arrowCx: 75, arrowCy: 5, arrowRot: 90, starCx: 65, starCy: 25, trianglePoints: "60,60 90,60 75,75", homeSlots: [[110, 20], [130, 20], [110, 40], [130, 40]] },
    BL: { baseX: 0, baseY: 90, laneRect: { x: 70, y: 90, w: 10, h: 50 }, startRect: { x: 60, y: 130, w: 10, h: 10 }, arrowCx: 75, arrowCy: 145, arrowRot: -90, starCx: 85, starCy: 125, trianglePoints: "60,90 90,90 75,75", homeSlots: [[20, 110], [40, 110], [20, 130], [40, 130]] },
    BR: { baseX: 90, baseY: 90, laneRect: { x: 90, y: 70, w: 50, h: 10 }, startRect: { x: 130, y: 80, w: 10, h: 10 }, arrowCx: 145, arrowCy: 75, arrowRot: 180, starCx: 125, starCy: 65, trianglePoints: "90,60 90,90 75,75", homeSlots: [[110, 110], [130, 110], [110, 130], [130, 130]] },
};

// ─── Board Component ─────────────────────────────────────────────────────────
interface LudoBoardProps {
    gameState: GameState;
    cfg: BuiltGameConfig;
    movablePawnIds: string[];
    onPawnClick: (id: string) => void;
}

function getPawnPosition(pawn: Pawn, cfg: BuiltGameConfig): [number, number] | null {
    if (pawn.status === "finished") return null;
    if (pawn.status === "base") {
        const homeSlots = cfg.homePositions[pawn.owner];
        const idx = parseInt(pawn.id.split("_")[1]);
        return homeSlots[idx];
    }
    if (pawn.position !== null) {
        return CELL_COORDS[pawn.position] || null;
    }
    return null;
}

export default function LudoBoard({ gameState, cfg, movablePawnIds, onPawnClick }: LudoBoardProps) {
    const { pawns, currentPlayer, selectedPawnId } = gameState;

    // ── Grid lines ───────────────────────────────────────────────────────────
    const gridLines = [];
    for (let i = 70; i <= 80; i += 10) {
        gridLines.push(<line key={`vt${i}`} x1={i} y1="0" x2={i} y2="60" stroke={C.black} strokeWidth="0.5" />);
        gridLines.push(<line key={`vb${i}`} x1={i} y1="90" x2={i} y2="150" stroke={C.black} strokeWidth="0.5" />);
    }
    for (let i = 10; i <= 50; i += 10) {
        gridLines.push(<line key={`ht${i}`} x1="60" y1={i} x2="90" y2={i} stroke={C.black} strokeWidth="0.5" />);
    }
    for (let i = 100; i <= 140; i += 10) {
        gridLines.push(<line key={`hb${i}`} x1="60" y1={i} x2="90" y2={i} stroke={C.black} strokeWidth="0.5" />);
    }
    for (let i = 10; i <= 50; i += 10) {
        gridLines.push(<line key={`vl${i}`} x1={i} y1="60" x2={i} y2="90" stroke={C.black} strokeWidth="0.5" />);
    }
    for (let i = 100; i <= 140; i += 10) {
        gridLines.push(<line key={`vr${i}`} x1={i} y1="60" x2={i} y2="90" stroke={C.black} strokeWidth="0.5" />);
    }
    for (let i = 70; i <= 80; i += 10) {
        gridLines.push(<line key={`hl${i}`} x1="0" y1={i} x2="60" y2={i} stroke={C.black} strokeWidth="0.5" />);
        gridLines.push(<line key={`hr${i}`} x1="90" y1={i} x2="150" y2={i} stroke={C.black} strokeWidth="0.5" />);
    }

    // ── Build slot→color lookup from config ──────────────────────────────────
    const slotColor: Record<string, string> = {};
    for (const sc of cfg.players) {
        slotColor[sc.slot] = C[sc.color];
    }

    const isHumanTurn = cfg.players.find(p => p.color === currentPlayer)?.type === "human";
    const activePawns = pawns.filter(p => p.status !== "finished");

    return (
        <div className="w-full aspect-square relative max-w-[800px] mx-auto p-4 flex items-center justify-center">
            {/* Player labels */}
            {cfg.players.filter(p => p.active).map(p => {
                const vis = SLOT_VISUAL[p.slot];
                const top = p.slot === "TL" || p.slot === "TR" ? "top-0" : "bottom-0";
                const left = p.slot === "TL" || p.slot === "BL" ? "left-4" : "right-4";
                return (
                    <div key={p.color} className={`absolute ${top} ${left} text-sm font-bold`} style={{ color: C[p.color] }}>
                        {p.label} {p.type === "bot" ? "🤖" : "👤"}
                    </div>
                );
            })}

            <svg viewBox="0 0 150 150" className="w-full h-full block bg-white border-[1.5px] border-black shadow-lg">
                <rect x="0" y="0" width="150" height="150" fill={C.white} />

                {/* Home lane colored strips + start cell highlights (dynamic per mode) */}
                {(["TL", "TR", "BL", "BR"] as const).map(slot => {
                    const vis = SLOT_VISUAL[slot];
                    const col = slotColor[slot];
                    return (
                        <React.Fragment key={slot}>
                            <rect x={vis.laneRect.x} y={vis.laneRect.y} width={vis.laneRect.w} height={vis.laneRect.h} fill={col} />
                            <rect x={vis.startRect.x} y={vis.startRect.y} width={vis.startRect.w} height={vis.startRect.h} fill={col} />
                        </React.Fragment>
                    );
                })}

                {gridLines}

                {/* Home bases (dynamic colors) */}
                {(["TL", "TR", "BL", "BR"] as const).map(slot => {
                    const vis = SLOT_VISUAL[slot];
                    const sc = cfg.players.find(p => p.slot === slot)!;
                    return <HomeBase key={slot} x={vis.baseX} y={vis.baseY} color={C[sc.color]} baseName={sc.color} />;
                })}

                {/* Center triangles (dynamic colors) */}
                {(["TL", "TR", "BL", "BR"] as const).map(slot => {
                    const vis = SLOT_VISUAL[slot];
                    return <polygon key={`tri-${slot}`} points={vis.trianglePoints} fill={slotColor[slot]} stroke={C.black} strokeWidth="0.5" />;
                })}

                {/* Borders */}
                <line x1="60" y1="0" x2="60" y2="150" stroke={C.black} strokeWidth="1" />
                <line x1="90" y1="0" x2="90" y2="150" stroke={C.black} strokeWidth="1" />
                <line x1="0" y1="60" x2="150" y2="60" stroke={C.black} strokeWidth="1" />
                <line x1="0" y1="90" x2="150" y2="90" stroke={C.black} strokeWidth="1" />
                <line x1="60" y1="60" x2="90" y2="90" stroke={C.black} strokeWidth="1" />
                <line x1="60" y1="90" x2="90" y2="60" stroke={C.black} strokeWidth="1" />
                <rect x="0" y="0" width="150" height="150" fill="none" stroke={C.black} strokeWidth="2" />

                {/* Arrows & Stars (dynamic colors) */}
                {(["TL", "TR", "BL", "BR"] as const).map(slot => {
                    const vis = SLOT_VISUAL[slot];
                    return (
                        <React.Fragment key={`icons-${slot}`}>
                            <SVGArrow cx={vis.arrowCx} cy={vis.arrowCy} rot={vis.arrowRot} color={slotColor[slot]} />
                            <SVGStar cx={vis.starCx} cy={vis.starCy} />
                        </React.Fragment>
                    );
                })}

                {/* Render Pawns from game state */}
                {activePawns.map(pawn => {
                    const pos = getPawnPosition(pawn, cfg);
                    if (!pos) return null;
                    const [cx, cy] = pos;
                    const color = C[pawn.owner];
                    const isClickable = isHumanTurn && movablePawnIds.includes(pawn.id);
                    const isSelected = pawn.id === selectedPawnId;
                    return (
                        <SVGPion
                            key={pawn.id}
                            id={pawn.id}
                            cx={cx}
                            cy={cy - 1}
                            color={color}
                            clickable={isClickable}
                            selected={isSelected}
                            onClick={() => onPawnClick(pawn.id)}
                        />
                    );
                })}
            </svg>
        </div>
    );
}
