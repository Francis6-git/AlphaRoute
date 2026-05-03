import { useState, useEffect, useCallback } from "react";
import {
  getSlot,
  computeTPS,
  getRecentPerformanceSamples,
} from "../services/quicknode";
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
    try {
      const [slot, tps, priceData] = await Promise.allSettled([
        getSlot(),
        computeTPS(),
        fetchTokenPrices([
          TOKENS.SOL.mint,
          TOKENS.JUP.mint,
          TOKENS.JTO.mint,
          TOKENS.BONK.mint,
        ]),
      ]);

      const tpsVal = tps.status === "fulfilled" ? tps.value : 0;
      let congestion = "Normal";
      let congestionColor = "text-alpha-success";
      if (tpsVal > 3500) {
        congestion = "High";
        congestionColor = "text-alpha-alert";
      } else if (tpsVal > 2000) {
        congestion = "Medium";
        congestionColor = "text-yellow-400";
      }

      setStats({
        slot: slot.status === "fulfilled" ? slot.value : 0,
        tps: tpsVal,
        congestion,
        congestionColor,
        prices: priceData.status === "fulfilled" ? priceData.value : {},
        loading: false,
      });
    } catch {
      setStats((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    update();
    const interval = setInterval(update, 15000); // ~every 15s (close to block time)
    return () => clearInterval(interval);
  }, [update]);

  return stats;
}
