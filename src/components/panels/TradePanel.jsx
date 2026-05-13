import React, { useState, useEffect, useCallback, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction, Connection } from "@solana/web3.js";
import {
  ArrowDownUp,
  Shield,
  Zap,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { TOKENS, SOLANA_RPC_PROXY } from "../../config";
import {
  getDFlowOrder,
  getJupiterOrder,
  executeJupiterSwap,
  deserializeTransaction,
  parseTradeError,
  calcExecutionScore,
} from "../../services/dflow";
import { saveTrade } from "../../services/database";
import { confirmWithPolling } from "../../services/quicknode";

import TokenInput from "../panels/_trade-panel-components/TokenInput";
import { MobilePriceTicker } from "../PriceTicker";

const SLIPPAGE_PRESETS = [0.1, 0.5, 1.0, 2.0];
const connection = new Connection(SOLANA_RPC_PROXY, {
  commitment: "confirmed",
});

export default function TradePanel({
  balances,
  stats,
  onTradeComplete,
  initialTradeData,
  clearInitialData,
}) {
  const { publicKey, signTransaction, connected } = useWallet();

  const [inputToken, setInputToken] = useState(TOKENS.SOL);
  const [outputToken, setOutputToken] = useState(TOKENS.USDC);
  const [inputAmount, setInputAmount] = useState("");
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [customSlippage, setCustomSlippage] = useState("");
  const [provider, setProvider] = useState("dflow"); // 'dflow' | 'jupiter'
  const [mevProtect, setMevProtect] = useState(true);
  const [txState, setTxState] = useState("idle"); // 'idle'|'quoting'|'signing'|'sending'|'confirming'|'done'|'error'
  const [txResult, setTxResult] = useState(null);
  const [txError, setTxError] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [lastExec, setLastExec] = useState(null);

  const quoteTimer = useRef(null);

  const getSlippageBps = useCallback(() => {
    const s = customSlippage ? parseFloat(customSlippage) : slippage;
    return Math.round(s * 100);
  }, [slippage, customSlippage]);

  const fetchQuote = useCallback(async () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0 || !publicKey) return;
    setQuoteLoading(true);
    setQuote(null);
    setQuoteError("");
    try {
      const rawAmount = Math.floor(
        parseFloat(inputAmount) * Math.pow(10, inputToken.decimals),
      );
      if (provider === "dflow") {
        const order = await getDFlowOrder({
          inputMint: inputToken.mint,
          outputMint: outputToken.mint,
          amount: rawAmount,
          walletPublicKey: publicKey.toBase58(),
          slippageBps: mevProtect ? "auto" : String(getSlippageBps()),
        });
        const outAmt = order.outAmount / Math.pow(10, outputToken.decimals);
        const inUsd = order.inAmountUsd || 0;
        const outUsd = order.outAmountUsd || 0;
        const slippagePct = Math.abs((outUsd / inUsd - 1) * 100) || 0;
        setQuote({
          transaction: order.transaction,
          requestId: null,
          outAmount: outAmt,
          inUsd,
          outUsd,
          slippage: slippagePct,
          priceImpact: order.priceImpactPct || 0,
          route: order.routePlan || [],
          provider: "dflow",
          raw: order,
        });
      } else {
        const order = await getJupiterOrder({
          inputMint: inputToken.mint,
          outputMint: outputToken.mint,
          amount: rawAmount,
          walletPublicKey: publicKey.toBase58(),
        });
        const outAmt =
          (order.outAmount || order.outputAmount || 0) /
          Math.pow(10, outputToken.decimals);
        setQuote({
          transaction: order.transaction,
          requestId: order.requestId,
          outAmount: outAmt,
          inUsd: 0,
          outUsd: 0,
          slippage: 0,
          priceImpact: 0,
          route: [],
          provider: "jupiter",
          raw: order,
        });
      }
    } catch (e) {
      console.error("[fetchQuote]", e.message);
      const msg = e.message || "Quote unavailable";
      setQuoteError(
        msg.includes("NO_ROUTES") || msg.includes("No routes")
          ? "No route found for this pair. Try a different token or smaller amount."
          : msg.includes("insufficient") || msg.includes("Insufficient")
            ? "Insufficient liquidity for this amount."
            : `Quote error: ${msg.slice(0, 80)}`,
      );
    } finally {
      setQuoteLoading(false);
    }
  }, [
    inputAmount,
    inputToken,
    outputToken,
    provider,
    publicKey,
    mevProtect,
    getSlippageBps,
  ]);

  useEffect(() => {
    if (initialTradeData) {
      // Find the token objects from config
      const tokenIn = TOKENS[initialTradeData.inputSymbol] || TOKENS.SOL;
      const tokenOut = TOKENS[initialTradeData.outputSymbol] || TOKENS.USDC;

      setInputToken(tokenIn);
      setOutputToken(tokenOut);
      setInputAmount(initialTradeData.tradeAmount.toString());

      clearInitialData();

      toast.success("Trade data imported from Alert");
    }
  }, [initialTradeData, clearInitialData]);

  useEffect(() => {
    clearTimeout(quoteTimer.current);
    setQuoteError("");
    if (inputAmount && parseFloat(inputAmount) > 0) {
      quoteTimer.current = setTimeout(fetchQuote, 800);
    } else {
      setQuote(null);
    }
    return () => clearTimeout(quoteTimer.current);
  }, [inputAmount, inputToken, outputToken, provider, fetchQuote]);

  const swapTokens = () => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setInputAmount(quote ? String(quote.outAmount.toFixed(6)) : "");
    setQuote(null);
  };

  const executeTrade = async () => {
    if (!quote || !publicKey || !signTransaction) return;

    const toastId = toast.loading("AlphaRoute Execution Initialized", {
      description: `Routing ${inputAmount} ${inputToken.symbol} → ${outputToken.symbol} via ${quote.provider.toUpperCase()}`,
    });

    // SAFETY: If the process hangs, force-close the toast and reset UI state after 90s
    const autoDismiss = setTimeout(() => {
      toast.dismiss(toastId);
      setTxState("idle");
    }, 60000);

    setTxState("signing");
    setTxError("");

    try {
      let signature;

      if (quote.provider === "jupiter" && quote.requestId) {
        // --- JUPITER ULTRA FLOW ---
        const tx = deserializeTransaction(quote.transaction);
        const { blockhash } = await connection.getLatestBlockhash();

        if (tx instanceof VersionedTransaction) {
          tx.message.recentBlockhash = blockhash;
        } else {
          tx.recentBlockhash = blockhash;
          tx.feePayer = publicKey;
        }

        const signed = await signTransaction(tx);
        const signedB64 = btoa(String.fromCharCode(...signed.serialize()));

        setTxState("sending");
        toast.loading("Broadcasting to Jupiter Ultra...", { id: toastId });

        const result = await executeJupiterSwap({
          requestId: quote.requestId,
          signedTransaction: signedB64,
        });
        signature = result.signature;
      } else {
        // --- DFLOW / DIRECT FLOW ---
        const tx = deserializeTransaction(quote.transaction);

        // Only set blockhash if it's a legacy transaction;
        // DFlow VersionedTxs usually come with a fresh blockhash
        if (tx instanceof VersionedTransaction) {
          // Optional: Re-fetch blockhash if simulation fails frequently
        } else {
          const { blockhash } = await connection.getLatestBlockhash();
          tx.recentBlockhash = blockhash;
          tx.feePayer = publicKey;
        }

        const signed = await signTransaction(tx);

        setTxState("sending");
        toast.loading("Broadcasting to DFlow MEV Layer...", { id: toastId });

        const rawBytes = signed.serialize();
        signature = await connection.sendRawTransaction(rawBytes, {
          skipPreflight: true,
        });
      }

      // --- CONFIRMATION PHASE ---
      setTxState("confirming");
      toast.loading("Awaiting Block Confirmation...", {
        id: toastId,
        description: "Transaction landing on Solana mainnet.",
      });

      await confirmWithPolling(connection, signature, 60000);

      // --- SUCCESS HANDLING ---
      clearTimeout(autoDismiss);
      const score = calcExecutionScore({
        slippage: quote.slippage,
        mevSaved: mevProtect,
        routeSteps: quote.route.length,
      });

      const execResult = {
        signature,
        score,
        provider: quote.provider,
        outAmount: quote.outAmount,
      };

      setLastExec(execResult);
      setTxResult(execResult);
      setTxState("done");

      toast.success("Trade Execution Complete", {
        id: toastId,
        description: `Swapped for ${quote.outAmount.toFixed(4)} ${outputToken.symbol}. Alpha Score: ${score}/100`,
        action: {
          label: "View",
          onClick: () =>
            window.open(`https://solscan.io/tx/${signature}`, "_blank"),
        },
      });

      if (publicKey) {
        try {
          await saveTrade({
            wallet: publicKey.toBase58(),
            inputToken: inputToken.symbol,
            outputToken: outputToken.symbol,
            inputAmount: parseFloat(inputAmount),
            outputAmount: quote.outAmount,
            inputUsd: quote.inUsd,
            outputUsd: quote.outUsd,
            routeProvider: quote.provider,
            executionScore: score,
            slippageBps: Math.round(quote.slippage * 100),
            mevProtected: mevProtect,
            signature,
            status: "confirmed",
          });
        } catch (dbErr) {
          console.warn("[saveTrade] failed:", dbErr);
        }
      }

      setInputAmount("");
      setQuote(null);
      setTimeout(() => setTxState("idle"), 5000);
    } catch (e) {
      // --- ERROR HANDLING ---
      clearTimeout(autoDismiss);
      const friendlyError = parseTradeError(e);

      setTxError(friendlyError);
      setTxState("error");

      toast.error("Execution Failed", {
        id: toastId,
        description: friendlyError,
      });

      setTimeout(() => setTxState("idle"), 8000);
    }
  };

  const inputBalance = balances?.[inputToken.symbol]?.amount || 0;
  const effectiveSlippage = customSlippage
    ? parseFloat(customSlippage)
    : slippage;

  return (
    <div className="w-full max-w-sm mx-auto space-y-3 animate-fade-in">
      {/* Provider Selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-alpha-surface rounded-lg p-0.5 border border-alpha-border">
          {[
            { id: "dflow", label: "DFlow MEV", icon: Shield },
            { id: "jupiter", label: "Jupiter", icon: Zap },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setProvider(id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${provider === id ? "bg-alpha-card text-alpha-success border border-alpha-border" : "text-alpha-muted hover:text-alpha-text"}`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={fetchQuote}
          disabled={quoteLoading}
          className="p-1.5 rounded-lg hover:bg-alpha-card text-alpha-muted hover:text-alpha-text transition-all"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${quoteLoading ? "animate-spin text-alpha-blue" : ""}`}
          />
        </button>
      </div>

      <TokenInput
        label="You Pay"
        token={inputToken}
        amount={inputAmount}
        onAmountChange={setInputAmount}
        onTokenChange={setInputToken}
        balance={inputBalance}
        maxBalance={
          inputToken.symbol === "SOL"
            ? Math.max(0, inputBalance - 0.01)
            : inputBalance
        }
      />

      <div className="flex justify-center -my-1">
        <button
          onClick={swapTokens}
          className="p-2 bg-alpha-card border border-alpha-border rounded-lg hover:bg-alpha-blue/10 hover:border-alpha-blue text-alpha-muted hover:text-alpha-blue transition-all"
        >
          <ArrowDownUp className="w-3.5 h-3.5" />
        </button>
      </div>

      <TokenInput
        label="You Receive"
        token={outputToken}
        amount={quoteLoading ? "…" : quote ? quote.outAmount.toFixed(6) : ""}
        onAmountChange={() => {}}
        onTokenChange={setOutputToken}
      />

      {/* Quote Error */}
      {quoteError && !quoteLoading && !quote && (
        <div className="bg-alpha-alert/10 border border-alpha-alert/30 rounded-xl p-2.5 flex items-center gap-2 animate-fade-in">
          <AlertTriangle className="w-3.5 h-3.5 text-alpha-alert shrink-0" />
          <p className="text-xs text-alpha-alert">{quoteError}</p>
        </div>
      )}

      {/* Quote Details */}
      {quote && !quoteLoading && (
        <div className="bg-alpha-surface border border-alpha-border rounded-xl p-3 space-y-1.5 text-xs animate-fade-in">
          <div className="flex justify-between text-alpha-muted">
            <span>Price Impact</span>
            <span
              className={`font-mono ${Math.abs(quote.priceImpact) > 1 ? "text-alpha-alert" : "text-alpha-success"}`}
            >
              {Math.abs(quote.priceImpact).toFixed(3)}%
            </span>
          </div>
          <div className="flex justify-between text-alpha-muted">
            <span>Route</span>
            <span className="text-alpha-text mono uppercase">
              {quote.provider}
            </span>
          </div>
          <div className="flex justify-between text-alpha-muted">
            <span>MEV Protection</span>
            <span
              className={mevProtect ? "text-alpha-success" : "text-yellow-400"}
            >
              {mevProtect ? "Active" : "Off"}
            </span>
          </div>
          {quote.inUsd > 0 && (
            <div className="flex justify-between text-alpha-muted">
              <span>USD Value</span>
              <span className="text-alpha-text">
                ${quote.inUsd.toFixed(2)} → ${quote.outUsd.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Slippage Settings */}
      <div className="bg-alpha-surface border border-alpha-border rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-alpha-muted uppercase">
            Slippage Tolerance
          </span>
          <label className="flex items-center gap-1.5 text-xs">
            <span className="text-alpha-muted">MEV Protect</span>
            <button
              onClick={() => setMevProtect(!mevProtect)}
              className={`w-8 h-4 rounded-full relative transition-all ${mevProtect ? "bg-alpha-success" : "bg-alpha-border"}`}
            >
              <div
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${mevProtect ? "left-4.5" : "left-0.5"}`}
              />
            </button>
          </label>
        </div>
        <div className="flex gap-1.5">
          {SLIPPAGE_PRESETS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setSlippage(s);
                setCustomSlippage("");
              }}
              className={`flex-1 py-1 rounded-lg text-xs font-mono transition-all ${slippage === s && !customSlippage ? "bg-alpha-blue/20 text-alpha-blue border border-alpha-blue/40" : "bg-alpha-card text-alpha-muted hover:text-alpha-text border border-alpha-border"}`}
            >
              {s}%
            </button>
          ))}
          <input
            type="number"
            className="flex-1 bg-alpha-card border border-alpha-border rounded-lg px-2 py-1 text-xs text-center text-alpha-text focus:border-alpha-blue focus:outline-none"
            placeholder="Custom"
            value={customSlippage}
            onChange={(e) => {
              setCustomSlippage(e.target.value);
              setSlippage(0);
            }}
            min="0.01"
            max="50"
            step="0.1"
          />
        </div>
        {effectiveSlippage > 2 && (
          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-yellow-400">
            <AlertTriangle className="w-3 h-3" /> High slippage alert
          </div>
        )}
      </div>

      {/* Status messages */}
      {txState === "done" && txResult && (
        <div className="bg-alpha-success/10 border border-alpha-success/30 rounded-xl p-3 animate-fade-in">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-alpha-success shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="text-alpha-success font-semibold">
                Swap Successful!
              </p>
              <a
                href={`https://solscan.io/tx/${txResult.signature}`}
                target="_blank"
                rel="noreferrer"
                className="text-alpha-blue hover:underline mono break-all"
              >
                {txResult.signature}
              </a>
            </div>
          </div>
        </div>
      )}

      {txState === "error" && (
        <div className="bg-alpha-alert/10 border border-alpha-alert/30 rounded-xl p-3 flex items-start gap-2 animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-alpha-alert shrink-0 mt-0.5" />
          <p className="text-xs text-alpha-alert">{txError}</p>
        </div>
      )}

      {/* Execute Button */}
      <button
        onClick={executeTrade}
        disabled={
          !connected ||
          !quote ||
          quoteLoading ||
          txState === "signing" ||
          txState === "sending" ||
          txState === "confirming"
        }
        className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 bg-alpha-success text-alpha-bg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed glow-green"
      >
        {txState === "signing" && "Approve in Wallet…"}
        {txState === "sending" && "Broadcasting…"}
        {txState === "confirming" && "Confirming…"}
        {(txState === "idle" || txState === "done" || txState === "error") &&
          (!connected
            ? "Connect Wallet"
            : !inputAmount || parseFloat(inputAmount) <= 0
              ? "Enter Amount"
              : quoteLoading
                ? "Quoting…"
                : "Swap Now")}
      </button>

      {!connected && (
        <p className="text-center text-xs text-alpha-muted">
          Connect your Phantom or Solflare wallet to start trading.
        </p>
      )}

      {/* Mobile Price Ticker - Visible only on mobile screens */}
      <div className="lg:hidden pt-4 border-t border-alpha-border/50">
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="w-1 h-1 rounded-full bg-alpha-blue animate-pulse" />
          <span className="text-[10px] font-mono text-alpha-muted uppercase tracking-widest">
            Market Rates
          </span>
        </div>
        <MobilePriceTicker stats={stats} className="lg:hidden" />
      </div>
    </div>
  );
}
