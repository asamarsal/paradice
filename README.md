# paradice
on Initia blockchain

## Initia Hackathon Submission

- **Project Name**: Paradice

### Project Overview

Paradice adalah game Ludo berbasis Initia yang menggabungkan room matchmaking, fair dice commit-reveal, dan settlement hadiah pemenang. Aplikasi ini ditujukan untuk pemain kasual hingga kompetitif yang ingin bermain game board dengan mekanisme hadiah on-chain yang transparan. Nilai utamanya adalah UX gameplay cepat dengan wallet-native flow dari InterwovenKit dan jalur integrasi smart contract Move untuk escrow taruhan.

### Implementation Detail

- **The Custom Implementation**: Kami membangun flow end-to-end untuk game session yang mengikat frontend, backend, dan Move module (`create_game`, `join_game`, `roll_dice`, `move_pawn`) serta backend session tracking untuk validasi settlement dan klaim NFT.
- **The Native Feature**: Kami menggunakan **initia-usernames** melalui InterwovenKit sehingga identitas pemain tampil sebagai username wallet-native (fallback ke address), membuat pengalaman sosial dalam lobby dan wallet panel lebih mudah dipahami pengguna.

### How to Run Locally

1. Jalankan backend Laravel di `paradice-backend`: install dependency, set `.env` termasuk `INITIA_REST_URL`, lalu `php artisan migrate` dan `php artisan serve`.
2. Jalankan frontend Next.js di `paradice-frontend`: install dependency lalu `npm run dev`.
3. Set env frontend untuk appchain (`NEXT_PUBLIC_MOVE_CHAIN_ID`, `NEXT_PUBLIC_MOVE_MODULE_ADDRESS`, endpoint backend, dan endpoint appchain/custom chain jika lokal).
4. Buka aplikasi, connect wallet via InterwovenKit, lalu buat/join room dan mulai match.
