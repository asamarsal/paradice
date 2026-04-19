"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import Footer from "@/components/Footer";

export default function LobbyPage() {
    const [players, setPlayers] = useState<2 | 4>(2);

    return (
        <div className="flex flex-col min-h-screen text-white max-w-full overflow-x-hidden">
            {/* ── Video Background ── */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                >
                    <source src="/video/ludoboard-animation.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(139,92,246,0.25),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(249,115,22,0.2),_transparent_50%)]" />
            </div>

            <Navbar balanceUsd={0} />

            <main className="relative flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 mt-20 flex flex-col">
                <div className="mb-8">
                    <Link href="/" className="text-white/60 hover:text-white flex items-center gap-2 text-sm font-semibold transition-colors w-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        BACK
                    </Link>
                    <h1 className="mt-6 text-4xl md:text-5xl font-black text-white drop-shadow-md">Play</h1>
                    <p className="mt-2 text-white/80 text-lg">Set your bet size and select a game mode now.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start h-full pb-10">

                    {/* Left Panel: Bet & Game Setup */}
                    <div className="flex-1 w-full flex flex-col">
                        <div className="rounded-[2rem] border border-white/20 bg-[#2A1B30]/40 backdrop-blur-xl shadow-2xl p-6 h-full flex flex-col relative overflow-hidden">
                            {/* Inner ambient glow */}
                            <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-80"></div>

                            <h2 className="text-xl font-bold text-orange-50/90 mb-5">Bet & Game Setup</h2>

                            {/* Tabs */}
                            <div className="flex gap-6 border-b border-white/10 mb-6 px-2">
                                <button className="pb-3 text-orange-400 font-bold border-b-2 border-orange-500 px-2 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                    <span>$1.00</span>
                                </button>
                                <button className="pb-3 text-white/50 hover:text-white/80 font-bold px-2 transition-colors">Public</button>
                                <button className="pb-3 text-white/50 hover:text-white/80 font-bold px-2 transition-colors">Private</button>
                            </div>

                            {/* Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                {/* Card 1 */}
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-orange-500/30 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-5 h-5 rounded bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs">🎲</div>
                                                <span className="font-bold text-white text-sm">Classic</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-white/50">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                                                <span>5 min</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-0.5"><path d="m6 9 6 6 6-6" /></svg>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-white mb-1">$2.00</div>
                                            <div className="text-xs text-white/50">Starts in 1d</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold shrink-0 border border-white/20">S</div>
                                            <span className="text-xs text-white/80 font-medium truncate max-w-[100px]">Satoshi999</span>
                                        </div>
                                        <button className="rounded-full bg-gradient-to-r from-orange-600 to-orange-500 px-5 py-1.5 text-xs font-bold text-white shadow-lg transition-transform group-hover:scale-105">
                                            Join
                                        </button>
                                    </div>
                                </div>

                                {/* Card 2 */}
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-orange-500/30 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-5 h-5 rounded bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs">🎲</div>
                                                <span className="font-bold text-white text-sm">Classic</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-white/50">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                                                <span>6 min</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-0.5"><path d="m6 9 6 6 6-6" /></svg>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-white mb-1">$5.00</div>
                                            <div className="text-xs text-white/50">Starts in 2h</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold shrink-0 border border-white/20">M</div>
                                            <span className="text-xs text-white/80 font-medium truncate max-w-[100px]">MoonLite</span>
                                        </div>
                                        <button className="rounded-full bg-gradient-to-r from-orange-600 to-orange-500 px-5 py-1.5 text-xs font-bold text-white shadow-lg transition-transform group-hover:scale-105">
                                            Join
                                        </button>
                                    </div>
                                </div>

                                {/* Card 3 */}
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-orange-500/30 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-5 h-5 rounded bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs">🎲</div>
                                                <span className="font-bold text-white text-sm">Classic</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-white/50">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                                                <span>1 min</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-0.5"><path d="m6 9 6 6 6-6" /></svg>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-white mb-1">$1.00</div>
                                            <div className="text-xs text-white/50">Starts in 7d</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-[#1E3A8A] flex items-center justify-center text-[10px] font-bold shrink-0 border border-white/20">O</div>
                                            <span className="text-xs text-white/80 font-medium truncate max-w-[100px]">Oxed...8a16</span>
                                        </div>
                                        <button className="rounded-full bg-gradient-to-r from-orange-600 to-orange-500 px-5 py-1.5 text-xs font-bold text-white shadow-lg transition-transform group-hover:scale-105">
                                            Join
                                        </button>
                                    </div>
                                </div>

                                {/* Card 4 */}
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-orange-500/30 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-5 h-5 rounded bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs">🎲</div>
                                                <span className="font-bold text-white text-sm">Classic</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-white/50">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                                                <span>3 min</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-0.5"><path d="m6 9 6 6 6-6" /></svg>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-white mb-1">$20.00</div>
                                            <div className="text-xs text-white/50">Starts in 1d</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-bold shrink-0 border border-white/20">S</div>
                                            <span className="text-xs text-white/80 font-medium truncate max-w-[100px]">SirStacksalot</span>
                                        </div>
                                        <button className="rounded-full bg-gradient-to-r from-orange-600 to-orange-500 px-5 py-1.5 text-xs font-bold text-white shadow-lg transition-transform group-hover:scale-105">
                                            Join
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Slider Pagination */}
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                                </div>
                                <button className="text-xs font-bold text-white/60 hover:text-white flex items-center gap-1 transition-colors">
                                    Next
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                                </button>
                            </div>

                            <div className="mt-auto pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="text-white/80 text-sm flex gap-3 items-center">
                                    <span>Mode: <strong className="text-white">{players} Players</strong></span>
                                    <span className="w-1 h-1 rounded-full bg-white/30"></span>
                                    <span>Stake: <strong className="text-white">$1.00</strong></span>
                                </div>
                                <Link
                                    href="/play/match"
                                    className="w-full md:w-auto rounded-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 px-10 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-[0_4px_25px_rgba(249,115,22,0.4)] transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                                    START MATCH
                                </Link>
                            </div>
                        </div>

                        {/* Quick action buttons below */}
                        <div className="flex gap-4 mt-6">
                            <button className="rounded-full bg-gradient-to-r from-orange-600 to-orange-800 px-6 py-2.5 text-sm font-bold text-white shadow-lg border border-orange-500/50 hover:brightness-110 transition-all">
                                Quick Join
                            </button>
                            <button className="rounded-full bg-black/40 backdrop-blur border border-white/10 px-6 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-black/60 transition-all flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                Private room? Enter Room Pass &rarr;
                            </button>
                        </div>
                    </div>

                    {/* Right Panel: Find or Create a Room */}
                    <div className="w-full lg:w-[350px] shrink-0 rounded-[2rem] border border-white/20 bg-[#2A1B30]/40 backdrop-blur-xl shadow-2xl p-6 relative overflow-hidden transition-all duration-300">
                        {/* Inner ambient glow */}
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-orange-500/10 to-transparent pointer-events-none"></div>

                        <h2 className="text-xl font-bold text-white mb-5">Find or Create a Room</h2>

                        <div className="flex justify-between border-b border-white/10 mb-6 px-1 text-sm">
                            <button className="pb-3 text-orange-400 font-bold border-b-2 border-orange-500 px-2">All Rooms</button>
                            <button className="pb-3 text-white/50 hover:text-white/80 font-bold px-2 transition-colors">Public</button>
                            <button className="pb-3 text-white/50 hover:text-white/80 font-bold px-2 transition-colors">Private</button>
                        </div>

                        <div className="space-y-5">
                            {/* Stake Amount */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-white/80">Stake Amount</span>
                                <span className="text-sm font-bold text-white flex items-center gap-1">
                                    $1.00
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></svg>
                                </span>
                            </div>

                            {/* Stake Input Control */}
                            <div className="flex items-center rounded-xl border border-white/10 bg-black/30 p-1">
                                <button className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /></svg>
                                </button>
                                <div className="flex-1 text-center font-bold text-white text-lg border-x border-white/10 py-1.5">
                                    $1.00
                                </div>
                                <button className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                </button>
                            </div>

                            {/* Players */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-white/80">Players</span>
                                <div className="flex gap-2">
                                    <span className="font-bold text-white mr-2 flex items-center">{players}</span>
                                    <button onClick={() => setPlayers(2)} className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-colors ${players === 2 ? 'border-orange-500 text-orange-400 bg-orange-500/10' : 'border-white/10 bg-white/5 text-white/50 hover:text-white'}`}>2</button>
                                    <button onClick={() => setPlayers(4)} className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-colors ${players === 4 ? 'border-orange-500 text-orange-400 bg-orange-500/10' : 'border-white/10 bg-white/5 text-white/50 hover:text-white'}`}>4</button>
                                </div>
                            </div>

                            {/* Room Pass Toggle */}
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white/80">Room Pass</span>
                                    <div className="w-6 h-3.5 rounded-full bg-orange-400 relative">
                                        <div className="absolute right-0.5 top-0.5 w-2.5 h-2.5 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter Password"
                                    className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 transition-colors"
                                />
                            </div>

                            <div className="pt-2">
                                <button className="w-full rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] border border-white/10">
                                    Create Room
                                </button>
                            </div>

                            <p className="text-center text-xs text-white/50 leading-relaxed px-2">
                                Invite friends or play solo. Private rooms need a password to join.
                            </p>

                            <div className="text-center pt-2">
                                <a href="#" className="text-sm text-cyan-300 hover:text-cyan-200 transition-colors">Need help?</a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
