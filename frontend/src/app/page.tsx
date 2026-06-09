"use client";

import { useState } from "react";
import {
  rpc as SorobanRpc,
  Contract,
  Keypair,
  nativeToScVal,
  TransactionBuilder,
  Networks,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import Navbar from "@/components/navbar";
import EscrowForm from "@/components/escrow-form";
import StatusPanel from "@/components/status-panel";
import LandingHero from "@/components/landing-hero";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// Your deployed Soroban contract address on Testnet.
const CONTRACT_ID = "CCOKOZWYOXYRQLKMQMXIHP644DOS67VIJKH3JRQWW5NUOKQBKSO7MEDI";

// Stellar Testnet RPC endpoint.
const RPC_URL = "https://soroban-testnet.stellar.org";

// ⚠️  REPLACE THIS with your real funded Testnet secret key.
// Generate + fund one at: https://laboratory.stellar.org/#account-creator
// It looks like: SCZANGBA5TNMQ2XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
const SIGNER_SECRET = "PASTE_YOUR_SECRET_KEY_HERE";
// ─────────────────────────────────────────────────────────────────────────────

const server = new SorobanRpc.Server(RPC_URL, { allowHttp: false });

/**
 * Encode a Stellar G... account address as a Soroban ScVal.
 * Uses nativeToScVal with type "address" — works across all SDK versions
 * and correctly handles both G... account and C... contract addresses.
 */
function accountToScVal(address: string) {
  return nativeToScVal(address, { type: "address" });
}

/**
 * Invoke a Soroban contract method and poll until confirmed.
 */
async function invokeContract(
  methodName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any[],
  signerSecret: string = SIGNER_SECRET,
): Promise<SorobanRpc.Api.GetSuccessfulTransactionResponse> {
  const keypair = Keypair.fromSecret(signerSecret);
  const account = await server.getAccount(keypair.publicKey());
  const contract = new Contract(CONTRACT_ID);

  // 1. Build
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call(methodName, ...args))
    .setTimeout(30)
    .build();

  // 2. Simulate — obtains resource footprint + fee
  const simResult = await server.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(simResult)) {
    throw new Error(`Simulation failed: ${simResult.error}`);
  }

  // 3. Assemble (injects auth + updated fee), sign, submit
  const preparedTx = SorobanRpc.assembleTransaction(tx, simResult).build();
  preparedTx.sign(keypair);

  const sendResult = await server.sendTransaction(preparedTx);
  if (sendResult.status === "ERROR") {
    throw new Error(`Submit failed: ${JSON.stringify(sendResult.errorResult)}`);
  }

  // 4. Poll for confirmation (up to 60 s)
  const hash = sendResult.hash;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const poll = await server.getTransaction(hash);
    if (poll.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
      return poll as SorobanRpc.Api.GetSuccessfulTransactionResponse;
    }
    if (poll.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
      throw new Error(`Transaction failed: ${JSON.stringify(poll)}`);
    }
  }
  throw new Error("Transaction confirmation timeout after 60 s.");
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [escrowData, setEscrowData] = useState({
    client: "",
    freelancer: "",
    arbiter: "",
    amount: "",
  });
  const [escrowStatus, setEscrowStatus] = useState<
    "pending" | "funded" | "disputed" | "released"
  >("pending");
  const [balance, setBalance] = useState(0);
  const [txPending, setTxPending] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  const handleConnectWallet = () => setWalletConnected((prev) => !prev);

  // ── Initialize ───────────────────────────────────────────────────────────
  const handleInitializeEscrow = async (data: typeof escrowData) => {
    setTxError(null);
    setTxPending(true);
    try {
      const amountXlm = parseFloat(data.amount) || 0;
      // Contract expects i128 stroops (1 XLM = 10_000_000 stroops)
      const amountStroops = BigInt(Math.round(amountXlm * 1e7));

      const args = [
        accountToScVal(data.client), // client  → Address ScVal
        accountToScVal(data.freelancer), // freelancer → Address ScVal
        accountToScVal(data.arbiter), // arbiter → Address ScVal
        nativeToScVal(amountStroops, { type: "i128" }), // amount → i128
      ];

      await invokeContract("initialize", args);

      // Update UI only after on-chain confirmation
      setEscrowData(data);
      setEscrowStatus("funded");
      setBalance(amountXlm);
    } catch (err: unknown) {
      setTxError(
        `Initialize failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setTxPending(false);
    }
  };

  // ── Release ──────────────────────────────────────────────────────────────
  const handleReleaseFunds = async () => {
    setTxError(null);
    setTxPending(true);
    try {
      await invokeContract("release_funds", []);
      setEscrowStatus("released");
      setBalance(0);
    } catch (err: unknown) {
      setTxError(
        `Release failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setTxPending(false);
    }
  };

  // ── Dispute ──────────────────────────────────────────────────────────────
  const handleFileDispute = async () => {
    setTxError(null);
    setTxPending(true);
    try {
      await invokeContract("file_dispute", []);
      setEscrowStatus("disputed");
    } catch (err: unknown) {
      setTxError(
        `Dispute failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setTxPending(false);
    }
  };

  // ── Not connected → Landing ──────────────────────────────────────────────
  if (!walletConnected) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <LandingHero onConnectWallet={handleConnectWallet} />
      </div>
    );
  }

  // ── Connected → Dashboard ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar
        walletConnected={walletConnected}
        onConnectWallet={handleConnectWallet}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Error banner */}
        {txError && (
          <div className="mb-6 rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-3 text-sm text-red-400">
            {txError}
          </div>
        )}

        {/* Pending banner */}
        {txPending && (
          <div className="mb-6 rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-white/40">
            ⏳ Waiting for on-chain confirmation…
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <EscrowForm onSubmit={handleInitializeEscrow} disabled={txPending} />
          <StatusPanel
            balance={balance}
            status={escrowStatus}
            escrowData={escrowData}
            onReleaseFunds={handleReleaseFunds}
            onFileDispute={handleFileDispute}
            disabled={txPending}
          />
        </div>
      </main>
    </div>
  );
}
