'use client';

import { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLanguage } from '@/context/LanguageContext';
import Footer from '@/components/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function HowToPlayPage() {
    const { t } = useLanguage();
    const [dummyBalanceUsd] = useState(62.9);
    const containerRef = useRef<HTMLDivElement>(null);

    const rules = [
        {
            id: 'ringkasan',
            title: t('hw_rule_1_title'),
            content: t('hw_rule_1_content'),
            bullets: [
                t('hw_rule_1_b1'),
                t('hw_rule_1_b2'),
                t('hw_rule_1_b3'),
                t('hw_rule_1_b4'),
            ],
            images: [
                { src: '/image/howto/howto1.png', label: t('hw_rule_1_img1') },
                { src: '/image/howto/howto2.png', label: t('hw_rule_1_img2') },
                { src: '/image/howto/howto3.png', label: t('hw_rule_1_img3') },
                { src: '/image/howto/howto4.png', label: t('hw_rule_1_img4') },
            ]
        },
        {
            id: 'persiapan',
            title: t('hw_rule_2_title'),
            content: t('hw_rule_2_content'),
            bullets: [
                t('hw_rule_2_b1'),
                t('hw_rule_2_b2'),
            ],
            mainImage: '/image/howto/howto5.png'
        },
        {
            id: 'dadu',
            title: t('hw_rule_3_title'),
            content: t('hw_rule_3_content'),
            bullets: [
                t('hw_rule_3_b1'),
                t('hw_rule_3_b2'),
                t('hw_rule_3_b3'),
                t('hw_rule_3_b4'),
            ],
            mainImage: '/image/howto/howto6.png'
        },
        {
            id: 'gerak',
            title: t('hw_rule_4_title'),
            content: t('hw_rule_4_content'),
            bullets: [
                t('hw_rule_4_b1'),
                t('hw_rule_4_b2'),
                t('hw_rule_4_b3'),
                t('hw_rule_4_b4'),
                t('hw_rule_4_b5'),
            ],
            mainImage: '/image/howto/howto7.png'
        },
        {
            id: 'finish',
            title: t('hw_rule_5_title'),
            content: t('hw_rule_5_content'),
            bullets: [
                t('hw_rule_5_b1'),
                t('hw_rule_5_b2'),
                t('hw_rule_5_b3'),
            ],
            mainImage: '/image/howto/howto8.png'
        },
        {
            id: 'skenario',
            title: t('hw_rule_6_title'),
            content: t('hw_rule_6_content'),
            bullets: [
                t('hw_rule_6_b1'),
                t('hw_rule_6_b2'),
                t('hw_rule_6_b3'),
                t('hw_rule_6_b4'),
                t('hw_rule_6_b5'),
            ],
            mainImage: '/image/howto/howto9.png'
        }
    ];

    useGSAP(() => {
        const steps = gsap.utils.toArray('.anim-step');

        steps.forEach((step: any, i) => {
            gsap.fromTo(step,
                { opacity: 0, y: 100, scale: 0.9, rotationX: 10 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    rotationX: 0,
                    duration: 1.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: step,
                        start: "top 85%",
                        end: "bottom 15%",
                        toggleActions: "play reverse play reverse",
                    }
                }
            );
        });

    }, { scope: containerRef });

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#0f0c1a] font-sans" ref={containerRef}>
            {/* Background Video */}
            <div className="fixed inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover opacity-70"
                >
                    <source src="/video/ludoboard-animation.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-[#4A2F1D]/40 via-transparent to-[#0f0c1a]" />
            </div>

            <Navbar balanceUsd={dummyBalanceUsd} />

            <main className="relative z-10 mx-auto max-w-[1240px] px-4 pt-24 pb-16 md:px-8">

                {/* Header Section: Back Button + Title */}
                <div className="mb-12">
                    {/* Top Row: Back Button & Title */}
                    <div className="relative flex items-center justify-center min-h-[44px] mb-2">
                        <BackButton className="absolute left-0" noMargin />

                        {/* Centered Title */}
                        <h1 className="text-5xl font-black text-[#fdf2d9] tracking-[0.1em] uppercase md:text-6xl text-center" style={{ textShadow: "0px 4px 20px rgba(0,0,0,0.8)" }}>
                            {t('hw_title')}
                        </h1>
                    </div>

                    {/* Bottom Row: Subtitle */}
                    <div className="text-center">
                        <p className="text-[#fdf2d9]/80 font-bold tracking-wide text-lg drop-shadow-md">
                            {t('hw_subtitle')}
                        </p>
                    </div>
                </div>

                {/* Stepper Container */}
                <div className="flex flex-col gap-12 sm:gap-16 pb-32">
                    {/* Step 1: Ringkasan Eksekutif */}
                    <div className="anim-step opacity-0">
                        <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#fef5e7] to-[#f2dac2] p-8 md:p-12 shadow-[0_30px_70px_rgba(0,0,0,0.7)] border-[6px] border-[#8a5d3b]/20">
                            <div className="relative z-10 flex flex-col xl:flex-row gap-12 items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-[#8B4513] text-2xl font-black text-white shadow-inner border-4 border-[#fdf2d9] drop-shadow-xl">
                                            1
                                        </div>
                                        <h2 className="text-3xl md:text-3xl font-black text-[#42210b] tracking-tight truncate">
                                            {rules[0].title}
                                        </h2>
                                    </div>
                                    <p className="text-[#6d3e20] font-bold text-lg mb-8 opacity-90 leading-relaxed">
                                        {rules[0].content}
                                    </p>
                                    <ul className="space-y-6">
                                        {rules[0].bullets.map((bullet, i) => (
                                            <li key={`rule-0-b-${i}`} className="flex items-start gap-4">
                                                <span className="mt-1 flex-shrink-0 text-[#8B4513]">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                </span>
                                                <span className="text-[#4a2610] text-base md:text-lg font-bold leading-relaxed opacity-85">{bullet}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="w-full xl:w-[480px] shrink-0">
                                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                                        {rules[0].images?.map((img, i) => (
                                            <div key={`rule-0-img-${i}`} className="flex flex-col gap-2">
                                                <p className="text-center text-xs font-black text-[#5c2b0c] uppercase tracking-wider">{img.label}</p>
                                                <div className="aspect-square overflow-hidden rounded-2xl border-4 border-[#825530] shadow-2xl bg-white/10 group transition hover:scale-105 duration-300">
                                                    <img src={img.src} alt={img.label} className="h-full w-full object-cover" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Persiapan Permainan (Large Image Layout) */}
                    <div className="anim-step opacity-0">
                        <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#fef5e7] to-[#f2dac2] py-6 px-12 md:py-6 md:px-12 shadow-[0_30px_70px_rgba(0,0,0,0.7)] border-[6px] border-[#8a5d3b]/20">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-[#8B4513] text-2xl font-black text-white shadow-inner border-4 border-[#fdf2d9] drop-shadow-xl">
                                    2
                                </div>
                                <h2 className="text-3xl md:text-3xl font-black text-[#42210b] tracking-tight uppercase">
                                    {rules[1].title}
                                </h2>
                            </div>
                            <div className="mb-6 overflow-hidden rounded-[2rem] border-[6px] border-[#825530] shadow-[0_20px_60px_rgba(0,0,0,0.5)] bg-black/10">
                                <img src={rules[1].mainImage} className="w-full h-[300px] object-cover transition duration-1000 hover:scale-105" alt="Roll the Dice" />
                            </div>
                            <div className="space-y-6">
                                <p className="text-[#6d3e20] font-bold text-lg md:text-xl leading-relaxed">{rules[1].content}</p>
                                <ul className="space-y-4">
                                    {rules[1].bullets.map((bullet, i) => (
                                        <li key={`rule-1-b-${i}`} className="flex items-start gap-4">
                                            <span className="mt-1 flex-shrink-0 text-[#8B4513]">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            </span>
                                            <span className="text-[#4a2610] text-base md:text-lg font-bold leading-relaxed opacity-85">{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Urutan Giliran & Dadu (Large Image Layout) */}
                    <div className="anim-step opacity-0">
                        <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#fef5e7] to-[#f2dac2] py-6 px-12 md:py-6 md:px-12 shadow-[0_30px_70px_rgba(0,0,0,0.7)] border-[6px] border-[#8a5d3b]/20">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-[#8B4513] text-2xl font-black text-white shadow-inner border-4 border-[#fdf2d9] drop-shadow-xl">
                                    3
                                </div>
                                <h2 className="text-3xl md:text-3xl font-black text-[#42210b] tracking-tight uppercase">
                                    {rules[2].title}
                                </h2>
                            </div>
                            <div className="mb-6 overflow-hidden rounded-[2rem] border-[6px] border-[#825530] shadow-[0_20px_60px_rgba(0,0,0,0.5)] bg-black/10 ">
                                <img src={rules[2].mainImage} className="w-full h-[300px] object-cover transition duration-1000 hover:scale-105" alt="Roll the Dice" />
                            </div>
                            <div className="space-y-6">
                                <p className="text-[#6d3e20] font-bold text-lg md:text-xl leading-relaxed">{rules[2].content}</p>
                                <ul className="space-y-4">
                                    {rules[2].bullets.map((bullet, i) => (
                                        <li key={`rule-2-b-${i}`} className="flex items-start gap-4">
                                            <span className="mt-1 flex-shrink-0 text-[#8B4513]">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            </span>
                                            <span className="text-[#4a2610] text-base md:text-lg font-bold leading-relaxed opacity-85">{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Step 4: Mengeluarkan & Memindahkan Pion (Large Image Layout) */}
                    <div className="anim-step opacity-0">
                        <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#fef5e7] to-[#f2dac2] py-6 px-12 md:py-6 md:px-12 shadow-[0_30px_70px_rgba(0,0,0,0.7)] border-[6px] border-[#8a5d3b]/20">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-[#8B4513] text-2xl font-black text-white shadow-inner border-4 border-[#fdf2d9] drop-shadow-xl">
                                    4
                                </div>
                                <h2 className="text-3xl md:text-3xl font-black text-[#42210b] tracking-tight uppercase">
                                    {rules[3].title}
                                </h2>
                            </div>
                            <div className="mb-6 overflow-hidden rounded-[2rem] border-[6px] border-[#825530] shadow-[0_20px_60px_rgba(0,0,0,0.5)] bg-black/10 ">
                                <img src={rules[3].mainImage} className="w-full h-[300px] object-cover transition duration-1000 hover:scale-105" alt="Pawn Movement" />
                            </div>
                            <div className="space-y-6">
                                <p className="text-[#6d3e20] font-bold text-lg md:text-xl leading-relaxed">{rules[3].content}</p>
                                <ul className="space-y-4">
                                    {rules[3].bullets.map((bullet, i) => (
                                        <li key={`rule-3-b-${i}`} className="flex items-start gap-4">
                                            <span className="mt-1 flex-shrink-0 text-[#8B4513]">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            </span>
                                            <span className="text-[#4a2610] text-base md:text-lg font-bold leading-relaxed opacity-85">{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Step 5: Menuju Finish & Menang (Large Image Layout) */}
                    <div className="anim-step opacity-0">
                        <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#fef5e7] to-[#f2dac2] py-6 px-12 md:py-6 md:px-12 shadow-[0_30px_70px_rgba(0,0,0,0.7)] border-[6px] border-[#8a5d3b]/20">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-[#8B4513] text-2xl font-black text-white shadow-inner border-4 border-[#fdf2d9] drop-shadow-xl">
                                    5
                                </div>
                                <h2 className="text-3xl md:text-3xl font-black text-[#42210b] tracking-tight uppercase">
                                    {rules[4].title}
                                </h2>
                            </div>
                            <div className="mb-6 overflow-hidden rounded-[2rem] border-[6px] border-[#825530] shadow-[0_20px_60px_rgba(0,0,0,0.5)] bg-black/10 ">
                                <img src={rules[4].mainImage} className="w-full h-[300px] object-cover transition duration-1000 hover:scale-105" alt="Finish and Win" />
                            </div>
                            <div className="space-y-6">
                                <p className="text-[#6d3e20] font-bold text-lg md:text-xl leading-relaxed">{rules[4].content}</p>
                                <ul className="space-y-4">
                                    {rules[4].bullets.map((bullet, i) => (
                                        <li key={`rule-4-b-${i}`} className="flex items-start gap-4">
                                            <span className="mt-1 flex-shrink-0 text-[#8B4513]">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            </span>
                                            <span className="text-[#4a2610] text-base md:text-lg font-bold leading-relaxed opacity-85">{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Step 6: Contoh Skenario (Large Image Layout) */}
                    <div className="anim-step opacity-0">
                        <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#fef5e7] to-[#f2dac2] py-6 px-12 md:py-6 md:px-12 shadow-[0_30px_70px_rgba(0,0,0,0.7)] border-[6px] border-[#8a5d3b]/20">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-[#8B4513] text-2xl font-black text-white shadow-inner border-4 border-[#fdf2d9] drop-shadow-xl">
                                    6
                                </div>
                                <h2 className="text-3xl md:text-3xl font-black text-[#42210b] tracking-tight uppercase">
                                    {rules[5].title}
                                </h2>
                            </div>
                            <div className="mb-6 overflow-hidden rounded-[2rem] border-[6px] border-[#825530] shadow-[0_20px_60px_rgba(0,0,0,0.5)] bg-black/10 ">
                                <img src={rules[5].mainImage} className="w-full h-[300px] object-cover transition duration-1000 hover:scale-105" alt="Scenario Examples" />
                            </div>
                            <div className="space-y-6">
                                <p className="text-[#6d3e20] font-bold text-lg md:text-xl leading-relaxed">{rules[5].content}</p>
                                <ul className="space-y-4">
                                    {rules[5].bullets.map((bullet, i) => (
                                        <li key={`rule-5-b-${i}`} className="flex items-start gap-4">
                                            <span className="mt-1 flex-shrink-0 text-[#8B4513]">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            </span>
                                            <span className="text-[#4a2610] text-base md:text-lg font-bold leading-relaxed opacity-85">{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}
