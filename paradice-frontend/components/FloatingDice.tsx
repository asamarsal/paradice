"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function FloatingDice() {
    const containerRef = useRef<HTMLDivElement>(null);
    const dice1Ref = useRef<HTMLDivElement>(null);
    const dice2Ref = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Dice 1 Parallax & Scroll Animation
        gsap.to(dice1Ref.current, {
            y: 100,
            x: 30,
            rotation: 45,
            scale: 1.1,
            ease: "none",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 80%",
                end: "bottom 20%",
                scrub: 1, // smooth scrubbing
            },
        });

        // Dice 2 Parallax & Scroll Animation
        gsap.to(dice2Ref.current, {
            y: -80,
            x: -40,
            rotation: -60,
            scale: 0.9,
            ease: "none",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 80%",
                end: "bottom 20%",
                scrub: 1.5,
            },
        });

        // Idle floating animation alongside scroll trigger
        gsap.to(dice1Ref.current, {
            y: "+=15",
            rotation: "+=5",
            yoyo: true,
            repeat: -1,
            duration: 3,
            ease: "sine.inOut"
        });

        gsap.to(dice2Ref.current, {
            y: "-=15",
            rotation: "-=5",
            yoyo: true,
            repeat: -1,
            duration: 3.5,
            ease: "sine.inOut",
            delay: 0.5
        });
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="relative w-full h-[300px] flex items-center justify-center">

            {/* Dice container */}
            <div className="relative w-full h-full flex items-center justify-center">

                {/* Dice 1 */}
                <div
                    ref={dice1Ref}
                    className="absolute w-24 h-24 bg-white rounded-2xl shadow-xl shadow-black/20 
          flex items-center justify-center 
          transform -rotate-12 -translate-x-8 translate-y-4 
          border-b-4 border-gray-200 border-r-4 z-10"
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div className="w-4 h-4 bg-red-500 rounded-full" />
                        <div className="w-4 h-4 bg-red-500 rounded-full" />
                        <div className="w-4 h-4 bg-red-500 rounded-full" />
                        <div className="w-4 h-4 bg-red-500 rounded-full" />
                    </div>
                </div>

                {/* Dice 2 */}
                <div
                    ref={dice2Ref}
                    className="absolute w-24 h-24 bg-white rounded-2xl shadow-xl shadow-black/20 
          flex items-center justify-center 
          transform rotate-12 translate-x-12 -translate-y-8 
          border-b-4 border-gray-200 border-r-4 z-0"
                >
                    <div className="w-4 h-4 bg-blue-500 rounded-full" />
                </div>

            </div>
        </div>
    );
}