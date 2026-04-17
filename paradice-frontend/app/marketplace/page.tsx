'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const nfts = [
    {
        id: 'champion-1',
        title: 'Island Champion',
        rarity: 'LEGENDARY',
        icon: '🏆',
        owner: '0x3kd....8fA2',
        priceInit: 249,
        priceUsd: 52.95,
        tagColor: 'text-amber-400 border-amber-400/50',
    },
    {
        id: 'dicemaster-1',
        title: 'Dice Master',
        rarity: 'EPIC',
        icon: '🎲',
        owner: '0x3kd....8fA2',
        priceInit: 150,
        priceUsd: 32.25,
        tagColor: 'text-purple-300 border-purple-400/50',
    },
    {
        id: 'raider-1',
        title: 'Paradise Raider',
        rarity: 'RARE',
        icon: '🌴',
        owner: '0x3kd....8fA2',
        priceInit: 90,
        priceUsd: 19.35,
        tagColor: 'text-blue-300 border-blue-400/50',
    },
    {
        id: 'speedster-1',
        title: 'Speedster',
        rarity: 'EPIC',
        icon: '⚡',
        owner: '0x3kd....8fA2',
        priceInit: 160,
        priceUsd: 34.40,
        tagColor: 'text-yellow-300 border-yellow-400/50',
    },
    {
        id: 'captureking-1',
        title: 'Capture King',
        rarity: 'RARE',
        icon: '⚔️',
        owner: '0x3kd....8fA2',
        priceInit: 275,
        priceUsd: 52.65,
        tagColor: 'text-red-300 border-red-400/50',
    },
    {
        id: 'luckyplayer-1',
        title: 'Lucky Player',
        rarity: 'COMMON',
        icon: '🍀',
        owner: '0x3kd....8fA2',
        priceInit: 49,
        priceUsd: 10.53,
        tagColor: 'text-emerald-300 border-emerald-400/50',
    },
    {
        id: 'speedster-2',
        title: 'Speedster',
        rarity: 'EPIC',
        icon: '⚡',
        owner: '0x3kd....8fA2',
        priceInit: 160,
        priceUsd: 34.50,
        tagColor: 'text-yellow-300 border-yellow-400/50',
    },
    {
        id: 'dicemaster-2',
        title: 'Dice Master',
        rarity: 'EPIC',
        icon: '🎲',
        owner: '0x3kd....8fA2',
        priceInit: 160,
        priceUsd: 34.40,
        tagColor: 'text-purple-300 border-purple-400/50',
    },
];

export default function MarketplacePage() {
    const [dummyBalanceUsd] = useState(62.90);
    const [priceRange, setPriceRange] = useState(1200);

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#0f0c1a] font-sans">
            {/* Background Video */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover opacity-70"
                >
                    <source src="/video/ludoboard-animation.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0f0c1a]" />
            </div>

            <Navbar balanceUsd={dummyBalanceUsd} />

            <main className="relative z-10 mx-auto max-w-[1440px] px-4 py-8 md:px-8">

                {/* Back Link */}
                <div className="mb-6">
                    <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-2 text-[11px] font-black uppercase tracking-widest text-white backdrop-blur-md transition hover:bg-white/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        Back
                    </Link>
                </div>

                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-black text-white tracking-[0.1em] drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] uppercase">
                        Marketplace
                    </h1>
                    <p className="mt-2 text-sm font-medium text-white/60 tracking-wide">
                        Buy and sell exclusive minted NFTs!
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur-2xl shadow-2xl relative overflow-hidden h-fit">

                            {/* Search */}
                            <div className="relative mb-6">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search"
                                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                />
                            </div>

                            {/* Nav Categories */}
                            <div className="space-y-1 mb-6">
                                <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm font-bold text-white">
                                    <span>All</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <div className="px-4 py-2 text-sm font-medium text-white/40 transition hover:text-white cursor-pointer">Owned</div>
                                <div className="px-4 py-2 text-sm font-medium text-white/40 transition hover:text-white cursor-pointer">On Sale</div>
                            </div>

                            {/* Wallet Selector */}
                            <div className="mb-6">
                                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-white/40">Wallet Address</label>
                                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white backdrop-blur transition hover:bg-white/10 cursor-pointer">
                                    <span className="opacity-80">0x3kd....8fA2</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div className="mb-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Filter by Harga (Price)</label>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="1200"
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(parseInt(e.target.value))}
                                    className="h-1.5 w-full appearance-none rounded-full bg-white/10 accent-orange-400 transition"
                                />
                                <div className="mt-3 flex items-center justify-between text-[11px] font-black text-orange-400">
                                    <span className="opacity-80">$1</span>
                                    <span className="opacity-80">${priceRange.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* More Filters */}
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10 cursor-pointer">
                                    <span className="opacity-80 font-bold">All Rarities</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </div>
                                <div>
                                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-white/40">Sort by</label>
                                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10 cursor-pointer">
                                        <span className="opacity-80 font-bold">Newest</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Reset Button */}
                            <button className="w-full rounded-2xl bg-orange-500 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-orange-500/20 transition hover:-translate-y-1 hover:shadow-orange-500/40">
                                Reset Filters
                            </button>

                            {/* Treasure Decoration */}
                            <div className="mt-8 flex justify-center">
                                <img
                                    src="/treasure_chest_ludo_1776390209649.png"
                                    alt="Treasure"
                                    className="h-32 object-contain drop-shadow-2xl opacity-90 transition hover:scale-110 duration-500"
                                />
                            </div>
                        </div>
                    </aside>

                    {/* Main Grid Content */}
                    <div className="flex-1">

                        {/* Top Utility Bar */}
                        <div className="mb-8 flex items-center gap-4">
                            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-6 py-2 text-xs font-bold text-white backdrop-blur-xl transition hover:bg-white/20 cursor-pointer">
                                <span>All</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {nfts.map((nft) => (
                                <div
                                    key={nft.id}
                                    className="group relative rounded-[2rem] border border-white/10 bg-[#1e1e1e]/60 p-6 backdrop-blur-2xl transition hover:bg-[#1e1e1e]/80 hover:scale-[1.02] hover:shadow-2xl"
                                >
                                    {/* Icon Container with specific theme */}
                                    <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/15 text-4xl shadow-lg shadow-black/40 transition group-hover:scale-110 duration-500 overflow-hidden relative`}>
                                        {/* Rarity ambient light */}
                                        <div className={`absolute inset-0 opacity-20 blur-xl ${nft.rarity === 'LEGENDARY' ? 'bg-orange-500' :
                                                nft.rarity === 'EPIC' ? 'bg-purple-500' :
                                                    nft.rarity === 'RARE' ? 'bg-blue-500' : 'bg-emerald-500'
                                            }`} />
                                        <span className="relative z-10">{nft.icon}</span>
                                    </div>

                                    {/* NFT Info */}
                                    <div className={`mb-3 inline-block rounded-md border px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${nft.tagColor}`}>
                                        {nft.rarity}
                                    </div>
                                    <h3 className="mb-1 text-lg font-black text-white">{nft.title}</h3>

                                    <div className="mb-6 flex items-center gap-2 text-[10px] font-bold text-white/40">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                        <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{nft.owner}</span>
                                    </div>

                                    {/* Price Card */}
                                    <div className="mb-6 rounded-2xl bg-black/40 p-3 shadow-inner">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-[10px] shadow-sm">💰</div>
                                                <span className="text-sm font-black text-white">{nft.priceInit} INIT</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-white/40">${nft.priceUsd.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Buy Button */}
                                    <button className="w-full rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg transition hover:-translate-y-1 hover:brightness-110 active:scale-95">
                                        Buy
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
