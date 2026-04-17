'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const formatUsd = (value: number) => `$${value.toFixed(2)}`;

const leaderboardData = {
    weekly: [
        { rank: 1, name: 'TropicalExplorer', tier: 'PLATINUM', avatar: '🤠', wins: 94, winrate: 68, rewards: '550 INIT' },
        { rank: 2, name: 'TropicTess', tier: 'GOLD', avatar: '🌺', wins: 81, winrate: 65, rewards: '400 INIT' },
        { rank: 3, name: 'PalmPilot', tier: 'SILVER', avatar: '👩', wins: 72, winrate: 61, rewards: '250 INIT' },
        { rank: 4, name: 'BananaBuddy', tier: 'BRONZE', avatar: '🤖', wins: 55, winrate: 63, rewards: '100 INIT' },
        { rank: 5, name: 'ArcadeAce', tier: 'BRONZE', avatar: '🤖', wins: 48, winrate: 58, rewards: '50 INIT' },
    ],
    monthly: [
        { rank: 1, name: 'IslandKing', tier: 'PLATINUM', avatar: '🦜', wins: 342, winrate: 72, rewards: '2500 INIT' },
        { rank: 2, name: 'TropicalExplorer', tier: 'PLATINUM', avatar: '🤠', wins: 310, winrate: 69, rewards: '1800 INIT' },
        { rank: 3, name: 'SeaCaptain', tier: 'GOLD', avatar: '⚓', wins: 285, winrate: 66, rewards: '1200 INIT' },
    ],
    allTime: [
        { rank: 1, name: 'LegendaryLudo', tier: 'PLATINUM', avatar: '👑', wins: 1540, winrate: 75, rewards: '10000 INIT' },
        { rank: 2, name: 'PalmPilot', tier: 'PLATINUM', avatar: '👩', wins: 1420, winrate: 71, rewards: '8000 INIT' },
    ]
};

const TIER_COLORS: Record<string, string> = {
    PLATINUM: 'text-slate-200 bg-slate-400/20',
    GOLD: 'text-amber-300 bg-amber-500/20',
    SILVER: 'text-slate-400 bg-slate-500/20',
    BRONZE: 'text-orange-400 bg-orange-600/20',
};

export default function LeaderboardPage() {
    const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');
    const [dummyBalanceUsd] = useState(62.90);

    const currentLeaderboard = leaderboardData[activeTab];

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#0f0c1a] font-sans">
            {/* Background Video */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover opacity-60"
                >
                    <source src="/video/ludoboard-animation.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0f0c1a]" />
            </div>

            <Navbar balanceUsd={dummyBalanceUsd} />

            {/* Main Content */}
            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-8">

                {/* Back button */}
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white backdrop-blur transition hover:bg-white/20"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        Back
                    </Link>
                </div>

                <h1 className="mb-8 text-4xl font-black text-white md:text-5xl drop-shadow-xl">
                    Leader<span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">board</span>
                </h1>

                <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

                    {/* Left Column: Leaderboard Table */}
                    <div className="flex flex-col gap-6">

                        {/* Tabs */}
                        <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-xl w-fit">
                            {[
                                { id: 'weekly', label: 'WEEKLY' },
                                { id: 'monthly', label: 'MONTHLY' },
                                { id: 'allTime', label: 'ALL-TIME' },
                            ].map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveTab(t.id as any)}
                                    className={`rounded-xl px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition ${activeTab === t.id
                                        ? 'bg-[#F97316] text-white shadow-lg shadow-orange-500/30'
                                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium text-white/60">Climb the leaderboard to earn rewards!</p>
                            <p className="text-xs font-bold text-orange-400/80 uppercase tracking-widest">Resets In: 4d 12h 25m</p>
                        </div>

                        {/* Table */}
                        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-2xl shadow-2xl">
                            <div className="grid grid-cols-[80px_1fr_100px_100px_120px] gap-4 border-b border-white/10 bg-white/5 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">
                                <span>Rank</span>
                                <span>Player</span>
                                <span className="text-center">Wins</span>
                                <span className="text-center">Winrate</span>
                                <span className="text-right">Rewards</span>
                            </div>

                            <div className="flex flex-col">
                                {currentLeaderboard.map((player) => (
                                    <div key={player.name} className="group grid grid-cols-[80px_1fr_100px_100px_120px] gap-4 items-center px-6 py-5 border-b border-white/5 transition hover:bg-white/[0.03]">
                                        <div className="flex items-center gap-3">
                                            {player.rank <= 3 ? (
                                                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-lg shadow-inner ${player.rank === 1 ? 'bg-gradient-to-br from-amber-200 to-amber-500 text-amber-900' :
                                                    player.rank === 2 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800' :
                                                        'bg-gradient-to-br from-orange-300 to-orange-500 text-orange-950'
                                                    }`}>
                                                    {player.rank}
                                                </div>
                                            ) : (
                                                <span className="ml-3 font-black text-white/30">{player.rank}</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/10 text-xl overflow-hidden">
                                                {player.avatar}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white group-hover:text-orange-300 transition">{player.name}</span>
                                                <span className={`w-fit mt-1 rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tighter ${TIER_COLORS[player.tier]}`}>
                                                    {player.tier}
                                                </span>
                                            </div>
                                        </div>

                                        <span className="text-center font-black text-white/80">{player.wins}</span>
                                        <span className="text-center font-black text-white/80">{player.winrate}%</span>
                                        <span className="text-right font-black text-orange-300">{player.rewards}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Your Rank Row */}
                            <div className="bg-orange-500/10 px-6 py-5 border-t border-orange-500/20 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]">
                                <div className="grid grid-cols-[80px_1fr_100px_100px_120px] gap-4 items-center">
                                    <div className="flex items-center gap-3">
                                        <span className="ml-3 font-black text-orange-400">#82</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 border border-orange-500/30 text-xl overflow-hidden">
                                            👤
                                        </div>
                                        <span className="font-bold text-white">TowerTraveler (You)</span>
                                    </div>
                                    <span className="text-center font-black text-white/80">12</span>
                                    <span className="text-center font-black text-white/80">55%</span>
                                    <span className="text-right font-black text-orange-300">15 INIT</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Rewards */}
                    <div className="flex flex-col gap-6">
                        <div className="rounded-[2.5rem] border border-white/15 bg-white/[0.08] p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-400/5 to-transparent" />

                            <h2 className="text-2xl font-black text-white text-center mb-8">Rewards</h2>

                            {/* Parchment-style scroll */}
                            <div className="relative mb-6">
                                <div className="absolute inset-x-0 -top-4 h-8 bg-[#e8d5b5] rounded-full blur-xl opacity-20" />
                                <div className="relative rounded-2xl bg-[#fdf2d9] p-6 shadow-2xl ring-4 ring-[#d8c3a5]">
                                    <h3 className="text-center text-[#8B4513] font-black uppercase tracking-widest text-sm mb-6 pb-2 border-b border-[#8B4513]/10">
                                        Weekly Top 10
                                    </h3>

                                    <div className="flex flex-col gap-5">
                                        {[
                                            { level: '1st', amt: '550 INIT', icon: '🥇', bg: 'bg-amber-100' },
                                            { level: '2nd', amt: '400 INIT', icon: '🥈', bg: 'bg-slate-50' },
                                            { level: '3rd', amt: '250 INIT', icon: '🥉', bg: 'bg-orange-50' },
                                        ].map((r) => (
                                            <div key={r.level} className="flex items-center justify-between group">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-3xl filter drop-shadow-md group-hover:scale-110 transition">{r.icon}</span>
                                                    <span className="font-black text-[#5d4037]">{r.amt}</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-[#8d6e63] uppercase tracking-tighter">{r.level} Rank</span>
                                            </div>
                                        ))}

                                        <div className="mt-4 pt-4 border-t border-[#8B4513]/10 text-center">
                                            <span className="inline-block px-4 py-1.5 rounded-full bg-[#8B4513]/5 text-[11px] font-black text-[#8B4513] uppercase">
                                                Ranks #4-10 INIT
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 text-center mt-8">
                                <div className="flex justify-center -space-x-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-10 w-10 rounded-full border-2 border-[#3d2b1f] bg-amber-400 flex items-center justify-center text-xl shadow-lg ring-2 ring-orange-500/20">
                                            💰
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs font-medium text-white/50 px-4 italic leading-relaxed">
                                    "The higher you rank, the bigger the rewards! Top players share the weekly bounty pool."
                                </p>
                            </div>
                        </div>

                        {/* Assets decoration (chest placeholder) */}
                        <div className="relative h-48 rounded-2xl overflow-hidden border border-[#F97316]/20 group">
                            <div className="absolute inset-0 bg-[url('/img/island-bg.jpg')] bg-cover bg-center opacity-30 group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c1a] to-transparent" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                <div className="text-5xl mb-3 filter drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">🎁</div>
                                <h4 className="text-sm font-black text-white uppercase tracking-widest">Extra Chests</h4>
                                <p className="text-[10px] text-white/40 mt-1">Earn exclusive NFTs for your first win streak.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
