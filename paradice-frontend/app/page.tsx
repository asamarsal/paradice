import LudoBoard from "@/components/LudoBoard";
import Dice from "@/components/Dice";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBEB]">
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌴</span>
          <h1 className="text-2xl font-black text-[#8B5CF6] tracking-tight">
            Paradice
          </h1>
        </div>
        <button className="bg-[#8B5CF6] text-white px-6 py-2 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
          Connect Wallet
        </button>
      </header>

      {/* Main board area */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-12 p-4 sm:p-8">

        {/* Left Side: Dice */}
        <div className="flex-shrink-0">
          <Dice />
        </div>

        {/* Center: Ludo Board */}
        <div className="w-full max-w-[560px]">
          <LudoBoard />
        </div>

        {/* Right Side: Spacer for symmetry */}
        <div className="hidden lg:block w-[120px]"></div>

      </main>

      <footer className="w-full p-3 text-center text-[#0C4A6E] opacity-60 text-sm">
        Built on Initia Blockchain 🥥
      </footer>
    </div>
  );
}
