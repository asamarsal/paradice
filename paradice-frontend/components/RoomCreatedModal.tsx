"use client";

import React from "react";
import Link from "next/link";
import type { RoomPlayer } from "@/lib/roomApi";

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

interface RoomCreatedModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomCode: string;
    mode: string;
    stake: string;
    fee: string;
    maxPlayers: 2 | 4;
    players: RoomPlayer[];
    currentWalletAddress: string;
    canStartGame: boolean;
}

function shortWallet(walletAddress: string): string {
    if (walletAddress.length <= 12) return walletAddress;
    return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
}

function buildAvatarByIndex(idx: number): string {
    const preset = ["/img/avatar-1.png", "/img/avatar-2.png", "/img/avatar-3.png"];
    return preset[idx % preset.length];
}

export default function RoomCreatedModal({
    isOpen,
    onClose,
    roomCode,
    mode,
    stake,
    fee,
    maxPlayers,
    players,
    currentWalletAddress,
    canStartGame,
}: RoomCreatedModalProps) {
    if (!isOpen) return null;

    const slots = Array.from({ length: maxPlayers }, (_, i) => i + 1);
    const inviteUrl = typeof window !== "undefined"
        ? `${window.location.origin}/play?room=${encodeURIComponent(roomCode)}`
        : `localhost:6767/play?room=${roomCode}`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-4xl overflow-hidden rounded-[2.5rem] border border-white/20 bg-black shadow-2xl animate-fade-in-up">
                <div className="absolute inset-0 -z-10">
                    <img
                        src="/img/room-bg.png"
                        alt="Sunset"
                        className="w-full h-full object-cover opacity-60 scale-110 blur-[2px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
                </div>

                <div className="p-8 md:p-10 flex flex-col gap-4">
                    <div className="text-center">
                        <h2 className="text-2xl md:text-3xl font-black text-white drop-shadow-lg uppercase tracking-tight">Room Created</h2>
                        <div className="mt-2 flex items-center justify-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <p className="text-sm font-medium text-white/80">Waiting for players to join...</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-2 bg-white/5 rounded-2xl p-4 md:p-5 border border-white/10">
                        <div className="flex flex-col items-center md:items-start gap-1.5">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg md:text-xl font-bold text-white">Room Code: <span className="text-orange-400 font-mono">{roomCode}</span></h3>
                                <button
                                    onClick={() => navigator.clipboard.writeText(roomCode)}
                                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg transition-colors text-xs font-bold text-white/80"
                                >
                                    Copy
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/60 font-medium justify-center md:justify-start">
                                <p>Mode: <span className="text-white">{mode} ({maxPlayers} Slots)</span></p>
                                <p>Stake: <span className="text-white">{stake} INIT</span></p>
                                <p>Platform Fee: <span className="text-white">{fee}</span></p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center md:items-end gap-2">
                            <div className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest">
                                Room members <span className="text-white/80 font-mono">{players.length}/{maxPlayers}</span>
                            </div>
                            <div className="w-48 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                                    style={{ width: `${(players.length / maxPlayers) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {slots.map((seatPosition) => {
                            const player = players.find((item) => item.seat_position === seatPosition);

                            if (!player) {
                                return (
                                    <div key={seatPosition} className="rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center p-8 transition-all hover:bg-white/10 group">
                                        <div className="w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center text-white/20 group-hover:scale-110 transition-transform">+</div>
                                        <p className="mt-3 text-xs font-bold text-white/20 uppercase tracking-widest">Waiting Slot #{seatPosition}</p>
                                    </div>
                                );
                            }

                            const isYou = player.wallet_address === currentWalletAddress;
                            const statSeed = player.username.length + seatPosition;

                            return (
                                <div key={player.user_id} className="relative flex flex-col rounded-2xl border border-white/10 bg-[#2A1B30]/60 p-4 backdrop-blur-md transition-all hover:bg-[#2A1B30]/80 group overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex gap-4 relative z-10">
                                        <div className="relative shrink-0">
                                            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-orange-500/30 shadow-lg">
                                                <img src={buildAvatarByIndex(seatPosition - 1)} alt={player.username} className="w-full h-full object-cover" />
                                            </div>
                                            {isYou && (
                                                <div className="absolute -top-2 -left-2 bg-gradient-to-r from-orange-500 to-red-500 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter text-white shadow-sm">
                                                    You
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div>
                                                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-0.5">Seat #{seatPosition} {player.username}</p>
                                                <p className="text-[9px] font-mono text-white/40 mb-2">{shortWallet(player.wallet_address)}</p>
                                            </div>

                                            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-md px-2 py-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                <span className="text-[9px] font-black text-emerald-300 uppercase tracking-wider">Joined</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-4 gap-2 pt-3 border-t border-white/5 relative z-10">
                                        <PlayerStat icon="T" value={10 + statSeed} />
                                        <PlayerStat icon="F" value={1 + (statSeed % 9)} />
                                        <PlayerStat icon="L" value={5 + statSeed} color="text-rose-400" />
                                        <PlayerStat icon="N" value={statSeed % 7} color="text-amber-400" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                            <div className="flex-1 flex items-center gap-3 bg-black/40 border border-white/10 rounded-full px-5 py-3 backdrop-blur-md">
                                <span className="text-xs font-medium text-white/70 truncate flex-1">{inviteUrl}</span>
                                <button
                                    onClick={() => navigator.clipboard.writeText(inviteUrl)}
                                    className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white/80 hover:bg-white/20 transition-colors"
                                >
                                    Copy Link
                                </button>
                            </div>

                            <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-full px-5 py-3 backdrop-blur-md">
                                <span className="text-xs font-black text-orange-400 uppercase tracking-[0.2em]">{roomCode}</span>
                            </div>

                            <Link
                                href={canStartGame ? "/play/match" : "#"}
                                aria-disabled={!canStartGame}
                                onClick={(event) => {
                                    if (!canStartGame) {
                                        event.preventDefault();
                                    }
                                }}
                                className={`rounded-full px-10 py-3 text-sm font-black uppercase tracking-[0.2em] text-white transition-all whitespace-nowrap ${
                                    canStartGame
                                        ? "bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 shadow-[0_4px_30px_rgba(249,115,22,0.4)] hover:brightness-110 transform hover:-translate-y-0.5"
                                        : "bg-white/10 border border-white/10 text-white/40 cursor-not-allowed"
                                }`}
                            >
                                {canStartGame ? "Start Game" : "Waiting Full Room"}
                            </Link>
                        </div>
                    </div>
                </div>

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
