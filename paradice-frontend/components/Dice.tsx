"use client";
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";

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

export interface DiceHandle {
    rollDice: (forcedValue?: number) => void;
}

interface DiceProps {
    onRollResult: (val: number) => void;
    disabled?: boolean;
    message?: string;
    value?: number | null;
    isBot?: boolean;
}

const Dice = forwardRef<DiceHandle, DiceProps>(({
    onRollResult, disabled, message, value: externalValue, isBot
}, ref) => {
    const [internalValue, setInternalValue] = useState(6);
    const value = externalValue ?? internalValue;
    const [isRolling, setIsRolling] = useState(false);
    const isRollingRef = useRef(false);
    const [isHolding, setIsHolding] = useState(false);
    const [rotation, setRotation] = useState({ x: 165, y: 15, z: 0 });

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

    // Sync rotation with value prop (ONLY for bots)
    useEffect(() => {
        if (isBot && externalValue && !isRolling) {
            const target = getTargetOffset(externalValue);
            setRotation({ x: target.x, y: target.y, z: 0 });
        }
    }, [externalValue, isRolling, isBot]);

    // Fast rotation while holding
    useEffect(() => {
        let interval: any;
        if (isHolding) {
            interval = setInterval(() => {
                setRotation(prev => ({
                    x: prev.x + 20,
                    y: prev.y + 25,
                    z: prev.z + 10
                }));
            }, 16);
        }
        return () => clearInterval(interval);
    }, [isHolding]);

    const rollDice = (forcedValue?: number) => {
        if (isRollingRef.current || (disabled && !isBot && forcedValue === undefined)) return;
        isRollingRef.current = true;
        setIsRolling(true);

        const finalValue = forcedValue ?? (Math.floor(Math.random() * 6) + 1);
        setInternalValue(finalValue);

        const spins = 1080; // 3 extra spins to show "rolling" after release
        const targetOffset = getTargetOffset(finalValue);

        // Round up to avoid backward jumps and add spins
        const newX = Math.ceil(rotation.x / 360) * 360 + spins + targetOffset.x;
        const newY = Math.ceil(rotation.y / 360) * 360 + spins + targetOffset.y;

        setRotation({ x: newX, y: newY, z: 0 });

        setTimeout(() => {
            isRollingRef.current = false;
            setIsRolling(false);
            onRollResult(finalValue);
        }, 1500);
    };

    useImperativeHandle(ref, () => ({
        rollDice: (forcedValue?: number) => rollDice(forcedValue)
    }));

    const startHold = (e: React.MouseEvent | React.TouchEvent) => {
        if (isRolling || disabled) return;
        setIsHolding(true);
    };

    const finishHold = () => {
        if (!isHolding || disabled) return;
        setIsHolding(false);
        rollDice();
    };

    return (
        <div className="flex flex-col items-center gap-12 p-4">
            <button
                onMouseDown={startHold}
                onMouseUp={finishHold}
                onMouseLeave={finishHold}
                onTouchStart={startHold}
                onTouchEnd={finishHold}
                onClick={(e) => {
                    // Prevent double-trigger from MouseUp and Click if already rolling
                    if (!isRollingRef.current && !isHolding && !disabled) {
                        rollDice();
                    }
                }}
                disabled={isRolling || disabled}
                className={`w-24 h-24 relative outline-none select-none transition-transform
                    ${disabled && !isRolling ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"}
                `}
                style={{ perspective: "600px" }}
            >
                <div
                    className="w-full h-full relative"
                    style={{
                        transformStyle: "preserve-3d",
                        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
                        transition: isHolding ? "none" : "transform 1.5s cubic-bezier(0.25, 1, 0.5, 1)"
                    }}
                >
                    <DiceFace value={1} transform="rotateY(0deg) translateZ(48px)" />
                    <DiceFace value={6} transform="rotateY(180deg) translateZ(48px)" />
                    <DiceFace value={2} transform="rotateY(90deg) translateZ(48px)" />
                    <DiceFace value={5} transform="rotateY(-90deg) translateZ(48px)" />
                    <DiceFace value={3} transform="rotateX(90deg) translateZ(48px)" />
                    <DiceFace value={4} transform="rotateX(-90deg) translateZ(48px)" />
                </div>
            </button>

            <div className="flex flex-col items-center h-[80px]">
                <span className="font-bold text-gray-700 uppercase tracking-widest text-sm text-center max-w-[150px]">
                    {isHolding ? "RELEASING..." : (isRolling ? "ROLLING..." : (message || "HOLD TO SPIN"))}
                </span>
                {!isRolling && !isHolding && value && (
                    <span className="text-3xl font-black text-[#8B5CF6] mt-1">{value}</span>
                )}
            </div>
        </div>
    );
});

Dice.displayName = "Dice";
export default Dice;
