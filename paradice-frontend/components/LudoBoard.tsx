"use client";

import React from "react";
import {
    GameState, Pawn,
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

function SVGPion({ cx, cy, color, id, clickable, selected, scale = 1, offset = [0, 0], onClick, onMouseEnter, onMouseLeave }: {
    cx: number; cy: number; color: string; id: string;
    clickable?: boolean; selected?: boolean; scale?: number; offset?: [number, number];
    onClick?: () => void; onMouseEnter?: () => void; onMouseLeave?: () => void;
}) {
    return (
        <g
            transform={`translate(${cx + offset[0]}, ${cy + offset[1]}) scale(${scale})`}
            id={id}
            data-pion-id={id}
            onClick={clickable ? onClick : undefined}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{ cursor: clickable ? "pointer" : "default" }}
        >
            {selected && <circle cx={0} cy={-6} r={7} fill="none" stroke="gold" strokeWidth="2" opacity="0.9" />}
            {clickable && !selected && <circle cx={0} cy={-6} r={6} fill="rgba(255,255,255,0.4)" stroke="gold" strokeWidth="1" opacity="0.7"><animate attributeName="r" values="5.5;7;5.5" dur="1.2s" repeatCount="indefinite" /></circle>}

            <path d="M 0 0 Q -3.8 -4 -3.8 -8 A 3.8 3.8 0 1 1 3.8 -8 Q 3.8 -4 0 0 Z"
                fill={C.white} stroke={C.black} strokeWidth="0.8" strokeLinejoin="round" />

            <path d="M 0 -1.2 Q -2.5 -4 -2.5 -8 A 2.5 2.5 0 1 1 2.5 -8 Q 2.5 -4 0 -1.2 Z"
                fill={color} stroke={C.black} strokeWidth="0.5" />

            <circle cx="-1" cy="-8.5" r="0.9" fill={C.white} />
            <circle cx="-2" cy="-7.5" r="0.4" fill={C.white} />
        </g>
    );
}

function HomeBase({ x, y, color, baseName }: { x: number; y: number; color: string; baseName: string }) {
    return (
        <g id={`base-${baseName}`}>
            <rect x={x} y={y} width="60" height="60" fill={color} />
            <rect x={x + 10} y={y + 10} width="40" height="40" fill={C.white} stroke={C.black} strokeWidth="1" />
            <circle cx={x + 20} cy={y + 20} r="6" fill={color} stroke={C.black} strokeWidth="1" />
            <circle cx={x + 40} cy={y + 20} r="6" fill={color} stroke={C.black} strokeWidth="1" />
            <circle cx={x + 20} cy={y + 40} r="6" fill={color} stroke={C.black} strokeWidth="1" />
            <circle cx={x + 40} cy={y + 40} r="6" fill={color} stroke={C.black} strokeWidth="1" />
        </g>
    );
}

const SLOT_VISUAL = {
    TL: { baseX: 0, baseY: 0, laneRect: { x: 10, y: 70, w: 50, h: 10 }, startRect: { x: 10, y: 60, w: 10, h: 10 }, arrowCx: 5, arrowCy: 75, arrowRot: 0, starCx: 25, starCy: 85, trianglePoints: "60,60 60,90 75,75" },
    TR: { baseX: 90, baseY: 0, laneRect: { x: 70, y: 10, w: 10, h: 50 }, startRect: { x: 80, y: 10, w: 10, h: 10 }, arrowCx: 75, arrowCy: 5, arrowRot: 90, starCx: 65, starCy: 25, trianglePoints: "60,60 90,60 75,75" },
    BL: { baseX: 0, baseY: 90, laneRect: { x: 70, y: 90, w: 10, h: 50 }, startRect: { x: 60, y: 130, w: 10, h: 10 }, arrowCx: 75, arrowCy: 145, arrowRot: -90, starCx: 85, starCy: 125, trianglePoints: "60,90 90,90 75,75" },
    BR: { baseX: 90, baseY: 90, laneRect: { x: 90, y: 70, w: 50, h: 10 }, startRect: { x: 130, y: 80, w: 10, h: 10 }, arrowCx: 145, arrowCy: 75, arrowRot: 180, starCx: 125, starCy: 65, trianglePoints: "90,60 90,90 75,75" },
};

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
    const { pawns, currentPlayer, pendingPlayer, selectedPawnId } = gameState;
    const [hoveredCell, setHoveredCell] = React.useState<number | null>(null);

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

    const slotColor: Record<string, string> = {};
    for (const sc of cfg.players) {
        slotColor[sc.slot] = C[sc.color];
    }

    const isHumanTurn = cfg.players.find((p) => p.color === currentPlayer)?.type === "human";

    return (
        <div className="w-full aspect-square relative max-w-[800px] mx-auto p-4 flex items-center justify-center">
            {cfg.players.filter((p) => p.active).map((p) => {
                const top = p.slot === "TL" || p.slot === "TR" ? "top-[-10px]" : "bottom-[-10px]";
                const left = p.slot === "TL" || p.slot === "BL" ? "left-3" : "right-3";
                const isActive = p.color === currentPlayer;
                const isPending = p.color === pendingPlayer;
                return (
                    <div
                        key={p.color}
                        className={`absolute z-20 ${top} ${left} rounded-full border px-3 py-1.5 text-sm font-bold transition-all ${
                            isActive
                                ? "scale-105 border-white bg-white/95 ring-4 ring-white/60"
                                : isPending
                                    ? "border-white/90 bg-white/80"
                                    : "border-transparent bg-transparent"
                        }`}
                        style={{
                            color: C[p.color],
                            boxShadow: isActive ? `0 0 0 3px ${C[p.color]}55, 0 12px 24px rgba(15, 23, 42, 0.15)` : undefined,
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <span>{p.label}</span>
                            {isActive && (
                                <span className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-white" style={{ backgroundColor: C[p.color] }}>
                                    Turn
                                </span>
                            )}
                            {!isActive && isPending && (
                                <span className="rounded-full bg-slate-900/75 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                                    Next
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}

            <svg viewBox="0 0 160 170" className="w-full h-full block bg-white border-[1.5px] border-black shadow-lg" style={{ overflow: "visible" }}>
                <g transform="translate(5, 12)">
                    <rect x="0" y="0" width="150" height="150" fill={C.white} />

                    {(["TL", "TR", "BL", "BR"] as const).map((slot) => {
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

                    {(["TL", "TR", "BL", "BR"] as const).map((slot) => {
                        const vis = SLOT_VISUAL[slot];
                        const sc = cfg.players.find((p) => p.slot === slot)!;
                        const isActive = sc.color === currentPlayer;
                        const isPending = sc.color === pendingPlayer;

                        if (!isActive && !isPending) return null;

                        return (
                            <g key={`base-highlight-${slot}`} pointerEvents="none">
                                <rect
                                    x={vis.baseX}
                                    y={vis.baseY}
                                    width="60"
                                    height="60"
                                    rx="4"
                                    fill={isActive ? `${C[sc.color]}30` : `${C[sc.color]}18`}
                                    opacity={isActive ? "1" : "0.7"}
                                />
                                <rect
                                    x={vis.baseX + 4}
                                    y={vis.baseY + 4}
                                    width="52"
                                    height="52"
                                    rx="4"
                                    fill="none"
                                    stroke={C[sc.color]}
                                    strokeWidth={isActive ? "2.2" : "1.2"}
                                    opacity={isActive ? "0.9" : "0.4"}
                                />
                                <rect
                                    x={vis.baseX + 10}
                                    y={vis.baseY + 10}
                                    width="40"
                                    height="40"
                                    rx="3"
                                    fill="none"
                                    stroke={isActive ? C.white : C[sc.color]}
                                    strokeWidth={isActive ? "1.2" : "0.7"}
                                    opacity={isActive ? "0.75" : "0.25"}
                                />
                            </g>
                        );
                    })}

                    {(["TL", "TR", "BL", "BR"] as const).map((slot) => {
                        const vis = SLOT_VISUAL[slot];
                        const sc = cfg.players.find((p) => p.slot === slot)!;
                        return <HomeBase key={slot} x={vis.baseX} y={vis.baseY} color={C[sc.color]} baseName={sc.color} />;
                    })}

                    {(["TL", "TR", "BL", "BR"] as const).map((slot) => {
                        const vis = SLOT_VISUAL[slot];
                        return <polygon key={`tri-${slot}`} points={vis.trianglePoints} fill={slotColor[slot]} stroke={C.black} strokeWidth="0.5" />;
                    })}

                    <line x1="60" y1="0" x2="60" y2="150" stroke={C.black} strokeWidth="1" />
                    <line x1="90" y1="0" x2="90" y2="150" stroke={C.black} strokeWidth="1" />
                    <line x1="0" y1="60" x2="150" y2="60" stroke={C.black} strokeWidth="1" />
                    <line x1="0" y1="90" x2="150" y2="90" stroke={C.black} strokeWidth="1" />
                    <line x1="60" y1="60" x2="90" y2="90" stroke={C.black} strokeWidth="1" />
                    <line x1="60" y1="90" x2="90" y2="60" stroke={C.black} strokeWidth="1" />
                    <rect x="0" y="0" width="150" height="150" fill="none" stroke={C.black} strokeWidth="2" />

                    {(["TL", "TR", "BL", "BR"] as const).map((slot) => {
                        const vis = SLOT_VISUAL[slot];
                        return (
                            <React.Fragment key={`icons-${slot}`}>
                                <SVGArrow cx={vis.arrowCx} cy={vis.arrowCy} rot={vis.arrowRot} color={slotColor[slot]} />
                                <SVGStar cx={vis.starCx} cy={vis.starCy} />
                            </React.Fragment>
                        );
                    })}

                    {(() => {
                        const cellGroups: Record<number, Pawn[]> = {};
                        const basePawns: Pawn[] = [];

                        pawns.forEach((p) => {
                            if (p.status === "finished") return;
                            if (p.status === "base") {
                                basePawns.push(p);
                            } else if (p.position !== null) {
                                if (!cellGroups[p.position]) cellGroups[p.position] = [];
                                cellGroups[p.position].push(p);
                            }
                        });

                        const renderedPawns: React.ReactNode[] = [];

                        basePawns.forEach((pawn) => {
                            const pos = getPawnPosition(pawn, cfg);
                            if (!pos) return;
                            const [cx, cy] = pos;
                            renderedPawns.push(
                                <SVGPion
                                    key={pawn.id}
                                    id={pawn.id}
                                    cx={cx}
                                    cy={cy - 1}
                                    color={C[pawn.owner]}
                                    clickable={isHumanTurn && movablePawnIds.includes(pawn.id)}
                                    selected={pawn.id === selectedPawnId}
                                    onClick={() => onPawnClick(pawn.id)}
                                />
                            );
                        });

                        Object.entries(cellGroups).forEach(([cellStr, group]) => {
                            const cellId = parseInt(cellStr);
                            const pos = CELL_COORDS[cellId];
                            if (!pos) return;

                            const [cx, cy] = pos;
                            const groupSize = group.length;
                            const scale = groupSize > 1 ? 0.7 : 1;

                            group.forEach((pawn, idx) => {
                                let offsetX = 0;
                                let offsetY = 0;
                                if (groupSize > 1) {
                                    const offsets = [[-2, -2], [2, -2], [-2, 2], [2, 2], [0, 0]];
                                    offsetX = offsets[idx % 5][0];
                                    offsetY = offsets[idx % 5][1];
                                }

                                renderedPawns.push(
                                    <SVGPion
                                        key={pawn.id}
                                        id={pawn.id}
                                        cx={cx}
                                        cy={cy - 1}
                                        color={C[pawn.owner]}
                                        clickable={isHumanTurn && movablePawnIds.includes(pawn.id)}
                                        selected={pawn.id === selectedPawnId}
                                        scale={scale}
                                        offset={[offsetX, offsetY]}
                                        onClick={() => onPawnClick(pawn.id)}
                                        onMouseEnter={() => setHoveredCell(cellId)}
                                        onMouseLeave={() => setHoveredCell(null)}
                                    />
                                );
                            });
                        });

                        return renderedPawns;
                    })()}
                </g>

                {hoveredCell !== null && (() => {
                    const group = pawns.filter((p) => p.position === hoveredCell && p.status !== "base" && p.status !== "finished");
                    if (group.length <= 1) return null;

                    const [cx, cy] = CELL_COORDS[hoveredCell] || [0, 0];
                    return (
                        <g transform={`translate(${cx}, ${cy - 12})`} style={{ pointerEvents: "none" }}>
                            <rect x="-20" y="-12" width="40" height={group.length * 5 + 4} rx="2" fill="rgba(0,0,0,0.85)" stroke="white" strokeWidth="0.5" />
                            {group.map((p, i) => (
                                <g key={p.id} transform={`translate(0, ${i * 5 - 5})`}>
                                    <circle cx="-12" cy="0" r="1.5" fill={C[p.owner]} stroke="white" strokeWidth="0.2" />
                                    <text x="-8" y="1.5" fill="white" fontSize="4" fontWeight="bold" style={{ textTransform: "capitalize" }}>
                                        {p.owner}
                                    </text>
                                </g>
                            ))}
                        </g>
                    );
                })()}
            </svg>
        </div>
    );
}
