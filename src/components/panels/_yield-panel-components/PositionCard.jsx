import React from "react";
import { TrendingUp, ArrowUpFromLine, Loader2 } from "lucide-react";

export default function PositionCard({ pos, isWithdrawing, onWithdraw }) {
  return (
    <div className="bg-alpha-card border border-alpha-border rounded-xl p-4 hover:border-alpha-blue/30 transition-all">
      <div className="flex items-start gap-3 min-w-0">
        <img
          src={pos.icon}
          alt={pos.token}
          className="w-8 h-8 rounded-full bg-alpha-surface mt-0.5 shrink-0"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1 gap-2">
            <div className="min-w-0">
              <span className="text-sm font-semibold text-alpha-text truncate block">
                {pos.token}
              </span>
              <span className="text-[10px] text-alpha-dim font-mono block">
                {pos.type}
              </span>
            </div>
            <span className="text-sm font-bold text-alpha-text font-mono shrink-0">
              ${pos.usdValue.toFixed(2)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mb-3">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-alpha-success" />
              <span className="text-alpha-success font-mono font-semibold">
                {pos.apy}% APY
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  pos.health > 80
                    ? "bg-alpha-success"
                    : pos.health > 50
                      ? "bg-yellow-400"
                      : "bg-alpha-alert"
                }`}
              />
              <span className="text-alpha-dim whitespace-nowrap">
                Health {pos.health}/100
              </span>
            </div>
            {pos.leverage && (
              <span className="text-alpha-blue font-mono whitespace-nowrap">
                {pos.leverage}x leverage
              </span>
            )}
          </div>

          {/* ROI tracker bar */}
          <div className="mb-2">
            <div className="flex justify-between text-[10px] text-alpha-dim mb-1">
              <span>ROI since deposit</span>
              <span className="text-alpha-success font-mono">
                +{(pos.apy / 12).toFixed(2)}% (30d est.)
              </span>
            </div>
            <div className="h-1 bg-alpha-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-alpha-blue to-alpha-success rounded-full transition-all"
                style={{ width: `${Math.min(100, pos.apy * 2)}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                onWithdraw(pos.id, pos.token.split("/")[0].split("-")[0], 100)
              }
              disabled={isWithdrawing}
              className="alpha-btn-secondary flex items-center gap-1 text-[10px] py-1.5 px-3"
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" /> Withdrawing
                </>
              ) : (
                <>
                  <ArrowUpFromLine className="w-3 h-3" /> Withdraw 100%
                </>
              )}
            </button>
            <button
              onClick={() =>
                onWithdraw(pos.id, pos.token.split("/")[0].split("-")[0], 50)
              }
              disabled={isWithdrawing}
              className="alpha-btn-secondary flex items-center gap-1 text-[10px] py-1.5 px-3"
            >
              <ArrowUpFromLine className="w-3 h-3" /> 50%
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
