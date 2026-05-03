import React from "react";
import {
  BarChart2,
  Repeat2,
  TrendingUp,
  Bell,
  BookOpen,
  LogOut,
  Menu,
} from "lucide-react";
import { useAuth } from "../../lib/auth-context";

const NAV = [
  { id: "trade", label: "Trade", icon: Repeat2, desc: "Execute swaps" },
  { id: "yield", label: "Yield", icon: TrendingUp, desc: "Kamino positions" },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart2,
    desc: "Execution stats",
  },
  { id: "alerts", label: "Alerts", icon: Bell, desc: "Price triggers" },
  { id: "history", label: "History", icon: BookOpen, desc: "Trade history" },
];

export default function Sidebar({
  activeTab,
  onTabChange,
  onToggleMobileMenu,
}) {
  const { user, signOut } = useAuth();

  return (
    <aside className="w-16 bg-alpha-surface border-r border-alpha-border flex flex-col items-center py-3 gap-1 shrink-0 h-screen sticky top-0">
      <div className="flex flex-col items-center gap-1 w-full overflow-y-auto no-scrollbar flex-1">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="p-2 lg:hidden text-alpha-muted hover:text-alpha-text items-center justify-center gap-0.5 transition-all duration-150"
        >
          <Menu className="w-5 h-5" />
        </button>

        {NAV.map(({ id, label, icon: Icon, desc }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            title={desc}
            className={`
            w-11 h-11 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all duration-150
            ${
              activeTab === id
                ? "bg-alpha-blue/20 text-alpha-blue border border-alpha-blue/40"
                : "text-alpha-muted hover:text-alpha-text hover:bg-alpha-card"
            }
          `}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[8px] font-semibold tracking-wide">
              {label.toUpperCase()}
            </span>
          </button>
        ))}

        <div className="flex-1" />

        {user && (
          <button
            onClick={signOut}
            title="Sign Out"
            className="w-11 h-11 mb-2 rounded-lg flex flex-col items-center justify-center gap-0.5 text-alpha-alert hover:text-alpha-muted hover:bg-alpha-alert/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-[8px] font-semibold tracking-wide">EXIT</span>
          </button>
        )}
      </div>
    </aside>
  );
}
