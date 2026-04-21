"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useEffect, useRef, useState } from "react";
import Footer from "@/components/Footer";
import RoomCreatedModal from "@/components/RoomCreatedModal";
import { useSearchParams } from "next/navigation";
import { createRoom, getRoomDetail, joinRoom, listRooms, RoomDetail, RoomListItem } from "@/lib/roomApi";

function randomWalletAddress(): string {
    return `init1${Math.random().toString(36).slice(2, 14)}`;
}

export default function LobbyPage() {
    const searchParams = useSearchParams();
    const [players, setPlayers] = useState<2 | 4>(2);
    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
    const [stakeAmount, setStakeAmount] = useState(1.0);
    const [isPrivateRoom, setIsPrivateRoom] = useState(false);
    const [password, setPassword] = useState("");
    const [walletAddress, setWalletAddress] = useState("");
    const [username, setUsername] = useState("Paradice Player");

    const [createdRoom, setCreatedRoom] = useState<RoomDetail | null>(null);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [joinCode, setJoinCode] = useState("");
    const [joinPassword, setJoinPassword] = useState("");
    const [isJoiningRoom, setIsJoiningRoom] = useState(false);
    const [joinError, setJoinError] = useState<string | null>(null);
    const [publicRooms, setPublicRooms] = useState<RoomListItem[]>([]);
    const [isPublicRoomsLoading, setIsPublicRoomsLoading] = useState(true);
    const [deepLinkInfo, setDeepLinkInfo] = useState<string | null>(null);
    const autoJoinAttemptedRoomRef = useRef<string | null>(null);

    useEffect(() => {
        const storageKey = "paradice_guest_wallet";
        const existing = window.localStorage.getItem(storageKey);
        if (existing) {
            setWalletAddress(existing);
            return;
        }

        const generated = randomWalletAddress();
        window.localStorage.setItem(storageKey, generated);
        setWalletAddress(generated);
    }, []);

    const handleSwitchGuestWallet = () => {
        const storageKey = "paradice_guest_wallet";
        const generated = randomWalletAddress();
        window.localStorage.setItem(storageKey, generated);
        setWalletAddress(generated);
    };

    useEffect(() => {
        const roomFromQuery = searchParams.get("room");
        if (!roomFromQuery) return;

        setJoinCode(roomFromQuery.trim().toUpperCase());
        const passwordFromQuery = searchParams.get("password");
        if (passwordFromQuery) {
            setJoinPassword(passwordFromQuery.trim());
        }
    }, [searchParams]);

    useEffect(() => {
        const roomFromQuery = searchParams.get("room")?.trim().toUpperCase();
        const passwordFromQuery = searchParams.get("password")?.trim();
        if (!roomFromQuery || !walletAddress) return;
        if (autoJoinAttemptedRoomRef.current === roomFromQuery) return;

        autoJoinAttemptedRoomRef.current = roomFromQuery;
        setIsJoiningRoom(true);
        setJoinError(null);
        setDeepLinkInfo(`Mencoba masuk ke room ${roomFromQuery}...`);

        void (async () => {
            try {
                const detail = await getRoomDetail(roomFromQuery);

                if (detail.is_private && !(passwordFromQuery || joinPassword.trim())) {
                    setJoinError("Room ini private. Isi password lalu klik Join Room.");
                    setDeepLinkInfo(`Room ${roomFromQuery} terdeteksi private.`);
                    return;
                }

                const room = await joinRoom({
                    roomCode: roomFromQuery,
                    walletAddress,
                    username,
                    password: passwordFromQuery || joinPassword.trim() || undefined,
                });

                setCreatedRoom(room);
                setPlayers(room.max_players);
                setStakeAmount(room.entry_fee);
                setIsPrivateRoom(room.is_private);
                setJoinCode(room.room_code);
                setIsRoomModalOpen(true);
                setDeepLinkInfo(`Berhasil masuk ke room ${room.room_code}.`);
            } catch (error) {
                setJoinError(error instanceof Error ? error.message : "Gagal join room.");
                setDeepLinkInfo(`Gagal masuk ke room ${roomFromQuery}.`);
            } finally {
                setIsJoiningRoom(false);
            }
        })();
    }, [searchParams, walletAddress, username, joinPassword]);

    useEffect(() => {
        let cancelled = false;

        const fetchPublicRooms = async () => {
            try {
                const rooms = await listRooms("public");
                if (!cancelled) {
                    setPublicRooms(rooms);
                }
            } catch {
                if (!cancelled) {
                    setPublicRooms([]);
                }
            } finally {
                if (!cancelled) {
                    setIsPublicRoomsLoading(false);
                }
            }
        };

        void fetchPublicRooms();
        const intervalRef = window.setInterval(fetchPublicRooms, 5000);

        return () => {
            cancelled = true;
            window.clearInterval(intervalRef);
        };
    }, []);

    useEffect(() => {
        if (!isRoomModalOpen || !createdRoom?.room_code) return;

        const intervalRef = window.setInterval(async () => {
            try {
                const latest = await getRoomDetail(createdRoom.room_code);
                setCreatedRoom(latest);
            } catch {
                // Keep last known state if polling fails.
            }
        }, 3000);

        return () => window.clearInterval(intervalRef);
    }, [createdRoom?.room_code, isRoomModalOpen]);

    const handleCreateRoom = async () => {
        if (!walletAddress) {
            setCreateError("Wallet belum siap. Reload halaman sekali lagi.");
            return;
        }

        if (isPrivateRoom && password.trim().length < 4) {
            setCreateError("Password private room minimal 4 karakter.");
            return;
        }

        setIsCreatingRoom(true);
        setCreateError(null);

        try {
            const room = await createRoom({
                walletAddress,
                username,
                entryFee: stakeAmount,
                maxPlayers: players,
                isPrivate: isPrivateRoom,
                password: isPrivateRoom ? password.trim() : undefined,
            });

            setCreatedRoom(room);
            setJoinCode(room.room_code);
            setIsRoomModalOpen(true);
        } catch (error) {
            setCreateError(error instanceof Error ? error.message : "Gagal membuat room.");
        } finally {
            setIsCreatingRoom(false);
        }
    };

    const handleJoinRoom = async () => {
        if (!walletAddress) {
            setJoinError("Wallet belum siap. Reload halaman sekali lagi.");
            return;
        }

        const sanitizedCode = joinCode.trim().toUpperCase();
        if (!sanitizedCode) {
            setJoinError("Masukkan kode room terlebih dahulu.");
            return;
        }

        setIsJoiningRoom(true);
        setJoinError(null);

        try {
            const room = await joinRoom({
                roomCode: sanitizedCode,
                walletAddress,
                username,
                password: joinPassword.trim() || undefined,
            });

            setCreatedRoom(room);
            setPlayers(room.max_players);
            setStakeAmount(room.entry_fee);
            setIsPrivateRoom(room.is_private);
            setJoinCode(room.room_code);
            setIsRoomModalOpen(true);
        } catch (error) {
            setJoinError(error instanceof Error ? error.message : "Gagal join room.");
        } finally {
            setIsJoiningRoom(false);
        }
    };

    const activeRoomPlayerCount = createdRoom?.players.length ?? 0;
    const canStartCreatedRoom = createdRoom ? activeRoomPlayerCount >= createdRoom.max_players : false;
    const canUseStartButton = createdRoom ? canStartCreatedRoom : true;

    return (
        <div className="flex flex-col min-h-screen text-white max-w-full overflow-x-hidden">
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <video autoPlay loop muted playsInline className="h-full w-full object-cover">
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
                    <p className="mt-2 text-white/80 text-lg">Buat room, pilih jumlah pemain, dan tunggu teman join.</p>
                    {searchParams.get("room") && (
                        <div className="mt-4 space-y-2">
                            <p className="text-xs text-white/70">
                                Deep link room: <span className="font-black text-orange-300">{searchParams.get("room")?.trim().toUpperCase()}</span>
                            </p>
                            {deepLinkInfo && (
                                <p className="text-xs text-cyan-200 rounded-lg border border-cyan-300/40 bg-cyan-500/15 px-3 py-2 break-words">
                                    {deepLinkInfo}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start h-full pb-10">
                    <div className="flex-1 w-full flex flex-col my-2">
                        <div className="rounded-[2.5rem] border border-white/10 bg-[#1a111c]/60 backdrop-blur-[30px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 h-full flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-80" />
                            <h2 className="text-xl font-bold text-orange-50/90 mb-5">Bet & Game Setup</h2>

                            <div className="flex gap-6 border-b border-white/10 mb-6 px-2">
                                <button className="pb-3 text-orange-400 font-bold border-b-2 border-orange-500 px-2">
                                    <span>{stakeAmount.toFixed(2)} INIT</span>
                                </button>
                                <button className="pb-3 text-white/50 hover:text-white/80 font-bold px-2 transition-colors">Public</button>
                                <button className="pb-3 text-white/50 hover:text-white/80 font-bold px-2 transition-colors">Private</button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                <div className="rounded-3xl border border-white/5 bg-white/5 p-5 transition-all hover:bg-white/10 hover:border-orange-500/20 group shadow-lg">
                                    <div className="flex justify-between items-start mb-5">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs shadow-inner">D</div>
                                                <span className="font-black text-white text-[15px] uppercase tracking-tight">Classic</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-white/40 font-bold">
                                                <span>{players} Players</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-black text-white text-lg mb-0.5">{stakeAmount.toFixed(2)} INIT</div>
                                            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Live setup</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-black text-white border border-white/20 shadow-lg">Y</div>
                                            <span className="text-xs text-white/60 font-bold tracking-tight truncate max-w-[100px]">{username || "You"}</span>
                                        </div>
                                        <button className="rounded-full bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-2 text-xs font-black uppercase tracking-widest text-white shadow-[0_4px_15px_rgba(234,88,12,0.3)] transition-all hover:scale-105 active:scale-95 group-hover:brightness-110">
                                            Ready
                                        </button>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-orange-500/30 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-5 h-5 rounded bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs">R</div>
                                                <span className="font-bold text-white text-sm">Room Status</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-white/50">
                                                <span>{createdRoom ? createdRoom.room_code : "No room selected"}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-white mb-1">
                                                {createdRoom ? `${createdRoom.players.length}/${createdRoom.max_players}` : "-"}
                                            </div>
                                            <div className="text-xs text-white/50">Players joined</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold shrink-0 border border-white/20">W</div>
                                            <span className="text-xs text-white/80 font-medium truncate max-w-[130px]">{walletAddress || "Waiting wallet..."}</span>
                                        </div>
                                        <button className="rounded-full bg-gradient-to-r from-orange-600 to-orange-500 px-5 py-1.5 text-xs font-bold text-white shadow-lg transition-transform group-hover:scale-105">
                                            Lobby
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="text-white/40 text-[13px] flex gap-4 items-center font-bold">
                                    <span>Mode: <strong className="text-white">{players} Players</strong></span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                                    <span>Stake: <strong className="text-white">{stakeAmount.toFixed(2)} INIT</strong></span>
                                </div>
                                <Link
                                    href={canUseStartButton ? "/play/match" : "#"}
                                    aria-disabled={!canUseStartButton}
                                    onClick={(event) => {
                                        if (!canUseStartButton) {
                                            event.preventDefault();
                                        }
                                    }}
                                    className={`w-full md:w-auto rounded-[2rem] px-12 py-4 text-sm font-black uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 ${
                                        canUseStartButton
                                            ? "bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 hover:brightness-110 text-white shadow-[0_10px_40px_rgba(249,115,22,0.4)]"
                                            : "bg-white/10 border border-white/10 text-white/40 cursor-not-allowed"
                                    }`}
                                >
                                    {canUseStartButton ? "START MATCH" : `WAITING ${activeRoomPlayerCount}/${createdRoom?.max_players}`}
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-[350px] shrink-0 rounded-[2.5rem] border border-white/10 bg-[#1a111c]/60 backdrop-blur-[30px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 relative overflow-hidden transition-all duration-300 my-2">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-orange-500/10 to-transparent pointer-events-none" />

                        <h2 className="text-xl font-bold text-white mb-5">Find or Create a Room</h2>

                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-white/80">Stake Amount</span>
                                <span className="text-sm font-bold text-white">{stakeAmount.toFixed(2)} INIT</span>
                            </div>

                            <div className="flex items-center rounded-xl border border-white/10 bg-black/30 p-1">
                                <button
                                    onClick={() => setStakeAmount((prev) => Math.max(0.1, Number((prev - 1).toFixed(2))))}
                                    className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                                >
                                    -
                                </button>
                                <div className="flex-1 text-center font-bold text-white text-lg border-x border-white/10 py-1.5">
                                    {stakeAmount.toFixed(2)}
                                </div>
                                <button
                                    onClick={() => setStakeAmount((prev) => Number((prev + 1).toFixed(2)))}
                                    className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                                >
                                    +
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-white/80">Players</span>
                                <div className="flex gap-2">
                                    <span className="font-bold text-white mr-2 flex items-center">{players}</span>
                                    <button onClick={() => setPlayers(2)} className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-colors ${players === 2 ? "border-orange-500 text-orange-400 bg-orange-500/10" : "border-white/10 bg-white/5 text-white/50 hover:text-white"}`}>2</button>
                                    <button onClick={() => setPlayers(4)} className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-colors ${players === 4 ? "border-orange-500 text-orange-400 bg-orange-500/10" : "border-white/10 bg-white/5 text-white/50 hover:text-white"}`}>4</button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm font-medium text-white/80">Username</span>
                                <input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Your username"
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 transition-colors"
                                />
                                <div className="flex items-center justify-between gap-2 text-[11px]">
                                    <span className="truncate text-white/50">Wallet: {walletAddress || "..."}</span>
                                    <button
                                        type="button"
                                        onClick={handleSwitchGuestWallet}
                                        className="shrink-0 rounded-md border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/80 hover:bg-white/20 transition-colors"
                                    >
                                        Switch Wallet
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white/80">Room Pass</span>
                                    <button
                                        type="button"
                                        onClick={() => setIsPrivateRoom((prev) => !prev)}
                                        className={`w-9 h-5 rounded-full relative transition-colors ${isPrivateRoom ? "bg-orange-500" : "bg-white/20"}`}
                                    >
                                        <span className={`absolute top-0.5 h-4 w-4 bg-white rounded-full transition-all ${isPrivateRoom ? "left-[18px]" : "left-0.5"}`} />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    disabled={!isPrivateRoom}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter Password"
                                    className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 disabled:opacity-40 focus:outline-none focus:border-orange-500/50 transition-colors"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={handleCreateRoom}
                                    disabled={isCreatingRoom}
                                    className="w-full rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] border border-white/10 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isCreatingRoom ? "Creating..." : "Create Room"}
                                </button>
                            </div>

                            {createError && (
                                <p className="text-center text-xs text-rose-300 rounded-lg border border-rose-400/40 bg-rose-500/15 px-3 py-2 break-words">
                                    {createError}
                                </p>
                            )}

                            <div className="pt-4 border-t border-white/10 space-y-3">
                                <p className="text-sm font-semibold text-white/80">Join Room</p>
                                <input
                                    type="text"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    placeholder="Room code (ex: PARA-ABCD)"
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 transition-colors"
                                />
                                <input
                                    type="text"
                                    value={joinPassword}
                                    onChange={(e) => setJoinPassword(e.target.value)}
                                    placeholder="Password (optional)"
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 transition-colors"
                                />
                                <button
                                    onClick={handleJoinRoom}
                                    disabled={isJoiningRoom}
                                    className="w-full rounded-2xl bg-white/10 py-3 text-sm font-bold text-white border border-white/10 hover:bg-white/15 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isJoiningRoom ? "Joining..." : "Join Room"}
                                </button>
                                {joinError && (
                                    <p className="text-center text-xs text-rose-300 rounded-lg border border-rose-400/40 bg-rose-500/15 px-3 py-2 break-words">
                                        {joinError}
                                    </p>
                                )}
                            </div>

                            <div className="pt-4 border-t border-white/10 space-y-3">
                                <p className="text-sm font-semibold text-white/80">Public Rooms</p>
                                <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                                    {isPublicRoomsLoading && (
                                        <p className="text-xs text-white/50">Loading public rooms...</p>
                                    )}
                                    {!isPublicRoomsLoading && publicRooms.length === 0 && (
                                        <p className="text-xs text-white/50">Belum ada room publik aktif.</p>
                                    )}
                                    {publicRooms.map((room) => (
                                        <button
                                            key={room.room_code}
                                            onClick={() => {
                                                setJoinCode(room.room_code);
                                                setJoinError(null);
                                            }}
                                            className="w-full rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-left transition-colors"
                                        >
                                            <p className="text-xs font-black text-orange-300">{room.room_code}</p>
                                            <p className="text-[11px] text-white/70 mt-0.5">
                                                {room.player_count}/{room.max_players} players • Stake {room.entry_fee.toFixed(2)} INIT
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <p className="text-center text-xs text-white/50 leading-relaxed px-2">
                                Invite friends or play solo. Private rooms need a password to join.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            <RoomCreatedModal
                isOpen={isRoomModalOpen}
                onClose={() => setIsRoomModalOpen(false)}
                roomCode={createdRoom?.room_code ?? "-"}
                mode={players === 2 ? "2 Players" : "4 Players"}
                stake={stakeAmount.toFixed(2)}
                fee="5%"
                maxPlayers={createdRoom?.max_players ?? players}
                players={createdRoom?.players ?? []}
                currentWalletAddress={walletAddress}
                canStartGame={canStartCreatedRoom}
            />
        </div>
    );
}
