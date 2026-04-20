"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface PlayerStatProps {
    icon: string;
    value: string | number;
    color?: string;
}

const PlayerStat = ({ icon, value, color = "text-white" }: PlayerStatProps) => (
    <div className="flex items-center gap-1.5">
        <span className="text-sm">{icon}</span>
        <span className={`text-xs font-bold ${color}`}>{value}</span>
    </div>
);

interface PlayerCardProps {
    rank: number;
    name: string;
    address: string;
    isYou?: boolean;
    isReady?: boolean;
    wins?: number;
    stats: {
        trophies: number;
        friends: number;
        likes: number;
        nfts: number;
    };
    avatar: string;
}

const PlayerCard = ({ rank, name, address, isYou, isReady, wins, stats, avatar }: PlayerCardProps) => (
    <div className="relative flex flex-col rounded-2xl border border-white/10 bg-[#2A1B30]/60 p-4 backdrop-blur-md transition-all hover:bg-[#2A1B30]/80 group overflow-hidden">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="flex gap-4 relative z-10">
            {/* Avatar */}
            <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-orange-500/30 shadow-lg">
                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                </div>
                {isYou && (
                    <div className="absolute -top-2 -left-2 bg-gradient-to-r from-orange-500 to-red-500 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter text-white shadow-sm">
                        You
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-0.5">#{rank} {name}</p>
                        <p className="text-[9px] font-mono text-white/40 mb-2">{address}</p>
                    </div>
                </div>

                {isYou ? (
                    <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-md px-2 py-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-300 uppercase tracking-wider">Ready</span>
                    </div>
                ) : (
                    <p className="text-[10px] font-bold text-white flex items-center gap-1.5">
                        {wins} Wins <span className="text-orange-300">💰</span>
                    </p>
                )}
            </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-4 grid grid-cols-4 gap-2 pt-3 border-t border-white/5 relative z-10">
            <PlayerStat icon="🏆" value={stats.trophies} />
            <PlayerStat icon="👥" value={stats.friends} />
            <PlayerStat icon="❤️" value={stats.likes} color="text-rose-400" />
            <PlayerStat icon="⭐" value={stats.nfts} color="text-amber-400" />
        </div>
    </div>
);

interface RoomCreatedModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomCode: string;
    mode: string;
    stake: string;
    fee: string;
}

export default function RoomCreatedModal({ isOpen, onClose, roomCode, mode, stake, fee }: RoomCreatedModalProps) {
    if (!isOpen) return null;

    const mockPlayers: PlayerCardProps[] = [
        {
            rank: 8,
            name: "ParadiceKing0x",
            address: "INIT1LML...H98D2R",
            isYou: true,
            isReady: true,
            stats: { trophies: 32, friends: 6, likes: 19, nfts: 5 },
            avatar: "/img/avatar-1.png"
        },
        {
            rank: 1,
            name: "Angela",
            address: "INITMLS...D3F03A",
            wins: 245,
            stats: { trophies: 245, friends: 20, likes: 211, nfts: 11 },
            avatar: "/img/avatar-2.png"
        },
        {
            rank: 27,
            name: "Luna",
            address: "INITMLS...C835B2",
            wins: 8,
            stats: { trophies: 8, friends: 3, likes: 24, nfts: 1 },
            avatar: "/img/avatar-3.png"
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl overflow-hidden rounded-[2.5rem] border border-white/20 bg-black shadow-2xl animate-fade-in-up">
                {/* Visual Background Layer */}
                <div className="absolute inset-0 -z-10">
                    <img
                        src="/img/room-bg.png"
                        alt="Sunset"
                        className="w-full h-full object-cover opacity-60 scale-110 blur-[2px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
                </div>

                <div className="p-8 md:p-10 flex flex-col gap-4">
                    {/* Header */}
                    <div className="text-center">
                        <h2 className="text-2xl md:text-3xl font-black text-white drop-shadow-lg uppercase tracking-tight">Room Created</h2>
                        <div className="mt-2 flex items-center justify-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <p className="text-sm font-medium text-white/80">Waiting for players to join...</p>
                        </div>
                    </div>

                    {/* Room Info & Expiry */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-2 bg-white/5 rounded-2xl p-4 md:p-5 border border-white/10">
                        {/* Left Side: Room Details */}
                        <div className="flex flex-col items-center md:items-start gap-1.5">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg md:text-xl font-bold text-white">Room Code: <span className="text-orange-400 font-mono">{roomCode}</span></h3>
                                <button className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg transition-colors text-xs font-bold text-white/80">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                    Copy
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/60 font-medium justify-center md:justify-start">
                                <p>Mode: <span className="text-white">{mode} (Public)</span></p>
                                <p>Stake: <span className="text-white">{stake} INIT</span></p>
                                <p>Platform Fee: <span className="text-white">{fee}</span></p>
                            </div>
                        </div>

                        {/* Right Side: Expiry */}
                        <div className="flex flex-col items-center md:items-end gap-2">
                            <div className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest">
                                Room expires in <span className="text-white/80 font-mono">1:57</span>
                            </div>
                            <div className="w-48 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-gradient-to-r from-orange-600 to-orange-400 w-[60%] rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                            </div>
                        </div>
                    </div>

                    {/* Players Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {mockPlayers.map((player, idx) => (
                            <PlayerCard key={idx} {...player} />
                        ))}

                        {/* Empty Slot Placeholder */}
                        {mockPlayers.length < 4 && (
                            <div className="rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center p-8 transition-all hover:bg-white/10 group">
                                <div className="w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center text-white/20 group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                </div>
                                <p className="mt-3 text-xs font-bold text-white/20 uppercase tracking-widest">Waiting Slot</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Controls */}
                    <div className="mt-4 flex flex-col gap-6">
                        {/* Link & Code Bar */}
                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                            <div className="flex-1 flex items-center gap-3 bg-black/40 border border-white/10 rounded-full px-5 py-3 backdrop-blur-md">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-purple-400"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                <span className="text-xs font-medium text-white/70 truncate flex-1">paradice.app/join/{roomCode}</span>
                            </div>

                            <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-full px-5 py-3 backdrop-blur-md">
                                <span className="text-xs font-black text-orange-400 uppercase tracking-[0.2em]">{roomCode}</span>
                                <button className="text-white/40 hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                </button>
                            </div>

                            <Link href="/play/match" className="rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 px-10 py-3 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[0_4px_30px_rgba(249,115,22,0.4)] hover:brightness-110 transition-all transform hover:-translate-y-0.5 whitespace-nowrap">
                                Start Game
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all hover:rotate-90"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
            </div>

            <style jsx>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
