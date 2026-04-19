'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import { useLanguage } from '@/context/LanguageContext';
import Footer from '@/components/Footer';

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
        priceUsd: 34.4,
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
        priceUsd: 34.5,
        tagColor: 'text-yellow-300 border-yellow-400/50',
    },
    {
        id: 'dicemaster-2',
        title: 'Dice Master',
        rarity: 'EPIC',
        icon: '🎲',
        owner: '0x3kd....8fA2',
        priceInit: 160,
        priceUsd: 34.4,
        tagColor: 'text-purple-300 border-purple-400/50',
    },
];

const musicNfts = [
    {
        id: 'music-1',
        title: 'Tropical Sunset Beat',
        image: 'https://images.unsplash.com/photo-1559825481-12a05cc00344?q=80&w=400&fit=crop',
        owner: '0x3kd....6fA2',
        priceInit: 0.8,
        priceUsd: 1.68,
    },
    {
        id: 'music-2',
        title: 'Beach Chill #03',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&fit=crop',
        owner: '0x3kd....6fA2',
        priceInit: 0.6,
        priceUsd: 1.26,
    },
    {
        id: 'music-3',
        title: 'Cyber Groove #02',
        image: 'https://images.unsplash.com/photo-1545972154-9bb223aac798?q=80&w=400&fit=crop',
        owner: '0x3kd....6fA2',
        priceInit: 1.2,
        priceUsd: 2.52,
    },
    {
        id: 'music-4',
        title: 'Night City Drive #01',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&fit=crop',
        owner: '0x3kd....8fA2', // Owned by user
        priceInit: 1.0,
        priceUsd: 2.10,
    },
    {
        id: 'music-5',
        title: 'Island Vibes #12',
        image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=400&fit=crop',
        owner: '0x3kd....8fA2', // Owned by user
        priceInit: 0.9,
        priceUsd: 1.89,
    },
    {
        id: 'music-6',
        title: 'Electric Paradise #03',
        image: 'https://images.unsplash.com/photo-1470229722913-7c092bb2bb05?q=80&w=400&fit=crop',
        owner: '0x3kd....6fA2',
        priceInit: 1.5,
        priceUsd: 3.15,
    }
];

export default function MarketplacePage() {
    const { t } = useLanguage();
    const containerRef = useRef<HTMLDivElement>(null);
    const [dummyBalanceUsd] = useState(62.9);
    const [priceRange, setPriceRange] = useState(1200);
    const [activeTab, setActiveTab] = useState<'nft' | 'music'>('music');
    const [filter, setFilter] = useState<'all' | 'owned' | 'sale'>('all');
    
    // Simulate current user's wallet to determine ownership
    const currentUserWallet = '0x3kd....8fA2';

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#0f0c1a] font-sans" ref={containerRef}>
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

            <main className="relative z-10 mx-auto max-w-[1440px] px-4 pt-24 pb-12 md:px-8">

                <BackButton />

                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-black text-white tracking-[0.1em] drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] uppercase">
                        {t('mkt_title')}
                    </h1>
                    <p className="mt-2 text-sm font-medium text-white/60 tracking-wide">
                        {t('mkt_desc')}
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
                                    id="search-input"
                                    type="text"
                                    placeholder={t('nav_search')}
                                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                />
                            </div>

                            {/* Nav Categories */}
                            <div className="space-y-1 mb-6">
                                <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm font-bold text-white">
                                    <span>{t('mkt_all')}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <div className="px-4 py-2 text-sm font-medium text-white/40 transition hover:text-white cursor-pointer">{t('mkt_owned')}</div>
                                <div className="px-4 py-2 text-sm font-medium text-white/40 transition hover:text-white cursor-pointer">{t('mkt_sale')}</div>
                            </div>

                            {/* Wallet Selector */}
                            <div className="mb-6">
                                <label htmlFor="wallet-selector" className="mb-2 block text-[10px] font-black uppercase tracking-widest text-white/40">{t('mkt_wallet')}</label>
                                <div id="wallet-selector" className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white backdrop-blur transition hover:bg-white/10 cursor-pointer">
                                    <span className="opacity-80">0x3kd....8fA2</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div className="mb-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">{t('mkt_filter_p')}</label>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="1200"
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(Number.parseInt(e.target.value))}
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
                                    <span className="opacity-80 font-bold">{t('mkt_all')}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </div>
                                <div>
                                    <label htmlFor="sort-selector" className="mb-2 block text-[10px] font-black uppercase tracking-widest text-white/40">{t('mkt_sort')}</label>
                                    <div id="sort-selector" className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10 cursor-pointer">
                                        <span className="opacity-80 font-bold">{t('mkt_new')}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Reset Button */}
                            <button className="w-full rounded-2xl bg-orange-500 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-orange-500/20 transition hover:-translate-y-1 hover:shadow-orange-500/40">
                                {t('mkt_reset')}
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

                        {/* Top Tabs */}
                        <div className="relative z-10 flex items-end">
                            {/* Glassmorphic Tab Container */}
                            <div className="flex bg-white/5 backdrop-blur-2xl border border-white/10 border-b-0 rounded-t-3xl p-1.5 pb-0 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-20 overflow-hidden relative">
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                                <button 
                                    onClick={() => setActiveTab('nft')}
                                    className={`relative px-6 py-3.5 text-sm font-bold transition-all rounded-t-2xl ${
                                        activeTab === 'nft' 
                                        ? 'text-white bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' 
                                        : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                                    }`}
                                >
                                    {t('mkt_nft_col')}
                                    {activeTab === 'nft' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-gradient-to-r from-orange-400 via-orange-300 to-orange-400 shadow-[0_-4px_15px_rgba(251,146,60,0.6)]"></div>
                                    )}
                                </button>

                                <button 
                                    onClick={() => setActiveTab('music')}
                                    className={`relative px-6 py-3.5 text-sm font-bold transition-all rounded-t-2xl ${
                                        activeTab === 'music' 
                                        ? 'text-white bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' 
                                        : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                                    }`}
                                >
                                    {t('mkt_music_col')}
                                    {activeTab === 'music' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-gradient-to-r from-orange-400 via-orange-300 to-orange-400 shadow-[0_-4px_15px_rgba(251,146,60,0.6)]"></div>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Glassmorphic Main Panel */}
                        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-b-[2rem] rounded-tr-[2rem] p-6 shadow-2xl mb-8 relative z-10 -mt-[1px]">
                            {/* Inner ambient light */}
                            <div className="absolute top-0 left-10 w-64 h-24 bg-orange-500/10 blur-[50px] -z-10 rounded-full"></div>
                            
                            <div className="flex gap-4 mb-8">
                                <button onClick={() => setFilter('all')} className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${filter === 'all' ? 'bg-white/20 text-white border-white/30 shadow-inner' : 'bg-white/5 text-white/50 border-white/10 hover:text-white hover:bg-white/10'}`}>{t('mkt_all_cat')}</button>
                                <button onClick={() => setFilter('owned')} className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${filter === 'owned' ? 'bg-white/20 text-white border-white/30 shadow-inner' : 'bg-white/5 text-white/50 border-white/10 hover:text-white hover:bg-white/10'}`}>{t('mkt_owned')}</button>
                                <button onClick={() => setFilter('sale')} className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${filter === 'sale' ? 'bg-white/20 text-white border-white/30 shadow-inner' : 'bg-white/5 text-white/50 border-white/10 hover:text-white hover:bg-white/10'}`}>{t('mkt_sale')}</button>
                            </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {activeTab === 'nft' && nfts.filter(nft => filter === 'all' || (filter === 'owned' && nft.owner === currentUserWallet) || (filter === 'sale' && nft.owner !== currentUserWallet)).map((nft) => (
                                <div
                                    key={nft.id}
                                    className="group relative rounded-[2rem] border border-white/10 bg-[#1e1e1e]/60 p-6 backdrop-blur-2xl transition hover:bg-[#1e1e1e]/80 hover:scale-[1.02] hover:shadow-2xl"
                                >
                                    {/* Icon Container with specific theme */}
                                    <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/15 text-4xl shadow-lg shadow-black/40 transition group-hover:scale-110 duration-500 overflow-hidden relative`}>
                                        {/* Rarity ambient light */}
                                        <div className={`absolute inset-0 opacity-20 blur-xl ${nft.rarity === 'LEGENDARY' ? 'bg-orange-500' :
                                            nft.rarity === 'EPIC' ? 'bg-purple-500' :
                                                nft.rarity === 'RARE' ? 'bg-blue-500' :
                                                    'bg-emerald-500'
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

                                    {/* Buy/Sell Button */}
                                    {nft.owner === currentUserWallet ? (
                                        <button className="w-full rounded-xl border border-orange-500/50 bg-orange-500/10 py-3 text-xs font-black uppercase tracking-widest text-orange-400 shadow-lg transition hover:bg-orange-500/20 hover:text-orange-300">
                                            {t('mkt_sell')}
                                        </button>
                                    ) : (
                                        <button className="w-full rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg transition hover:-translate-y-1 hover:brightness-110 active:scale-95">
                                            {t('mkt_buy_btn')}
                                        </button>
                                    )}
                                </div>
                            ))}

                            {activeTab === 'music' && musicNfts.filter(nft => filter === 'all' || (filter === 'owned' && nft.owner === currentUserWallet) || (filter === 'sale' && nft.owner !== currentUserWallet)).map((nft) => (
                                <div
                                    key={nft.id}
                                    className="group relative rounded-[2rem] border border-white/10 bg-[#1e1e1e]/60 p-5 backdrop-blur-2xl transition hover:bg-[#1e1e1e]/80 hover:scale-[1.02] hover:shadow-2xl flex flex-col"
                                >
                                    {/* Image with Play button */}
                                    <div className="mb-4 relative w-full h-36 rounded-2xl overflow-hidden shadow-inner">
                                        <img src={nft.image} alt={nft.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        
                                        {/* Music Icon Badge */}
                                        <div className="absolute top-2 left-2 bg-[#fef0cb] text-[#86591d] rounded-full p-1.5 shadow">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"></path></svg>
                                        </div>

                                        {/* Play Button Overlay */}
                                        <div className="absolute bottom-2 right-2 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full w-8 h-8 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z"></path></svg>
                                        </div>
                                    </div>

                                    <h3 className="mb-1 text-base font-black text-white line-clamp-1">{nft.title}</h3>

                                    <div className="mb-4 flex items-center gap-1.5 text-[10px] font-bold text-white/40">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{nft.owner}</span>
                                    </div>

                                    <div className="mt-auto flex items-center gap-1.5 mb-4">
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[8px] shadow-sm">💰</div>
                                        <span className="text-sm font-black text-white">{nft.priceInit} INIT</span>
                                    </div>

                                    {/* Buy/Sell Button */}
                                    {nft.owner === currentUserWallet ? (
                                        <button className="w-full rounded-xl border border-orange-500/50 bg-orange-500/10 py-3 text-xs font-black uppercase tracking-widest text-orange-400 shadow-lg transition hover:bg-orange-500/20 hover:text-orange-300">
                                            {t('mkt_sell')}
                                        </button>
                                    ) : (
                                        <button className="w-full rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg transition hover:-translate-y-1 hover:brightness-110 active:scale-95">
                                            {t('mkt_buy_btn')}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        {/* Explore CTA */}
                        {activeTab === 'music' && (
                            <div className="mt-8 flex justify-center w-full">
                                <button className="flex items-center gap-2 text-orange-300 font-semibold text-sm hover:text-orange-400 transition">
                                    Explore Music NFTs <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
