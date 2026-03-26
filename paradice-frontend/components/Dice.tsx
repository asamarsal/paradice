"use client";
import React, { useState } from "react";

const getDots = (val: number) => {
    const dots = [];
    const dotClass = "w-3.5 h-3.5 bg-white rounded-full place-self-center shadow-inner";

    if (val === 1) {
        dots.push(<div key={1} className={`${dotClass} col-start-2 row-start-2`} />);
    } else if (val === 2) {
        dots.push(<div key={1} className={`${dotClass} col-start-1 row-start-1`} />);
        dots.push(<div key={2} className={`${dotClass} col-start-3 row-start-3`} />);
    } else if (val === 3) {
        dots.push(<div key={1} className={`${dotClass} col-start-1 row-start-1`} />);
        dots.push(<div key={2} className={`${dotClass} col-start-2 row-start-2`} />);
        dots.push(<div key={3} className={`${dotClass} col-start-3 row-start-3`} />);
    } else if (val === 4) {
        dots.push(<div key={1} className={`${dotClass} col-start-1 row-start-1`} />);
        dots.push(<div key={2} className={`${dotClass} col-start-3 row-start-1`} />);
        dots.push(<div key={3} className={`${dotClass} col-start-1 row-start-3`} />);
        dots.push(<div key={4} className={`${dotClass} col-start-3 row-start-3`} />);
    } else if (val === 5) {
        dots.push(<div key={1} className={`${dotClass} col-start-1 row-start-1`} />);
        dots.push(<div key={2} className={`${dotClass} col-start-3 row-start-1`} />);
        dots.push(<div key={3} className={`${dotClass} col-start-2 row-start-2`} />);
        dots.push(<div key={4} className={`${dotClass} col-start-1 row-start-3`} />);
        dots.push(<div key={5} className={`${dotClass} col-start-3 row-start-3`} />);
    } else if (val === 6) {
        dots.push(<div key={1} className={`${dotClass} col-start-1 row-start-1`} />);
        dots.push(<div key={2} className={`${dotClass} col-start-3 row-start-1`} />);
        dots.push(<div key={3} className={`${dotClass} col-start-1 row-start-2`} />);
        dots.push(<div key={4} className={`${dotClass} col-start-3 row-start-2`} />);
        dots.push(<div key={5} className={`${dotClass} col-start-1 row-start-3`} />);
        dots.push(<div key={6} className={`${dotClass} col-start-3 row-start-3`} />);
    }
    return dots;
};

const DiceFace = ({ value, transform }: { value: number, transform: string }) => {
    return (
        <div
            className="absolute inset-0 bg-[#8B5CF6] border-2 border-[#4C1D95] grid grid-cols-3 grid-rows-3 p-3 shadow-inner"
            style={{
                transform,
                backfaceVisibility: "hidden",
                width: "96.5px", // Slight oversize to overlap and hide gaps from anti-aliasing
                height: "96.5px",
                margin: "-0.25px"
            }}
        >
            {getDots(value)}
        </div>
    );
};

export default function Dice() {
    const [value, setValue] = useState(6);
    const [isRolling, setIsRolling] = useState(false);
    // Start with a slight 3D angle showing face 6 (Back) perfectly?
    // Actually, setting initial rotation to face 6: target offset for 6 is x:180, y:0.
    // We can just add a slight tilt: x: 180 - 15, y: 15 so it looks 3D!
    const [rotation, setRotation] = useState({ x: 165, y: 15, z: 0 });

    const rollDice = () => {
        if (isRolling) return;
        setIsRolling(true);

        const finalValue = Math.floor(Math.random() * 6) + 1;
        setValue(finalValue);

        const spins = 1440; // 4 full physical spins
        const getTargetOffset = (val: number) => {
            switch (val) {
                case 1: return { x: 0, y: 0 };
                case 6: return { x: 180, y: 0 };
                case 2: return { x: 0, y: -90 };
                case 5: return { x: 0, y: 90 };
                case 3: return { x: -90, y: 0 };
                case 4: return { x: 90, y: 0 };
                default: return { x: 0, y: 0 };
            }
        };

        const targetOffset = getTargetOffset(finalValue);

        // Round to nearest 360 block, add our aggressive spins, then map to exactly our face + slight tilt for aesthetics
        const newX = Math.floor(rotation.x / 360) * 360 + spins + targetOffset.x - 15;
        const newY = Math.floor(rotation.y / 360) * 360 + spins + targetOffset.y + 15;

        setRotation({ x: newX, y: newY, z: 0 });

        // CSS transition handles animation. Unlock after 1.5s
        setTimeout(() => {
            setIsRolling(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col items-center gap-12 p-4">
            {/* Perspective container */}
            <button
                onClick={rollDice}
                disabled={isRolling}
                className="w-24 h-24 relative outline-none cursor-pointer"
                style={{ perspective: "600px" }}
            >
                <div
                    className="w-full h-full relative"
                    style={{
                        transformStyle: "preserve-3d",
                        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
                        transition: "transform 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                    }}
                >
                    {/* w-24 is 96px, so half is 48px */}
                    <DiceFace value={1} transform="rotateY(0deg) translateZ(48px)" />
                    <DiceFace value={6} transform="rotateY(180deg) translateZ(48px)" />
                    <DiceFace value={2} transform="rotateY(90deg) translateZ(48px)" />
                    <DiceFace value={5} transform="rotateY(-90deg) translateZ(48px)" />
                    <DiceFace value={3} transform="rotateX(90deg) translateZ(48px)" />
                    <DiceFace value={4} transform="rotateX(-90deg) translateZ(48px)" />
                </div>
            </button>

            <div className="flex flex-col items-center">
                <span className="font-bold text-gray-700 uppercase tracking-widest text-sm">
                    {isRolling ? "Rolling..." : "Tap to Roll"}
                </span>
                {!isRolling && value && (
                    <span className="text-3xl font-black text-[#8B5CF6] mt-1">{value}</span>
                )}
            </div>
        </div>
    );
}
