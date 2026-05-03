import React from "react";
import { ExternalLink } from "lucide-react";
import AlphaRouteLogo from "../layout/Logo";

const LINKS = [
  { label: "DFlow", href: "https://dflow.net" },
  { label: "Kamino", href: "https://app.kamino.finance" },
  { label: "Quicknode", href: "https://quicknode.com" },
  { label: "Solscan", href: "https://solscan.io" },
  { label: "Solflare", href: "https://solflare.com" },
];

export default function Footer() {
  return (
    <footer className="border-t border-alpha-border bg-alpha-surface/50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <AlphaRouteLogo className="w-8 md:w-10 h-8 md:h-10" />
            <div>
              <span className="text-sm font-bold text-alpha-text tracking-wider">
                AlphaRoute
              </span>
              <p className="text-[10px] text-alpha-dim">
                Execution Intelligence Terminal
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-5">
            {LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-alpha-dim hover:text-alpha-blue transition-colors flex items-center gap-1"
              >
                {label}
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-alpha-border/50 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-alpha-muted font-mono">
            Built on Solana. Powered by DFlow MEV Protection, Kamino DeFi, and
            Quicknode Infrastructure.
          </p>
          <div className="flex items-center gap-4 text-[10px] text-alpha-muted font-mono">
            <span>Network: Mainnet-Beta</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
