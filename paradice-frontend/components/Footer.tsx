'use client';

import { useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
    const { t } = useLanguage();
    const footerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.fromTo(".footer-column-global",
            { opacity: 0, x: -40 },
            { opacity: 1, x: 0, duration: 0.7, stagger: 0.12, ease: "power2.out", scrollTrigger: { trigger: ".footer-column-global", start: "top 95%", toggleActions: "play none none reset" } }
        );
    }, { scope: footerRef });

    return (
        <div ref={footerRef} className="bg-[#1a1a1a]/80 w-full mt-auto relative z-20 border-t border-white/5 backdrop-blur-md">
            <footer className="mx-auto w-full max-w-7xl px-4 pb-12 pt-16 md:px-8">
                <div className="grid gap-10 md:grid-cols-4 md:gap-8">
                    <div className="footer-column-global">
                        <div className="flex items-center gap-3 mb-6">
                            <img src="/icon/paradice-icon.png" alt="Paradice Icon" className="h-8 w-8 object-contain" />
                            <h3 className="text-2xl font-black text-white">Paradice</h3>
                        </div>
                        <p className="text-white/40 text-sm font-medium leading-relaxed max-w-xs">{t('ft_desc')}</p>
                    </div>

                    <div className="footer-column-global">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-orange-500 mb-6">[ Docs & Dev ]</h4>
                        <ul className="space-y-3 text-white/50 text-sm font-bold">
                            <li><button className="hover:text-white transition-colors">Documentation</button></li>
                            <li><button className="hover:text-white transition-colors">Smart Contract</button></li>
                            <li><button className="hover:text-white transition-colors">API</button></li>
                            <li><button className="hover:text-white transition-colors">GitHub</button></li>
                        </ul>
                    </div>

                    <div className="footer-column-global">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-orange-500 mb-6">[ Support ]</h4>
                        <ul className="space-y-3 text-white/50 text-sm font-bold">
                            <li><button className="hover:text-white transition-colors">Terms</button></li>
                            <li><button className="hover:text-white transition-colors">Privacy</button></li>
                            <li><button className="hover:text-white transition-colors">Security</button></li>
                            <li><button className="hover:text-white transition-colors">Audit</button></li>
                        </ul>
                    </div>

                    <div className="footer-column-global">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-orange-500 mb-6">[ Community ]</h4>
                        <ul className="space-y-3 text-white/50 text-sm font-bold">
                            <li><button className="hover:text-white transition-colors">Twitter</button></li>
                            <li><button className="hover:text-white transition-colors">Discord</button></li>
                            <li><button className="hover:text-white transition-colors">Medium</button></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-20 border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                        {t('ft_rights')}
                    </div>
                    <div className="flex gap-6">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500/50" />
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500/50" />
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500/50" />
                    </div>
                </div>
            </footer>
        </div>
    );
}
