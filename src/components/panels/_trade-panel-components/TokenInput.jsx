import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import TokenSelectModal from "./TokenSelectModal";

export default function TokenInput({
  label,
  token,
  amount,
  onAmountChange,
  onTokenChange,
  balance,
  maxBalance,
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-alpha-surface border border-alpha-border rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-alpha-muted uppercase">
          {label}
        </span>
        {balance !== undefined && (
          <button
            className="text-[10px] text-alpha-blue hover:text-alpha-success mono"
            onClick={() => maxBalance && onAmountChange(String(maxBalance))}
          >
            BAL: {typeof balance === "number" ? balance.toFixed(4) : balance}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-alpha-card border border-alpha-border rounded-lg px-2.5 py-1.5 hover:border-alpha-blue transition-all shrink-0"
        >
          <img
            src={token.icon}
            alt={token.symbol}
            className="w-5 h-5 rounded-full bg-alpha-surface"
            onError={(e) => {
              e.target.src =
                "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><circle cx=%2212%22 cy=%2212%22 r=%2212%22 fill=%22%231e3a5f%22/></svg>";
            }}
          />
          <span className="text-sm font-semibold text-alpha-text">
            {token.symbol}
          </span>
          <ChevronDown className="w-3 h-3 text-alpha-muted" />
        </button>

        <input
          type="number"
          className="flex-1 w-full min-w-0 bg-transparent text-right text-base sm:text-lg font-bold text-alpha-text placeholder-alpha-muted focus:outline-none"
          placeholder="0.00"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          min="0"
          step="any"
        />
      </div>
      {showModal && (
        <TokenSelectModal
          currentMint={token.mint}
          onSelect={(t) => {
            onTokenChange(t);
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
