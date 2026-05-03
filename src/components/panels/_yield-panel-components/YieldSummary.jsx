import React from "react";
import { DollarSign, Shield, BarChart3, TrendingUp } from "lucide-react";

export default function YieldSummary({
  walletUsdc,
  kaminoUsdc,
  totalKamino,
  avgApy,
}) {
  const items = [
    {
      label: "Wallet USDC",
      value: `$${walletUsdc.toFixed(2)}`,
      icon: DollarSign,
      color: "text-alpha-text",
    },
    {
      label: "Kamino USDC",
      value: `$${kaminoUsdc.toFixed(2)}`,
      icon: Shield,
      color: "text-alpha-blue",
    },
    {
      label: "Total Deployed",
      value: `$${totalKamino.toFixed(2)}`,
      icon: BarChart3,
      color: "text-alpha-success",
    },
    {
      label: "Avg APY",
      value: `${avgApy}%`,
      icon: TrendingUp,
      color: "text-alpha-success",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="bg-alpha-card border border-alpha-border rounded-xl p-3 min-w-0"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Icon className={`w-3.5 h-3.5 ${color}`} />
            <span className="text-[10px] text-alpha-muted font-mono uppercase truncate">
              {label}
            </span>
          </div>
          <div className={`text-lg font-bold font-mono ${color} truncate`}>
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}
