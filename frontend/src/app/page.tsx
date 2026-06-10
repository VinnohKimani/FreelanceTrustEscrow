"use client";

import { useState } from "react";
import {
  rpc as SorobanRpc,
  Contract,
  Keypair,
  nativeToScVal,
  Address,
  TransactionBuilder,
  Networks,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import Navbar from "@/components/navbar";
import EscrowForm from "@/components/escrow-form";
import StatusPanel from "@/components/status-panel";
import LandingHero from "@/components/landing-hero";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const CONTRACT_ID = "CCOKOZWYOXYRQLKMQMXIHP644DOS67VIJKH3JRQWW5NUOKQBKSO7MEDI";
const RPC_URL = "https://soroban-testnet.stellar.org";


const NATIVE_TOKEN_ID =
  "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

const server = new SorobanRpc.Server(RPC_URL, { allowHttp: false });

function accountToScVal(address: string) {
  return new Address(address).toScVal();
}


async function invokeContract(
  methodName: string,
  args: any[],
  signerSecrets: string[],
): Promise<SorobanRpc.Api.GetSuccessfulTransactionResponse> {
  if (signerSecrets.length === 0) {
    throw new Error("At least one signer secret is required.");
  }

  const primaryKeypair = Keypair.fromSecret(signerSecrets[0]);
  const account = await server.getAccount(primaryKeypair.publicKey());
  const contract = new Contract(CONTRACT_ID);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call(methodName, ...args))
    .setTimeout(30)
    .build();

  const simResult = await server.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(simResult)) {
    throw new Error(`Simulation failed: ${simResult.error}`);
  }

  const preparedTx = SorobanRpc.assembleTransaction(tx, simResult).build();
  for (const secret of signerSecrets) {
    preparedTx.sign(Keypair.fromSecret(secret));
  }

  const sendResult = await server.sendTransaction(preparedTx);
  if (sendResult.status === "ERROR") {
    throw new Error(`Submit failed: ${JSON.stringify(sendResult.errorResult)}`);
  }

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


export default function Page() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [escrowData, setEscrowData] = useState({
    client: "",
    freelancer: "",
    arbiter: "",
    amount: "",
  });
  const [clientSecret, setClientSecret] = useState("");
  const [escrowStatus, setEscrowStatus] = useState<
    "pending" | "funded" | "disputed" | "released"
  >("pending");
  const [balance, setBalance] = useState(0);
  const [txPending, setTxPending] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  const handleConnectWallet = () => setWalletConnected((prev) => !prev);

  const handleInitializeEscrow = async (
    data: typeof escrowData,
    secret: string,
  ) => {
    setTxError(null);
    setTxPending(true);
    try {
      const amountXlm = parseFloat(data.amount) || 0;
      const amountStroops = BigInt(Math.round(amountXlm * 1e7));

      const args = [
        accountToScVal(data.client), 
        accountToScVal(data.freelancer), 
        accountToScVal(data.arbiter), 
        accountToScVal(NATIVE_TOKEN_ID), 
        nativeToScVal(amountStroops, { type: "i128" }),
      ];

   
      await invokeContract("initialize", args, [secret]);

      setEscrowData(data);
      setClientSecret(secret);
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

 
  const handleReleaseFunds = async () => {
    setTxError(null);
    setTxPending(true);
    try {
      await invokeContract("release_funds", [], [clientSecret]);
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

  const handleFileDispute = async () => {
    setTxError(null);
    setTxPending(true);
    try {
      await invokeContract("file_dispute", [], [clientSecret]);
      setEscrowStatus("disputed");
    } catch (err: unknown) {
      setTxError(
        `Dispute failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setTxPending(false);
    }
  };

  if (!walletConnected) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <LandingHero onConnectWallet={handleConnectWallet} />
      </div>
    );
  }

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
