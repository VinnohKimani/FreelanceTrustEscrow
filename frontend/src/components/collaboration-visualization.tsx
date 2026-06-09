"use client";

import { Briefcase, User, Lock, Zap } from "lucide-react";

export default function CollaborationVisualization() {
  return (
    <div className="relative w-full h-[520px] flex items-center justify-center rounded-2xl border border-white/8 bg-[#0d0d0d] overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Central lock ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative flex items-center justify-center">
          {/* Outer ring */}
          <div className="h-28 w-28 rounded-full border border-[#22c55e]/20" />
          {/* Middle ring */}
          <div className="absolute h-20 w-20 rounded-full border border-[#22c55e]/35" />
          {/* Inner filled circle */}
          <div className="absolute h-11 w-11 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center shadow-lg shadow-[#22c55e]/30">
            <Lock className="h-5 w-5 text-black" />
          </div>
        </div>
      </div>

      {/* Client card — top left */}
      <div className="absolute top-14 left-8">
        <div className="w-52 rounded-xl border border-white/10 bg-[#161616] p-5 transition-all hover:border-[#22c55e]/30 hover:shadow-lg hover:shadow-[#22c55e]/5">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#1f2d22]">
            <Briefcase className="h-5 w-5 text-[#22c55e]" />
          </div>
          <p className="text-[13px] font-semibold text-white mb-1">
            Client/Employer
          </p>
          <p className="text-xs text-white/40 mb-4 leading-relaxed">
            Project owner funding milestones
          </p>
          <div className="flex gap-2">
            <span className="rounded px-2 py-0.5 text-[11px] font-medium border border-[#22c55e]/30 text-[#22c55e] bg-[#22c55e]/5">
              Verified
            </span>
            <span className="rounded px-2 py-0.5 text-[11px] font-medium border border-white/10 text-white/40 bg-white/5">
              Insured
            </span>
          </div>
        </div>
        {/* Dashed line to center */}
        <div className="absolute -right-6 top-1/2 w-6 border-t border-dashed border-[#22c55e]/20" />
      </div>

      {/* Freelancer card — top right */}
      <div className="absolute top-14 right-8">
        <div className="w-52 rounded-xl border border-white/10 bg-[#161616] p-5 transition-all hover:border-[#22c55e]/30 hover:shadow-lg hover:shadow-[#22c55e]/5">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#1f2d22]">
            <User className="h-5 w-5 text-[#22c55e]" />
          </div>
          <p className="text-[13px] font-semibold text-white mb-1">
            Freelancer Specialist
          </p>
          <p className="text-xs text-white/40 mb-4 leading-relaxed">
            Service provider securing payments
          </p>
          <div className="flex gap-2">
            <span className="rounded px-2 py-0.5 text-[11px] font-medium border border-[#22c55e]/30 text-[#22c55e] bg-[#22c55e]/5">
              Certified
            </span>
            <span className="rounded px-2 py-0.5 text-[11px] font-medium border border-white/10 text-white/40 bg-white/5">
              Bonded
            </span>
          </div>
        </div>
        {/* Dashed line to center */}
        <div className="absolute -left-6 top-1/2 w-6 border-t border-dashed border-[#22c55e]/20" />
      </div>

      {/* Bottom badge */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <div className="inline-flex items-center gap-2 rounded-lg border border-[#22c55e]/25 bg-[#22c55e]/5 px-4 py-2">
          <Zap className="h-3.5 w-3.5 text-[#22c55e]" />
          <span className="text-xs font-medium text-[#22c55e]">
            Automated Smart Contracts
          </span>
        </div>
      </div>

      {/* Outer border glow */}
      <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none" />
    </div>
  );
}
