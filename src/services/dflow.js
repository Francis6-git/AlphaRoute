import { DFLOW_PROXY, DIALECT_PROXY } from "../config";
import { VersionedTransaction, Transaction } from "@solana/web3.js";

// Get a DFlow swap order — returns transaction + order metadata
export async function getDFlowOrder({
  inputMint,
  outputMint,
  amount,
  walletPublicKey,
  slippageBps = "auto",
}) {
  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount: String(amount),
    userPublicKey: walletPublicKey,
    slippageBps,
    prioritizationFeeLamports: "auto",
    wrapAndUnwrapSol: "true",
  });

  const res = await fetch(
    `${DFLOW_PROXY}/e.quote-api.dflow.net/order?${params}`,
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `DFlow order failed: ${res.status}`);
  }
  return res.json();
}

// Get DFlow order status by signature
export async function getDFlowOrderStatus(signature) {
  const res = await fetch(
    `${DFLOW_PROXY}/e.quote-api.dflow.net/order-status?signature=${signature}`,
  );
  if (!res.ok) throw new Error("Order status fetch failed");
  return res.json();
}

// Deserialize a base64 transaction (versioned or legacy)
export function deserializeTransaction(base64Tx) {
  const bytes = Uint8Array.from(atob(base64Tx), (c) => c.charCodeAt(0));
  try {
    return VersionedTransaction.deserialize(bytes);
  } catch {
    return Transaction.from(bytes);
  }
}

// Serialize a signed transaction to base64
export function serializeTransaction(tx) {
  return btoa(String.fromCharCode(...tx.serialize()));
}

// Jupiter Ultra swap (fallback) - step 1: order
export async function getJupiterOrder({
  inputMint,
  outputMint,
  amount,
  walletPublicKey,
}) {
  const res = await fetch(
    `${DIALECT_PROXY}/api.jup.ag/ultra/v1/order?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&taker=${walletPublicKey}`,
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Jupiter order failed: ${res.status}`);
  }
  return res.json();
}

// Jupiter Ultra swap - step 3: execute
export async function executeJupiterSwap({ requestId, signedTransaction }) {
  const res = await fetch(`${DIALECT_PROXY}/api.jup.ag/ultra/v1/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestId, signedTransaction }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Jupiter execute failed: ${res.status}`);
  }
  return res.json();
}

// Calculate execution quality score (0-100)
export function calcExecutionScore({ slippage, mevSaved, routeSteps }) {
  let score = 100;
  if (slippage > 0.5) score -= 10;
  if (slippage > 1) score -= 15;
  if (!mevSaved) score -= 5;
  if (routeSteps > 3) score -= 5;
  return Math.max(50, score);
}

// Token search via Jupiter
export async function searchTokens(query) {
  const res = await fetch(
    `${DIALECT_PROXY}/api.jup.ag/ultra/v1/search?query=${encodeURIComponent(query)}`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data)
    ? data.map((t) => ({
        mint: t.id,
        symbol: t.symbol,
        name: t.name,
        decimals: t.decimals,
        icon: t.icon,
        isVerified: t.isVerified,
        daily_volume: t.daily_volume,
      }))
    : [];
}

// Fetch token prices
export async function fetchTokenPrices(mints) {
  if (!mints.length) return {};
  const res = await fetch(
    `${DIALECT_PROXY}/api.jup.ag/price/v3?ids=${mints.join(",")}`,
  );
  if (!res.ok) return {};
  return res.json();
}

// Human-readable error messages
export function parseTradeError(error) {
  const msg = error?.message || String(error);
  if (
    msg.includes("slippage") ||
    msg.includes("0x1788") ||
    msg.includes("SlippageTolerance")
  ) {
    return "Slippage exceeded. Price moved too fast. Try increasing slippage tolerance.";
  }
  if (msg.includes("insufficient") || msg.includes("Insufficient")) {
    return "Insufficient balance. Please check your wallet has enough funds including SOL for fees.";
  }
  if (msg.includes("NO_ROUTES") || msg.includes("No routes")) {
    return "No liquidity found for this trading pair. Try a different route or smaller amount.";
  }
  if (
    msg.includes("rejected") ||
    msg.includes("User rejected") ||
    msg.includes("Rejected")
  ) {
    return "Transaction cancelled in wallet.";
  }
  if (msg.includes("timeout") || msg.includes("Timeout")) {
    return "Transaction timed out. Check your wallet — it may have still gone through.";
  }
  if (msg.includes("simulation") || msg.includes("SimulateTransaction")) {
    return "Transaction simulation failed. Ensure you have sufficient balance.";
  }
  if (msg.includes("address table") || msg.includes("lookup table")) {
    return "Address lookup table error. Please try again.";
  }
  return `Trade failed: ${msg.slice(0, 120)}`;
}
