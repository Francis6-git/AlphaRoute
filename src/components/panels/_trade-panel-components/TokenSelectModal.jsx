import React, { useState, useEffect } from "react";
import { Search, Loader2, X } from "lucide-react";
import { TOKEN_LIST } from "../../../config";
import { searchTokens } from "../../../services/dflow";

export default function TokenSelectModal({ onSelect, onClose, currentMint }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(TOKEN_LIST);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults(TOKEN_LIST);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchTokens(query);
        setResults(
          res.length
            ? res
            : TOKEN_LIST.filter(
                (t) =>
                  t.symbol.toLowerCase().includes(query.toLowerCase()) ||
                  t.name.toLowerCase().includes(query.toLowerCase()),
              ),
        );
      } catch {
        setResults(TOKEN_LIST);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-alpha-card border border-alpha-border rounded-xl w-full max-w-sm p-4 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-alpha-text">
            Select Token
          </h3>
          <button
            onClick={onClose}
            className="text-alpha-muted hover:text-alpha-text"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-alpha-muted" />
          <input
            className="alpha-input w-full pl-8"
            placeholder="Search name or mint…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {searching && (
            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-alpha-blue animate-spin" />
          )}
        </div>
        <div className="max-h-64 overflow-y-auto space-y-0.5">
          {results.map((t) => (
            <button
              key={t.mint || t.id}
              onClick={() => onSelect(t)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-alpha-surface transition-all text-left
                ${(t.mint || t.id) === currentMint ? "bg-alpha-blue/10 border border-alpha-blue/30" : ""}
              `}
            >
              <img
                src={t.icon || t.logoURI}
                alt={t.symbol}
                className="w-7 h-7 rounded-full bg-alpha-surface object-cover"
                onError={(e) => {
                  e.target.src =
                    "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><circle cx=%2212%22 cy=%2212%22 r=%2212%22 fill=%22%231e3a5f%22/></svg>";
                }}
              />
              <div>
                <div className="text-xs font-semibold text-alpha-text">
                  {t.symbol}
                </div>
                <div className="text-[10px] text-alpha-dim truncate max-w-[160px]">
                  {t.name}
                </div>
              </div>
              {t.isVerified && (
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-alpha-success"
                  title="Verified"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
