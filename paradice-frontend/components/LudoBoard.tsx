"use client";

import React from "react";

const C = {
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

function SVGPion({ cx, cy, color, id }: { cx: number; cy: number; color: string; id: string }) {
    return (
        <g transform={`translate(${cx}, ${cy})`} id={id} data-pion-id={id}>
            {/* Outer border & white padding */}
            <path
                d="M 0 0 Q -4.5 -5 -4.5 -9 A 4.5 4.5 0 1 1 4.5 -9 Q 4.5 -5 0 0 Z"
                fill={C.white}
                stroke={C.black}
                strokeWidth="1"
                strokeLinejoin="round"
            />
            {/* Colored Body */}
            <path
                d="M 0 -1.5 Q -3 -5 -3 -9 A 3 3 0 1 1 3 -9 Q 3 -5 0 -1.5 Z"
                fill={color}
                stroke={C.black}
                strokeWidth="0.5"
            />
            {/* Glossy Spot Highlights */}
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

            {/* Starting Slots */}
            <circle cx={x + 20} cy={y + 20} r="6" fill={color} stroke={C.black} strokeWidth="1" />
            <circle cx={x + 40} cy={y + 20} r="6" fill={color} stroke={C.black} strokeWidth="1" />
            <circle cx={x + 20} cy={y + 40} r="6" fill={color} stroke={C.black} strokeWidth="1" />
            <circle cx={x + 40} cy={y + 40} r="6" fill={color} stroke={C.black} strokeWidth="1" />

            {/* 4 Standing Pions */}
            <SVGPion cx={x + 20} cy={y + 20} color={color} id={`${baseName}1`} />
            <SVGPion cx={x + 40} cy={y + 20} color={color} id={`${baseName}2`} />
            <SVGPion cx={x + 20} cy={y + 40} color={color} id={`${baseName}3`} />
            <SVGPion cx={x + 40} cy={y + 40} color={color} id={`${baseName}4`} />
        </g>
    );
}

export default function LudoBoard() {
    const gridLines = [];

    // Vertical grid lines for vertical paths (Top and Bottom)
    for (let i = 70; i <= 80; i += 10) {
        gridLines.push(<line key={`vt${i}`} x1={i} y1="0" x2={i} y2="60" stroke={C.black} strokeWidth="0.5" />);
        gridLines.push(<line key={`vb${i}`} x1={i} y1="90" x2={i} y2="150" stroke={C.black} strokeWidth="0.5" />);
    }
    // Horizontal grid lines for vertical paths (Top and Bottom)
    for (let i = 10; i <= 50; i += 10) {
        gridLines.push(<line key={`ht${i}`} x1="60" y1={i} x2="90" y2={i} stroke={C.black} strokeWidth="0.5" />);
    }
    for (let i = 100; i <= 140; i += 10) {
        gridLines.push(<line key={`hb${i}`} x1="60" y1={i} x2="90" y2={i} stroke={C.black} strokeWidth="0.5" />);
    }

    // Vertical grid lines for horizontal paths (Left and Right)
    for (let i = 10; i <= 50; i += 10) {
        gridLines.push(<line key={`vl${i}`} x1={i} y1="60" x2={i} y2="90" stroke={C.black} strokeWidth="0.5" />);
    }
    for (let i = 100; i <= 140; i += 10) {
        gridLines.push(<line key={`vr${i}`} x1={i} y1="60" x2={i} y2="90" stroke={C.black} strokeWidth="0.5" />);
    }
    // Horizontal grid lines for horizontal paths (Left and Right)
    for (let i = 70; i <= 80; i += 10) {
        gridLines.push(<line key={`hl${i}`} x1="0" y1={i} x2="60" y2={i} stroke={C.black} strokeWidth="0.5" />);
        gridLines.push(<line key={`hr${i}`} x1="90" y1={i} x2="150" y2={i} stroke={C.black} strokeWidth="0.5" />);
    }

    return (
        <div className="w-full aspect-square relative max-w-[800px] mx-auto p-4 flex items-center justify-center">
            <svg viewBox="0 0 150 150" className="w-full h-full block bg-white border-[1.5px] border-black shadow-lg">

                {/* Base Background (under grid lines) */}
                <rect x="0" y="0" width="150" height="150" fill={C.white} />

                {/* Path Centers (Colored home stretches) */}
                <rect x="10" y="70" width="50" height="10" fill={C.green} />
                <rect x="70" y="10" width="10" height="50" fill={C.yellow} />
                <rect x="90" y="70" width="50" height="10" fill={C.blue} />
                <rect x="70" y="90" width="10" height="50" fill={C.red} />

                {/* Additional Start Colors Outside House */}
                <rect x="10" y="60" width="10" height="10" fill={C.green} />
                <rect x="80" y="10" width="10" height="10" fill={C.yellow} />
                <rect x="130" y="80" width="10" height="10" fill={C.blue} />
                <rect x="60" y="130" width="10" height="10" fill={C.red} />

                {/* Grid Lines Layer */}
                {gridLines}

                {/* Cover Bases and Center on top of grid lines */}
                <HomeBase x={0} y={0} color={C.green} baseName="green" />
                <HomeBase x={90} y={0} color={C.yellow} baseName="yellow" />
                <HomeBase x={0} y={90} color={C.red} baseName="red" />
                <HomeBase x={90} y={90} color={C.blue} baseName="blue" />

                {/* Center Triangles */}
                <polygon points="60,60 90,60 75,75" fill={C.yellow} stroke={C.black} strokeWidth="0.5" />
                <polygon points="90,60 90,90 75,75" fill={C.blue} stroke={C.black} strokeWidth="0.5" />
                <polygon points="60,90 90,90 75,75" fill={C.red} stroke={C.black} strokeWidth="0.5" />
                <polygon points="60,60 60,90 75,75" fill={C.green} stroke={C.black} strokeWidth="0.5" />

                {/* Major Thick Borders Disconnecting Home Bases from Paths and Center */}
                <line x1="60" y1="0" x2="60" y2="150" stroke={C.black} strokeWidth="1" />
                <line x1="90" y1="0" x2="90" y2="150" stroke={C.black} strokeWidth="1" />
                <line x1="0" y1="60" x2="150" y2="60" stroke={C.black} strokeWidth="1" />
                <line x1="0" y1="90" x2="150" y2="90" stroke={C.black} strokeWidth="1" />

                {/* Center Diagonal Separators */}
                <line x1="60" y1="60" x2="90" y2="90" stroke={C.black} strokeWidth="1" />
                <line x1="60" y1="90" x2="90" y2="60" stroke={C.black} strokeWidth="1" />

                {/* Border box */}
                <rect x="0" y="0" width="150" height="150" fill="none" stroke={C.black} strokeWidth="2" />

                {/* Icons Layer */}
                {/* Left Path (Green) */}
                <SVGArrow cx={5} cy={75} rot={0} color={C.green} /> {/* Entry Arrow */}
                <SVGStar cx={25} cy={85} /> {/* Bottom row star */}

                {/* Top Path (Yellow) */}
                <SVGArrow cx={75} cy={5} rot={90} color={C.yellow} /> {/* Entry Arrow */}
                <SVGStar cx={65} cy={25} /> {/* Left col star */}

                {/* Right Path (Blue) */}
                <SVGArrow cx={145} cy={75} rot={180} color={C.blue} /> {/* Entry Arrow */}
                <SVGStar cx={125} cy={65} /> {/* Top row star */}

                {/* Bottom Path (Red) */}
                <SVGArrow cx={75} cy={145} rot={-90} color={C.red} /> {/* Entry Arrow */}
                <SVGStar cx={85} cy={125} /> {/* Right col star */}

            </svg>
        </div>
    );
}
