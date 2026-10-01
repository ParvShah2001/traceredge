import React from "react";
import {
  Flame,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  BarChart2,
  DollarSign,
  Layers,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";

export const PRESETS = [
  { id: "all", label: "All Stocks", icon: Layers, desc: "Complete universe" },
  { id: "52w_high", label: "52W High Breakouts", icon: Flame, desc: "Within 3% of yearly high", badge: "Hot" },
  { id: "rsi_oversold", label: "RSI Oversold Bounce", icon: Sparkles, desc: "RSI < 35 reversal zone" },
  { id: "rsi_overbought", label: "RSI Momentum", icon: ArrowUpRight, desc: "RSI > 70 strong trend" },
  { id: "volume_shocker", label: "Volume Shockers", icon: Zap, desc: "Volume > 1.4x 20D average", badge: "Active" },
  { id: "golden_cross", label: "Golden Crossover", icon: ShieldCheck, desc: "50 DMA above 200 DMA" },
  { id: "top_gainers", label: "Top Gainers", icon: TrendingUp, desc: "Biggest % intraday gain" },
  { id: "top_losers", label: "Top Losers", icon: TrendingDown, desc: "Biggest % intraday decline" },
  { id: "value_gems", label: "Value Gems", icon: DollarSign, desc: "Low P/E & steady yield" },
  { id: "high_dividend", label: "High Dividend", icon: BarChart2, desc: "Yield > 1.5% income picks" },
  { id: "large_cap", label: "Large Caps (Nifty 50)", icon: Layers, desc: "Mega caps > ₹50,000 Cr" },
  { id: "mid_cap", label: "Mid Cap Leaders", icon: Zap, desc: "High beta midcap picks" },
];

export function QuickPresets({ activePreset, onSelectPreset }) {
  return (
    <div className="overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
        {PRESETS.map((p) => {
          const Icon = p.icon;
          const isActive = activePreset === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p.id)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition border select-none ${
                isActive
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm"
                  : "bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-current" : "text-zinc-500 dark:text-zinc-400"}`} />
              <span>{p.label}</span>
              {p.badge && (
                <span className={`text-[9px] px-1 py-0.2 rounded font-black uppercase ${
                  isActive
                    ? "bg-white text-black dark:bg-black dark:text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                }`}>
                  {p.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
