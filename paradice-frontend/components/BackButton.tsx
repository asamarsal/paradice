"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface BackButtonProps {
    href?: string;
    className?: string;
    noMargin?: boolean;
}

/**
 * Standardized Back Button component for secondary pages.
 * Ensures consistent vertical alignment and glassmorphism styling.
 */
export default function BackButton({ href = "/", className = "", noMargin = false }: BackButtonProps) {
    const { t } = useLanguage();

    return (
        <div className={`${noMargin ? "" : "mb-6"} ${className}`}>
            <Link
                href={href}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-2 text-[11px] font-black uppercase tracking-widest text-white backdrop-blur-md transition hover:bg-white/20 shadow-lg"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                {t('hw_back')}
            </Link>
        </div>
    );
}
