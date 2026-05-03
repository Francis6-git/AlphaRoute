import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Activity } from "lucide-react";
import PriceTicker from "../PriceTicker";
import AlphaRouteLogo from "./Logo";

export default function TopBar({ stats }) {
  return (
    <header className="h-14 md:h-16 bg-alpha-surface border-b border-alpha-border flex items-center px-3 md:px-4 gap-2 md:gap-4 shrink-0">
      <div className="flex items-center gap-2 shrink-0">
        <AlphaRouteLogo className="w-8 md:w-10 h-8 md:h-10" />
        <span className="text-sm font-bold text-alpha-text hidden sm:inline">
          AlphaRoute
        </span>
      </div>

      <div className="hidden md:block w-px h-6 bg-alpha-border" />

      {/* Ticker: Hidden on Mobile TopBar */}
      <div className="flex-1 min-w-0">
        <PriceTicker stats={stats} className="hidden lg:flex" />
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Simplified TPS for mobile */}
        <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-mono">
          <Activity className="w-3 h-3 text-alpha-muted hidden xs:block" />
          <span className="text-alpha-success">
            {stats.tps.toLocaleString()}{" "}
            <span className="hidden md:inline">TPS</span>
          </span>
        </div>

        <div className="w-px h-6 bg-alpha-border hidden sm:block" />
        <WalletMultiButton />
      </div>
    </header>
  );
}
