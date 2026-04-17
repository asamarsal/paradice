'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const rules = [
    {
        id: 'ringkasan',
        title: 'Ringkasan Eksekutif',
        content: 'Paradice mengikuti aturan dasar Ludo klasik:',
        bullets: [
            'Pada prinsipnya 2–4 pemain bergiliran searah jarum jam memindahkan keempat pionnya dari "rumah" ke kotak finish di tengah papan. Untuk keluar rumah diperlukan lemparan dadu 6 pertama kali.',
            'Setiap kali pion lawan ditangkap (dengan mendarat di petaknya), pion lawan dikembalikan ke rumah.',
            'Pemenang adalah pemain pertama yang memasukkan semua 4 pionnya ke finish.',
            'Panduan ini menguraikan langkah-langkah lengkap, contoh situasi, FAQ, dan tips.'
        ]
    },
    {
        id: 'persiapan',
        title: 'Persiapan Permainan',
        content: 'Pemain: 2–4 orang, masing-masing memilih warna (Merah, Biru, Kuning, Hijau) dan menempatkan 4 pion di "rumah" awal berwarna.',
        bullets: [
            'Menentukan Giliran Awal: Biasanya tiap pemain melempar dadu sekali, giliran pertama adalah yang mendapatkan angka tertinggi. Setelahnya giliran berjalan searah jarum jam.',
            'Tata Letak Papan: Papan berbentuk silang dengan 4 zona berwarna. Kotak pertama di masing-masing zona warna adalah titik keluar rumah, dan terdapat kotak bertanda bintang di jalur utama (zona aman).'
        ]
    },
    {
        id: 'dadu',
        title: 'Urutan Giliran & Dadu',
        content: 'Pada giliran, pemain melempar dadu sekali dan mengambil langkah sesuai angka dadu.',
        bullets: [
            'Jika pemain mendapat angka 6, ia boleh mengeluarkan pion baru dari rumah (jika ada) atau memindahkan pion yang sudah ada di jalur.',
            'Setelah melempar 6, pemain mendapat giliran tambahan (melempar lagi).',
            'Namun jika seorang pemain melempar angka 6 sebanyak tiga kali berturut-turut, giliran ketiga diabaikan dan giliran beralih ke pemain berikutnya.',
            'Penting: pemain hanya boleh memilih satu pion (yang sudah keluar) untuk dipindahkan.'
        ]
    },
    {
        id: 'gerak',
        title: 'Mengeluarkan & Memindahkan Pion',
        content: 'Mengeluarkan Pion: Saat dadu menunjukkan 6, satu pion keluar dari rumah ke petak awal jalur berwarna masing-masing.',
        bullets: [
            'Memindahkan Pion: Setelah pion di jalur, pion bergerak searah jarum jam mengikuti jalurnya.',
            'Memilih Pion: Pemain bebas memilih pion mana saja yang sudah di jalur, semua pion dapat bergerak.',
            'Blok Ganda: Jika dua pion satu warna berada di petak sama, terbentuk blok ganda. Ini tidak bisa dilewati atau ditangkap oleh lawan.',
            'Zona Aman (Bintang): Pion di zona berlambang bintang tidak bisa ditangkap oleh lawan.',
            'Menangkap Pion: Mendarat tepat di petak dihuni lawan akan mengirim lawan ke rumah. Pemain lalu mendapat giliran tambahan.'
        ]
    },
    {
        id: 'finish',
        title: 'Menuju Finish & Menang',
        content: 'Setelah mengelilingi papan, pion akan memasuki kolom beranda (berwarna sama dengan pemain) menuju kotak finish.',
        bullets: [
            'Pemain harus melempar angka yang tepat untuk mencapai finish. Jika angka dadu lebih besar dari sisa langkah, pion diam.',
            'Pemenang: Pemain pertama yang keempat pionnya mencapai kotak finish memenangkan permainan.',
            'Jika ada pemain tersisa, mereka melanjutkan permainan untuk menentukan posisi selanjutnya.'
        ]
    },
    {
        id: 'skenario',
        title: 'Contoh Skenario',
        content: 'Beberapa contoh penerapan aturan secara langsung:',
        bullets: [
            'Menangkap: Misal Pion Merah di petak 10. Biru melempar 3 sehingga mendarat di petak 10. Merah langsung kembali ke rumah.',
            'Zona Aman: Pion Biru berada di petak bintang (aman). Jika lawan mendarat disana, Biru tetap aman.',
            'Blok Ganda: Dua pion Hijau menumpuk. Lawan harus memutar atau menunggu blokir pecah.',
            'Lempar 6 Beruntun: Dua kali lempar 6 dapat ekstra jalan, tetapi lempar 6 kali ketiga (6,6,6) gilirannya hangus (berakhir instan).',
            'Selesai Bersamaan: Pemain (X) yang secara aktif mencapai finish terlebih dahulu pada gilirannya menang atas (Y).'
        ]
    }
];

export default function HowToPlayPage() {
    const [dummyBalanceUsd] = useState(62.90);
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const steps = gsap.utils.toArray('.anim-step');

        steps.forEach((step: any, i) => {
            gsap.fromTo(step,
                { opacity: 0, y: 100, scale: 0.9, rotationX: 10 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    rotationX: 0,
                    duration: 1.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: step,
                        start: "top 85%", // When top of step hits 85% of viewport
                        end: "bottom 15%", // When bottom of step goes past 15% of viewport
                        toggleActions: "play reverse play reverse", // Animates in, animates out (disappears) when scrolling past, and comes back when scrolling up
                    }
                }
            );
        });

    }, { scope: containerRef });

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#0f0c1a] font-sans" ref={containerRef}>
            {/* Background Video */}
            <div className="fixed inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover opacity-70"
                >
                    <source src="/video/ludoboard-animation.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-[#4A2F1D]/40 via-transparent to-[#0f0c1a]" />
            </div>

            <Navbar balanceUsd={dummyBalanceUsd} />

            <main className="relative z-10 mx-auto max-w-4xl px-4 py-16 md:px-8">

                {/* Back Button */}
                <div className="mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-2 text-[11px] font-black uppercase tracking-widest text-[#fdf2d9] backdrop-blur-md transition hover:bg-white/20 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        Back
                    </Link>
                </div>

                {/* Header Title */}
                <div className="text-center mb-24 drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">
                    <h1 className="text-5xl font-black text-[#fdf2d9] tracking-[0.1em] uppercase mb-4 md:text-6xl" style={{ textShadow: "0px 4px 20px rgba(0,0,0,0.8)" }}>
                        How To Play
                    </h1>
                    <p className="text-[#fdf2d9]/80 font-bold tracking-wide mt-2 text-lg drop-shadow-md">
                        Panduan Bermain Paradice (Ludo Klasik)
                    </p>
                </div>

                {/* Stepper Container */}
                <div className="flex flex-col gap-12 sm:gap-16 pb-32">
                    {rules.map((rule, idx) => (
                        <div key={rule.id} className="anim-step opacity-0">
                            {/* Parchment Box */}
                            <div className="relative rounded-2xl bg-gradient-to-br from-[#fdf2d9] to-[#e4cd9b] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] border-4 border-[#8B4513]/30">

                                {/* Grunge overlay texture for vintage feel */}
                                <div className="absolute inset-0 opacity-10 bg-[url('/icon/paradice-icon.png')] bg-repeat mix-blend-overlay pointer-events-none rounded-xl" style={{ backgroundSize: "150px" }} />

                                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">

                                    {/* Round Step Number */}
                                    <div className="flex-shrink-0 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-[#8B4513] text-2xl font-black text-white shadow-inner border-4 border-[#fdf2d9] drop-shadow-lg">
                                        {idx + 1}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <h2 className="text-2xl md:text-3xl font-black text-[#5c2b0c] mb-3 tracking-tight">
                                            {rule.title}
                                        </h2>

                                        <p className="text-[#6d3e20] font-semibold text-sm md:text-base mb-6 leading-relaxed">
                                            {rule.content}
                                        </p>

                                        <ul className="space-y-4 text-sm md:text-base font-medium text-[#4a2610]">
                                            {rule.bullets.map((bullet, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <span className="mt-1 flex-shrink-0 text-[#8B4513]">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                    </span>
                                                    <span className="leading-relaxed opacity-90">{bullet}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
