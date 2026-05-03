import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, Zap, ArrowRight, CheckCircle } from 'lucide-react';

// Animated score ring
function ScoreRing({ score, size = 160 }) {
  const [animScore, setAnimScore] = useState(0);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimScore(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const color = animScore >= 90 ? '#00ffbd' : animScore >= 70 ? '#3b82f6' : '#eab308';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1e3a5f" strokeWidth={8} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out, stroke 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold font-mono text-alpha-text">{animScore}</span>
        <span className="text-[10px] text-alpha-muted font-mono uppercase">/ 100</span>
      </div>
    </div>
  );
}

const MOCK_TRADE = {
  pair: 'SOL → USDC',
  input: '2.5 SOL',
  output: '375.42 USDC',
  score: 96,
  slippageSaved: '0.12%',
  mevProtected: true,
  route: 'DFlow → Orca → Raydium',
  executionTime: '380ms',
};

const BREAKDOWN = [
  { label: 'Slippage saved vs AMM', value: MOCK_TRADE.slippageSaved, color: 'text-alpha-success' },
  { label: 'MEV extraction prevented', value: '$0.00', color: 'text-alpha-success' },
  { label: 'Route hops', value: '3 (optimal)', color: 'text-alpha-blue' },
  { label: 'Execution latency', value: MOCK_TRADE.executionTime, color: 'text-alpha-text' },
  { label: 'Confirmation', value: 'Finalized', color: 'text-alpha-success' },
];

export default function ExecutionProof({ onLaunch }) {
  return (
    <section className="py-20 md:py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-alpha-bg via-alpha-surface/30 to-alpha-bg pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-[11px] font-mono font-semibold text-alpha-success uppercase tracking-widest">Proof of Execution</span>
          <h2 className="text-3xl md:text-4xl font-bold text-alpha-text mt-3">
            The Alpha Score
          </h2>
          <p className="text-alpha-dim mt-3 max-w-lg mx-auto">
            Every trade is graded on execution quality. Slippage, MEV savings, route efficiency — all quantified.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Score visualization */}
          <div className="bg-alpha-card border border-alpha-border rounded-2xl p-8 flex flex-col items-center">
            <div className="text-[10px] font-mono text-alpha-muted uppercase tracking-widest mb-6">Execution Quality</div>
            <ScoreRing score={MOCK_TRADE.score} size={180} />
            <div className="mt-6 text-center">
              <p className="text-sm text-alpha-text font-semibold">Excellent Execution</p>
              <p className="text-xs text-alpha-dim mt-1">
                {MOCK_TRADE.pair} • {MOCK_TRADE.input} → {MOCK_TRADE.output}
              </p>
            </div>

            {/* Route */}
            <div className="mt-4 flex items-center gap-2 bg-alpha-surface border border-alpha-border rounded-lg px-3 py-2 w-full max-w-xs">
              <Shield className="w-4 h-4 text-alpha-success shrink-0" />
              <span className="text-xs text-alpha-dim">Route:</span>
              <span className="text-xs text-alpha-text font-mono flex-1 text-right">{MOCK_TRADE.route}</span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-4">
            <div className="bg-alpha-card border border-alpha-border rounded-2xl p-6">
              <h3 className="text-sm font-bold text-alpha-text mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-alpha-blue" />
                Execution Breakdown
              </h3>
              <div className="space-y-3">
                {BREAKDOWN.map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-alpha-border/50 last:border-0">
                    <span className="text-xs text-alpha-dim">{label}</span>
                    <span className={`text-xs font-mono font-semibold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div className="bg-alpha-surface border border-alpha-success/20 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-alpha-text mb-3">How the Alpha Score Works</h3>
              <div className="space-y-2">
                {[
                  'DFlow routes your order through an off-chain auction, competing market makers bid for your flow.',
                  'The best price wins. MEV bots cannot front-run or sandwich your transaction.',
                  'Post-execution, we compare actual fill vs theoretical AMM — the difference is your Alpha Score.',
                ].map((step, i) => (
                  <div key={i} className="flex gap-2 text-xs text-alpha-dim">
                    <CheckCircle className="w-3.5 h-3.5 text-alpha-success shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onLaunch}
              className="w-full flex items-center justify-center gap-2 bg-alpha-success text-alpha-bg font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-all glow-green"
            >
              Start Trading with MEV Protection
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
