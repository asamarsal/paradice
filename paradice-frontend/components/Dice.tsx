"use client";
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";

const getDots = (val: number) => {
    const dots = [];
    const dotClass = "w-2.5 h-2.5 bg-white rounded-full place-self-center shadow-inner";

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
            className="absolute inset-0 bg-[#8B5CF6] border-2 border-[#4C1D95] grid grid-cols-3 grid-rows-3 p-2 shadow-inner"
            style={{
                transform,
                backfaceVisibility: "hidden",
                width: "80.5px", // Slight oversize to overlap and hide gaps from anti-aliasing
                height: "80.5px",
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
    serverAuthoritative?: boolean;
    onRollRequest?: () => void | Promise<void>;
}

const Dice = forwardRef<DiceHandle, DiceProps>(({
    onRollResult, disabled, message, value: externalValue, isBot, serverAuthoritative, onRollRequest
}, ref) => {
    const [internalValue, setInternalValue] = useState(6);
    const value = externalValue ?? internalValue;
    const [isRolling, setIsRolling] = useState(false);
    const isRollingRef = useRef(false);
    const [isHolding, setIsHolding] = useState(false);
    const [isAwaitingServer, setIsAwaitingServer] = useState(false);
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

    // NOTE: Bot dice animation is triggered imperatively via rollDice() ref.
    // No need to sync rotation with externalValue — that causes a second animation.

    // Fast rotation while holding
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;
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

    const requestServerRoll = async () => {
        if (!serverAuthoritative || !onRollRequest || isRollingRef.current || isAwaitingServer) return;
        setIsAwaitingServer(true);
        try {
            await onRollRequest();
        } finally {
            setIsAwaitingServer(false);
        }
    };

    const rollDice = (forcedValue?: number) => {
        if (forcedValue === undefined && serverAuthoritative) {
            void requestServerRoll();
            return;
        }

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

    const startHold = () => {
        if (isRolling || isAwaitingServer || disabled) return;
        setIsHolding(true);
    };

    const finishHold = () => {
        if (!isHolding || isAwaitingServer || disabled) return;
        setIsHolding(false);
        if (serverAuthoritative) {
            void requestServerRoll();
            return;
        }
        rollDice();
    };

    return (
        <div className="flex flex-col items-center gap-8 p-4">
            <button
                onMouseDown={startHold}
                onMouseUp={finishHold}
                onMouseLeave={finishHold}
                onTouchStart={startHold}
                onTouchEnd={finishHold}
                onClick={() => {
                    // Prevent double-trigger from MouseUp and Click if already rolling
                    if (!isRollingRef.current && !isHolding && !isAwaitingServer && !disabled) {
                        rollDice();
                    }
                }}
                disabled={isRolling || isAwaitingServer || disabled}
                className={`w-20 h-20 relative outline-none select-none transition-transform
                    ${disabled && !isRolling && !isAwaitingServer ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"}
                `}
                style={{ perspective: "400px" }}
            >
                <div
                    className="w-full h-full relative"
                    style={{
                        transformStyle: "preserve-3d",
                        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
                        transition: isHolding ? "none" : "transform 1.5s cubic-bezier(0.25, 1, 0.5, 1)"
                    }}
                >
                    <DiceFace value={1} transform="rotateY(0deg) translateZ(40px)" />
                    <DiceFace value={6} transform="rotateY(180deg) translateZ(40px)" />
                    <DiceFace value={2} transform="rotateY(90deg) translateZ(40px)" />
                    <DiceFace value={5} transform="rotateY(-90deg) translateZ(40px)" />
                    <DiceFace value={3} transform="rotateX(90deg) translateZ(40px)" />
                    <DiceFace value={4} transform="rotateX(-90deg) translateZ(40px)" />
                </div>
            </button>

            <div className="flex flex-col items-center h-[80px]">
                <span className="font-bold text-gray-700 uppercase tracking-widest text-sm text-center max-w-[150px]">
                    {isHolding ? "RELEASING..." : (isAwaitingServer ? "SYNCING..." : (isRolling ? "ROLLING..." : (message || "HOLD TO SPIN")))}
                </span>
                {!isRolling && !isHolding && !isAwaitingServer && value !== null && value !== undefined && (
                    <span className="text-3xl font-black text-[#8B5CF6] mt-1">{value}</span>
                )}
            </div>
        </div>
    );
});

Dice.displayName = "Dice";
export default Dice;
