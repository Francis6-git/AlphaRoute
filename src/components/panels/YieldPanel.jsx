import React, { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { TrendingUp, ArrowDownToLine, RefreshCw, Loader2, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { Connection } from "@solana/web3.js";
import { SOLANA_RPC_PROXY } from "../../config";
import {
  fetchLiveKaminoPositions,
  kaminoLendWithdraw,
  kaminoLiquidityWithdraw,
  deserializeTx,
} from "../../services/kamino";
import { confirmWithPolling } from "../../services/quicknode";
import { parseTradeError } from "../../services/dflow";
import { useDemoData, buildDemoPositions } from "../../hooks/useDemoData";

// Sub-components
import YieldSummary from "../panels/_yield-panel-components/YieldSummary";
import PositionCard from "../panels/_yield-panel-components/PositionCard";

const connection = new Connection(SOLANA_RPC_PROXY, {
  commitment: "confirmed",
  wsEndpoint: "",
});

export default function YieldPanel({ balances, refreshBalances }) {
  const { publicKey, signTransaction, connected } = useWallet();
  const { isDemo } = useDemoData();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionState, setActionState] = useState({});

  const loadPositions = useCallback(async () => {
    // Demo mode: use mock positions
    if (isDemo) {
      const solPrice = balances?.SOL?.price || 165;
      setPositions(buildDemoPositions(solPrice));
      return;
    }
    if (!publicKey) return;
    setLoading(true);
    try {
      const livePositions = await fetchLiveKaminoPositions(publicKey.toBase58());
      setPositions(livePositions);
    } catch (err) {
      toast.error("Failed to sync Kamino positions", {
        description: err.message?.slice(0, 80),
      });
    } finally {
      setLoading(false);
    }
  }, [publicKey, isDemo, balances?.SOL?.price]);

  useEffect(() => {
    loadPositions();
  }, [loadPositions]);

  const handleWithdraw = async (posId, token, percentage = 100) => {
    if (!publicKey || !signTransaction) return;
    if (isDemo) {
      toast.info("Demo mode — withdrawal disabled");
      return;
    }

    const toastId = toast.loading("Processing Withdrawal…", {
      description: `Preparing to withdraw ${token} from Kamino.`,
    });
    const autoDismiss = setTimeout(() => toast.dismiss(toastId), 60000);

    setActionState((s) => ({ ...s, [posId]: "withdrawing" }));

    try {
      const result = await kaminoLendWithdraw({
        token,
        percentage,
        walletPublicKey: publicKey.toBase58(),
      });

      if (result.transaction) {
        const tx = deserializeTx(result.transaction);
        const signed = await signTransaction(tx);

        toast.loading("Confirming on-chain…", { id: toastId });

        const sig = await connection.sendRawTransaction(signed.serialize(), {
          skipPreflight: true,
        });
        await confirmWithPolling(connection, sig);

        clearTimeout(autoDismiss);
        toast.success("Withdrawal Successful", {
          id: toastId,
          description: `Withdrew ${percentage}% of ${token} from Kamino lending.`,
          action: {
            label: "View",
            onClick: () => window.open(`https://solscan.io/tx/${sig}`, "_blank"),
          },
        });

        if (refreshBalances) refreshBalances();
        loadPositions();
      } else {
        clearTimeout(autoDismiss);
        toast.error("Withdrawal Failed", {
          id: toastId,
          description: result.message || "Protocol could not generate a transaction.",
        });
      }
    } catch (e) {
      clearTimeout(autoDismiss);
      console.error("Withdraw error:", e);
      toast.error("Withdraw Failed", {
        id: toastId,
        description: parseTradeError(e),
      });
    } finally {
      setActionState((s) => ({ ...s, [posId]: null }));
    }
  };

  const handlePullFromKamino = async () => {
    if (!publicKey || !signTransaction) return;
    if (isDemo) {
      toast.info("Demo mode — pull disabled");
      return;
    }

    const toastId = toast.loading("Pulling USDC…", {
      description: "Accessing Kamino liquidity vault.",
    });
    const autoDismiss = setTimeout(() => toast.dismiss(toastId), 60000);

    setActionState((s) => ({ ...s, pullUsdc: "withdrawing" }));

    try {
      const result = await kaminoLiquidityWithdraw({
        percentage: 100,
        walletPublicKey: publicKey.toBase58(),
      });

      if (result.transaction) {
        const tx = deserializeTx(result.transaction);
        const signed = await signTransaction(tx);

        toast.loading("Broadcasting transaction…", { id: toastId });

        const sig = await connection.sendRawTransaction(signed.serialize(), {
          skipPreflight: true,
        });
        await confirmWithPolling(connection, sig);

        clearTimeout(autoDismiss);
        toast.success("USDC Pulled Successfully", {
          id: toastId,
          description: "USDC withdrawn from Kamino liquidity vault to wallet.",
          action: {
            label: "View",
            onClick: () => window.open(`https://solscan.io/tx/${sig}`, "_blank"),
          },
        });

        if (refreshBalances) refreshBalances();
        loadPositions();
      } else {
        clearTimeout(autoDismiss);
        toast.error("Pull Failed", {
          id: toastId,
          description: result.message || "Protocol could not generate a transaction.",
        });
      }
    } catch (e) {
      clearTimeout(autoDismiss);
      console.error("Pull error:", e);
      toast.error("Pull from Kamino Failed", {
        id: toastId,
        description: parseTradeError(e),
      });
    } finally {
      setActionState((s) => ({ ...s, pullUsdc: null }));
    }
  };

  const walletUsdc = balances?.USDC?.amount || 0;
  const kaminoUsdc = positions.find((p) => p.token === "USDC")?.amount || 0;
  const totalKamino = positions.reduce((s, p) => s + (p.usdValue || 0), 0);
  const avgApy = positions.length
    ? (positions.reduce((s, p) => s + p.apy, 0) / positions.length).toFixed(1)
    : "0.0";

  if (!connected && !isDemo) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <TrendingUp className="w-12 h-12 text-alpha-muted mb-4" />
        <h2 className="text-lg font-semibold text-alpha-text mb-2">
          Kamino Yield Optimizer
        </h2>
        <p className="text-sm text-alpha-dim text-center max-w-sm">
          Connect your wallet to view Kamino positions, manage dry powder, and
          optimize yield across your capital.
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
          Demo mode — sample Kamino positions. Withdraw buttons are disabled.
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-alpha-text flex items-center gap-2">
            Kamino Optimizer
          </h2>
          <p className="text-xs text-alpha-dim mt-0.5">
            Manage yield positions and deploy capital for trades.
          </p>
        </div>
        <button
          onClick={loadPositions}
          className="p-2 rounded-lg bg-alpha-card border border-alpha-border hover:border-alpha-blue text-alpha-muted hover:text-alpha-blue transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Summary cards */}
      <YieldSummary
        walletUsdc={walletUsdc}
        kaminoUsdc={kaminoUsdc}
        totalKamino={totalKamino}
        avgApy={avgApy}
      />

      {/* One-Click Pull from Kamino */}
      <div className="bg-alpha-card border border-alpha-blue/30 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-alpha-text flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4 text-alpha-blue" />
              Dry Powder — Pull from Kamino
            </h3>
            <p className="text-xs text-alpha-dim mt-0.5">
              Instantly withdraw USDC from Kamino to fund DFlow trades.
              Currently{" "}
              <span className="text-alpha-blue font-mono">
                ${kaminoUsdc.toFixed(2)}
              </span>{" "}
              available.
            </p>
          </div>
          <button
            onClick={handlePullFromKamino}
            disabled={kaminoUsdc <= 0 || actionState.pullUsdc === "withdrawing"}
            className="alpha-btn-primary flex items-center gap-2 text-xs whitespace-nowrap"
          >
            {actionState.pullUsdc === "withdrawing" ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Withdrawing...
              </>
            ) : (
              <>
                <ArrowDownToLine className="w-3.5 h-3.5" /> Pull USDC
              </>
            )}
          </button>
        </div>
      </div>

      {/* Positions */}
      <div>
        <h3 className="text-sm font-semibold text-alpha-text mb-3">
          Active Positions
        </h3>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 text-alpha-blue animate-spin" />
          </div>
        ) : positions.length === 0 ? (
          <div className="bg-alpha-card border border-alpha-border rounded-xl p-6 text-center">
            <p className="text-sm text-alpha-dim">
              No active Kamino positions. Deposit to start earning yield.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {positions.map((pos) => (
              <PositionCard
                key={pos.id}
                pos={pos}
                isWithdrawing={actionState[pos.id] === "withdrawing"}
                onWithdraw={handleWithdraw}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
