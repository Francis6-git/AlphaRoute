import React, { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Wallet,
  TrendingUp,
  ExternalLink,
  Loader2,
  ChevronRight,
  X,
} from "lucide-react";
import { TOKEN_LIST, EXPLORER_BASE } from "../../config";
import {
  // getMockPositions ,
  fetchLiveKaminoPositions,
} from "../../services/kamino";

// Internal UI shared by both Desktop and Mobile
const RailContent = ({
  balances,
  totalUsd,
  loading,
  kaminoTotal,
  deployableCapital,
  tokenEntries,
  kaminoPositions,
  onNavigateYield,
  publicKey,
}) => (
  <div className="flex flex-col h-full overflow-hidden">
    {/* Header */}
    <div className="p-4 border-b border-alpha-border shrink-0">
      <div className="flex items-center gap-2 mb-3">
        <Wallet className="w-4 h-4 text-alpha-blue" />
        <span className="text-xs font-semibold text-alpha-text uppercase tracking-wider">
          Portfolio
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-alpha-muted font-mono">WALLET</span>
          <span className="text-sm font-bold text-alpha-text font-mono">
            {loading ? "..." : `$${totalUsd.toFixed(2)}`}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-alpha-muted font-mono">
            KAMINO DEPLOYED
          </span>
          <span className="text-sm font-bold text-alpha-success font-mono">
            ${kaminoTotal.toFixed(2)}
          </span>
        </div>
        <div className="h-px bg-alpha-border my-1" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-alpha-blue font-mono font-semibold">
            DEPLOYABLE CAPITAL
          </span>
          <span className="text-sm font-bold text-alpha-blue font-mono">
            ${deployableCapital.toFixed(2)}
          </span>
        </div>
      </div>
    </div>

    {/* Scrollable Body */}
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      {/* Wallet Balances */}
      <div className="p-4 border-b border-alpha-border">
        <span className="text-[10px] text-alpha-muted font-mono uppercase tracking-wider">
          Wallet Balances
        </span>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-4 h-4 text-alpha-blue animate-spin" />
          </div>
        ) : tokenEntries.length === 0 ? (
          <p className="text-xs text-alpha-dim mt-3">
            No tokens found. Deposit funds to start trading.
          </p>
        ) : (
          <div className="space-y-1.5 mt-2">
            {tokenEntries.map(([sym, bal]) => {
              const token = TOKEN_LIST.find((t) => t.symbol === sym);
              return (
                <div
                  key={sym}
                  className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-alpha-card transition-all"
                >
                  {token?.icon ? (
                    <img
                      src={token.icon}
                      alt={sym}
                      className="w-5 h-5 rounded-full bg-alpha-card"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-alpha-card" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-alpha-text">
                      {sym}
                    </div>
                    <div className="text-[10px] text-alpha-dim font-mono">
                      {bal.uiAmount}
                    </div>
                  </div>
                  <div className="text-right text-xs text-alpha-text font-mono">
                    ${(bal.usdValue || 0).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Kamino Positions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-alpha-muted font-mono uppercase tracking-wider">
            Kamino Positions
          </span>
          <button
            onClick={onNavigateYield}
            className="text-[10px] text-alpha-blue hover:text-alpha-success flex items-center gap-0.5 transition-colors"
          >
            Manage <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {kaminoPositions.length === 0 ? (
          <p className="text-xs text-alpha-dim">No active positions.</p>
        ) : (
          <div className="space-y-2">
            {kaminoPositions.map((pos) => (
              <div
                key={pos.id}
                className="bg-alpha-card border border-alpha-border rounded-lg p-2.5"
              >
                <div className="flex justify-between text-xs mb-1">
                  <img
                    src={pos.icon}
                    alt={pos.token}
                    className="w-5 h-5 rounded-full bg-alpha-surface"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <span className="text-alpha-text font-semibold">
                    {pos.token}
                  </span>
                  <span className="font-mono">${pos.usdValue.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-alpha-success" />
                    <span className="text-alpha-success font-mono font-semibold">
                      {pos.apy}% APY
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${pos.health > 80 ? "bg-alpha-success" : pos.health > 50 ? "bg-yellow-400" : "bg-alpha-alert"}`}
                    />
                    <span className="text-alpha-dim">Health {pos.health}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Footer */}
    {publicKey && (
      <div className="p-3 border-t border-alpha-border bg-alpha-surface shrink-0">
        <a
          href={`${EXPLORER_BASE}/account/${publicKey.toBase58()}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 text-[10px] text-alpha-blue hover:text-alpha-success transition-colors font-mono"
        >
          <ExternalLink className="w-3 h-3" /> View on Solscan
        </a>
      </div>
    )}
  </div>
);

// MAIN EXPORT (Desktop)
export default function PortfolioRail(props) {
  const { publicKey } = useWallet();
  const [kaminoPositions, setKaminoPositions] = useState([]);
  const [kaminoLoading, setKaminoLoading] = useState(false);

  const loadKaminoData = useCallback(async () => {
    if (!publicKey) return;
    setKaminoLoading(true);
    const data = await fetchLiveKaminoPositions(publicKey.toBase58());
    setKaminoPositions(data);
    setKaminoLoading(false);
  }, [publicKey]);

  useEffect(() => {
    loadKaminoData();
  }, [loadKaminoData]);

  //  useEffect(() => {
  //    if (!publicKey) return;
  //    setKaminoPositions(getMockPositions(props.balances?.SOL?.price || 150));
  //  }, [publicKey, props.balances?.SOL?.price]);

  const kaminoTotal = kaminoPositions.reduce(
    (s, p) => s + (p.usdValue || 0),
    0,
  );

  const dataProps = {
    ...props,
    publicKey,
    kaminoPositions,
    kaminoTotal,
    kaminoLoading,
    deployableCapital: (props.totalUsd || 0) + kaminoTotal,
    tokenEntries: Object.entries(props.balances || {}).filter(
      ([, b]) => b.amount > 0,
    ),
  };

  return (
    <aside className="w-72 bg-alpha-surface border-l border-alpha-border flex-col shrink-0 hidden lg:flex h-full">
      <RailContent {...dataProps} />
    </aside>
  );
}

// MOBILE EXPORT
export function MobilePortfolioRail({ isOpen, onClose, ...props }) {
  const { publicKey } = useWallet();
  const [kaminoPositions, setKaminoPositions] = useState([]);
  const [kaminoLoading, setKaminoLoading] = useState(false);

  const loadKaminoData = useCallback(async () => {
    if (!publicKey || !isOpen) return;
    setKaminoLoading(true);
    const data = await fetchLiveKaminoPositions(publicKey.toBase58());
    setKaminoPositions(data);
    setKaminoLoading(false);
  }, [publicKey, isOpen]);

  useEffect(() => {
    loadKaminoData();
  }, [loadKaminoData]);

  //  useEffect(() => {
  //    if (!publicKey || !isOpen) return;
  //    setKaminoPositions(getMockPositions(props.balances?.SOL?.price || 150));
  //  }, [publicKey, props.balances?.SOL?.price, isOpen]);

  if (!isOpen) return null;

  const kaminoTotal = kaminoPositions.reduce(
    (s, p) => s + (p.usdValue || 0),
    0,
  );

  const dataProps = {
    ...props,
    publicKey,
    kaminoPositions,
    kaminoTotal,
    kaminoLoading,
    deployableCapital: (props.totalUsd || 0) + kaminoTotal,
    tokenEntries: Object.entries(props.balances || {}).filter(
      ([, b]) => b.amount > 0,
    ),
  };

  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-80 bg-alpha-surface border-l border-alpha-border shadow-2xl animate-slide-in-right">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-alpha-muted hover:text-alpha-text"
        >
          <X className="w-5 h-5" />
        </button>
        <RailContent {...dataProps} />
      </div>
    </div>
  );
}
