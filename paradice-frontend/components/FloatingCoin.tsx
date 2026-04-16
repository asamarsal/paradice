"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function FloatingCoin() {
    const containerRef = useRef<HTMLDivElement>(null);
    const coin1Ref = useRef<HTMLDivElement>(null);
    const coin2Ref = useRef<HTMLDivElement>(null);
    const coin3Ref = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Coin 1 (Top Left to Right, scales up)
        gsap.to(coin1Ref.current, {
            x: 300,
            y: 100,
            rotation: 360,
            scale: 1.5,
            ease: "power1.inOut",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 90%",
                end: "bottom 10%",
                scrub: 1.2,
            },
        });

        // Coin 2 (Middle Right to Left, scales down)
        gsap.to(coin2Ref.current, {
            x: -250,
            y: 150,
            rotation: -180,
            scale: 0.6,
            ease: "power1.inOut",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 80%",
                end: "bottom 20%",
                scrub: 1.5,
            },
        });

        // Coin 3 (Bottom center, moves up and wobbles)
        gsap.to(coin3Ref.current, {
            x: 100,
            y: -150,
            rotation: 720,
            scale: 1.2,
            ease: "power2.out",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 70%",
                end: "bottom 30%",
                scrub: 2,
            },
        });

        // Continuous floating/shining animations alongside scroll
        [coin1Ref, coin2Ref, coin3Ref].forEach((ref, i) => {
            gsap.to(ref.current, {
                y: `+=${10 + i * 5}`,
                rotationY: "+=20",
                yoyo: true,
                repeat: -1,
                duration: 2 + i * 0.5,
                ease: "sine.inOut",
                delay: i * 0.3
            });
        });

    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {/* Coin 1 */}
            <div
                ref={coin1Ref}
                className="absolute top-[10%] left-[5%] w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 shadow-[0_10px_25px_rgba(234,179,8,0.5)] border-2 border-yellow-200 flex items-center justify-center opacity-80"
            >
                <div className="w-12 h-12 rounded-full border border-yellow-400/50 flex items-center justify-center">
                    <span className="text-yellow-100 font-black text-xl drop-shadow-md">$</span>
                </div>
            </div>

            {/* Coin 2 */}
            <div
                ref={coin2Ref}
                className="absolute top-[40%] right-[10%] w-24 h-24 rounded-full bg-gradient-to-br from-[#FCD34D] via-[#F59E0B] to-[#D97706] shadow-[0_15px_35px_rgba(245,158,11,0.6)] border-[3px] border-yellow-100 flex items-center justify-center"
            >
                <div className="w-16 h-16 rounded-full border-2 border-amber-500/50 flex items-center justify-center bg-gradient-to-bl from-yellow-400 to-amber-500 shadow-inner">
                    <span className="text-amber-100 font-extrabold text-3xl drop-shadow-lg">P</span>
                </div>
            </div>

            {/* Coin 3 */}
            <div
                ref={coin3Ref}
                className="absolute bottom-[20%] left-[30%] w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-[0_8px_20px_rgba(217,119,6,0.6)] border border-amber-200 flex items-center justify-center opacity-90"
            >
                <div className="w-8 h-8 rounded-full border border-amber-400/50 flex items-center justify-center">
                    <span className="text-amber-100 font-black text-sm drop-shadow-md">init</span>
                </div>
            </div>
        </div>
    );
}
