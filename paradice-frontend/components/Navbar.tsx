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
                    <div className="hidden items-center gap-2 border-r border-white/10 pr-5 md:flex">
                        <button
                            onClick={() => setLocale(locale === 'en' ? 'id' : 'en')}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[11px] font-bold text-white hover:text-orange-300 backdrop-blur transition hover:bg-white/20 hover:border-white/30"
                            title={locale === 'en' ? 'Ganti Bahasa' : 'Switch Language'}
                        >
                            {locale.toUpperCase()}
                        </button>
                        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 hover:text-orange-300" title="Toggle Music">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                        </button>
                    </div>

                    {/* ACCOUNT GROUP */}
                    <div className="flex items-center gap-2 md:gap-3 relative">
                        {/* Balance Card Touchable */}
                        <div className="relative">
                            <button
                                onClick={() => setShowWalletInfo(!showWalletInfo)}
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
