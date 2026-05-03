import { QUICKNODE_SOLANA, DIALECT_PROXY } from "../config";

async function rpc(method, params = []) {
  const res = await fetch(QUICKNODE_SOLANA, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!res.ok) throw new Error(`RPC ${method} failed: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "RPC error");
  return data.result;
}

export async function getSlot() {
  return rpc("getSlot");
}

export async function getEpochInfo() {
  return rpc("getEpochInfo");
}

export async function getRecentPerformanceSamples() {
  return rpc("getRecentPerformanceSamples", [4]);
}

export async function getBalance(pubkey) {
  const result = await rpc("getBalance", [pubkey]);
  return result?.value ?? 0;
}

export async function getTokenAccountsByOwner(pubkey) {
  const result = await rpc("getTokenAccountsByOwner", [
    pubkey,
    { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
    { encoding: "jsonParsed" },
  ]);
  return result?.value ?? [];
}

export async function simulateTransaction(txBase64) {
  const result = await rpc("simulateTransaction", [
    txBase64,
    {
      encoding: "base64",
      commitment: "confirmed",
      replaceRecentBlockhash: true,
    },
  ]);
  return result?.value ?? null;
}

export async function sendRawTransaction(txBase64) {
  return rpc("sendTransaction", [
    txBase64,
    {
      encoding: "base64",
      skipPreflight: false,
      preflightCommitment: "confirmed",
    },
  ]);
}

export async function getSignatureStatus(sig) {
  const result = await rpc("getSignatureStatuses", [
    [sig],
    { searchTransactionHistory: true },
  ]);
  return result?.value?.[0] ?? null;
}

export async function getLatestBlockhash() {
  return rpc("getLatestBlockhash", [{ commitment: "confirmed" }]);
}

// Compute TPS from performance samples
export async function computeTPS() {
  try {
    const samples = await getRecentPerformanceSamples();
    if (!samples?.length) return 0;
    const avg =
      samples.reduce((s, r) => s + r.numTransactions / r.samplePeriodSecs, 0) /
      samples.length;
    return Math.round(avg);
  } catch {
    return 0;
  }
}

// Fetch Jupiter prices via DIALECT_PROXY
export async function fetchPrices(mints) {
  const ids = mints.join(",");
  const res = await fetch(`${DIALECT_PROXY}/api.jup.ag/price/v3?ids=${ids}`);
  if (!res.ok) throw new Error("Price fetch failed");
  return res.json();
}

export async function confirmWithPolling(
  connection,
  signature,
  timeout = 60000,
) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const status = await getSignatureStatus(signature);
      if (
        status?.confirmationStatus === "confirmed" ||
        status?.confirmationStatus === "finalized"
      ) {
        if (status.err)
          throw new Error(`Transaction failed: ${JSON.stringify(status.err)}`);
        return status;
      }
    } catch (e) {
      if (e.message.includes("Transaction failed")) throw e;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Transaction confirmation timeout");
}
