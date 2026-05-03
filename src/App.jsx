import React, { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "./lib/auth-context";
import TopBar from "./components/layout/TopBar";
import Sidebar from "./components/layout/Sidebar";
import TradePanel from "./components/panels/TradePanel";
import YieldPanel from "./components/panels/YieldPanel";
import IntelligencePanel from "./components/panels/IntelligencePanel";
import AlertsPanel from "./components/panels/AlertsPanel";
import HistoryPanel from "./components/panels/HistoryPanel";
import PortfolioRail, {
  MobilePortfolioRail,
} from "./components/layout/PortfolioRail";
import LandingPage from "./pages/LandingPage";
import AuthModal from "./components/auth/AuthModal";
import { useWalletBalances } from "./hooks/useWalletBalances";
import { ToastProvider } from "./components/ui/ToastProvider";
import { useNetworkStats } from "./hooks/useNetworkStats";

export default function App() {
  const { publicKey, connected } = useWallet();
  const stats = useNetworkStats();
  const { user } = useAuth();
  const {
    balances,
    loading: balLoading,
    totalUsd,
    refresh: refreshBalances,
  } = useWalletBalances(publicKey);
  const [activeTab, setActiveTab] = useState("trade");
  const [showDashboard, setShowDashboard] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Show dashboard if user is logged in, wallet is connected, or user chose to enter
  const isDashboard = showDashboard || !!user || connected;

  const onTradeComplete = useCallback(() => {
    refreshBalances();
  }, [refreshBalances]);

  const handleLaunch = () => {
    if (user || connected) {
      setShowDashboard(true);
    } else {
      setShowAuth(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    setShowDashboard(true);
  };

  if (!isDashboard) {
    return (
      <>
        <LandingPage onLaunch={handleLaunch} />
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  const renderPanel = () => {
    switch (activeTab) {
      case "trade":
        return (
          <TradePanel
            balances={balances}
            stats={stats}
            onTradeComplete={onTradeComplete}
          />
        );
      case "yield":
        return (
          <YieldPanel balances={balances} refreshBalances={refreshBalances} />
        );
      case "analytics":
        return <IntelligencePanel />;
      case "alerts":
        return <AlertsPanel balances={balances} />;
      case "history":
        return <HistoryPanel />;
      default:
        return (
          <TradePanel
            balances={balances}
            stats={stats}
            onTradeComplete={onTradeComplete}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-alpha-bg overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar stats={stats} />

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 custom-scrollbar">
            <div className="max-w-4xl mx-auto animate-fade-in pb-20">
              {renderPanel()}
            </div>
          </main>

          {/* Right rail — portfolio + Kamino positions */}
          {/* Desktop Rail */}
          {connected && (
            <PortfolioRail
              balances={balances}
              totalUsd={totalUsd}
              loading={balLoading}
              onNavigateYield={() => setActiveTab("yield")}
            />
          )}

          {/* Mobile Rail (Controlled by Hamburger in Sidebar) */}
          <MobilePortfolioRail
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            balances={balances}
            totalUsd={totalUsd}
            loading={balLoading}
            onNavigateYield={() => {
              setActiveTab("yield");
              setIsMobileMenuOpen(false);
            }}
          />
        </div>
      </div>
      <ToastProvider />
    </div>
  );
}
