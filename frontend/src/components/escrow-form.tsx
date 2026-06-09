"use client";

import { useState } from "react";
import { Send } from "lucide-react";

interface EscrowFormProps {
  onSubmit: (data: {
    client: string;
    freelancer: string;
    arbiter: string;
    amount: string;
  }) => void;
  disabled?: boolean;
}

export default function EscrowForm({ onSubmit, disabled }: EscrowFormProps) {
  const [formData, setFormData] = useState({
    client: "",
    freelancer: "",
    arbiter: "",
    amount: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.client &&
      formData.freelancer &&
      formData.arbiter &&
      formData.amount
    ) {
      // Pass data up to the parent page component
      onSubmit(formData);

      // NOTE: Removed immediate setFormData reset here so data doesn't wipe out mid-flight.
    }
  };

  const allFilled =
    formData.client &&
    formData.freelancer &&
    formData.arbiter &&
    formData.amount;

  return (
    <div className="rounded-2xl border border-white/8 bg-[#111111] p-7">
      {/* Header */}
      <div className="mb-7 flex items-center gap-3.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a2e1a]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5 text-[#22c55e]"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M9 12h6M9 16h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-white">
            Initialize Escrow
          </h2>
          <p className="text-xs text-white/40 mt-0.5">
            Create a new escrow agreement
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Client Address */}
        <div>
          <label className="block text-[13px] font-medium text-white/80 mb-2">
            Client Address
          </label>
          <input
            type="text"
            name="client"
            value={formData.client}
            onChange={handleChange}
            placeholder="G..."
            disabled={disabled}
            className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/20 disabled:opacity-50"
          />
          <p className="mt-1.5 text-xs text-white/30">
            Stellar address of the client
          </p>
        </div>

        {/* Freelancer Address */}
        <div>
          <label className="block text-[13px] font-medium text-white/80 mb-2">
            Freelancer Address
          </label>
          <input
            type="text"
            name="freelancer"
            value={formData.freelancer}
            onChange={handleChange}
            placeholder="G..."
            disabled={disabled}
            className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/20 disabled:opacity-50"
          />
          <p className="mt-1.5 text-xs text-white/30">
            Stellar address of the freelancer
          </p>
        </div>

        {/* Arbiter Address */}
        <div>
          <label className="block text-[13px] font-medium text-white/80 mb-2">
            Arbiter Address
          </label>
          <input
            type="text"
            name="arbiter"
            value={formData.arbiter}
            onChange={handleChange}
            placeholder="G..."
            disabled={disabled}
            className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/20 disabled:opacity-50"
          />
          <p className="mt-1.5 text-xs text-white/30">
            Stellar address of the arbiter
          </p>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-[13px] font-medium text-white/80 mb-2">
            XLM Deposit Amount
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            disabled={disabled}
            className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/20 disabled:opacity-50"
          />
          <p className="mt-1.5 text-xs text-white/30">
            Amount in XLM to deposit to escrow
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!allFilled || disabled}
          className="mt-2 w-full rounded-lg bg-[#22c55e] px-4 py-3 text-[14px] font-semibold text-black transition-all hover:bg-[#16a34a] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Send className="h-4 w-4" />
          {disabled ? "Processing…" : "Initialize Escrow"}
        </button>
      </form>
    </div>
  );
}
