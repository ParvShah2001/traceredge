import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  Sun,
  Moon,
  ShieldCheck,
  Zap
} from "lucide-react";

export function MarketHeader({
  indices = [],
  marketStatus,
  connectionStatus,
  lastTickTime,
  universeStats,
  onSyncUniverse,
  isSyncingUniverse,
  theme,
  onToggleTheme,
  onVerifyEodClose,
  isVerifyingEod
}) {
  const isMarketOpen = marketStatus?.is_market_open;
  const breadth = marketStatus?.breadth || { advances: 0, declines: 0, unchanged: 0, total: 0 };
  const advancePct = breadth.total > 0 ? Math.round((breadth.advances / breadth.total) * 100) : 50;

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black sticky top-0 z-40 transition-colors">
      {/* Primary Bar */}
      <div className="max-w-[1700px] mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 text-xs">
        {/* Left: TracerEdge Brand & Session Status */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Logo */}
          <div className="flex items-center gap-2 font-black tracking-tight select-none">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-sm font-black shadow-sm">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-black dark:text-white">
                TRACER<span className="text-zinc-500 dark:text-zinc-400">EDGE</span>
              </span>
              <span className="hidden sm:inline-block text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800">
                NSE / BSE
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden md:block" />

          {/* Session Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition ${
              isMarketOpen
                ? "bg-zinc-100 border-zinc-300 text-zinc-900 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
                : "bg-zinc-50 border-zinc-200 text-zinc-800 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isMarketOpen ? "bg-black dark:bg-white animate-ping" : "bg-zinc-400"
              }`}
            />
            {isMarketOpen ? (
              <span className="font-semibold text-black dark:text-white">
                LIVE SESSION
              </span>
            ) : (
              <span className="flex items-center gap-1 font-semibold text-zinc-800 dark:text-zinc-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">EOD SETTLEMENT VERIFIED</span>
                <span className="xs:hidden">MARKET CLOSED</span>
              </span>
            )}
            <span className="text-zinc-500 font-mono hidden lg:inline">
              09:15–15:30 IST
            </span>
          </div>

          {/* EOD Verification Trigger (Desktop & Tablet) */}
          {!isMarketOpen && onVerifyEodClose && (
            <button
              onClick={onVerifyEodClose}
              disabled={isVerifyingEod}
              className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-black border border-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 dark:text-zinc-300 dark:hover:text-white dark:border-zinc-800 transition text-[11px] disabled:opacity-40"
              title="Verify & lock official Bhavcopy closing prices directly from NSE & BSE"
            >
              <RefreshCw className={`w-3 h-3 ${isVerifyingEod ? "animate-spin text-black dark:text-white" : ""}`} />
              <span>Verify Official EOD</span>
            </button>
          )}

          {/* Universe Meta Info */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 text-[11px]">
            <span>
              Universe: <strong className="text-black dark:text-white font-mono font-bold">{universeStats?.stats?.total_stocks ? universeStats.stats.total_stocks.toLocaleString() : "7,654"}</strong>
            </span>
            <span className="text-zinc-400 dark:text-zinc-600">•</span>
            <span>{universeStats?.stats?.nse_count ? universeStats.stats.nse_count.toLocaleString() : "2,593"} NSE</span>
            <span className="text-zinc-400 dark:text-zinc-600">•</span>
            <span>{universeStats?.stats?.bse_count ? universeStats.stats.bse_count.toLocaleString() : "5,061"} BSE</span>
            {onSyncUniverse && (
              <button
                onClick={onSyncUniverse}
                disabled={isSyncingUniverse}
                className="p-0.5 rounded text-zinc-500 hover:text-black dark:hover:text-white transition"
                title="Refresh master lists"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isSyncingUniverse ? "animate-spin text-black dark:text-white" : ""}`} />
              </button>
            )}
          </div>
        </div>

        {/* Right: Breadth, Theme Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Market Breadth Indicator (Tablet & Desktop) */}
          <div className="hidden sm:flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px]">
            <span className="text-zinc-600 dark:text-zinc-400 font-medium">Breadth:</span>
            <span className="text-black dark:text-white font-bold font-tabular">
              ▲ {breadth.advances}
            </span>
            <div className="w-14 h-1.5 bg-zinc-300 dark:bg-zinc-800 rounded-full overflow-hidden flex">
              <div
                className="bg-black dark:bg-white h-full transition-all duration-300"
                style={{ width: `${advancePct}%` }}
              />
              <div
                className="bg-zinc-400 dark:bg-zinc-600 h-full transition-all duration-300"
                style={{ width: `${100 - advancePct}%` }}
              />
            </div>
            <span className="text-zinc-600 dark:text-zinc-400 font-bold font-tabular">
              ▼ {breadth.declines}
            </span>
          </div>

          {/* Theme Switcher Toggle (Sun / Moon) */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg transition border flex items-center justify-center text-xs bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200 hover:text-black dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-white"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Indices Ticker Tape (Always visible, touch scrollable, mobile-optimized) */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-black/80 overflow-x-auto no-scrollbar py-1.5 px-3 sm:px-4">
        <div className="max-w-[1700px] mx-auto flex items-center gap-2.5 sm:gap-3 min-w-max">
          <div className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1 pr-2 border-r border-zinc-200 dark:border-zinc-800">
            <Activity className="w-3 h-3 text-black dark:text-white" />
            <span>Indices</span>
          </div>

          {indices.map((idx) => {
            const isBull = (idx.change ?? 0) >= 0;
            return (
              <div
                key={idx.symbol}
                className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition select-none text-xs shadow-sm"
              >
                <div className="flex items-baseline gap-1">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {idx.symbol}
                  </span>
                </div>

                <span className="font-mono font-bold text-black dark:text-white font-tabular">
                  {Number(idx.value).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>

                <div
                  className={`flex items-center gap-0.5 font-mono text-[11px] font-semibold font-tabular ${
                    isBull ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
                  }`}
                >
                  {isBull ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {isBull ? "+" : ""}
                    {Number(idx.change_pct).toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
