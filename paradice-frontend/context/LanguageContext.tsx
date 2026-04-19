'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Locale = 'en' | 'id';

interface Translations {
    [key: string]: {
        [locale in Locale]: string;
    };
}

const translations: Translations = {
    // Navbar
    // Navbar & Common Buttons
    nav_home: { en: 'Home', id: 'Beranda' },
    nav_play: { en: 'Play', id: 'Main' },
    nav_marketplace: { en: 'Marketplace', id: 'Pasar NFT' },
    nav_leaderboard: { en: 'Leaderboard', id: 'Peringkat' },
    nav_howto: { en: 'How To Play', id: 'Cara Main' },
    nav_about: { en: 'About', id: 'Tentang' },
    nav_connect_wallet: { en: 'Connect Wallet', id: 'Sambungkan Dompet' },
    nav_wallet_summary: { en: 'Wallet Summary', id: 'Ringkasan Dompet' },
    nav_network: { en: 'Network', id: 'Jaringan' },
    nav_address: { en: 'Address', id: 'Alamat' },
    nav_total_assets: { en: 'Total Assets', id: 'Total Aset' },
    nav_manage_wallet: { en: 'Manage Wallet', id: 'Kelola Dompet' },
    nav_search: { en: 'Search Icons...', id: 'Cari Ikon...' },

    bt_stake: { en: 'Stake', id: 'Taruhan' },
    bt_total_pot: { en: 'Estimated total pot', id: 'Estimasi total pot' },
    bt_tax: { en: 'Estimated tax (5%)', id: 'Estimasi biaya (5%)' },
    bt_payout: { en: 'Estimated winner payout', id: 'Estimasi kemenangan' },
    bt_custom: { en: 'Custom', id: 'Kustom' },
    bet_start: { en: '▶ Start Match', id: '▶ Mulai Match' },
    bet_preparing: { en: 'Preparing...', id: 'Menyiapkan...' },
    bt_mode: { en: 'Mode', id: 'Mode' },

    // Hero & Bet Setup
    bet_title: { en: 'BET SETUP', id: 'PENGATURAN TARUHAN' },
    bet_subtitle: { en: 'Choose Arena Stake', id: 'Pilih Nilai Taruhan' },
    bet_stake: { en: 'Stake', id: 'Taruhan' },
    bet_stake_player: { en: 'Stake per player', id: 'Taruhan per pemain' },
    bet_total_pot: { en: 'Total Pot', id: 'Total Pot' },
    bet_tax: { en: 'Platform Fee (5%)', id: 'Biaya Platform (5%)' },
    bet_payout: { en: 'Winner Payout', id: 'Hadiah Pemenang' },
    bt_start_match: { en: '▶ Start Match', id: '▶ Mulai Match' },
    bet_custom: { en: 'Custom', id: 'Kustom' },
    bet_placeholder_stake: { en: 'e.g. 5.0', id: 'Misal: 5.0' },
    bet_mode: { en: 'Mode', id: 'Mode' },
    bet_win_credited: { en: '🏆 Win! +${amount} credited.', id: '🏆 Menang! +${amount} dikreditkan.' },
    bet_lose_pot: { en: '💀 Loss. Stake ${amount} to pot.', id: '💀 Kalah. Taruhan ${amount} masuk pot.' },
    bet_insufficient: { en: 'Insufficient balance. Need ${amount} to start match.', id: 'Saldo tidak cukup. Butuh ${amount} untuk mulai match.' },
    bet_win_toast: { en: 'You won. +${amount} added to dummy balance.', id: 'Kamu menang. +${amount} masuk ke saldo dummy.' },
    bet_lose_toast: { en: 'You lost this round. Stake ${amount} moved to pot.', id: 'Kamu kalah ronde ini. Taruhan ${amount} masuk ke pot.' },
    bet_err_start: { en: 'Failed to start match.', id: 'Gagal memulai match.' },
    bet_err_payload: { en: 'Failed to prepare game payload. Try again.', id: 'Gagal menyiapkan payload game. Coba lagi.' },
    bet_err_rematch: { en: 'Failed to prepare rematch payload.', id: 'Gagal menyiapkan payload rematch.' },

    // Tx History
    tx_onchain: { en: '📜 ON-CHAIN HISTORY', id: '📜 RIWAYAT ON-CHAIN' },
    tx_match_history: { en: 'Match History', id: 'Riwayat Match' },
    tx_history_desc: { en: 'All games recorded immutably on Initia. Readable by anyone.', id: 'Semua game tercatat permanen di Initia. Dapat dibaca siapa saja.' },
    tx_hash: { en: 'Tx Hash', id: 'Hash Transaksi' },
    tx_mode: { en: 'Mode', id: 'Mode' },
    tx_stake: { en: 'Stake', id: 'Taruhan' },
    tx_result: { en: 'Result', id: 'Hasil' },
    tx_payout: { en: 'Payout', id: 'Hadiah' },
    tx_nft: { en: 'NFT', id: 'NFT' },
    tx_view_explorer: { en: 'View All On Explorer ↗', id: 'Lihat Semua di Explorer ↗' },
    tx_realtime: { en: '⚡ Real-Time On-Chain Read', id: '⚡ Baca On-Chain Real-Time' },
    tx_block_height: { en: 'Block Height', id: 'Tinggi Block' },
    tx_contract: { en: 'Contract', id: 'Kontrak' },
    tx_status: { en: 'Tx Status', id: 'Status Transaksi' },
    tx_gas: { en: 'Gas Used', id: 'Gas Dipakai' },
    tx_confirmed: { en: 'Confirmed', id: 'Terkonfirmasi' },

    // Arena Selector
    arena_title: { en: 'CHOOSE ARENA', id: 'PILIH ARENA' },
    arena_subtitle: { en: 'Select Game Mode', id: 'Pilih Mode Game' },
    arena_2p_title: { en: '2 Players', id: '2 Pemain' },
    arena_2p_subtitle: { en: 'You vs Bot', id: 'Kamu vs Bot' },
    arena_2p_desc: { en: 'Quick duel to start playing instantly.', id: 'Duel cepat untuk langsung main.' },
    arena_2p_detail: { en: 'One player against one bot with a more relaxed tempo and focus on core strategy.', id: 'Satu pemain lawan satu bot dengan tempo lebih santai dan fokus ke strategi inti.' },
    arena_4p_title: { en: '4 Players', id: '4 Pemain' },
    arena_4p_subtitle: { en: 'You vs 3 Bots', id: 'Kamu vs 3 Bot' },
    arena_4p_desc: { en: 'Busy, chaotic, and full of comebacks.', id: 'Rame, chaos, dan penuh comeback.' },
    arena_4p_detail: { en: 'Three active bots make the board livelier with more blocks, captures, and revenge.', id: 'Tiga bot aktif membuat papan lebih hidup dengan lebih banyak block, capture, dan balas dendam.' },

    hero_badge: { en: '🌴 ON-CHAIN PARTY BOARD GAME', id: '🌴 PERMAINAN PAPAN PESTA ON-CHAIN' },
    hero_title_1: { en: 'Roll Into The', id: 'Lempar Dadu di' },
    hero_title_red: { en: 'Island', id: 'Arena' },
    hero_title_purple: { en: 'Arena', id: 'Pulau' },
    hero_desc: { en: 'Stake INIT, enter the arena, race your pawns to glory. Smart contract settles payouts. 5% fee. Winner takes all.', id: 'Taruhkan INIT, masuk ke arena, bawa bidakmu ke kemenangan. Kontrak pintar menyelesaikan pembayaran. Biaya 5%. Pemenang ambil semua.' },

    // NFT Section
    nft_badge: { en: '🎨 NFT REWARDS', id: '🎨 HADIAH NFT' },
    nft_title_1: { en: 'Win &', id: 'Menang &' },
    nft_title_2: { en: 'Earn NFTs', id: 'Dapat NFT' },
    nft_desc: { en: 'Exclusive collectibles minted on-chain when you achieve milestones.', id: 'Koleksi eksklusif dicetak on-chain saat kamu mencapai pencapaian tertentu.' },
    nft_minted: { en: 'On-Chain Minted', id: 'Dicetak On-Chain' },
    nft_tradeable: { en: 'Tradeable', id: 'Dapat Ditukar' },
    nft_emotes_t: { en: 'Emotes & Reactions', id: 'Emote & Reaksi' },
    nft_emotes_d: { en: 'Unlock emotes you can use during matches to taunt or celebrate.', id: 'Buka emote yang bisa kamu pakai saat match untuk selebrasi.' },
    nft_token_t: { en: 'Token Drops', id: 'Drop Token' },
    nft_token_d: { en: 'Earn INIT token rewards as you climb the leaderboard each week.', id: 'Dapatkan hadiah token INIT seiring naiknya peringkat mingguanmu.' },
    nft_invite_t: { en: 'Invite Friends', id: 'Ajak Teman' },
    nft_invite_d: { en: 'Send wallet-based invites. Both you and your friend earn bonus tokens on their first win.', id: 'Kirim undangan dompet. Kamu dan temanmu dapat bonus token di kemenangan pertama mereka.' },
    nft_invite_btn: { en: 'Copy Invite Link', id: 'Salin Link Undangan' },

    nft_cond_win_10: { en: 'Win 10 games', id: 'Menang 10 game' },
    nft_cond_666: { en: 'Roll 6 three times in a row', id: 'Lempar 6 tiga kali berurutan' },
    nft_cond_50_games: { en: 'Play 50 games', id: 'Main 50 game' },
    nft_cond_100_captures: { en: 'Capture 100 pawns', id: 'Tangkap 100 pion' },
    nft_cond_first_win: { en: 'First win', id: 'Menang pertama' },
    nft_cond_speed: { en: 'Win in under 10 minutes', id: 'Menang di bawah 10 menit' },

    // Stats
    st_active: { en: 'Active Players', id: 'Pemain Aktif' },
    st_today: { en: 'Games Today', id: 'Game Hari Ini' },
    st_total_win: { en: 'Total Winnings', id: 'Total Kemenangan' },
    st_win_rate: { en: 'Avg Win Rate', id: 'Rerata Kemenangan' },

    // Prize Pool
    pz_transparency: { en: '🔍 ON-CHAIN TRANSPARENCY', id: '🔍 TRANSPARANSI ON-CHAIN' },
    pz_title_1: { en: 'Real Prize Pool', id: 'Rincian Pool' },
    pz_title_2: { en: 'Breakdown', id: 'Hadiah Riil' },
    pz_desc: { en: 'Every payout is verifiable on Initia Blockchain — no hidden fees.', id: 'Setiap pembayaran dapat diverifikasi di Initia Blockchain — tanpa biaya tersembunyi.' },
    pz_pot_label: { en: 'Total Pot', id: 'Total Pot' },
    pz_pot_desc: { en: 'Stake per player × number of players. Pooled into smart contract before game starts.', id: 'Taruhan per pemain × jumlah pemain. Dikumpulkan di smart contract sebelum game mulai.' },
    pz_fee_label: { en: 'Platform Fee', id: 'Biaya Platform' },
    pz_fee_desc: { en: 'Fixed fee deducted from total pot to sustain the platform. Sent to treasury wallet automatically.', id: 'Biaya tetap dipotong dari total pot untuk platform. Dikirim ke dompet treasury otomatis.' },
    pz_win_label: { en: 'Winner Payout', id: 'Pembayaran Pemenang' },
    pz_win_desc: { en: 'Total pot minus fee. Sent directly to winner wallet on-chain the moment game ends.', id: 'Total pot minus biaya. Dikirim langsung ke dompet pemenang secara on-chain saat game selesai.' },

    // Game Rules
    gr_badge: { en: '📖 GAME RULES', id: '📖 ATURAN GAME' },
    gr_desc: { en: 'Learn how to play and master Paradise Ludo!', id: 'Pelajari cara main dan kuasai Paradise Ludo!' },
    gr_obj_t: { en: 'Objective', id: 'Tujuan' },
    gr_obj_d: { en: 'Move all your pawns from base to the center finish square before other players.', id: 'Pindahkan semua bidakmu dari base ke kotak finish tengah sebelum pemain lain.' },
    gr_roll_t: { en: 'Rolling Dice', id: 'Lempar Dadu' },
    gr_roll_d: { en: 'Roll dice to move pawns. The number determines how many steps you can take.', id: 'Lempar dadu untuk menggerakkan bidak. Angka menentukan jumlah langkah yang diambil.' },
    gr_cap_t: { en: 'Capturing', id: 'Menangkap' },
    gr_cap_d: { en: 'Landing on an opponent square sends them back to base, unless they are in Safe Zone.', id: 'Mendarat di atas bidak lawan mengirim mereka ke base, kecuali di Zona Aman.' },
    gr_safe_t: { en: 'Safe Zones', id: 'Zona Aman' },
    gr_safe_d: { en: 'Star squares are safe zones; pawns here cannot be captured by opponents.', id: 'Petak bintang adalah zona aman; bidak di sini tidak bisa ditangkap lawan.' },
    gr_home_t: { en: 'Home Stretch', id: 'Jalur Beranda' },
    gr_home_d: { en: 'After a full lap, pawns enter the home stretch and must hit the center target exactly.', id: 'Setelah satu putaran, pion masuk jalur beranda dan harus mendarat tepat di pusat.' },
    gr_win_t: { en: 'Winning', id: 'Kemenangan' },
    gr_win_d: { en: 'The first player to get all 4 pawns to the final finish square wins!', id: 'Pemain pertama yang memasukkan ke-4 bidaknya ke kotak finish akhir menang!' },

    // Marketplace
    mkt_title: { en: 'Marketplace', id: 'Pasar NFT' },
    mkt_desc: { en: 'Buy and sell exclusive minted NFTs!', id: 'Jual beli NFT eksklusif yang telah dicetak!' },
    mkt_filter_p: { en: 'Price Range', id: 'Rentang Harga' },
    mkt_rarity: { en: 'Rarity', id: 'Kelangkaan' },
    mkt_sort: { en: 'Sort By', id: 'Urutkan' },
    mkt_new: { en: 'Newest', id: 'Terbaru' },
    mkt_old: { en: 'Oldest', id: 'Terlama' },
    mkt_buy: { en: 'Buy', id: 'Beli' },
    mkt_all: { en: 'All Rarities', id: 'Semua Kelangkaan' },
    mkt_owned: { en: 'Owned', id: 'Milik Anda' },
    mkt_sale: { en: 'On Sale', id: 'Dijual' },
    mkt_reset: { en: 'Reset Filters', id: 'Reset Filter' },
    mkt_wallet: { en: 'Wallet Address', id: 'Alamat Dompet' },
    mkt_buy_btn: { en: 'Buy', id: 'Beli' },
    mkt_all_cat: { en: 'All', id: 'Semua' },
    mkt_nft_col: { en: 'NFT Collections', id: 'Koleksi NFT' },
    mkt_music_col: { en: 'Music NFT Collections', id: 'Koleksi NFT Musik' },
    mkt_sell: { en: 'Sell', id: 'Jual' },

    // Leaderboard
    // Leaderboard
    lb_title_1: { en: 'LEADER', id: 'PERINGKAT' },
    lb_title_2: { en: 'BOARD', id: 'PEMAIN TOP' },
    lb_rankings: { en: '🏆 Rankings', id: '🏆 Peringkat' },
    lb_desc: { en: 'Top players by wins and earnings across the platform.', id: 'Pemain terbaik berdasarkan kemenangan dan pendapatan.' },
    lb_weekly: { en: 'Weekly', id: 'Mingguan' },
    lb_monthly: { en: 'Monthly', id: 'Bulanan' },
    lb_alltime: { en: 'All Time', id: 'Selamanya' },
    lb_climb: { en: 'Climb the ranks and win INIT rewards!', id: 'Kejar peringkat dan dapatkan hadiah INIT!' },
    lb_resets: { en: 'Resets In', id: 'Reset Dalam' },
    lb_rank: { en: 'Rank', id: 'Peringkat' },
    lb_player: { en: 'Player', id: 'Pemain' },
    lb_wins: { en: 'Wins', id: 'Menang' },
    lb_winrate: { en: 'Winrate', id: 'Winrate' },
    lb_rewards: { en: 'Rewards', id: 'Hadiah' },
    lb_you: { en: 'You', id: 'Kamu' },
    lb_weekly_top: { en: 'Weekly Top 10', id: 'Top 10 Mingguan' },
    lb_rank_label: { en: 'Rank', id: 'Peringkat' },
    lb_reward_desc: { en: 'The higher you rank, the bigger the rewards!', id: 'Semakin tinggi peringkatmu, semakin besar hadiahnya!' },
    lb_rewards_others: { en: 'PERINGKATS #4-10 INIT', id: 'PERINGKAT #4-10 INIT' },
    lb_extra_chests: { en: 'Extra Chests', id: 'Peti Tambahan' },
    lb_extra_chests_desc: { en: 'Earn exclusive NFTs for your first win streak.', id: 'Dapatkan NFT eksklusif untuk tren kemenangan pertamamu.' },

    // Profile
    pr_t_stats: { en: 'STATS', id: 'STATISTIK' },
    pr_t_inventory: { en: 'INVENTORY', id: 'INVENTARIS' },
    pr_t_friends: { en: 'FRIENDS', id: 'TEMAN' },
    pr_t_history: { en: 'HISTORY', id: 'RIWAYAT' },
    pr_coming_soon: { en: 'Coming Soon', id: 'Segera Hadir' },
    pr_earnings_label: { en: 'Total Earnings', id: 'Total Pendapatan' },
    pr_streak_label: { en: 'Win Streak', id: 'Tren Menang' },
    pr_view_friends: { en: 'View All ›', id: 'Lihat Semua ›' },
    pr_wins_suffix: { en: 'Wins 🔥', id: 'Menang 🔥' },
    pr_update: { en: 'Update Profile', id: 'Perbarui Profil' },
    pr_user: { en: 'Username', id: 'Nama Pengguna' },
    pr_bio: { en: 'Bio', id: 'Bio' },
    pr_save: { en: 'Save Changes', id: 'Simpan Perubahan' },
    pr_saving: { en: 'Saving...', id: 'Menyimpan...' },
    pr_saved: { en: 'Saved!', id: 'Tersimpan!' },
    pr_matches: { en: 'Matches', id: 'Pertandingan' },
    pr_wins: { en: 'Wins', id: 'Menang' },
    pr_winrate: { en: 'Winrate', id: 'Winrate' },
    pr_level: { en: 'Level', id: 'Level' },
    pr_earnings: { en: 'Total Earnings', id: 'Total Pendapatan' },
    pr_streak: { en: 'Win Streak', id: 'Tren Menang' },
    pr_friends: { en: 'Friends', id: 'Teman' },
    pr_view_all: { en: 'View All', id: 'Lihat Semua' },
    pr_copy: { en: 'Copied!', id: 'Tersalin!' },
    pr_connected: { en: 'Connected Wallet', id: 'Dompet Terhubung' },
    pr_change_avatar: { en: 'Change avatar', id: 'Ubah avatar' },
    pr_placeholder_user: { en: 'Your username', id: 'Nama penggunamu' },
    pr_placeholder_bio: { en: 'Tell the world who you are...', id: 'Ceritakan siapa dirimu...' },

    // How to Play
    hw_title: { en: 'How To Play', id: 'Cara Bermain' },
    hw_subtitle: { en: 'Paradice Gameplay Guide (Classic Ludo)', id: 'Panduan Bermain Paradice (Ludo Klasik)' },
    hw_back: { en: 'Back', id: 'Kembali' },
    hw_rule_1_title: { en: 'Executive Summary', id: 'Ringkasan Eksekutif' },
    hw_rule_1_content: { en: 'Paradice follows the basic rules of classic Ludo:', id: 'Paradice mengikuti aturan dasar Ludo klasik:' },
    hw_rule_1_b1: { en: '2–4 players take turns clockwise moving their four pawns from "home" to the finish square. A 6 roll is required to exit home.', id: '2–4 pemain bergiliran searah jarum jam memindahkan keempat pionnya dari "rumah" ke finish. Perlu dadu 6 untuk keluar rumah.' },
    hw_rule_1_b2: { en: 'Capturing an opponent (landing on their square) sends them back to home.', id: 'Menangkap lawan (mendarat di petaknya) mengirim lawan kembali ke rumah.' },
    hw_rule_1_b3: { en: 'The first player to get all 4 pawns to the finish wins.', id: 'Pemain pertama yang memasukkan 4 pion ke finish menang.' },
    hw_rule_1_b4: { en: 'This guide covers steps, scenarios, FAQ, and tips.', id: 'Panduan ini menguraikan langkah, skenario, FAQ, dan tips.' },
    hw_rule_1_img1: { en: 'Need 6', id: 'Perlu Dadu 6' },
    hw_rule_1_img2: { en: 'Clockwise', id: 'Searah Jarum Jam' },
    hw_rule_1_img3: { en: 'Capture!', id: 'Tangkap Lawan!' },
    hw_rule_1_img4: { en: 'Victory!', id: 'Kemenangan!' },

    hw_rule_2_title: { en: 'Game Preparation', id: 'Persiapan Permainan' },
    hw_rule_2_content: { en: '2–4 players pick a color (Red, Blue, Yellow, Green) and place 4 pawns in starting home.', id: '2–4 pemain memilih warna (Merah, Biru, Kuning, Hijau) dan menempatkan 4 pion di rumah awal.' },
    hw_rule_2_b1: { en: 'Turn Order: Each player rolls once, highest goes first. Turns then proceed clockwise.', id: 'Urutan Giliran: Pemain melempar sekali, angka tertinggi mulai duluan. Lalu searah jarum jam.' },
    hw_rule_2_b2: { en: 'Board Layout: Each color zone has a starting square and star-marked safe squares.', id: 'Tata Letak: Tiap zona warna punya petak keluar dan petak bintang (zona aman).' },

    hw_rule_3_title: { en: 'Turn Order & Dice', id: 'Urutan Giliran & Dadu' },
    hw_rule_3_content: { en: 'On your turn, roll the dice once and move a pawn by that number.', id: 'Pada giliran, pemain melempar dadu sekali dan melangkah sesuai angka dadu.' },
    hw_rule_3_b1: { en: 'Roll a 6: Exit a new pawn from home or move one already on the track.', id: 'Angka 6: Bisa keluarkan pion baru atau pindahkan pion yang sudah di jalur.' },
    hw_rule_3_b2: { en: 'Bonus Turn: Rolling a 6 grants an extra roll.', id: 'Giliran Tambahan: Lemparan 6 memberikan kesempatan melempar lagi.' },
    hw_rule_3_b3: { en: 'Three 6s: Rolling three 6s in a row voids the third turn and passes it.', id: 'Tiga kali 6: Lempar 6 tiga kali berturut-turut menghanguskan giliran.' },
    hw_rule_3_b4: { en: 'Note: You can only choose one pawn to move per roll.', id: 'Penting: Hanya satu pion yang dipilih untuk dipindahkan per lemparan.' },

    hw_rule_4_title: { en: 'Exiting & Moving Pawns', id: 'Mengeluarkan & Memindahkan Pion' },
    hw_rule_4_content: { en: 'Exiting: When you roll a 6, one pawn exits home to the starting square.', id: 'Mengeluarkan: Saat dadu 6, satu pion keluar dari rumah ke petak awal masing-masing.' },
    hw_rule_4_b1: { en: 'Moving: Once on the track, pawns move clockwise along the path.', id: 'Memindahkan: Setelah di jalur, pion bergerak searah jarum jam mengikuti jalurnya.' },
    hw_rule_4_b2: { en: 'Choosing: You can choose any pawn currently on the track.', id: 'Memilih: Pemain bebas memilih pion mana saja yang sudah di jalur.' },
    hw_rule_4_b3: { en: 'Blockade: Two pawns of the same color on one square form a blockade (cannot be passed or captured).', id: 'Blok Ganda: Dua pion sewarna di petak sama membentuk blok (tidak bisa dilewati lawan).' },
    hw_rule_4_b4: { en: 'Safe Zones: Pawns on star squares are safe from being captured.', id: 'Zona Aman: Pion di petak bintang tidak bisa ditangkap lawan.' },
    hw_rule_4_b5: { en: 'Capturing: Landing exactly on an opponent square sends them back to home and grants a bonus turn.', id: 'Menangkap: Mendarat di petak lawan mengirim mereka ke rumah dan dapat bonus jalan.' },

    hw_rule_5_title: { en: 'Finish & Winning', id: 'Menuju Finish & Menang' },
    hw_rule_5_content: { en: 'After a full lap, pawns enter the home column towards the finish square.', id: 'Setelah berkeliling, pion masuk ke kolom beranda menuju kotak finish.' },
    hw_rule_5_b1: { en: 'Exact Roll: You must roll the exact number to reach finish. If roll is higher, pawn stays.', id: 'Angka Tepat: Harus lempar angka pas untuk finish. Jika lebih besar, pion diam.' },
    hw_rule_5_b2: { en: 'Winner: First player with all 4 pawns in the finish square wins.', id: 'Pemenang: Pemain pertama yang 4 pionnya sampai finish memenangkan permainan.' },
    hw_rule_5_b3: { en: 'Continuing: Remaining players continue to determine further positions.', id: 'Lanjut: Pemain tersisa lanjut bermain untuk menentukan posisi berikutnya.' },

    hw_rule_6_title: { en: 'Scenarios', id: 'Contoh Skenario' },
    hw_rule_6_content: { en: 'Examples of rules in action:', id: 'Beberapa contoh penerapan aturan secara langsung:' },
    hw_rule_6_b1: { en: 'Capture: Red on 10, Blue rolls 3 and lands on 10. Red returns home.', id: 'Menangkap: Merah di 10, Biru lempar 3 ke 10. Merah kembali ke rumah.' },
    hw_rule_6_b2: { en: 'Safe Zone: Blue on star square. Opponent lands there, Blue stays safe.', id: 'Zona Aman: Biru di bintang. Lawan mendarat di sana, Biru tetap aman.' },
    hw_rule_6_b3: { en: 'Blockade: Two Green pawns stacked. Opponent must wait or go around.', id: 'Blok Ganda: Dua pion Hijau menumpuk. Lawan harus menunggu blokir pecah.' },
    hw_rule_6_b4: { en: 'Triple 6: Two 6s get bonus, third 6 ends turn instantly.', id: '6 Beruntun: Dua kali 6 dapat bonus, kali ketiga giliran hangus.' },
    hw_rule_6_b5: { en: 'Victory: Player X reaches finish actively on their turn wins over Player Y.', id: 'Menang: Pemain X yang aktif sampai finish dulu menang atas Y.' },

    // CTA & Footer
    cta_title: { en: 'Ready for Tropical Adventure?', id: 'Siap untuk Petualangan Tropis?' },
    cta_desc: { en: 'Join thousands of players on Initia Blockchain and start earning exclusive NFTs today!', id: 'Bergabunglah dengan ribuan pemain di Initia Blockchain dan mulai menangkan hadiah NFT eksklusif hari ini!' },
    cta_btn: { en: 'PLAY NOW →', id: 'MAIN SEKARANG →' },
    ft_desc: { en: 'Play ludo on-chain and win with strategy. Securely built on Initia Blockchain.', id: 'Main ludo secara on-chain dan menang dengan strategi. Dibangun secara aman di atas Initia Blockchain.' },
    ft_qlinks: { en: 'QUICK LINKS', id: 'TAUTAN CEPAT' },
    ft_support: { en: 'SUPPORT', id: 'DUKUNGAN' },
    ft_follow: { en: 'FOLLOW US', id: 'IKUTI KAMI' },
    ft_rights: { en: '© 2026 Paradise Ludo. All Rights Reserved.', id: '© 2026 Paradise Ludo. Hak Cipta Dilindungi.' },
};

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { readonly children: React.ReactNode }) {
    const [locale, setLocale] = useState<Locale>('en');

    useEffect(() => {
        const saved = localStorage.getItem('paradice-locale') as Locale;
        if (saved && (saved === 'en' || saved === 'id')) {
            setLocale(saved);
        }
    }, []);

    const handleSetLocale = (newLocale: Locale) => {
        setLocale(newLocale);
        localStorage.setItem('paradice-locale', newLocale);
    };

    const t = (key: string) => {
        if (!translations[key]) {
            console.warn(`Translation key not found: ${key}`);
            return key;
        }
        return translations[key][locale];
    };

    const contextValue = React.useMemo(() => ({
        locale,
        setLocale: handleSetLocale,
        t
    }), [locale]);

    return (
        <LanguageContext.Provider value={contextValue}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
