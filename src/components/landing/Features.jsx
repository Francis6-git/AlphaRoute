import React from "react";
import {
  Shield,
  Zap,
  TrendingUp,
  BarChart3,
  ArrowDownToLine,
  Activity,
  Eye,
  RefreshCw,
} from "lucide-react";

const FEATURES = [
  {
    icon: Shield,
    title: "DFlow MEV Protection",
    desc: "Every trade routes through DFlow's order-flow auction, ensuring zero MEV extraction and optimal pricing across all Solana liquidity.",
    color: "text-alpha-success",
    border: "border-alpha-success/20 hover:border-alpha-success/40",
    glow: "bg-alpha-success/5",
    tag: "CORE",
  },
  {
    icon: Zap,
    title: "Alpha Score",
    desc: "Post-trade execution quality graded 0-100. Measures slippage, MEV savings, and route efficiency so you know exactly how well you traded.",
    color: "text-alpha-blue",
    border: "border-alpha-blue/20 hover:border-alpha-blue/40",
    glow: "bg-alpha-blue/5",
    tag: "UNIQUE",
  },
  {
    icon: TrendingUp,
    title: "Kamino Yield Engine",
    desc: "Idle capital earns in Kamino lending, multiply, and LP vaults. One-click withdraw to fund trades. Your balance is always productive.",
    color: "text-alpha-blue",
    border: "border-alpha-blue/20 hover:border-alpha-blue/40",
    glow: "bg-alpha-blue/5",
    tag: "STRATEGY",
  },
  {
    icon: ArrowDownToLine,
    title: "Dry Powder System",
    desc: "Pull USDC from Kamino vaults instantly when an opportunity appears. No more idle stablecoins sitting in your wallet losing value.",
    color: "text-alpha-success",
    border: "border-alpha-success/20 hover:border-alpha-success/40",
    glow: "bg-alpha-success/5",
    tag: "STRATEGY",
  },
  {
    icon: Activity,
    title: "Quicknode Data Layer",
    desc: "Real-time TPS, slot tracking, price tickers, and transaction simulation powered by Quicknode's high-performance Solana RPC infrastructure.",
    color: "text-alpha-text",
    border: "border-alpha-border hover:border-alpha-text/40",
    glow: "bg-alpha-text/5",
    tag: "INFRA",
  },
  {
    icon: BarChart3,
    title: "Execution Intelligence",
    desc: "Full analytics dashboard: volume by day, token distribution, execution score trends, and MEV protection history — all from your on-chain data.",
    color: "text-alpha-blue",
    border: "border-alpha-blue/20 hover:border-alpha-blue/40",
    glow: "bg-alpha-blue/5",
    tag: "ANALYTICS",
  },
  {
    icon: Eye,
    title: "Price Alerts + Auto-Trade",
    desc: "Set conditional triggers: when SOL hits $X, auto-swap via DFlow with optional Kamino vault funding. Intelligent execution, hands-free.",
    color: "text-alpha-alert",
    border: "border-alpha-alert/20 hover:border-alpha-alert/40",
    glow: "bg-alpha-alert/5",
    tag: "AUTOMATION",
  },
  {
    icon: RefreshCw,
    title: "Route Breakdown",
    desc: "See exactly how DFlow routes your order, which DEXs are hit, and how much MEV was prevented. Full transparency on every execution.",
    color: "text-alpha-success",
    border: "border-alpha-success/20 hover:border-alpha-success/40",
    glow: "bg-alpha-success/5",
    tag: "TRANSPARENCY",
  },
];

export default function Features() {
  return (
    <section className="py-20 md:py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-alpha-bg via-alpha-surface/50 to-alpha-bg pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-[11px] font-mono font-semibold text-alpha-blue uppercase tracking-widest">
            Architecture
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-alpha-text mt-3">
            Three Engines. One Terminal.
          </h2>
          <p className="text-alpha-dim mt-3 max-w-lg mx-auto">
            DFlow execution + Kamino yield + Quicknode data — tightly integrated
            so every action compounds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(
            ({ icon: Icon, title, desc, color, border, glow, tag }) => (
              <div
                key={title}
                className={`bg-alpha-card border ${border} rounded-xl p-5 transition-all duration-300 group`}
              >
                <div
                  className={`w-10 h-10 rounded-lg ${glow} flex items-center justify-center mb-3`}
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-bold text-alpha-text">{title}</h3>
                  <span className="text-[8px] font-mono font-bold text-alpha-muted bg-alpha-surface px-1.5 py-0.5 rounded">
                    {tag}
                  </span>
                </div>
                <p className="text-xs text-alpha-dim leading-relaxed">{desc}</p>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
