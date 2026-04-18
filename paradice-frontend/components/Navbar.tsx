'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useInterwovenKit } from '@initia/interwovenkit-react';

interface NavbarProps {
    balanceUsd: number;
}

export default function Navbar({ balanceUsd }: NavbarProps) {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [showWalletInfo, setShowWalletInfo] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [showMusicMenu, setShowMusicMenu] = useState(false);
    const { locale, setLocale, t } = useLanguage();
    const { address, username, openWallet } = useInterwovenKit();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { label: t('nav_home'), href: '/' },
        { label: t('nav_play'), href: '/#play' },
        { label: t('nav_marketplace'), href: '/marketplace' },
        { label: t('nav_leaderboard'), href: '/leaderboard' },
        { label: t('nav_howto'), href: '/how-to-play' },
        { label: t('nav_about'), href: '#' },
    ];

    const formatUsd = (value: number) => `$${value.toFixed(2)}`;

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${isScrolled ? 'pt-0 px-0' : 'pt-4 px-4 md:px-8'
            }`}>
            <div className={`mx-auto flex w-full items-center justify-between border-white/15 bg-white/10 px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-500 ease-in-out ${isScrolled ? 'max-w-none rounded-none border-b bg-white/15 py-4' : 'max-w-7xl rounded-2xl border'
                }`}>
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 transition hover:opacity-80">
                    <img src="/icon/paradice-icon.png" alt="Paradice Icon" className="h-8 w-8 object-contain drop-shadow-md" />
                    <div className="flex flex-col">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-300">Onchain Ludo</p>
                        <p className="text-sm font-black text-white leading-none">Paradice</p>
                    </div>
                </Link>

                {/* Nav links */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href || (link.href === '/' && pathname === '/');
                        return (
                            <Link key={link.label} href={link.href}>
                                <button
                                    className={`text-sm font-semibold transition hover:text-white ${isActive ? 'text-white border-b-2 border-orange-400' : 'text-white/70'
                                        }`}
                                >
                                    {link.label}
                                </button>
                            </Link>
                        );
                    })}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-5">
                    {/* UTILITIES GROUP (Settings) */}
                    <div className="hidden items-center gap-2 border-r border-white/10 pr-5 md:flex relative">
                        {/* Language Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowLangMenu(!showLangMenu);
                                    setShowMusicMenu(false);
                                    setShowWalletInfo(false);
                                }}
                                className={`flex h-10 w-10 items-center justify-center rounded-full border text-[11px] font-bold backdrop-blur transition hover:bg-white/20 hover:border-white/30 ${showLangMenu ? 'bg-white/20 border-white/40 text-orange-300' : 'border-white/20 bg-white/10 text-white'}`}
                                title={locale === 'en' ? 'Ganti Bahasa' : 'Switch Language'}
                            >
                                {locale.toUpperCase()}
                            </button>

                            {showLangMenu && (
                                <div className="absolute right-0 top-12 w-40 rounded-2xl border border-white/15 bg-white/20 p-2 shadow-2xl backdrop-blur-2xl transition-all animate-fade-in z-50">
                                    <button
                                        onClick={() => { setLocale('en'); setShowLangMenu(false); }}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${locale === 'en' ? 'bg-white/15 text-orange-400' : 'text-white hover:bg-white/10'}`}
                                    >
                                        🇬🇧 English (EN)
                                        {locale === 'en' && <span className="w-2 h-2 rounded-full bg-orange-400"></span>}
                                    </button>
                                    <button
                                        onClick={() => { setLocale('id'); setShowLangMenu(false); }}
                                        className={`w-full flex items-center justify-between px-3 py-2 mt-1 rounded-xl text-xs font-semibold transition ${locale === 'id' ? 'bg-white/15 text-orange-400' : 'text-white hover:bg-white/10'}`}
                                    >
                                        🇮🇩 Bahasa (ID)
                                        {locale === 'id' && <span className="w-2 h-2 rounded-full bg-orange-400"></span>}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Music Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowMusicMenu(!showMusicMenu);
                                    setShowLangMenu(false);
                                    setShowWalletInfo(false);
                                }}
                                className={`flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur transition hover:bg-white/20 ${showMusicMenu ? 'bg-white/20 border-white/40 text-orange-300' : 'border-white/20 bg-white/10 text-white'}`}
                                title="Audio Settings"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                            </button>

                            {showMusicMenu && (
                                <div className="absolute right-0 top-12 w-[340px] md:w-[460px] rounded-[1.5rem] border border-orange-500/20 bg-[#2d1b2e]/90 p-4 shadow-[0_10px_50px_rgba(255,165,0,0.15)] backdrop-blur-2xl transition-all animate-fade-in z-50 text-white">
                                    {/* Now Playing Section */}
                                    <div className="mb-4">
                                        <p className="text-sm font-medium text-white/90 mb-2 font-sans tracking-wide">Now Playing</p>
                                        <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-2">
                                            <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden relative shadow-inner">
                                                <img src="https://images.unsplash.com/photo-1559825481-12a05cc00344?q=80&w=400&fit=crop" alt="Tropical Sunset" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col justify-center w-full">
                                                <h4 className="text-sm font-bold text-white leading-tight">Tropical Sunset Beat</h4>
                                                <div className="flex items-center gap-1.5 mt-0.5 opacity-80">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-orange-300"><path d="M12 2L22 12 12 22 2 12 12 2z"></path></svg>
                                                    <p className="text-[10px] text-white/70">Owned NFT • Looping</p>
                                                </div>
                                                <p className="text-[10px] text-white/70 mt-0.5">Owner: <span className="text-white">You</span></p>
                                                <div className="flex gap-2 mt-2">
                                                    <button className="flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 px-3 py-1 text-[10px] font-bold text-white shadow shadow-orange-500/40 hover:brightness-110 transition">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"></path></svg>
                                                        Preview
                                                    </button>
                                                    <button className="rounded-full border border-white/20 px-3 py-1 text-[10px] font-medium text-white hover:bg-white/10 transition">
                                                        Use
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Your NFT Collection */}
                                    <div>
                                        <p className="text-sm font-medium text-white/90 mb-2 font-sans tracking-wide">Your NFT Collection</p>
                                        <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide">
                                            {/* Card 1 */}
                                            <div className="min-w-[140px] rounded-2xl border border-white/10 bg-[#1e1322] p-2 flex flex-col group">
                                                <div className="w-full h-24 rounded-xl overflow-hidden relative shadow-inner mb-2 shrink-0">
                                                    <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&fit=crop" alt="Island Vibes" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                                                    <div className="absolute top-1.5 left-1.5 bg-[#fef0cb] text-[#86591d] rounded-full p-1.5 shadow">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"></path></svg>
                                                    </div>
                                                </div>
                                                <h4 className="text-xs font-bold text-white">Island Vibes #12</h4>
                                                <p className="text-[10px] text-white/60 mb-2">Owner: You</p>
                                                <div className="flex items-center justify-between mt-auto">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-1">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-orange-300"><path d="M12 2L22 12 12 22 2 12 12 2z"></path></svg>
                                                            <span className="text-[10px] font-semibold text-white/50">—</span>
                                                        </div>
                                                    </div>
                                                    <button className="rounded-full border border-white/20 px-3 py-1 text-[10px] text-white hover:bg-white/10 transition">
                                                        Use
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Card 2 */}
                                            <div className="min-w-[140px] rounded-2xl border border-white/10 bg-[#1e1322] p-2 flex flex-col group">
                                                <div className="w-full h-24 rounded-xl overflow-hidden relative shadow-inner mb-2 shrink-0">
                                                    <img src="https://images.unsplash.com/photo-1545972154-9bb223aac798?q=80&w=400&fit=crop" alt="Hype Summer" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                                                    <div className="absolute top-1.5 left-1.5 bg-[#fef0cb] text-[#86591d] rounded-full p-1.5 shadow">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"></path></svg>
                                                    </div>
                                                </div>
                                                <h4 className="text-xs font-bold text-white">Hype Summer #7</h4>
                                                <p className="text-[10px] text-white/60 mb-2">Owner: You</p>
                                                <div className="flex items-center justify-between mt-auto">
                                                    <div className="flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-orange-300"><path d="M12 2L22 12 12 22 2 12 12 2z"></path></svg>
                                                        <span className="text-[10px] font-semibold text-white/80">0.7 INIT</span>
                                                    </div>
                                                    <button className="rounded-full border border-white/20 px-3 py-1 text-[10px] text-white hover:bg-white/10 transition">
                                                        Use
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Card 3 */}
                                            <div className="min-w-[140px] rounded-2xl border border-white/10 bg-[#1e1322] p-2 flex flex-col group">
                                                <div className="w-full h-24 rounded-xl overflow-hidden relative shadow-inner mb-2 shrink-0">
                                                    <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&fit=crop" alt="Paradise Party" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                                                    <div className="absolute top-1.5 left-1.5 bg-[#fef0cb] text-[#86591d] rounded-full p-1.5 shadow">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"></path></svg>
                                                    </div>
                                                </div>
                                                <h4 className="text-xs font-bold text-white">Paradise Party #5</h4>
                                                <p className="text-[10px] text-white/60 mb-2">Owner: You</p>
                                                <div className="flex items-center justify-between mt-auto">
                                                    <div className="flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-orange-500"><circle fill="none" cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" /></svg>
                                                        <span className="text-[10px] font-semibold text-white/80">1.5 INIT</span>
                                                    </div>
                                                    <button className="rounded-full border border-white/20 px-3 py-1 text-[10px] text-white hover:bg-white/10 transition">
                                                        Use
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Explore CTA */}
                                    <button className="mt-2 w-full rounded-full border border-orange-500/40 bg-orange-500/5 py-2.5 text-xs font-semibold text-orange-200 transition hover:bg-orange-500/10 hover:border-orange-500/60 flex items-center justify-center gap-2 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent -translate-x-full transition-transform duration-700 group-hover:translate-x-full" />
                                        Explore Music NFTs <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ACCOUNT GROUP */}
                    <div className="flex items-center gap-2 md:gap-3 relative">
                        {/* Balance Card Touchable */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowWalletInfo(!showWalletInfo);
                                    setShowLangMenu(false);
                                    setShowMusicMenu(false);
                                }}
                                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 h-10 text-[11px] font-black uppercase tracking-[0.2em] text-white backdrop-blur transition hover:bg-white/20 hover:border-orange-500/50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                                <span className="ml-1">{formatUsd(balanceUsd)}</span>
                            </button>

                            {/* Wallet Info Dropdown */}
                            {showWalletInfo && (
                                <div className="absolute right-0 top-12 w-64 rounded-2xl border border-white/15 bg-white/20 p-4 shadow-2xl backdrop-blur-2xl transition-all animate-fade-in z-50">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-2">{t('nav_wallet_summary')}</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-white/50">{t('nav_network')}</span>
                                            <span className="text-white font-bold">Initia Testnet</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-white/50">{t('nav_address')}</span>
                                            <span className="text-white font-mono opacity-60">0x3kd...8fA2</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs border-t border-white/10 pt-2 mt-2">
                                            <span className="text-white/50">{t('nav_total_assets')}</span>
                                            <span className="text-emerald-400 font-bold">{formatUsd(balanceUsd)}</span>
                                        </div>
                                    </div>
                                    <button className="w-full mt-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition">
                                        {t('nav_manage_wallet')}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Profile */}
                        <Link href="/profile">
                            <button
                                className={`flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur transition hover:text-orange-300 ${pathname === '/profile' ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                                    }`}
                                title="My Profile"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </button>
                        </Link>

                        {/* Connect Wallet - RainbowKit */}
                        <ConnectButton.Custom>
                            {({
                                account,
                                chain,
                                openConnectModal,
                                openAccountModal,
                                mounted,
                            }) => {
                                const connected = mounted && account && chain;
                                return (
                                    <button
                                        onClick={connected ? () => openWallet?.() : openConnectModal}
                                        className="h-10 rounded-full bg-gradient-to-r from-[#F97316] to-[#EF4444] px-6 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/40 whitespace-nowrap"
                                    >
                                        {connected
                                            ? (username || `${account.address.slice(0, 6)}...${account.address.slice(-4)}`)
                                            : t('nav_connect_wallet')}
                                    </button>
                                );
                            }}
                        </ConnectButton.Custom>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
        </nav>
    );
}
