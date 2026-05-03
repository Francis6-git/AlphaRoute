import React from "react";
import { TOKENS } from "../config";

export default function PriceTicker({ stats, className = "" }) {
  const items = [
    { sym: "SOL", mint: TOKENS.SOL.mint, d: 2 },
    { sym: "JUP", mint: TOKENS.JUP.mint, d: 3 },
    { sym: "JTO", mint: TOKENS.JTO.mint, d: 3 },
    {
      sym: "BONK",
      mint: TOKENS.BONK.mint,
      d: 4,
      multiplier: 1e5,
      suffix: "/100k",
    },
  ];

  const fmt = (v, d = 2) => (v ? `$${Number(v).toFixed(d)}` : "—");

  return (
    <div
      className={`flex items-center gap-5 text-xs font-mono overflow-x-auto no-scrollbar scroll-smooth ${className}`}
    >
      {items.map(({ sym, mint, d, multiplier, suffix }) => {
        const data = stats.prices[mint];
        const rawPrice = data?.usdPrice;
        const price = multiplier
          ? rawPrice
            ? rawPrice * multiplier
            : null
          : rawPrice;
        const change = data?.priceChange24h;
        const isPos = (change || 0) >= 0;

        return (
          <div key={sym} className="flex items-center gap-1.5 shrink-0 px-1">
            <span className="text-alpha-dim">{sym}</span>
            <span className="text-alpha-text font-semibold">
              {fmt(price, d)}
              {suffix || ""}
            </span>
            {change !== undefined && (
              <span
                className={isPos ? "text-alpha-success" : "text-alpha-alert"}
              >
                {isPos ? "+" : ""}
                {Number(change).toFixed(2)}%
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Mobile Price Ticker
export function MobilePriceTicker({ stats, className = "" }) {
  const items = [
    { sym: "SOL", mint: TOKENS.SOL.mint, d: 2 },
    { sym: "JUP", mint: TOKENS.JUP.mint, d: 3 },
    { sym: "JTO", mint: TOKENS.JTO.mint, d: 3 },
    {
      sym: "BONK",
      mint: TOKENS.BONK.mint,
      d: 4,
      multiplier: 1e5,
      suffix: "/100k",
    },
  ];

  const fmt = (v, d = 2) => (v ? `$${Number(v).toFixed(d)}` : "—");

  return (
    <div className={`grid grid-cols-2 gap-2 mt-4 ${className}`}>
      {items.map(({ sym, mint, d, multiplier, suffix }) => {
        const data = stats?.prices?.[mint];
        const rawPrice = data?.usdPrice;
        const price = multiplier
          ? rawPrice
            ? rawPrice * multiplier
            : null
          : rawPrice;
        const change = data?.priceChange24h;
        const isPos = (change || 0) >= 0;

        return (
          <div
            key={sym}
            className="flex flex-col p-3 bg-alpha-surface border border-alpha-border rounded-xl transition-all active:scale-95"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-alpha-muted uppercase tracking-tighter">
                {sym}
              </span>
              {change !== undefined && (
                <span
                  className={`text-[10px] font-mono ${isPos ? "text-alpha-success" : "text-alpha-alert"}`}
                >
                  {isPos ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-alpha-text font-mono truncate">
              {fmt(price, d)}
              <span className="text-[10px] opacity-50 ml-0.5">
                {suffix || ""}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
