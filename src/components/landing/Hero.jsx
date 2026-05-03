import React from "react";
import { Zap, Shield, TrendingUp, ArrowRight } from "lucide-react";

export default function Hero({ onLaunch }) {
  return (
    <section className="relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#3b82f6 2px, transparent 2px), linear-gradient(90deg, #3b82f6 2px, transparent 2px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-alpha-blue/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-alpha-success/5 blur-[100px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-36 text-center">
        {/* Tag */}
        <div className="inline-flex items-center gap-2 bg-alpha-success/10 border border-alpha-success/20 rounded-full px-4 py-1.5 mb-8">
          {/* <div className="w-1.5 h-1.5 rounded-full bg-alpha-success animate-pulse-fast" /> */}
          <span className="text-[11px] font-mono font-semibold text-alpha-success tracking-wider uppercase">
            MEV-Protected Execution Terminal
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-alpha-text leading-tight mb-6 tracking-tight">
          Execute Smarter.
          <br />
          <span className="bg-gradient-to-r from-alpha-success via-alpha-blue to-alpha-success bg-clip-text text-transparent">
            Earn While You Wait.
          </span>
        </h1>

        {/* Sub */}
        <p className="text-lg md:text-xl text-alpha-dim max-w-2xl mx-auto mb-10 leading-relaxed">
          AlphaRoute unifies DFlow MEV-protected routing, Kamino yield vaults,
          and Quicknode real-time data into one institutional-grade terminal.
          Every trade is scored. Every dollar earns.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onLaunch}
            className="group flex items-center gap-2 bg-alpha-success text-alpha-bg font-bold px-8 py-3.5 rounded-xl text-sm hover:opacity-90 transition-all glow-green"
          >
            Launch Terminal
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <a
            href="https://pond.dflow.net/build/introduction"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-alpha-blue hover:text-alpha-success transition-colors text-sm font-medium"
          >
            How DFlow Protects You
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
          {[
            {
              icon: Shield,
              label: "MEV Protection",
              value: "100%",
              desc: "Every swap shielded",
              color: "text-alpha-success",
            },
            {
              icon: TrendingUp,
              label: "Avg Alpha Score",
              value: "96/100",
              desc: "Execution quality",
              color: "text-alpha-blue",
            },
            {
              icon: Zap,
              label: "Latency",
              value: "<400ms",
              desc: "Block-time execution",
              color: "text-alpha-success",
            },
          ].map(({ icon: Icon, label, value, desc, color }) => (
            <div
              key={label}
              className="bg-alpha-card/60 backdrop-blur border border-alpha-border rounded-xl p-4"
            >
              <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
              <div className={`text-xl font-bold font-mono ${color}`}>
                {value}
              </div>
              <div className="text-[10px] text-alpha-muted uppercase tracking-wider mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
