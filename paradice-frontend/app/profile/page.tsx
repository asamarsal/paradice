'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import { useLanguage } from '@/context/LanguageContext';

const dummyUser = {
    username: 'TropicalExplorer',
    walletAddress: '0x3kd7f2a9b8c1e4d6f0a2b3c4d5e6f7a8fA2',
    walletShort: '0x3kd...8fA2',
    bio: 'Exploring the islands and rolling some dice!',
    tier: 'PLATINUM',
    level: 24,
    levelProgress: 72,
    matches: 255,
    wins: 156,
    winrate: 66,
    totalEarnings: 249.2,
    winStreak: 3,
    twitter: 'TropicalExplorer',
    discord: 'TropicalExplorer',
    onchain: 'TropicalExplorer',
    avatar: null as string | null,
};

const friends = [
    { name: 'ArcadeAce', emoji: '🤖', color: '#FF4499' },
    { name: 'PalmPilot', emoji: '👩', color: '#AA44FF' },
    { name: 'IslandKing', emoji: '🦜', color: '#FF8800' },
    { name: 'TropicTess', emoji: '🌺', color: '#44DDAA' },
];

const TIER_CONFIG: Record<string, { label: string; color: string; stars: number; bg: string }> = {
    PLATINUM: { label: 'Platinum', color: '#E2E8F0', stars: 5, bg: 'from-slate-400 to-slate-200' },
    GOLD: { label: 'Gold', color: '#F59E0B', stars: 4, bg: 'from-yellow-500 to-amber-300' },
    SILVER: { label: 'Silver', color: '#94A3B8', stars: 3, bg: 'from-slate-400 to-slate-300' },
};

const formatUsd = (value: number) => `$${value.toFixed(2)}`;

export default function ProfilePage() {
    const { t } = useLanguage();
    const [dummyBalanceUsd] = useState(20);
    const [user, setUser] = useState({ ...dummyUser });
    const [form, setForm] = useState({
        username: dummyUser.username,
        bio: dummyUser.bio,
        twitter: dummyUser.twitter,
        discord: dummyUser.discord,
        onchain: dummyUser.onchain,
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('STATS');
    const fileRef = useRef<HTMLInputElement>(null);

    const tier = TIER_CONFIG[user.tier] ?? TIER_CONFIG.PLATINUM;

    const handleSave = async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 1200));
        setUser((prev) => ({ ...prev, ...form }));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handleCopyWallet = () => {
        navigator.clipboard.writeText(user.walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setUser((prev) => ({ ...prev, avatar: ev.target?.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

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

            <main className="relative z-10 mx-auto max-w-7xl px-4 pt-24 pb-12 md:px-8">
                <BackButton />
                <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

                    {/* ─── LEFT: Player Card ─── */}
                    <div className="flex flex-col gap-4">
                        {/* Profile Header Card */}
                        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
                            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-[#F97316]/5 to-[#8B5CF6]/5" />
                            <div className="relative flex items-start gap-5">
                                <div className="relative flex-shrink-0">
                                    <button
                                        type="button"
                                        className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-2xl border-2 border-[#F97316]/50 bg-gradient-to-br from-[#F97316] to-[#8B5CF6] shadow-lg shadow-orange-500/20"
                                        onClick={() => fileRef.current?.click()}
                                        aria-label={t('pr_change_avatar')}
                                    >
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-4xl">🌴</div>
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                        </div>
                                    </button>
                                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h1 className="text-2xl font-black text-white">{user.username}</h1>
                                        <button
                                            onClick={() => fileRef.current?.click()}
                                            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white"
                                            title={t('pr_change_avatar')}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleCopyWallet}
                                        className="mt-1.5 flex items-center gap-2 text-sm font-mono text-white/50 transition hover:text-white/80"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                        {user.walletShort}
                                        {copied && <span className="ml-1 text-[10px] text-emerald-400">{t('pr_copy')}</span>}
                                    </button>

                                    <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
                                        <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" />
                                        {t('pr_connected')}
                                    </div>

                                    <div className={`mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${tier.bg} px-3 py-1 shadow-lg`}>
                                        <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#1a0f2e]">{tier.label}</span>
                                        <div className="flex gap-0.5" aria-hidden="true">
                                            {Array.from({ length: 5 }).map((_, i) => {
                                                const isActive = i < tier.stars;
                                                return (
                                                    <span key={`star-${i}`} className={`text-[10px] ${isActive ? 'text-[#1a0f2e]' : 'text-[#1a0f2e]/20'}`}>★</span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur">
                            {[
                                { id: 'STATS', label: t('pr_t_stats') },
                                { id: 'INVENTORY', label: t('pr_t_inventory') },
                                { id: 'FRIENDS', label: t('pr_t_friends') },
                                { id: 'HISTORY', label: t('pr_t_history') },
                            ].map((tabItem) => (
                                <button
                                    key={tabItem.id}
                                    onClick={() => setActiveTab(tabItem.id)}
                                    className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest transition ${activeTab === tabItem.id
                                        ? 'bg-[#F97316] text-white shadow-inner'
                                        : 'text-white/40 hover:text-white/70'
                                        }`}
                                >
                                    {tabItem.label}
                                </button>
                            ))}
                        </div>

                        {/* Stats Tab Content */}
                        {activeTab === 'STATS' && (
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { icon: '▶', label: t('pr_matches'), value: user.matches, color: 'text-emerald-400' },
                                        { icon: '🏆', label: t('pr_wins'), value: user.wins, color: 'text-yellow-400' },
                                        { icon: '⚡', label: t('pr_winrate'), value: `${user.winrate}%`, color: 'text-orange-400' },
                                    ].map((stat) => (
                                        <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.06] p-4 text-center backdrop-blur">
                                            <div className={`text-xl font-black ${stat.color}`}>{stat.icon} {stat.value}</div>
                                            <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/40">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="rounded-xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-xs font-black uppercase tracking-widest text-white/50">Level {user.level}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">💎</span>
                                            <span className="text-lg font-black text-white">{tier.label}</span>
                                        </div>
                                    </div>
                                    <div className="h-3 overflow-hidden rounded-full bg-white/10">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-[#F97316] to-[#EAB308] shadow-[0_0_12px_rgba(249,115,22,0.6)] transition-all duration-700"
                                            style={{ width: `${user.levelProgress}%` }}
                                        />
                                    </div>
                                    <div className="mt-1 text-right text-[10px] text-white/30">{user.levelProgress}%</div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t('pr_earnings_label')}</div>
                                        <div className="mt-1 text-xl font-black text-emerald-400">${user.totalEarnings.toFixed(2)}</div>
                                    </div>
                                    <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t('pr_streak_label')}</div>
                                        <div className="mt-1 text-xl font-black text-orange-400">{user.winStreak} {t('pr_wins_suffix')}</div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                                    <div className="mb-4 flex items-center justify-between">
                                        <span className="text-[11px] font-black uppercase tracking-widest text-white/60">{t('pr_t_friends')}</span>
                                        <Link href="/leaderboard">
                                            <button className="text-[10px] font-black uppercase tracking-widest text-orange-400 transition hover:text-orange-300">{t('pr_view_friends')}</button>
                                        </Link>
                                    </div>
                                    <div className="flex gap-4">
                                        {friends.map((f) => (
                                            <div key={f.name} className="flex flex-col items-center gap-2">
                                                <div
                                                    className="flex h-14 w-14 items-center justify-center rounded-full border-2 text-2xl shadow-lg"
                                                    style={{ borderColor: f.color, backgroundColor: `${f.color}22` }}
                                                >
                                                    {f.emoji}
                                                </div>
                                                <span className="text-[9px] font-bold text-white/50">{f.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab !== 'STATS' && (
                            <div className="flex h-40 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-xs font-black uppercase tracking-widest text-white/20 backdrop-blur">
                                {activeTab} — {t('pr_coming_soon')}
                            </div>
                        )}
                    </div>

                    {/* ─── RIGHT: Update Profile Form ─── */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl shadow-2xl">
                        <h2 className="mb-6 text-lg font-black text-white">{t('pr_update')}</h2>
                        <div className="flex flex-col gap-5">
                            <div>
                                <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-white/50">{t('pr_user')}</label>
                                <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 focus-within:border-[#F97316]/50 focus-within:bg-white/10 transition">
                                    <input
                                        type="text"
                                        value={form.username}
                                        onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                                        className="flex-1 bg-transparent text-sm font-semibold text-white outline-none"
                                        placeholder={t('pr_placeholder_user')}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-white/50">{t('pr_bio')}</label>
                                <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 focus-within:border-[#F97316]/50 transition">
                                    <textarea
                                        rows={3}
                                        value={form.bio}
                                        onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                                        className="w-full resize-none bg-transparent text-sm text-white/80 outline-none"
                                        placeholder={t('pr_placeholder_bio')}
                                    />
                                </div>
                            </div>

                            {(() => {
                                let btnClasses = "h-12 w-full rounded-xl text-sm font-black uppercase tracking-[0.15em] shadow-lg transition active:scale-95 ";
                                if (saved) {
                                    btnClasses += "bg-emerald-500 text-white shadow-emerald-500/30";
                                } else if (saving) {
                                    btnClasses += "cursor-not-allowed bg-[#F97316]/60 text-white/60";
                                } else {
                                    btnClasses += "bg-gradient-to-r from-[#F97316] to-[#EAB308] text-[#1a0f2e] shadow-orange-500/30 hover:-translate-y-px hover:shadow-orange-400/50";
                                }

                                let btnText = t('pr_save');
                                if (saving) btnText = t('pr_saving');
                                else if (saved) btnText = t('pr_saved');

                                return (
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={saving}
                                        className={btnClasses}
                                    >
                                        {btnText}
                                    </button>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
