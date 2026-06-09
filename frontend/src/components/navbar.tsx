import { LogOut } from "lucide-react";

interface NavbarProps {
  walletConnected: boolean;
  onConnectWallet: () => void;
}

export default function Navbar({
  walletConnected,
  onConnectWallet,
}: NavbarProps) {
  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-white/8 bg-[#111111]">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#22c55e]">
          {/* Wallet icon in black */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5 text-black"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <rect x="2" y="5" width="20" height="14" rx="2.5" />
            <path d="M16 12h2" strokeLinecap="round" />
            <path d="M2 9h20" strokeLinecap="round" />
          </svg>
        </div>
        <span className="text-[15px] font-bold text-white tracking-tight">
          FreeLance Trust
        </span>
      </div>

      {/* Wallet status / connect */}
      <button
        onClick={onConnectWallet}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
          walletConnected
            ? "bg-[#1a2e1a] border border-[#22c55e]/30 text-white hover:bg-[#1f3620]"
            : "bg-[#22c55e] text-black hover:bg-[#16a34a]"
        }`}
      >
        {walletConnected ? (
          <>
            <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
            Connected
          </>
        ) : (
          <>
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
          </>
        )}
      </button>
    </nav>
  );
}