"use client";

import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface StatusPanelProps {
  balance: number;
  status: "pending" | "funded" | "disputed" | "released";
  escrowData: {
    client: string;
    freelancer: string;
    arbiter: string;
    amount: string;
  };
  onReleaseFunds: () => void;
  onFileDispute: () => void;
  disabled?: boolean;
}

export default function StatusPanel({
  balance,
  status,
  escrowData,
  onReleaseFunds,
  onFileDispute,
  disabled,
}: StatusPanelProps) {
  const statusBadge = () => {
    switch (status) {
      case "funded":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1a2e1a] border border-[#22c55e]/25 px-3 py-1 text-xs font-medium text-[#22c55e]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
            Funded
          </span>
        );
      case "disputed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/25 px-3 py-1 text-xs font-medium text-red-400">
            <AlertTriangle className="h-3 w-3" />
            Disputed
          </span>
        );
      case "released":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1a2e1a] border border-[#22c55e]/25 px-3 py-1 text-xs font-medium text-[#22c55e]">
            <CheckCircle2 className="h-3 w-3" />
            Released
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-medium text-white/40">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Balance card ── */}
      <div className="rounded-2xl border border-white/8 bg-[#111111] p-6">
        <p className="text-xs font-medium text-white/40 mb-3 uppercase tracking-wider">
          Escrow Balance
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black text-white tabular-nums">
            {balance.toFixed(2)}
          </span>
          <span className="text-2xl font-bold text-[#22c55e]">XLM</span>
        </div>
        <p className="mt-2 text-xs text-white/30">
          Current funds held in escrow
        </p>
      </div>

      {/* ── Status card ── */}
      <div className="rounded-2xl border border-white/8 bg-[#111111] p-6">
        <p className="text-xs font-medium text-white/40 mb-4 uppercase tracking-wider">
          Escrow Status
        </p>

        {statusBadge()}

        {status === "pending" && (
          <div className="mt-4 rounded-lg bg-white/4 border border-white/6 px-4 py-3 text-sm text-white/30">
            Initialize an escrow to get started
          </div>
        )}

        {status === "disputed" && (
          <div className="mt-4 rounded-lg bg-red-500/8 border border-red-500/20 px-4 py-3">
            <p className="text-sm font-medium text-red-400">
              Dispute in Progress
            </p>
            <p className="text-xs text-red-400/60 mt-1">
              This escrow is under review by the arbiter
            </p>
          </div>
        )}

        {status === "released" && (
          <div className="mt-4 rounded-lg bg-[#22c55e]/8 border border-[#22c55e]/20 px-4 py-3">
            <p className="text-sm font-medium text-[#22c55e]">Funds Released</p>
            <p className="text-xs text-[#22c55e]/50 mt-1">
              All funds have been released to the freelancer
            </p>
          </div>
        )}
      </div>

      {/* ── Escrow details card ── */}
      {escrowData.client && (
        <div className="rounded-2xl border border-white/8 bg-[#111111] p-6">
          <p className="text-xs font-medium text-white/40 mb-4 uppercase tracking-wider">
            Escrow Details
          </p>
          <div className="space-y-3">
            {[
              { label: "Client", value: escrowData.client },
              { label: "Freelancer", value: escrowData.freelancer },
              { label: "Arbiter", value: escrowData.arbiter },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[11px] text-white/30 uppercase tracking-wider mb-0.5">
                  {label}
                </p>
                <p className="font-mono text-xs text-white/70 break-all">
                  {value}
                </p>
              </div>
            ))}
            <div>
              <p className="text-[11px] text-white/30 uppercase tracking-wider mb-0.5">
                Amount
              </p>
              <p className="text-sm font-bold text-white">
                {escrowData.amount}{" "}
                <span className="text-[#22c55e] font-semibold">XLM</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Action buttons ── */}
      {status === "funded" && (
        <div className="space-y-3">
          <button
            onClick={onReleaseFunds}
            disabled={disabled}
            className="w-full rounded-xl bg-[#22c55e] px-4 py-3 text-sm font-semibold text-black transition-all hover:bg-[#16a34a] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {disabled ? "Processing…" : "Release Funds"}
          </button>
          <button
            onClick={onFileDispute}
            disabled={disabled}
            className="w-full rounded-xl border border-red-500/30 bg-transparent px-4 py-3 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/8 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            {disabled ? "Processing…" : "File Dispute"}
          </button>
        </div>
      )}

      {status === "disputed" && (
        <button
          disabled
          className="w-full rounded-xl bg-white/5 border border-white/8 px-4 py-3 text-sm font-medium text-white/30 cursor-not-allowed"
        >
          Awaiting Arbiter Decision
        </button>
      )}

      {status === "released" && (
        <button
          disabled
          className="w-full rounded-xl bg-white/5 border border-white/8 px-4 py-3 text-sm font-medium text-white/30 cursor-not-allowed"
        >
          Escrow Completed
        </button>
      )}
    </div>
  );
}
