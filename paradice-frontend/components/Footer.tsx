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
        <div ref={footerRef} className="bg-[#1e1e1e] w-full mt-auto relative z-20">
            <footer className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 md:px-8">
                <div className="grid gap-10 md:grid-cols-4 md:gap-8">
                    <div className="footer-column-global">
                        <h3 className="text-2xl font-black text-[#F97316] mb-4">Paradice Ludo</h3>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">{t('ft_desc')}</p>
                    </div>
                    <div className="footer-column-global">
                        <h4 className="text-sm font-black uppercase tracking-widest text-white mb-4">{t('ft_qlinks')}</h4>
                        <ul className="space-y-2 text-slate-400 text-sm font-medium">
                            <li><button className="hover:text-[#F97316] transition-colors">{t('nav_home')}</button></li>
                            <li><button className="hover:text-[#F97316] transition-colors">{t('nav_leaderboard')}</button></li>
                            <li><button className="hover:text-[#F97316] transition-colors">{t('pr_t_stats')}</button></li>
                        </ul>
                    </div>
                    <div className="footer-column-global">
                        <h4 className="text-sm font-black uppercase tracking-widest text-white mb-4">{t('ft_support')}</h4>
                        <ul className="space-y-2 text-slate-400 text-sm font-medium">
                            <li><button className="hover:text-[#F97316] transition-colors">FAQ</button></li>
                            <li><button className="hover:text-[#F97316] transition-colors">Terms of Service</button></li>
                            <li><button className="hover:text-[#F97316] transition-colors">Privacy Policy</button></li>
                        </ul>
                    </div>
                    <div className="footer-column-global">
                        <h4 className="text-sm font-black uppercase tracking-widest text-white mb-4">{t('ft_follow')}</h4>
                        <ul className="space-y-2 text-slate-400 text-sm font-medium">
                            <li><button className="hover:text-[#F97316] transition-colors">Twitter/X</button></li>
                            <li><button className="hover:text-[#F97316] transition-colors">Discord</button></li>
                            <li><button className="hover:text-[#F97316] transition-colors">Medium</button></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t border-white/10 pt-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    {t('ft_rights')}
                </div>
            </footer>
        </div>
    );
}
