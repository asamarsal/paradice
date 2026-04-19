"use client";

import React, { useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (globalThis.window !== undefined) {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function AboutPage() {
  const mainRef = useRef<HTMLDivElement>(null);

  const { t } = useLanguage();

  useGSAP(() => {
    // Proper Parallax: Reveal bottom of image (ukulele/treasure) as we scroll down
    gsap.to(".bg-layer-top", {
      yPercent: -10,
      ease: "none",
      scrollTrigger: {
        trigger: mainRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true
      }
    });
    gsap.to(".bg-layer-mid", {
      yPercent: -25,
      ease: "none",
      scrollTrigger: {
        trigger: mainRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true
      }
    });
    gsap.to(".bg-layer-bot", {
      yPercent: -40,
      ease: "none",
      scrollTrigger: {
        trigger: mainRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true
      }
    });

    // Hero animations
    gsap.from(".hero-content", {
      opacity: 0,
      y: 50,
      duration: 1.2,
      ease: "power3.out",
    });

    // Simplified Fade-in for specific about-sections
    gsap.utils.toArray(".about-section").forEach((section: any) => {
      gsap.from(section, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 90%",
          toggleActions: "play none none reverse",
        }
      });
    });
  }, { scope: mainRef });

  return (
    <div ref={mainRef} className="relative min-h-screen bg-[#0a0515] text-white selection:bg-orange-500/30 overflow-x-hidden">
      {/* Parallax Background Layers - Revealing top to bottom */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Layer 1: Sky/Trees (Back) */}
        <div
          className="bg-layer-top absolute top-0 left-0 w-full h-[120%]"
          style={{
            backgroundImage: "url('/image/background/parallax-background.png')",
            backgroundSize: "cover",
            backgroundPosition: "top center",
            opacity: 0.3
          }}
        />
        {/* Layer 2: Sea/Board (Middle) */}
        <div
          className="bg-layer-mid absolute top-0 left-0 w-full h-[140%]"
          style={{
            backgroundImage: "url('/image/background/parallax-background.png')",
            backgroundSize: "cover",
            backgroundPosition: "top center",
            opacity: 0.7
          }}
        />
        {/* Layer 3: Beach/Ukulele/Treasure (Front) */}
        <div
          className="bg-layer-bot absolute top-0 left-0 w-full h-[160%]"
          style={{
            backgroundImage: "url('/image/background/parallax-background.png')",
            backgroundSize: "cover",
            backgroundPosition: "top center",
            opacity: 1.0
          }}
        />
      </div>
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#0a0515]/30 via-[#0a0515]/70 to-[#0a0515]" />

      <Navbar balanceUsd={0} />

      <main className="relative z-10 pt-32 pb-20 px-4 md:px-8">

        {/* 🌴 HERO SECTION */}
        <section className="hero-content mx-auto max-w-5xl text-center mb-32">
          <span className="inline-block rounded-full border border-orange-500/30 bg-orange-500/10 px-6 py-2 text-xs font-black uppercase tracking-[0.4em] text-orange-400 backdrop-blur-md mb-6">
            Paradise Found
          </span>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Paradice Redefines Ludo
          </h1>
          <p className="text-lg md:text-2xl text-white/70 font-medium max-w-3xl mx-auto leading-relaxed mb-12">
            Where classic strategy meets on-chain ownership.
            Play, stake, and earn in a tropical arena built for the next generation of gaming.
          </p>
          <Link href="/play" className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-orange-600 px-10 py-5 text-lg font-black uppercase tracking-widest text-white transition-all hover:-translate-y-1 hover:bg-orange-500 hover:shadow-[0_0_40px_rgba(234,88,12,0.4)]">
            Start Playing →
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </Link>
        </section>

        {/* 🧠 WHAT IS PARADICE */}
        <section className="about-section mx-auto max-w-4xl mb-32 text-center">
          <div className="glass-card rounded-[3rem] border border-white/10 bg-white/5 p-8 md:p-16 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-purple-600" />
            <h2 className="text-3xl md:text-5xl font-black mb-8 text-white">What is Paradice?</h2>
            <div className="space-y-6 text-white/70 text-lg font-medium leading-relaxed">
              <p>
                Paradice is a multiplayer on-chain Ludo game built on Initia, where every match is more than just a game—it’s a verifiable, competitive experience powered by blockchain.
              </p>
              <p>
                Players can stake, compete, and win real rewards in a transparent environment, while owning unique in-game assets such as NFTs, music tracks, and visual identities.
              </p>
              <div className="pt-4 text-white font-black uppercase tracking-widest text-sm space-y-2">
                <p className="flex items-center justify-center gap-2"><span className="text-orange-500">✔</span> No hidden systems.</p>
                <p className="flex items-center justify-center gap-2"><span className="text-orange-500">✔</span> No off-record outcomes.</p>
                <p className="text-orange-400">Everything is fair, traceable, and built for trust.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 🎵 NFT MUSIC SHOWCASE */}
        <section className="about-section mx-auto max-w-7xl mb-32 relative z-20">
          {/* Tabs */}
          <div className="flex items-end mb-0 px-4">
            <button className="px-8 py-4 text-white/40 font-bold text-sm uppercase tracking-widest border-b-2 border-transparent transition hover:text-white">
              NFT Collections
            </button>
            <button className="px-8 py-4 text-white font-black text-sm uppercase tracking-widest border-b-[3px] border-orange-500 bg-white/5 rounded-t-2xl">
              Music NFT Collections
            </button>
          </div>

          <div className="rounded-[3rem] rounded-tl-none border border-white/10 bg-black/40 p-8 md:p-12 backdrop-blur-3xl shadow-2xl">
            {/* Filters */}
            <div className="flex gap-4 mb-10">
              {['All', 'Owned', 'On Sale'].map((filter) => (
                <button
                  key={filter}
                  className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition border ${filter === 'All' ? 'bg-orange-600/20 border-orange-600 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Horizontal Scroll Grid */}
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {[
                  { title: "Tropical Sunset Beat", author: "0x3kd...6fA2", price: "0.8 INIT", status: "BUY", pos: "top" },
                  { title: "Beach Chill #03", author: "0x3kd...6fA2", price: "0.6 INIT", status: "BUY", pos: "center" },
                  { title: "Cyber Groove #02", author: "0x3kd...6fA2", price: "1.2 INIT", status: "BUY", pos: "bottom" },
                  { title: "Night City Drive #01", author: "0x3kd...8fA2", price: "1 INIT", status: "SELL", pos: "40% 40%" },
                  { title: "Island Vibes #12", author: "0x3kd...8fA2", price: "0.9 INIT", status: "SELL", pos: "60% 60%" },
                  { title: "Electric Paradise #03", author: "0x3kd...6fA2", price: "1.5 INIT", status: "BUY", pos: "20% 80%" },
                  { title: "Palm Breeze #05", author: "0x3kd...6fA2", price: "0.7 INIT", status: "BUY", pos: "80% 20%" },
                  { title: "Sunset Glow #09", author: "0x3kd...6fA2", price: "1.1 INIT", status: "BUY", pos: "left center" }
                ].map((nft) => (
                  <div key={nft.title} className="flex-shrink-0 w-[190px] rounded-[1.5rem] bg-[#2d2a32] p-3 border border-white/5 shadow-xl group transition-all hover:bg-white/5">
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 border border-white/10">
                      <div
                        className="absolute inset-0 bg-cover bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                        style={{
                          backgroundImage: "url('/image/background/parallax-background.png')",
                          backgroundPosition: nft.pos
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center text-orange-600 text-[8px] shadow-md z-10">
                        🎵
                      </div>
                      <button className="absolute bottom-2.5 right-2.5 h-7 w-7 rounded-full bg-orange-600 flex items-center justify-center text-white text-[10px] shadow-lg transition transform group-hover:scale-110 z-10">
                        ▶
                      </button>
                    </div>

                    <div className="space-y-0.5 mb-3 px-1">
                      <h5 className="font-black text-white text-[13px] leading-tight truncate">{nft.title}</h5>
                      <p className="text-[9px] text-purple-400 font-bold tracking-wide">{nft.author}</p>
                    </div>

                    <div className="flex items-center gap-1.5 mb-4 px-1">
                      <div className="h-3.5 w-3.5 rounded-full bg-amber-400 flex items-center justify-center text-white text-[7px] font-black">i</div>
                      <span className="text-[13px] font-black text-white/90">{nft.price}</span>
                    </div>

                    {nft.status === "BUY" ? (
                      <button className="w-full rounded-lg bg-orange-600 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-orange-500">
                        BUY
                      </button>
                    ) : (
                      <button className="w-full rounded-lg border border-orange-600/30 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/40 transition hover:border-orange-600 hover:text-white">
                        SELL
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Custom Scrollbar like in the image */}
              <div className="mt-8 mb-10 flex items-center gap-2">
                <button className="h-6 w-6 flex items-center justify-center text-white/40 hover:text-white">◀</button>
                <div className="h-2 flex-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-white/40 rounded-full" />
                </div>
                <button className="h-6 w-6 flex items-center justify-center text-white/40 hover:text-white">▶</button>
              </div>

              <div className="flex justify-center">
                <button className="rounded-full border border-orange-500/30 bg-orange-500/5 px-16 py-4 text-sm font-black uppercase tracking-widest text-orange-400 transition hover:bg-orange-500 hover:text-white">
                  Explore Music NFTs →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ⚙️ HOW IT WORKS */}
        <section className="about-section mx-auto max-w-6xl mb-32">
          <h2 className="text-3xl md:text-5xl font-black mb-12 text-center text-white">How It Works</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { num: "1", title: "Choose Your Stake", desc: "Select how much you want to play for. Every match has a clear prize pool and fee." },
              { num: "2", title: "Join or Create a Room", desc: "Play instantly against others or invite friends into a private room." },
              { num: "3", title: "Play the Match", desc: "Classic Ludo gameplay with strategic movement, safe zones, and capture mechanics." },
              { num: "4", title: "Automatic Payouts", desc: "Smart contracts handle the outcome. Winners receive rewards instantly and transparently." }
            ].map((step) => (
              <div key={step.num} className="glass-card group rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl transition hover:bg-white/10 hover:border-white/20">
                <span className="mb-6 block text-4xl font-black text-orange-500/40 transition group-hover:text-orange-500">{step.num}</span>
                <h3 className="mb-4 text-xl font-black text-white">{step.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 💰 GAME ECONOMY */}
        <section className="about-section mx-auto max-w-5xl mb-32">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-black mb-8 text-white">A Player-Driven Economy</h2>
              <div className="space-y-6 text-white/70 text-lg leading-relaxed">
                <p>Paradice introduces a simple yet powerful economic system where gameplay and ownership are fully connected.</p>
                <ul className="space-y-4">
                  {[
                    "Stake-based matches with real rewards",
                    "Transparent platform fee (e.g. 5%)",
                    "NFT assets with real utility, not just collectibles",
                    "Open marketplace to buy, sell, and trade assets"
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] font-black">✔</span>
                      <span className="text-base font-semibold text-white/90">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="pt-4 text-white/50 italic">From music NFTs to visual identities, every asset you own can become part of your gameplay experience.</p>
              </div>
            </div>
            <div className="glass-card rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-orange-500/10 to-purple-500/10 p-10 backdrop-blur-2xl text-center">
              <div className="text-7xl mb-6">💰</div>
              <p className="text-2xl font-black text-white mb-2">Platform Fee</p>
              <p className="text-6xl font-black text-orange-500 mb-6">5%</p>
              <div className="h-px bg-white/10 mb-6" />
              <p className="text-white/60 text-sm font-medium">Supporting the ecosystem, maintaining rewards, and fueling growth.</p>
            </div>
          </div>
        </section>

        {/* 🎮 GAMEPLAY INTEGRITY */}
        <section className="about-section mx-auto max-w-6xl mb-32">
          <div className="glass-card rounded-[3rem] border border-white/10 bg-black/20 p-8 md:p-16 backdrop-blur-3xl">
            <h2 className="text-3xl md:text-5xl font-black mb-12 text-center text-white">Fair Play, Always</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: "🛡️", title: "Safe Zones", desc: "Safe zones protect your pieces from being captured." },
                { icon: "⚔️", title: "Capture", desc: "Captured pawns return to base instantly." },
                { icon: "🎲", title: "Unlock Moves", desc: "Rolling a 6 unlocks new moves from base." },
                { icon: "🚫", title: "Triple 6s", desc: "Three consecutive 6s end your turn immediately." }
              ].map((rule) => (
                <div key={rule.title} className="text-center">
                  <div className="text-5xl mb-4">{rule.icon}</div>
                  <h4 className="text-lg font-black text-white mb-2">{rule.title}</h4>
                  <p className="text-sm text-white/50 leading-relaxed">{rule.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <p className="text-xl font-black text-orange-400 uppercase tracking-widest italic">No shortcuts. No manipulation. Just skill and strategy.</p>
            </div>
          </div>
        </section>

        {/* 🔐 TRANSPARENCY & SECURITY & 🌐 VISION */}
        <div className="grid gap-8 md:grid-cols-2 mb-32 mx-auto max-w-6xl">
          <section className="about-section">
            <div className="glass-card h-full rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/5 p-10 backdrop-blur-3xl">
              <div className="text-4xl mb-6">🔐</div>
              <h2 className="text-3xl font-black mb-6 text-white">Built on Trust</h2>
              <ul className="space-y-4 text-white/70 font-medium">
                <li>• All transactions are handled via smart contracts</li>
                <li>• Players remain in control of their wallets and assets</li>
                <li>• Match outcomes and payouts are verifiable</li>
                <li>• No centralized control over game results</li>
              </ul>
              <p className="mt-8 text-emerald-400 font-black uppercase tracking-widest text-sm">You don’t just play the game—you can trust it.</p>
            </div>
          </section>
          <section className="about-section">
            <div className="glass-card h-full rounded-[2.5rem] border border-blue-500/20 bg-blue-500/5 p-10 backdrop-blur-3xl">
              <div className="text-4xl mb-6">🌐</div>
              <h2 className="text-3xl font-black mb-6 text-white">The Future of On-Chain Gaming</h2>
              <div className="space-y-4 text-white/70 font-medium">
                <p>We believe games should be more than entertainment. Paradice is built to become a social, competitive, and economic ecosystem where players truly own their experience.</p>
                <p className="text-white font-black">Our goal is simple:</p>
                <p className="text-blue-400 italic">To create a new standard for on-chain games—where gameplay, ownership, and identity exist as one seamless system.</p>
              </div>
            </div>
          </section>
        </div>

        {/* 🎧 NFT & IDENTITY */}
        <section className="about-section mx-auto max-w-5xl mb-32">
          <div className="glass-card rounded-[3rem] border border-white/10 bg-white/5 p-10 md:p-20 backdrop-blur-3xl text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-orange-500/10" />
            <h2 className="text-3xl md:text-5xl font-black mb-8 text-white">More Than Just Playing</h2>
            <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed">Paradice transforms NFTs into meaningful in-game assets that evolve with your journey.</p>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { icon: "🎵", label: "Music NFTs", desc: "Atmospheric tracks" },
                { icon: "🎨", label: "Visual Identities", desc: "Unique player styles" },
                { icon: "🧩", label: "Collectibles", desc: "Your evolving legacy" }
              ].map((item) => (
                <div key={item.label} className="p-6 rounded-2xl bg-white/5 border border-white/10 transition hover:bg-white/10">
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h4 className="font-black text-white mb-1">{item.label}</h4>
                  <p className="text-xs text-white/40 uppercase tracking-widest font-black">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-12 text-2xl font-black text-white bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent italic">
              Your presence in the game becomes uniquely yours.
            </p>
          </div>
        </section>

        {/* 🚀 ROADMAP */}
        <section className="about-section mx-auto max-w-4xl mb-32">
          <h2 className="text-3xl md:text-5xl font-black mb-12 text-center text-white">What’s Next</h2>
          <div className="space-y-4">
            {[
              "Ranked leaderboard & seasonal rewards",
              "Expanded NFT utilities (music, skins, effects)",
              "Tournament mode & competitive play",
              "Mobile experience optimization",
              "Deeper social features & multiplayer interaction"
            ].map((item) => (
              <div key={item} className="glass-card flex items-center gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-orange-500/30">
                <span className="text-2xl">🚀</span>
                <span className="text-lg font-bold text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 🧑🤝🧑 COMMUNITY */}
        <section className="about-section mx-auto max-w-4xl mb-32 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-8 text-white">Play Together</h2>
          <p className="text-xl text-white/70 font-medium leading-relaxed max-w-2xl mx-auto">
            Paradice is built for connection. Challenge players, invite friends, and experience competitive gameplay in a shared environment where every match matters.
          </p>
          <div className="mt-12 flex justify-center gap-6">
            <div className="h-16 w-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-3xl">💬</div>
            <div className="h-16 w-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-3xl">🎮</div>
            <div className="h-16 w-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-3xl">🤝</div>
          </div>
        </section>

        {/* 🔥 FINAL CTA */}
        <div className="w-full bg-transparent mt-12 relative z-20">
          <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-8">
            <div className="cta-box flex flex-col items-center justify-center text-center gap-8 rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-10 md:p-14 shadow-2xl backdrop-blur-3xl">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-[#F97316] to-[#EAB308] bg-clip-text text-transparent drop-shadow-sm">{t('cta_title')}</h2>
                <p className="text-white/60 font-medium text-lg leading-relaxed">{t('cta_desc')}</p>
              </div>
              <button className="group relative overflow-hidden rounded-full border border-white/25 bg-gradient-to-r from-orange-500 via-orange-550 to-orange-600 px-10 py-5 text-sm font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:-translate-y-1 hover:brightness-110 hover:border-white/40">
                <span className="relative z-10 text-base">{t('cta_btn')}</span>
                <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-20 bg-white" />
              </button>
            </div>
          </section>
        </div>

      </main>

      <Footer />
    </div>
  );
}
