import { useState, useEffect, useCallback } from "react";
import { getBalance, getTokenAccountsByOwner } from "../services/quicknode";
import { fetchTokenPrices } from "../services/dflow";
import { TOKEN_LIST, TOKENS } from "../config";

export function useWalletBalances(publicKey) {
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!publicKey) {
      setBalances({});
      return;
    }
    setLoading(true);
    try {
      const mints = TOKEN_LIST.map((t) => t.mint);

      // BATCH FETCH: Get SOL, Tokens, and Prices simultaneously
      const [solLamports, tokenAccounts, prices] = await Promise.all([
        getBalance(publicKey.toBase58()),
        getTokenAccountsByOwner(publicKey.toBase58()),
        fetchTokenPrices(mints),
      ]);

      const solPrice = prices[TOKENS.SOL.mint]?.usdPrice || 0;

      // Initialize result with SOL data + price
      const result = {
        SOL: {
          amount: solLamports / 1e9,
          uiAmount: (solLamports / 1e9).toFixed(4),
          price: solPrice,
          usdValue: (solLamports / 1e9) * solPrice,
        },
      };

      // Process SPL Tokens
      tokenAccounts.forEach((ta) => {
        const info = ta.account?.data?.parsed?.info;
        if (!info) return;

        const token = TOKEN_LIST.find((t) => t.mint === info.mint);
        if (!token) return;

        const uiAmount = info.tokenAmount?.uiAmount || 0;
        const price = prices[token.mint]?.usdPrice || 0;

        result[token.symbol] = {
          amount: uiAmount,
          uiAmount: uiAmount.toFixed(4),
          price: price,
          usdValue: uiAmount * price,
        };
      });

      setBalances(result);
    } catch (e) {
      console.error("fetchBalances error:", e);
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    fetch();
    if (!publicKey) return;
    const interval = setInterval(fetch, 15000);
    return () => clearInterval(interval);
  }, [fetch, publicKey]);

  const totalUsd = Object.values(balances).reduce(
    (s, b) => s + (b.usdValue || 0),
    0,
  );

  return { balances, loading, totalUsd, refresh: fetch };
}
