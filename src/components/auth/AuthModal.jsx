import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useAuth } from "../../lib/auth-context";
import {
  X,
  Mail,
  Loader2,
  Wallet,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const { signIn, signUp } = useAuth();
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [mode, setMode] = useState("login"); // 'login' | 'signup' | 'wallet'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        onSuccess?.();
      } else {
        const result = await signUp(email, password, { source: "alpharoute" });
        if (result.access_token) {
          onSuccess?.();
        } else {
          setSuccess(
            "Account created. Check your email to confirm, then sign in.",
          );
          setMode("login");
        }
      }
    } catch (e) {
      setError(e.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnect = () => {
    setVisible(true);
    onClose();
  };

  // If wallet is already connected, treat as guest mode success
  const handleGuestMode = () => {
    if (connected) {
      onSuccess?.();
    } else {
      setVisible(true);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-alpha-card border border-alpha-border rounded-2xl w-full max-w-md animate-fade-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-alpha-border">
          <h2 className="text-lg font-bold text-alpha-text">
            {mode === "login"
              ? "Sign In"
              : mode === "signup"
                ? "Create Account"
                : "Connect Wallet"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-alpha-surface text-alpha-muted hover:text-alpha-text transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Wallet / Guest Mode */}
          <button
            onClick={handleGuestMode}
            className="w-full flex items-center justify-center gap-2 bg-alpha-success text-alpha-bg font-bold px-4 py-3 rounded-xl text-sm hover:opacity-90 transition-all glow-green"
          >
            <Wallet className="w-4 h-4" />
            {connected
              ? "Enter as Guest (Wallet Connected)"
              : "Connect Wallet — Guest Mode"}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-alpha-border" />
            <span className="text-[10px] text-alpha-muted font-mono uppercase">
              or use email
            </span>
            <div className="flex-1 h-px bg-alpha-border" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[10px] text-alpha-muted font-mono uppercase block mb-1">
                Email
              </label>
              <input
                type="email"
                className="alpha-input w-full"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-alpha-muted font-mono uppercase block mb-1">
                Password
              </label>
              <input
                type="password"
                className="alpha-input w-full"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-alpha-alert bg-alpha-alert/10 border border-alpha-alert/30 rounded-lg px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-xs text-alpha-success bg-alpha-success/10 border border-alpha-success/30 rounded-lg px-3 py-2">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full flex items-center justify-center gap-2 bg-alpha-blue text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />{" "}
                  {mode === "login" ? "Signing in…" : "Creating account…"}
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />{" "}
                  {mode === "login" ? "Sign In" : "Create Account"}
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="text-center">
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
                setSuccess("");
              }}
              className="text-xs text-alpha-blue hover:text-alpha-success transition-colors"
            >
              {mode === "login"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
