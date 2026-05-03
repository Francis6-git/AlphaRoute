/**
 * database.js — All Supabase read/write operations for AlphaRoute.
 *
 * Security: Tables are wallet-keyed (Solana pubkey). RLS allows public access;
 * application-level wallet guards prevent cross-wallet writes or bad inputs.
 *
 * DATABASE SETUP:
 *   Tables required: trades, price_alerts
 *   Run the migration in scripts/db-setup.sql via the Supabase SQL editor
 *   (Project: hpwacbhxsvahvlbmbseq) if the tables do not exist yet.
 */
import { supabase } from "../lib/supabase";

// ── Guard helpers ─────────────────────────────────────────────────────────────
function assertWallet(wallet) {
  if (!wallet || typeof wallet !== "string" || wallet.length < 32 || wallet.length > 44) {
    throw new Error("Invalid wallet address");
  }
}

// ── Trade History ─────────────────────────────────────────────────────────────
export async function saveTrade(trade) {
  assertWallet(trade.wallet);

  const { data, error } = await supabase
    .from("trades")
    .insert([
      {
        wallet:          trade.wallet,
        input_token:     trade.inputToken,
        output_token:    trade.outputToken,
        input_amount:    trade.inputAmount,
        output_amount:   trade.outputAmount,
        input_usd:       trade.inputUsd   ?? 0,
        output_usd:      trade.outputUsd  ?? 0,
        route_provider:  trade.routeProvider || "dflow",
        execution_score: trade.executionScore ?? 0,
        slippage_bps:    trade.slippageBps    ?? 0,
        mev_protected:   trade.mevProtected   ?? true,
        signature:       trade.signature,
        status:          trade.status || "confirmed",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("[saveTrade]", error.message);
    throw new Error(`Failed to save trade: ${error.message}`);
  }
  return data;
}

export async function fetchTrades(wallet, limit = 50) {
  assertWallet(wallet);

  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .eq("wallet", wallet)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[fetchTrades]", error.message);
    throw new Error(`Failed to fetch trades: ${error.message}`);
  }
  return data || [];
}

// ── Price Alerts ──────────────────────────────────────────────────────────────
export async function saveAlert(alert) {
  assertWallet(alert.wallet);

  if (!alert.targetPrice || alert.targetPrice <= 0) {
    throw new Error("Target price must be greater than 0");
  }
  if (!["above", "below"].includes(alert.direction)) {
    throw new Error("Direction must be 'above' or 'below'");
  }
  if (!["notify", "trade"].includes(alert.action)) {
    throw new Error("Action must be 'notify' or 'trade'");
  }

  const { data, error } = await supabase
    .from("price_alerts")
    .insert([
      {
        wallet:            alert.wallet,
        token_mint:        alert.tokenMint,
        token_symbol:      alert.tokenSymbol,
        target_price:      alert.targetPrice,
        direction:         alert.direction,
        action:            alert.action,
        trade_input_mint:  alert.tradeInputMint  ?? null,
        trade_output_mint: alert.tradeOutputMint ?? null,
        trade_amount:      alert.tradeAmount     ?? null,
        kamino_withdraw:   alert.kaminoWithdraw  ?? false,
        kamino_vault_id:   alert.kaminoVaultId   ?? null,
        status:            "active",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("[saveAlert]", error.message);
    throw new Error(`Failed to save alert: ${error.message}`);
  }
  return data;
}

export async function fetchAlerts(wallet) {
  assertWallet(wallet);

  const { data, error } = await supabase
    .from("price_alerts")
    .select("*")
    .eq("wallet", wallet)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[fetchAlerts]", error.message);
    throw new Error(`Failed to fetch alerts: ${error.message}`);
  }
  return data || [];
}

export async function deleteAlert(id) {
  if (!id) throw new Error("Missing alert ID");

  const { error } = await supabase.from("price_alerts").delete().eq("id", id);

  if (error) {
    console.error("[deleteAlert]", error.message);
    throw new Error(`Failed to delete alert: ${error.message}`);
  }
}

export async function updateAlertStatus(id, status) {
  if (!id) throw new Error("Missing alert ID");

  const { error } = await supabase
    .from("price_alerts")
    .update({
      status,
      ...(status === "triggered" ? { triggered_at: new Date().toISOString() } : {}),
    })
    .eq("id", id);

  if (error) {
    console.error("[updateAlertStatus]", error.message);
    throw new Error(`Failed to update alert: ${error.message}`);
  }
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export async function fetchTradeStats(wallet) {
  const trades = await fetchTrades(wallet, 500);
  if (!trades.length) return null;

  const totalVolume = trades.reduce((s, t) => s + (t.input_usd || 0), 0);
  const avgScore =
    trades.reduce((s, t) => s + (t.execution_score || 0), 0) / trades.length;
  const mevProtected = trades.filter((t) => t.mev_protected).length;

  const byToken = {};
  trades.forEach((t) => {
    if (t.input_token) {
      byToken[t.input_token] = (byToken[t.input_token] || 0) + (t.input_usd || 0);
    }
  });

  return {
    totalTrades:       trades.length,
    totalVolume,
    avgExecutionScore: Math.round(avgScore),
    mevProtectedPct:   Math.round((mevProtected / trades.length) * 100),
    topTokens:         Object.entries(byToken)
                         .sort((a, b) => b[1] - a[1])
                         .slice(0, 5),
    recentTrades:      trades.slice(0, 10),
  };
}
