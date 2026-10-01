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
  const totalStocksCount = universeStats?.stats?.total_stocks ? universeStats.stats.total_stocks.toLocaleString() : "7,654";

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black sticky top-0 z-40 transition-colors">
      {/* Primary Bar */}
      <div className="max-w-[1700px] mx-auto px-2.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-3 text-xs">
        {/* Left: TracerEdge Brand & Session Status */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          {/* Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2 font-black tracking-tight select-none">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-sm font-black shadow-sm">
              <Zap className="w-4 h-4 fill-current text-white dark:text-black" />
            </div>
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-black dark:text-white">
              TRACER<span className="text-zinc-500 dark:text-zinc-400">EDGE</span>
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

          {/* Session Status Pill */}
          <div
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full border text-[10px] sm:text-[11px] font-medium transition ${
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
                LIVE
              </span>
            ) : (
              <span className="flex items-center gap-1 font-semibold text-zinc-800 dark:text-zinc-200">
                <ShieldCheck className="w-3 h-3 text-zinc-700 dark:text-zinc-300" />
                <span className="hidden sm:inline">EOD SETTLED</span>
                <span className="sm:hidden">CLOSED</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions, Breadth, Theme, Refresh Buttons (All Viewports) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Master List Universe Sync Button (Mobile & Desktop) */}
          {onSyncUniverse && (
            <button
              onClick={onSyncUniverse}
              disabled={isSyncingUniverse}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-800 transition text-[11px] font-semibold disabled:opacity-50"
              title="Refresh NSE & BSE master stock universe"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncingUniverse ? "animate-spin text-black dark:text-white" : ""}`} />
              <span className="hidden sm:inline">Universe:</span>
              <span className="font-bold">{totalStocksCount}</span>
            </button>
          )}

          {/* EOD Verification Trigger (Mobile & Desktop) */}
          {!isMarketOpen && onVerifyEodClose && (
            <button
              onClick={onVerifyEodClose}
              disabled={isVerifyingEod}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-800 transition text-[11px] font-semibold disabled:opacity-50"
              title="Verify & lock official Bhavcopy closing prices directly from NSE & BSE"
            >
              <ShieldCheck className={`w-3 h-3 ${isVerifyingEod ? "animate-spin text-black dark:text-white" : ""}`} />
              <span className="hidden md:inline">Verify Official EOD</span>
              <span className="md:hidden">EOD</span>
            </button>
          )}

          {/* Market Breadth Indicator (Tablet & Desktop) */}
          <div className="hidden md:flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px]">
            <span className="text-black dark:text-white font-bold font-tabular">
              ▲ {breadth.advances}
            </span>
            <div className="w-10 h-1.5 bg-zinc-300 dark:bg-zinc-800 rounded-full overflow-hidden flex">
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
            className="p-1.5 rounded-lg transition border flex items-center justify-center text-xs bg-zinc-100 text-black border-zinc-200 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-white dark:border-zinc-800 dark:hover:bg-zinc-800"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Indices Ticker Tape (Always visible, touch scrollable, mobile-optimized) */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-x-auto no-scrollbar py-1.5 px-2.5 sm:px-4">
        <div className="max-w-[1700px] mx-auto flex items-center gap-2 sm:gap-2.5 min-w-max">
          <div className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1 pr-1.5 border-r border-zinc-200 dark:border-zinc-800">
            <Activity className="w-3 h-3 text-black dark:text-white" />
            <span>Indices</span>
          </div>

          {indices.map((idx) => {
            const isBull = (idx.change ?? 0) >= 0;
            return (
              <div
                key={idx.symbol}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition select-none text-xs shadow-xs"
              >
                <span className="font-bold text-zinc-800 dark:text-zinc-200 text-[11px]">
                  {idx.symbol}
                </span>

                <span className="font-mono font-bold text-black dark:text-white text-[11px] font-tabular">
                  {Number(idx.value).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>

                <div
                  className={`flex items-center gap-0.5 font-mono text-[10px] font-bold font-tabular ${
                    isBull ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
                  }`}
                >
                  {isBull ? (
                    <TrendingUp className="w-2.5 h-2.5" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5" />
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

export default React.memo(MarketHeader);
