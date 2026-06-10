"use client";

import { useState } from "react";
import { Send, AlertCircle, Eye, EyeOff } from "lucide-react";
import { StrKey, Keypair } from "@stellar/stellar-sdk";

interface EscrowFormProps {
  onSubmit: (
    data: {
      client: string;
      freelancer: string;
      arbiter: string;
      amount: string;
    },
    clientSecret: string,
  ) => void;
  disabled?: boolean;
}

function isValidStellarAddress(addr: string): boolean {
  try {
    return StrKey.isValidEd25519PublicKey(addr);
  } catch {
    return false;
  }
}

function isValidStellarSecret(secret: string): boolean {
  try {
    Keypair.fromSecret(secret);
    return true;
  } catch {
    return false;
  }
}

function secretMatchesAddress(secret: string, address: string): boolean {
  try {
    return Keypair.fromSecret(secret).publicKey() === address;
  } catch {
    return false;
  }
}

export default function EscrowForm({ onSubmit, disabled }: EscrowFormProps) {
  const [formData, setFormData] = useState({
    client: "",
    freelancer: "",
    arbiter: "",
    amount: "",
  });
  const [clientSecret, setClientSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  const [validationErrors, setValidationErrors] = useState<
    Partial<
      Record<
        "client" | "freelancer" | "arbiter" | "amount" | "clientSecret",
        string
      >
    >
  >({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSecretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientSecret(e.target.value);
    setValidationErrors((prev) => ({ ...prev, clientSecret: undefined }));
  };

  const validate = () => {
    const errors: typeof validationErrors = {};

    if (!isValidStellarAddress(formData.client)) {
      errors.client =
        "Invalid Stellar address. Must be a valid G... public key.";
    }
    if (!isValidStellarAddress(formData.freelancer)) {
      errors.freelancer =
        "Invalid Stellar address. Must be a valid G... public key.";
    }
    if (!isValidStellarAddress(formData.arbiter)) {
      errors.arbiter =
        "Invalid Stellar address. Must be a valid G... public key.";
    }
    const amt = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amt) || amt <= 0) {
      errors.amount = "Amount must be a positive number.";
    }

    if (!isValidStellarSecret(clientSecret)) {
      errors.clientSecret =
        "Invalid secret key. Must be a valid S... secret key.";
    } else if (
      isValidStellarAddress(formData.client) &&
      !secretMatchesAddress(clientSecret, formData.client)
    ) {
      errors.clientSecret =
        "This secret key does not match the Client Address above.";
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    onSubmit(formData, clientSecret);
  };

  const allFilled =
    formData.client &&
    formData.freelancer &&
    formData.arbiter &&
    formData.amount &&
    clientSecret;

  const addressFields: {
    name: keyof typeof formData;
    label: string;
    hint: string;
    type?: string;
  }[] = [
    {
      name: "client",
      label: "Client Address",
      hint: "Stellar G... public key of the client",
    },
    {
      name: "freelancer",
      label: "Freelancer Address",
      hint: "Stellar G... public key of the freelancer",
    },
    {
      name: "arbiter",
      label: "Arbiter Address",
      hint: "Stellar G... public key of the arbiter",
    },
    {
      name: "amount",
      label: "XLM Deposit Amount",
      hint: "Amount in XLM to deposit to escrow",
      type: "number",
    },
  ];

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

      {/* Helper notice */}
      <div className="mb-5 rounded-lg border border-[#22c55e]/20 bg-[#22c55e]/5 px-4 py-3">
        <p className="text-xs text-[#22c55e]/80 leading-relaxed">
          ⚠️ All addresses must be real funded Stellar testnet accounts.{" "}
          <a
            href="https://laboratory.stellar.org/#account-creator"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[#22c55e] hover:text-white transition-colors"
          >
            Generate keypairs here →
          </a>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {addressFields.map(({ name, label, hint, type }) => (
          <div key={name}>
            <label className="block text-[13px] font-medium text-white/80 mb-2">
              {label}
            </label>
            <input
              type={type ?? "text"}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              placeholder={type === "number" ? "0.00" : "G..."}
              step={type === "number" ? "0.01" : undefined}
              min={type === "number" ? "0" : undefined}
              disabled={disabled}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-colors disabled:opacity-50 bg-[#1a1a1a] ${
                validationErrors[name]
                  ? "border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                  : "border-white/10 focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/20"
              }`}
            />
            {validationErrors[name] ? (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                {validationErrors[name]}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-white/30">{hint}</p>
            )}
          </div>
        ))}

        {/* ── Client Secret Key (required for client.require_auth()) ── */}
        <div>
          <label className="block text-[13px] font-medium text-white/80 mb-2">
            Client Secret Key
          </label>
          <div className="relative">
            <input
              type={showSecret ? "text" : "password"}
              name="clientSecret"
              value={clientSecret}
              onChange={handleSecretChange}
              placeholder="S..."
              disabled={disabled}
              autoComplete="off"
              className={`w-full rounded-lg border px-4 py-2.5 pr-10 text-sm text-white placeholder-white/20 outline-none transition-colors disabled:opacity-50 bg-[#1a1a1a] ${
                validationErrors.clientSecret
                  ? "border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                  : "border-white/10 focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/20"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowSecret((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              tabIndex={-1}
            >
              {showSecret ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {validationErrors.clientSecret ? (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              {validationErrors.clientSecret}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-white/30">
              The client&apos;s S... secret key — required to authorize the
              on-chain transfer. Never stored or sent anywhere except the
              Stellar testnet RPC.
            </p>
          )}
        </div>

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
