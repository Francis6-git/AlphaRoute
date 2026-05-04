import { useState, useEffect, useCallback } from "react";
import { getSlot, computeTPS } from "../services/quicknode";
import { fetchTokenPrices } from "../services/dflow";
import { TOKENS } from "../config";

export function useNetworkStats() {
  const [stats, setStats] = useState({
    slot: 0,
    tps: 0,
    congestion: "Normal",
    congestionColor: "text-alpha-success",
    prices: {},
    loading: true,
  });

  const update = useCallback(async () => {
    // Use allSettled so a single API failure doesn't prevent other stats from updating
    const [slot, tps, priceData] = await Promise.allSettled([
      getSlot().catch((e) => {
        console.warn("[stats] getSlot:", e.message);
        return 0;
      }),
      computeTPS().catch((e) => {
        console.warn("[stats] computeTPS:", e.message);
        return 0;
      }),
      fetchTokenPrices([
        TOKENS.SOL.mint,
        TOKENS.JUP.mint,
        TOKENS.JTO.mint,
        TOKENS.BONK.mint,
      ]).catch((e) => {
        console.warn("[stats] fetchTokenPrices:", e.message);
        return {};
      }),
    ]);

    const tpsVal = tps.status === "fulfilled" ? tps.value || 0 : 0;
    let congestion = "Normal";
    let congestionColor = "text-alpha-success";
    if (tpsVal > 3500) {
      congestion = "High";
      congestionColor = "text-alpha-alert";
    } else if (tpsVal > 2000) {
      congestion = "Medium";
      congestionColor = "text-yellow-400";
    }

    setStats((prev) => ({
      ...prev,
      slot: slot.status === "fulfilled" ? slot.value || prev.slot : prev.slot,
      tps: tpsVal,
      congestion,
      congestionColor,
      prices:
        priceData.status === "fulfilled" &&
        priceData.value &&
        Object.keys(priceData.value).length > 0
          ? priceData.value
          : prev.prices,
      loading: false,
    }));
  }, []);

  useEffect(() => {
    update();
    const interval = setInterval(update, 15000); // ~every 15s (close to block time)
    return () => clearInterval(interval);
  }, [update]);

  return stats;
}
