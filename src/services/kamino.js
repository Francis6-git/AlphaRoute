import {
  DIALECT_PROXY,
  KAMINO_MAIN_MARKET,
  KAMINO_RESERVES,
  SOL_USDC_VAULT,
  KAMINO_MULTIPLY_PAIRS,
} from "../config";
import { VersionedTransaction, Transaction } from "@solana/web3.js";

// Sign and send a single blink transaction
async function executeBlink(url, walletPublicKey, extraBody = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "transaction",
      account: walletPublicKey,
      ...extraBody,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Kamino blink error: ${res.status}`);
  }
  return res.json();
}

// ── MARKETS (Lending) ──────────────────────────────────────────────────────

export async function kaminoLendDeposit({ token, amount, walletPublicKey }) {
  const reserve = KAMINO_RESERVES[token];
  if (!reserve) throw new Error(`No reserve for ${token}`);
  return executeBlink(
    `${DIALECT_PROXY}/kamino.dial.to/api/v0/lending/reserve/${KAMINO_MAIN_MARKET}/${reserve}/deposit?amount=${amount}`,
    walletPublicKey,
  );
}

export async function kaminoLendWithdraw({
  token,
  percentage = 100,
  walletPublicKey,
}) {
  const reserve = KAMINO_RESERVES[token];
  if (!reserve) throw new Error(`No reserve for ${token}`);
  return executeBlink(
    `${DIALECT_PROXY}/kamino.dial.to/api/v0/lending/reserve/${KAMINO_MAIN_MARKET}/${reserve}/withdraw?percentage=${percentage}`,
    walletPublicKey,
  );
}

export async function kaminoBorrow({ token, amount, walletPublicKey }) {
  const reserve = KAMINO_RESERVES[token];
  if (!reserve) throw new Error(`No reserve for ${token}`);
  return executeBlink(
    `${DIALECT_PROXY}/kamino.dial.to/api/v0/lending/reserve/${KAMINO_MAIN_MARKET}/${reserve}/borrow?amount=${amount}`,
    walletPublicKey,
  );
}

export async function kaminoRepay({
  token,
  percentage = 100,
  walletPublicKey,
}) {
  const reserve = KAMINO_RESERVES[token];
  if (!reserve) throw new Error(`No reserve for ${token}`);
  return executeBlink(
    `${DIALECT_PROXY}/kamino.dial.to/api/v0/lending/reserve/${KAMINO_MAIN_MARKET}/${reserve}/repay?percentage=${percentage}`,
    walletPublicKey,
  );
}

// ── LIQUIDITY VAULT ────────────────────────────────────────────────────────

export async function kaminoLiquidityDeposit({
  side = "A",
  amount,
  walletPublicKey,
}) {
  return executeBlink(
    `${DIALECT_PROXY}/kamino.dial.to/api/v0/liquidity/${SOL_USDC_VAULT}/deposit?side=${side}&amount=${amount}`,
    walletPublicKey,
  );
}

export async function kaminoLiquidityWithdraw({
  percentage = 100,
  walletPublicKey,
}) {
  return executeBlink(
    `${DIALECT_PROXY}/kamino.dial.to/api/v0/liquidity/${SOL_USDC_VAULT}/withdraw?percentage=${percentage}`,
    walletPublicKey,
  );
}

// ── MULTIPLY ───────────────────────────────────────────────────────────────

export async function kaminoMultiplySetup({ pair, walletPublicKey }) {
  const params = KAMINO_MULTIPLY_PAIRS[pair];
  if (!params) throw new Error(`Unknown pair ${pair}`);
  const url = `${DIALECT_PROXY}/kamino.dial.to/api/v0/multiply/${KAMINO_MAIN_MARKET}/setup?collTokenMint=${params.collTokenMint}&debtTokenMint=${params.debtTokenMint}`;
  return executeBlink(url, walletPublicKey);
}

export async function kaminoMultiplyDeposit({
  pair,
  leverage,
  amount,
  walletPublicKey,
}) {
  const params = KAMINO_MULTIPLY_PAIRS[pair];
  if (!params) throw new Error(`Unknown pair ${pair}`);
  const url = `${DIALECT_PROXY}/kamino.dial.to/api/v0/multiply/${KAMINO_MAIN_MARKET}/deposit?collTokenMint=${params.collTokenMint}&debtTokenMint=${params.debtTokenMint}&leverage=${leverage}&amount=${amount}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "transactions", account: walletPublicKey }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.message || `Kamino multiply deposit error: ${res.status}`,
    );
  }
  return res.json(); // { transactions: [...] }
}

export async function kaminoMultiplyWithdraw({
  pair,
  percentage = 100,
  walletPublicKey,
}) {
  const params = KAMINO_MULTIPLY_PAIRS[pair];
  if (!params) throw new Error(`Unknown pair ${pair}`);
  const url = `${DIALECT_PROXY}/kamino.dial.to/api/v0/multiply/${KAMINO_MAIN_MARKET}/withdraw?collTokenMint=${params.collTokenMint}&debtTokenMint=${params.debtTokenMint}&percentage=${percentage}`;
  return executeBlink(url, walletPublicKey);
}

// ── LEVERAGE ───────────────────────────────────────────────────────────────

export async function kaminoLeverageSetup({
  collTokenMint,
  debtTokenMint,
  walletPublicKey,
}) {
  const url = `${DIALECT_PROXY}/kamino.dial.to/api/v0/leverage/${KAMINO_MAIN_MARKET}/setup?collTokenMint=${collTokenMint}&debtTokenMint=${debtTokenMint}`;
  return executeBlink(url, walletPublicKey);
}

export async function kaminoOpenPosition({
  collTokenMint,
  debtTokenMint,
  leverage,
  amount,
  walletPublicKey,
}) {
  const url = `${DIALECT_PROXY}/kamino.dial.to/api/v0/leverage/${KAMINO_MAIN_MARKET}/openPosition?collTokenMint=${collTokenMint}&debtTokenMint=${debtTokenMint}&leverage=${leverage}&amount=${amount}`;
  return executeBlink(url, walletPublicKey);
}

export async function kaminoClosePosition({
  collTokenMint,
  debtTokenMint,
  walletPublicKey,
}) {
  const url = `${DIALECT_PROXY}/kamino.dial.to/api/v0/leverage/${KAMINO_MAIN_MARKET}/closePosition?collTokenMint=${collTokenMint}&debtTokenMint=${debtTokenMint}&percentage=100`;
  return executeBlink(url, walletPublicKey);
}

// ── TX HELPERS ─────────────────────────────────────────────────────────────

export function deserializeTx(base64) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  try {
    return VersionedTransaction.deserialize(bytes);
  } catch {
    return Transaction.from(bytes);
  }
}

// Fetch Kamino blink metadata for UI display
export async function fetchBlinkMeta(path) {
  try {
    const res = await fetch(`${DIALECT_PROXY}/kamino.dial.to/api/${path}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * For a production build, @kamino-finance/kaminisdk fetch implementation using their data API for speed.
 */
export async function fetchLiveKaminoPositions(walletPublicKey) {
  try {
    // You can use Kamino's public data API or your own indexer
    const response = await fetch(
      `https://api.kamino.finance/v1/users/${walletPublicKey}/positions`,
    );
    if (!response.ok) throw new Error("Failed to fetch Kamino positions");

    const data = await response.json();

    // Map their API response to your UI structure
    return data.positions.map((p) => ({
      id: p.obligationId || p.vaultId,
      type: p.strategyType, // e.g., 'Lend', 'Multiply', 'LP'
      token: p.symbol,
      amount: parseFloat(p.amount),
      usdValue: parseFloat(p.usdValue),
      apy: parseFloat(p.apy),
      health: p.healthFactor || 100,
      icon: p.mintAddress
        ? `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${p.mintAddress}/logo.png`
        : "",
      leverage: p.leverage || null,
    }));
  } catch (error) {
    console.error("Error fetching live positions:", error);
    return []; // Return empty so UI doesn't crash
  }
}

// Mock Kamino position data (would be fetched from on-chain in production)
export function getMockPositions(solPrice) {
  const sp = solPrice || 150;
  return [
    {
      id: "lend-usdc",
      type: "Lend",
      token: "USDC",
      amount: 2450.0,
      usdValue: 2450.0,
      apy: 5.8,
      health: 92,
      icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
    },
    {
      id: "multiply-jitosol",
      type: "Multiply 3x",
      token: "JitoSOL/SOL",
      amount: 1.5,
      usdValue: 1.5 * sp * 3,
      apy: 14.2,
      leverage: 3,
      health: 78,
      icon: "https://storage.googleapis.com/token-metadata/JitoSOL-256.png",
    },
    {
      id: "lp-solusdc",
      type: "LP Vault",
      token: "SOL-USDC",
      amount: 0.8,
      usdValue: 0.8 * sp + 120,
      apy: 22.5,
      health: 95,
      icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    },
  ];
}
