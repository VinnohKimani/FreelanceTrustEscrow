"use client";

import { Wallet, ArrowRight, Shield, Zap } from "lucide-react";
import CollaborationVisualization from "@/components/collaboration-visualization";

interface LandingHeroProps {
  onConnectWallet: () => void;
}

export default function LandingHero({ onConnectWallet }: LandingHeroProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Navbar ── */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          {/* Green diamond icon */}
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#22c55e]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 text-black"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 8l10 14L22 8 12 2z" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold text-white tracking-tight">
            Freelance Trust
          </span>
        </div>

        <button
          onClick={onConnectWallet}
          className="inline-flex items-center gap-2 rounded-lg border border-[#22c55e] px-4 py-2 text-sm font-medium text-[#22c55e] transition-all hover:bg-[#22c55e]/10"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M16 12h2" />
          </svg>
          Connect Wallet
        </button>
      </nav>

      {/* ── Hero ── */}
      <div className="flex-1 flex items-center px-6 lg:px-12 py-12 max-w-7xl mx-auto w-full">
        <div className="grid gap-12 lg:grid-cols-2 items-center w-full">
          {/* Left: Copy */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
              <span className="text-xs font-medium text-white/70 tracking-wide">
                Built on Stellar Soroban
              </span>
            </div>

            {/* Title */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tight">
              Freelance <br />Trust
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-white/50 leading-relaxed max-w-xl">
              A decentralized milestone escrow platform securing trust between
              employers and freelance professionals. Fund projects confidently
              with secure, automated smart contracts and neutral arbiter dispute
              resolution.
            </p>

            {/* Feature bullets */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-[#22c55e] flex-shrink-0" />
                <span className="text-sm text-white/50">
                  Secure escrow with instant smart contract validation
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 text-[#22c55e] flex-shrink-0" />
                <span className="text-sm text-white/50">
                  Fast, borderless transactions on blockchain
                </span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={onConnectWallet}
              className="inline-flex items-center gap-2 rounded-lg bg-[#22c55e] px-7 py-4 text-[15px] font-semibold text-black transition-all hover:bg-[#16a34a] hover:shadow-lg hover:shadow-[#22c55e]/20 group"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M16 12h2" />
              </svg>
              Connect Wallet to Enter App
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Right: Visualization */}
          <div className="hidden lg:block">
            <CollaborationVisualization />
          </div>
        </div>
      </div>
    </div>
  );
}
