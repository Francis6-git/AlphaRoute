import React, { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Bell,
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  ArrowUp,
  ArrowDown,
  X,
  Zap,
  FlaskConical,
  Pencil,
} from "lucide-react";
import { TOKEN_LIST, TOKENS } from "../../config";
import { saveAlert, fetchAlerts, deleteAlert } from "../../services/database";
import { useDemoData } from "../../hooks/useDemoData";
import { toast } from "sonner";

export default function AlertsPanel({ balances, onTriggerTrade }) {
  const { publicKey, connected } = useWallet();
  const { isDemo, demoAlerts } = useDemoData();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  // Create form state
  const [selectedToken, setSelectedToken] = useState(TOKENS.SOL);
  const [direction, setDirection] = useState("above");
  const [targetPrice, setTargetPrice] = useState("");
  const [action, setAction] = useState("notify");
  const [tradeOutputToken, setTradeOutputToken] = useState(TOKENS.USDC);
  const [tradeAmount, setTradeAmount] = useState("");
  const [kaminoWithdraw, setKaminoWithdraw] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const loadAlerts = useCallback(
    async (isBackground = false) => {
      if (isDemo) {
        setAlerts(demoAlerts);
        return;
      }
      if (!publicKey) return;
      if (!isBackground) setLoading(true);
      try {
        const data = await fetchAlerts(publicKey.toBase58());
        setAlerts(data);
      } catch (e) {
        if (!isBackground) {
          toast.error("Could not load alerts", { description: e.message });
        }
      } finally {
        if (!isBackground) setLoading(false);
      }
    },
    [publicKey, isDemo, demoAlerts],
  );

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(() => loadAlerts(true), 15000);
    return () => clearInterval(interval);
  }, [loadAlerts]);

  const handleCreate = async () => {
    if (!publicKey || !targetPrice || parseFloat(targetPrice) <= 0) return;
    if (action === "trade" && (!tradeAmount || parseFloat(tradeAmount) <= 0)) {
      toast.error("Enter a valid trade amount");
      return;
    }

    setCreating(true);
    const toastId = toast.loading("Creating your price alert…");

    try {
      const alertData = {
        wallet: publicKey.toBase58(),
        tokenMint: selectedToken.mint,
        tokenSymbol: selectedToken.symbol,
        targetPrice: parseFloat(targetPrice),
        direction,
        action,
        tradeInputMint: action === "trade" ? selectedToken.mint : null,
        tradeOutputMint: action === "trade" ? tradeOutputToken.mint : null,
        tradeAmount: action === "trade" ? parseFloat(tradeAmount) : null,
        kaminoWithdraw,
        kaminoVaultId: null,
      };

      await saveAlert(alertData);

      toast.success(
        `Alert set — ${selectedToken.symbol} ${direction} $${parseFloat(targetPrice).toLocaleString()}`,
        {
          id: toastId,
          description:
            action === "trade"
              ? "Auto-trade will execute via DFlow MEV protection."
              : "You will be notified when the price is reached.",
        },
      );

      setTargetPrice("");
      setTradeAmount("");
      setShowCreate(false);
      loadAlerts();
    } catch (err) {
      toast.error("Failed to create alert", {
        id: toastId,
        description: err.message?.slice(0, 80),
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    // Optimistic removal
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    const toastId = toast.loading("Deleting alert…");

    try {
      await deleteAlert(id);
      toast.success("Alert removed", { id: toastId });
    } catch (err) {
      loadAlerts(); // rollback
      toast.error("Could not delete alert", {
        id: toastId,
        description: err.message,
      });
    }
  };

  const handleEditInitiation = (alert) => {
    setEditingId(alert.id);
    setSelectedToken(TOKEN_LIST.find((t) => t.mint === alert.token_mint));
    setTargetPrice(alert.target_price);
    setDirection(alert.direction);
    setAction(alert.action);
    setTradeAmount(alert.trade_amount || "");
    setShowCreate(true);
  };

  //  Alert Monitor
  // This watches the prices and triggers alerts while the app is open.
  useEffect(() => {
    if (!alerts.length || isDemo) return;

    alerts.forEach((alert) => {
      if (alert.status !== "active") return;

      const currentPrice = balances[alert.token_symbol]?.price;
      if (!currentPrice) return;

      const isTriggered =
        alert.direction === "above"
          ? currentPrice >= alert.target_price
          : currentPrice <= alert.target_price;

      if (isTriggered) {
        // Trigger notification
        toast.info(`Alert Triggered: ${alert.token_symbol}`, {
          description: `${alert.token_symbol} is now $${currentPrice.toFixed(4)} (${alert.direction} $${alert.target_price})`,
          action:
            alert.action === "trade"
              ? {
                  label: "Execute Trade",
                  onClick: () => {
                    onTriggerTrade({
                      inputSymbol: alert.token_symbol,
                      outputSymbol: alert.trade_output_symbol,
                      tradeAmount: alert.trade_amount,
                    });
                    toast.success("Initiating auto-trade...");
                  },
                }
              : null,
          duration: 10000,
        });

        // Update status in DB (optimistic)
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === alert.id ? { ...a, status: "triggered" } : a,
          ),
        );
        import("../../services/database").then((db) =>
          db.updateAlertStatus(alert.id, "triggered"),
        );
      }
    });
  }, [alerts, balances, isDemo]);

  if (!connected && !isDemo) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <Bell className="w-12 h-12 text-alpha-muted mb-4" />
        <h2 className="text-lg font-semibold text-alpha-text mb-2">
          Price Alerts
        </h2>
        <p className="text-sm text-alpha-dim text-center max-w-sm">
          Connect your wallet to create price alerts with optional auto-trade
          execution via DFlow MEV protection.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Demo banner */}
      {isDemo && (
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-xs text-yellow-400">
          <FlaskConical className="w-3.5 h-3.5 shrink-0" />
          Demo mode — sample data only. Press{" "}
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
            <Bell className="w-5 h-5 text-alpha-blue" />
            Price Alerts
          </h2>
          <p className="text-xs text-alpha-dim mt-0.5">
            {alerts.length} active alert{alerts.length !== 1 ? "s" : ""}.
            Auto-trade triggers execute via DFlow MEV protection.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadAlerts}
            disabled={loading}
            className="p-2 rounded-lg bg-alpha-card border border-alpha-border hover:border-alpha-blue text-alpha-muted hover:text-alpha-blue transition-all"
            title="Refresh alerts"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          {!isDemo && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="alpha-btn-primary flex items-center gap-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              New Alert
            </button>
          )}
        </div>
      </div>

      {/* Create Form */}
      {showCreate && !isDemo && (
        <div className="bg-alpha-card border border-alpha-blue/30 rounded-xl p-4 space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-alpha-text">
              Create Alert
            </h3>
            <button
              onClick={() => setShowCreate(false)}
              className="text-alpha-muted hover:text-alpha-text"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Token selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-alpha-muted font-mono uppercase block mb-1">
                Token
              </label>
              <select
                value={selectedToken.symbol}
                onChange={(e) =>
                  setSelectedToken(
                    TOKEN_LIST.find((t) => t.symbol === e.target.value) ||
                      TOKENS.SOL,
                  )
                }
                className="alpha-input w-full"
              >
                {TOKEN_LIST.map((t) => (
                  <option key={t.mint} value={t.symbol}>
                    {t.symbol} — {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-alpha-muted font-mono uppercase block mb-1">
                Condition
              </label>
              <div className="flex gap-1">
                <button
                  onClick={() => setDirection("above")}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all border ${
                    direction === "above"
                      ? "bg-alpha-success/10 text-alpha-success border-alpha-success/40"
                      : "bg-alpha-surface text-alpha-muted border-alpha-border hover:text-alpha-text"
                  }`}
                >
                  <ArrowUp className="w-3 h-3" /> Above
                </button>
                <button
                  onClick={() => setDirection("below")}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all border ${
                    direction === "below"
                      ? "bg-alpha-alert/10 text-alpha-alert border-alpha-alert/40"
                      : "bg-alpha-surface text-alpha-muted border-alpha-border hover:text-alpha-text"
                  }`}
                >
                  <ArrowDown className="w-3 h-3" /> Below
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-alpha-muted font-mono uppercase block mb-1">
                Target Price ($)
              </label>
              <input
                type="number"
                className="alpha-input w-full"
                placeholder="0.00"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                min="0"
                step="any"
              />
            </div>
          </div>

          {/* Action */}
          <div>
            <label className="text-[10px] text-alpha-muted font-mono uppercase block mb-1">
              Action
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setAction("notify")}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border ${
                  action === "notify"
                    ? "bg-alpha-blue/10 text-alpha-blue border-alpha-blue/40"
                    : "bg-alpha-surface text-alpha-muted border-alpha-border hover:text-alpha-text"
                }`}
              >
                Notify Only
              </button>
              <button
                onClick={() => setAction("trade")}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border flex items-center justify-center gap-1 ${
                  action === "trade"
                    ? "bg-alpha-success/10 text-alpha-success border-alpha-success/40"
                    : "bg-alpha-surface text-alpha-muted border-alpha-border hover:text-alpha-text"
                }`}
              >
                <Zap className="w-3 h-3" /> Auto-Trade
              </button>
            </div>
          </div>

          {/* Auto-trade config */}
          {action === "trade" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-alpha-surface border border-alpha-border rounded-xl p-3">
              <div>
                <label className="text-[10px] text-alpha-muted font-mono uppercase block mb-1">
                  Swap To
                </label>
                <select
                  value={tradeOutputToken.symbol}
                  onChange={(e) =>
                    setTradeOutputToken(
                      TOKEN_LIST.find((t) => t.symbol === e.target.value) ||
                        TOKENS.USDC,
                    )
                  }
                  className="alpha-input w-full"
                >
                  {TOKEN_LIST.filter((t) => t.mint !== selectedToken.mint).map(
                    (t) => (
                      <option key={t.mint} value={t.symbol}>
                        {t.symbol}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-alpha-muted font-mono uppercase block mb-1">
                  Amount ({selectedToken.symbol})
                </label>
                <input
                  type="number"
                  className="alpha-input w-full"
                  placeholder="0.00"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  min="0"
                  step="any"
                />
              </div>
              {/* <div className="sm:col-span-2">
                <label className="flex items-center gap-2 text-xs text-alpha-dim cursor-pointer">
                  <input
                    type="checkbox"
                    checked={kaminoWithdraw}
                    onChange={(e) => setKaminoWithdraw(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-alpha-border bg-alpha-surface accent-alpha-blue"
                  />
                  Auto-withdraw from Kamino vault to fund trade
                </label>
              </div> */}
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={creating || !targetPrice || parseFloat(targetPrice) <= 0}
            className="alpha-btn-primary w-full flex items-center justify-center gap-2 text-sm"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creating…
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Create Alert
              </>
            )}
          </button>
        </div>
      )}

      {/* Active Alerts List */}
      {loading && alerts.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 text-alpha-blue animate-spin" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-alpha-card border border-alpha-border rounded-xl p-8 text-center">
          <Bell className="w-8 h-8 text-alpha-muted mx-auto mb-3" />
          <p className="text-sm text-alpha-dim">
            No active alerts. Create one to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((a) => (
            <div
              key={a.id}
              className="bg-alpha-card border border-alpha-border rounded-xl p-3 hover:border-alpha-blue/30 transition-all"
            >
              <div className="flex items-center gap-3">
                {/* Token + direction */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      a.direction === "above"
                        ? "bg-alpha-success/10"
                        : "bg-alpha-alert/10"
                    }`}
                  >
                    {a.direction === "above" ? (
                      <ArrowUp className="w-4 h-4 text-alpha-success" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-alpha-alert" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-alpha-text">
                      {a.token_symbol} {a.direction === "above" ? ">" : "<"} $
                      {Number(a.target_price).toFixed(4)}
                    </div>
                    <div className="text-[10px] text-alpha-dim">
                      {a.action === "trade" ? (
                        <span className="text-alpha-success">
                          Auto-trade {a.trade_amount} {a.token_symbol}
                          {a.kamino_withdraw ? " (Kamino funded)" : ""}
                        </span>
                      ) : (
                        "Notify only"
                      )}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                    a.status === "active"
                      ? "text-alpha-success bg-alpha-success/10"
                      : a.status === "triggered"
                        ? "text-alpha-blue bg-alpha-blue/10"
                        : "text-alpha-dim bg-alpha-surface"
                  }`}
                >
                  {a.status || "active"}
                </span>

                <div className="flex gap-1">
                  {/* Edit Icon */}
                  {!isDemo && (
                    <button
                      onClick={() => handleEditInitiation(a)}
                      className="p-1.5 rounded-lg hover:bg-alpha-blue/10 text-alpha-muted hover:text-alpha-blue transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />{" "}
                    </button>
                  )}

                  {/* Delete — disabled in demo mode */}
                  {!isDemo && (
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1.5 rounded-lg hover:bg-alpha-alert/10 text-alpha-muted hover:text-alpha-alert transition-all"
                      title="Delete alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
