/**
 * useDemoData — Global demo mode system for AlphaRoute
 *
 * HOW TO USE:
 *   1. Toggle via keyboard: Ctrl + Shift + D  (works anywhere in the app)
 *   2. Or call: localStorage.setItem('ar_demo', '1') then reload
 *   3. A golden "DEMO" badge appears in the top-bar when active
 *
 * In components:
 *   const { isDemo, demoTrades, demoAlerts, demoPositions, demoStats } = useDemoData();
 */

import { useState, useEffect, useCallback } from "react";

const DEMO_KEY = "ar_demo";

// ── Demo Trades ───────────────────────────────────────────────────────────────
const buildDemoTrades = () => {
  const now = Date.now();
  const day = 86_400_000;
  const pairs = [
    ["SOL", "USDC", "dflow", true, 97],
    ["USDC", "JUP", "dflow", true, 92],
    ["JUP", "SOL", "jupiter", false, 74],
    ["SOL", "BONK", "dflow", true, 88],
    ["BONK", "USDC", "dflow", true, 91],
    ["USDC", "WIF", "dflow", true, 95],
    ["WIF", "SOL", "jupiter", false, 67],
    ["SOL", "USDT", "dflow", true, 93],
    ["USDT", "RAY", "jupiter", true, 82],
    ["RAY", "SOL", "dflow", true, 89],
    ["SOL", "JitoSOL", "jupiter", true, 96],
    ["JitoSOL", "USDC", "dflow", true, 94],
    ["USDC", "mSOL", "jupiter", true, 78],
    ["mSOL", "SOL", "dflow", true, 90],
    ["SOL", "JTO", "dflow", true, 85],
  ];

  return pairs.map(([inp, out, prov, mev, score], i) => ({
    id: `demo-${i}`,
    wallet: "DeMoWa11et1111111111111111111111111111111111",
    input_token: inp,
    output_token: out,
    input_amount: +(Math.random() * 10 + 0.5).toFixed(4),
    output_amount: +(Math.random() * 500 + 10).toFixed(4),
    input_usd: +(Math.random() * 800 + 50).toFixed(2),
    output_usd: +(Math.random() * 800 + 50).toFixed(2),
    route_provider: prov,
    execution_score: score,
    slippage_bps: Math.round(Math.random() * 50 + 5),
    mev_protected: mev,
    signature: `5${Array.from({ length: 87 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789"[Math.floor(Math.random() * 58)]).join("")}`,
    status: "confirmed",
    created_at: new Date(now - day * (i * 0.7 + Math.random())).toISOString(),
  }));
};

// ── Demo Alerts ───────────────────────────────────────────────────────────────
const DEMO_ALERTS = [
  {
    id: "alert-demo-1",
    wallet: "DeMoWa11et1111111111111111111111111111111111",
    token_mint: "So11111111111111111111111111111111111111112",
    token_symbol: "SOL",
    target_price: 200,
    direction: "above",
    action: "notify",
    trade_amount: null,
    kamino_withdraw: false,
    status: "active",
    created_at: new Date(Date.now() - 3_600_000).toISOString(),
  },
  {
    id: "alert-demo-2",
    wallet: "DeMoWa11et1111111111111111111111111111111111",
    token_mint: "So11111111111111111111111111111111111111112",
    token_symbol: "SOL",
    target_price: 140,
    direction: "below",
    action: "trade",
    trade_amount: 50,
    kamino_withdraw: true,
    status: "active",
    created_at: new Date(Date.now() - 7_200_000).toISOString(),
  },
  {
    id: "alert-demo-3",
    wallet: "DeMoWa11et1111111111111111111111111111111111",
    token_mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    token_symbol: "JUP",
    target_price: 1.2,
    direction: "above",
    action: "notify",
    trade_amount: null,
    kamino_withdraw: false,
    status: "triggered",
    created_at: new Date(Date.now() - 86_400_000).toISOString(),
  },
];

// ── Demo Kamino Positions ─────────────────────────────────────────────────────
export const buildDemoPositions = (solPrice = 165) => [
  {
    id: "demo-lend-usdc",
    type: "Lend",
    token: "USDC",
    amount: 2450.0,
    usdValue: 2450.0,
    apy: 5.8,
    health: 92,
    icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  },
  {
    id: "demo-multiply-jitosol",
    type: "Multiply 3x",
    token: "JitoSOL/SOL",
    amount: 1.5,
    usdValue: +(1.5 * solPrice * 3).toFixed(2),
    apy: 14.2,
    leverage: 3,
    health: 78,
    icon: "https://storage.googleapis.com/token-metadata/JitoSOL-256.png",
  },
  {
    id: "demo-lp-solusdc",
    type: "LP Vault",
    token: "SOL-USDC",
    amount: 0.8,
    usdValue: +(0.8 * solPrice + 120).toFixed(2),
    apy: 22.5,
    health: 95,
    icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  },
];

// ── Demo Trade Stats (for Intelligence Panel) ─────────────────────────────────
const buildDemoStats = (trades) => {
  const totalVolume = trades.reduce((s, t) => s + (t.input_usd || 0), 0);
  const avgScore = Math.round(
    trades.reduce((s, t) => s + (t.execution_score || 0), 0) / trades.length,
  );
  const mevProtected = trades.filter((t) => t.mev_protected).length;
  const byToken = {};
  trades.forEach((t) => {
    byToken[t.input_token] = (byToken[t.input_token] || 0) + (t.input_usd || 0);
  });
  return {
    totalTrades: trades.length,
    totalVolume,
    avgExecutionScore: avgScore,
    mevProtectedPct: Math.round((mevProtected / trades.length) * 100),
    topTokens: Object.entries(byToken)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    recentTrades: trades.slice(0, 10),
  };
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useDemoData() {
  const [isDemo, setIsDemo] = useState(
    () => localStorage.getItem(DEMO_KEY) === "1",
  );

  // Keyboard shortcut: Ctrl + Shift + D
  const handleKey = useCallback(
    (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        const next = !isDemo;
        if (next) {
          localStorage.setItem(DEMO_KEY, "1");
        } else {
          localStorage.removeItem(DEMO_KEY);
        }
        setIsDemo(next);
      }
    },
    [isDemo],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // Stable memo: build demo data only when isDemo is true
  const demoTrades = isDemo ? buildDemoTrades() : [];
  const demoAlerts = isDemo ? DEMO_ALERTS : [];
  const demoPositions = isDemo ? buildDemoPositions() : [];
  const demoStats = isDemo ? buildDemoStats(buildDemoTrades()) : null;

  const toggleDemo = () => {
    const next = !isDemo;
    if (next) {
      localStorage.setItem(DEMO_KEY, "1");
    } else {
      localStorage.removeItem(DEMO_KEY);
    }
    setIsDemo(next);
  };

  return { isDemo, toggleDemo, demoTrades, demoAlerts, demoPositions, demoStats };
}

export { DEMO_ALERTS, buildDemoTrades, buildDemoStats };
