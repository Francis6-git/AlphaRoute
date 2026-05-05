import React, { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  BookOpen,
  RefreshCw,
  Loader2,
  ExternalLink,
  Shield,
  ShieldOff,
  ArrowRight,
  FlaskConical,
} from "lucide-react";
import { fetchTrades } from "../../services/database";
import { EXPLORER_BASE } from "../../config";
import { useDemoData } from "../../hooks/useDemoData";
import { toast } from "sonner";

function ScoreBadge({ score }) {
  const color =
    score >= 90
      ? "text-alpha-success bg-alpha-success/10 border-alpha-success/30"
      : score >= 70
        ? "text-alpha-blue bg-alpha-blue/10 border-alpha-blue/30"
        : "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${color}`}
    >
      {score}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    confirmed: "text-alpha-success bg-alpha-success/10",
    failed: "text-alpha-alert bg-alpha-alert/10",
    pending: "text-yellow-400 bg-yellow-400/10",
  };
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${map[status] || map.pending}`}
    >
      {status}
    </span>
  );
}

export default function HistoryPanel() {
  const { publicKey, connected } = useWallet();
  const { isDemo, demoTrades } = useDemoData();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 15;

  const load = useCallback(
    async (isBackground = false) => {
      if (isDemo) {
        setTrades(demoTrades);
        return;
      }
      if (!publicKey) return;
      if (!isBackground) setLoading(true);
      try {
        const data = await fetchTrades(publicKey.toBase58(), 200);
        setTrades(data);
      } catch (e) {
        if (!isBackground) {
          toast.error("Could not load trade history", {
            description: e.message,
          });
        }
      } finally {
        if (!isBackground) setLoading(false);
      }
    },
    [publicKey, isDemo, demoTrades],
  );

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 15000);
    return () => clearInterval(interval);
  }, [load]);

  if (!connected && !isDemo) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <BookOpen className="w-12 h-12 text-alpha-muted mb-4" />
        <h2 className="text-lg font-semibold text-alpha-text mb-2">
          Trade History
        </h2>
        <p className="text-sm text-alpha-dim text-center max-w-sm">
          Connect your wallet to view your complete trade execution history with
          Alpha Scores and MEV protection status.
        </p>
      </div>
    );
  }

  const paginated = trades.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(trades.length / PAGE_SIZE);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Demo banner */}
      {isDemo && (
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-xs text-yellow-400">
          <FlaskConical className="w-3.5 h-3.5 shrink-0" />
          Demo mode — {demoTrades.length} sample trades. Press{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-yellow-500/20 font-mono">
            Ctrl+Shift+D
          </kbd>{" "}
          to toggle.
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-alpha-text flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-alpha-blue" />
            Trade History
          </h2>
          <p className="text-xs text-alpha-dim mt-0.5">
            {trades.length} total execution{trades.length !== 1 ? "s" : ""}{" "}
            recorded.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2 rounded-lg bg-alpha-card border border-alpha-border hover:border-alpha-blue text-alpha-muted hover:text-alpha-blue transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && trades.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 text-alpha-blue animate-spin" />
        </div>
      ) : trades.length === 0 ? (
        <div className="bg-alpha-card border border-alpha-border rounded-xl p-8 text-center">
          <p className="text-sm text-alpha-dim">
            No trades yet. Execute a swap to start building your history.
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-alpha-card border border-alpha-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-alpha-border">
                    <th className="text-left px-4 py-2.5 text-[10px] text-alpha-muted font-mono uppercase tracking-wider">
                      Pair
                    </th>
                    <th className="text-right px-4 py-2.5 text-[10px] text-alpha-muted font-mono uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-right px-4 py-2.5 text-[10px] text-alpha-muted font-mono uppercase tracking-wider">
                      USD
                    </th>
                    <th className="text-center px-4 py-2.5 text-[10px] text-alpha-muted font-mono uppercase tracking-wider">
                      Score
                    </th>
                    <th className="text-center px-4 py-2.5 text-[10px] text-alpha-muted font-mono uppercase tracking-wider">
                      MEV
                    </th>
                    <th className="text-center px-4 py-2.5 text-[10px] text-alpha-muted font-mono uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-center px-4 py-2.5 text-[10px] text-alpha-muted font-mono uppercase tracking-wider">
                      Route
                    </th>
                    <th className="text-right px-4 py-2.5 text-[10px] text-alpha-muted font-mono uppercase tracking-wider">
                      Tx
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((t, i) => (
                    <tr
                      key={t.id || i}
                      className="border-b border-alpha-border/50 hover:bg-alpha-surface/50 transition-colors"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1 font-semibold text-alpha-text">
                          {t.input_token}{" "}
                          <ArrowRight className="w-3 h-3 text-alpha-muted" />{" "}
                          {t.output_token}
                        </div>
                        <div className="text-[10px] text-alpha-dim mt-0.5">
                          {t.created_at
                            ? new Date(t.created_at).toLocaleDateString("en", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-alpha-text">
                        {Number(t.input_amount || 0).toFixed(4)}
                        <span className="text-alpha-dim ml-1">
                          {t.input_token}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-alpha-dim">
                        ${Number(t.input_usd || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <ScoreBadge score={t.execution_score || 0} />
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {t.mev_protected ? (
                          <Shield className="w-3.5 h-3.5 text-alpha-success mx-auto" />
                        ) : (
                          <ShieldOff className="w-3.5 h-3.5 text-alpha-alert mx-auto" />
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <StatusBadge status={t.status || "confirmed"} />
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="text-[10px] font-mono text-alpha-dim uppercase">
                          {t.route_provider || "dflow"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {t.signature ? (
                          <a
                            href={`${EXPLORER_BASE}/tx/${t.signature}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-alpha-blue hover:text-alpha-success transition-colors font-mono"
                          >
                            {t.signature.slice(0, 8)}…
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-alpha-dim">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="alpha-btn-secondary text-[10px] px-3 py-1"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="alpha-btn-secondary text-[10px] px-3 py-1"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
