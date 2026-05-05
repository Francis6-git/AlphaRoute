import React, { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { useDemoData } from "../../hooks/useDemoData";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  BarChart3,
  Shield,
  TrendingUp,
  Activity,
  Loader2,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { fetchTradeStats } from "../../services/database";
import { EXPLORER_BASE } from "../../config";
import { FlaskConical } from "lucide-react";

const CHART_COLORS = ["#00ffbd", "#3b82f6", "#f43f5e", "#a855f7", "#eab308"];

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="bg-alpha-card border border-alpha-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-[10px] text-alpha-muted font-mono uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
      {sub && <div className="text-[10px] text-alpha-dim mt-1">{sub}</div>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-alpha-card border border-alpha-border rounded-lg p-2 text-xs">
      <p className="text-alpha-dim font-mono mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-alpha-text">
          <span style={{ color: p.color }}>{p.name}:</span>{" "}
          <span className="font-mono">
            {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export default function IntelligencePanel() {
  const { publicKey, connected } = useWallet();
  const { isDemo, demoStats } = useDemoData();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const load = useCallback(
    async (isBackground = false) => {
      if (isDemo) {
        setStats(demoStats);
        return;
      }
      if (!publicKey) return;
      if (!isBackground) setLoading(true);
      setFetchError(null);
      try {
        const data = await fetchTradeStats(publicKey.toBase58());
        setStats(data);
      } catch (err) {
        console.error("[IntelligencePanel]", err);
        if (!isBackground) {
          setFetchError(err.message || "Could not load analytics");
          toast.error("Analytics unavailable", {
            description: err.message?.slice(0, 80),
          });
        }
      } finally {
        if (!isBackground) setLoading(false);
      }
    },
    [publicKey, isDemo, demoStats],
  );

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 15000);
    return () => clearInterval(interval);
  }, [load]);

  if (!connected && !isDemo) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <BarChart3 className="w-12 h-12 text-alpha-muted mb-4" />
        <h2 className="text-lg font-semibold text-alpha-text mb-2">
          Execution Intelligence
        </h2>
        <p className="text-sm text-alpha-dim text-center max-w-sm">
          Connect your wallet to view trade analytics, execution quality
          metrics, and MEV protection status.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-alpha-blue animate-spin" />
      </div>
    );
  }

  if (fetchError && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <AlertTriangle className="w-12 h-12 text-alpha-alert mb-4" />
        <h2 className="text-lg font-semibold text-alpha-text mb-2">
          Analytics Unavailable
        </h2>
        <p className="text-sm text-alpha-dim text-center max-w-sm">
          {fetchError}
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <Activity className="w-12 h-12 text-alpha-muted mb-4" />
        <h2 className="text-lg font-semibold text-alpha-text mb-2">
          No Trade Data Yet
        </h2>
        <p className="text-sm text-alpha-dim text-center max-w-sm">
          Execute your first trade to start building execution intelligence.
          Your Alpha Score and MEV protection metrics will appear here.
        </p>
      </div>
    );
  }

  // Derive chart data from recent trades
  const volumeByDay = {};
  const scoreHistory = [];
  (stats.recentTrades || []).forEach((t, i) => {
    const day = new Date(t.created_at).toLocaleDateString("en", {
      month: "short",
      day: "numeric",
    });
    volumeByDay[day] = (volumeByDay[day] || 0) + (t.input_usd || 0);
    scoreHistory.push({
      trade: `#${stats.totalTrades - i}`,
      score: t.execution_score || 0,
      slippage: (t.slippage_bps || 0) / 100,
    });
  });

  const volumeData = Object.entries(volumeByDay).map(([day, vol]) => ({
    day,
    volume: vol,
  }));
  const tokenData = (stats.topTokens || []).map(([token, vol], i) => ({
    name: token,
    value: vol,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const estimatedSlippageSaved = stats.totalVolume * 0.003; // estimated 0.3% savings from MEV protection

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Demo banner */}
      {isDemo && (
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-xs text-yellow-400">
          <FlaskConical className="w-3.5 h-3.5 shrink-0" />
          Demo mode — sample analytics. Press{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-yellow-500/20 font-mono">
            Ctrl+Shift+D
          </kbd>{" "}
          to toggle.
        </div>
      )}
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-alpha-text flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-alpha-blue" />
          Execution Intelligence
        </h2>
        <p className="text-xs text-alpha-dim mt-0.5">
          Comprehensive analytics on your DFlow-routed trades.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Trades"
          value={stats.totalTrades}
          icon={Activity}
          color="text-alpha-text"
        />
        <StatCard
          label="Avg Alpha Score"
          value={`${stats.avgExecutionScore}/100`}
          sub={
            stats.avgExecutionScore >= 90
              ? "Excellent execution"
              : stats.avgExecutionScore >= 70
                ? "Good execution"
                : "Needs improvement"
          }
          icon={Zap}
          color={
            stats.avgExecutionScore >= 90
              ? "text-alpha-success"
              : stats.avgExecutionScore >= 70
                ? "text-alpha-blue"
                : "text-yellow-400"
          }
        />
        <StatCard
          label="Total Volume"
          value={`$${stats.totalVolume.toFixed(0)}`}
          icon={TrendingUp}
          color="text-alpha-blue"
        />
        <StatCard
          label="MEV Protected"
          value={`${stats.mevProtectedPct}%`}
          sub={`~$${estimatedSlippageSaved.toFixed(2)} saved`}
          icon={Shield}
          color="text-alpha-success"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Execution Score Trend */}
        <div className="bg-alpha-card border border-alpha-border rounded-xl p-4">
          <h3 className="text-xs font-semibold text-alpha-text mb-3 uppercase tracking-wider">
            Execution Score Trend
          </h3>
          {scoreHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={scoreHistory.reverse()}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ffbd" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00ffbd" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                <XAxis
                  dataKey="trade"
                  tick={{ fill: "#64748b", fontSize: 10 }}
                />
                <YAxis
                  domain={[50, 100]}
                  tick={{ fill: "#64748b", fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#00ffbd"
                  fill="url(#scoreGrad)"
                  strokeWidth={2}
                  name="Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-xs text-alpha-dim">
              Not enough data
            </div>
          )}
        </div>

        {/* Volume by Day */}
        <div className="bg-alpha-card border border-alpha-border rounded-xl p-4">
          <h3 className="text-xs font-semibold text-alpha-text mb-3 uppercase tracking-wider">
            Volume by Day
          </h3>
          {volumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 10 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="volume"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="Volume ($)"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-xs text-alpha-dim">
              Not enough data
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Token Distribution */}
        <div className="bg-alpha-card border border-alpha-border rounded-xl p-4">
          <h3 className="text-xs font-semibold text-alpha-text mb-3 uppercase tracking-wider">
            Token Distribution
          </h3>
          {tokenData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={tokenData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={3}
                  >
                    {tokenData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5">
                {tokenData.map((t) => (
                  <div key={t.name} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: t.color }}
                    />
                    <span className="text-alpha-text font-mono">{t.name}</span>
                    <span className="text-alpha-dim font-mono">
                      ${t.value.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[140px] flex items-center justify-center text-xs text-alpha-dim">
              Not enough data
            </div>
          )}
        </div>

        {/* MEV Protection History */}
        <div className="bg-alpha-card border border-alpha-border rounded-xl p-4">
          <h3 className="text-xs font-semibold text-alpha-text mb-3 uppercase tracking-wider">
            MEV Protection Status
          </h3>
          <div className="space-y-2 max-h-[140px] overflow-y-auto">
            {(stats.recentTrades || []).slice(0, 6).map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs py-1 border-b border-alpha-border/50 last:border-0"
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${t.mev_protected ? "bg-alpha-success" : "bg-alpha-alert"}`}
                />
                <span className="text-alpha-dim font-mono w-16 shrink-0">
                  {t.input_token}→{t.output_token}
                </span>
                <span
                  className={`font-mono ${t.mev_protected ? "text-alpha-success" : "text-alpha-alert"}`}
                >
                  {t.mev_protected ? "Protected" : "Unprotected"}
                </span>
                <span className="text-alpha-dim ml-auto">
                  Score: {t.execution_score}
                </span>
                <a
                  href={`${EXPLORER_BASE}/tx/${t.signature}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-alpha-blue hover:underline font-mono shrink-0"
                >
                  {t.signature?.slice(0, 8)}…
                </a>
              </div>
            ))}
            {(stats.recentTrades || []).length === 0 && (
              <p className="text-xs text-alpha-dim text-center py-4">
                No trades yet. Execute a swap to build history.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
