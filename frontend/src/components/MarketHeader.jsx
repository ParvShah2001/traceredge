import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
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
  onVerifyEodClose,
  isVerifyingEod
}) {
  const isMarketOpen = marketStatus?.is_market_open;
  const breadth = marketStatus?.breadth || { advances: 0, declines: 0, unchanged: 0, total: 0 };
  const advancePct = breadth.total > 0 ? Math.round((breadth.advances / breadth.total) * 100) : 50;
  const totalStocksCount = universeStats?.stats?.total_stocks ? universeStats.stats.total_stocks.toLocaleString() : "7,654";

  return (
    <header className="border-b border-zinc-800 bg-black sticky top-0 z-40 select-none">
      {/* Primary Navigation Bar */}
      <div className="max-w-[1700px] mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 text-xs">
        {/* Left: Brand & Market Open/Close Indicator */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          {/* TracerEdge Logo */}
          <div className="flex items-center gap-2 font-black tracking-tight select-none">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-white text-black flex items-center justify-center text-sm font-black shadow-sm">
              <Zap className="w-4 h-4 fill-black text-black" />
            </div>
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-white">
              TRACER<span className="text-zinc-400">EDGE</span>
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

          {/* Prominent Market Status (Open / Closed) Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full border text-[11px] font-semibold transition shadow-xs ${
              isMarketOpen
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-zinc-900/90 border-zinc-800 text-zinc-300"
            }`}
          >
            <span className="relative flex h-2 w-2">
              {isMarketOpen && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isMarketOpen ? "bg-emerald-400" : "bg-rose-500"
                }`}
              ></span>
            </span>

            {isMarketOpen ? (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-wide">MARKET OPEN</span>
                <span className="text-[10px] text-emerald-400/80 font-mono hidden sm:inline">09:15–15:30 IST</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-zinc-200 tracking-wide">MARKET CLOSED</span>
                <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">Official EOD Settled</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions, Breadth, Universe Sync, EOD Verify */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Master List Universe Sync Button (Mobile & Desktop) */}
          {onSyncUniverse && (
            <button
              onClick={onSyncUniverse}
              disabled={isSyncingUniverse}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition text-[11px] font-semibold disabled:opacity-50"
              title="Synchronize complete NSE & BSE master stock universe"
            >
              <RefreshCw className={`w-3 h-3 text-zinc-400 ${isSyncingUniverse ? "animate-spin text-white" : ""}`} />
              <span className="hidden sm:inline text-zinc-400">Universe:</span>
              <span className="font-bold text-white">{totalStocksCount}</span>
            </button>
          )}

          {/* EOD Settlement Verification Trigger */}
          {!isMarketOpen && onVerifyEodClose && (
            <button
              onClick={onVerifyEodClose}
              disabled={isVerifyingEod}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition text-[11px] font-semibold disabled:opacity-50"
              title="Verify & lock official Bhavcopy closing prices directly from NSE & BSE"
            >
              <ShieldCheck className={`w-3.5 h-3.5 text-zinc-400 ${isVerifyingEod ? "animate-spin text-white" : ""}`} />
              <span className="hidden md:inline">Verify Official EOD</span>
              <span className="md:hidden">EOD</span>
            </button>
          )}

          {/* Market Breadth Indicator (Tablet & Desktop) */}
          <div className="hidden md:flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 text-[11px]">
            <span className="text-emerald-400 font-bold font-tabular">
              ▲ {breadth.advances}
            </span>
            <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${advancePct}%` }}
              />
              <div
                className="bg-rose-500 h-full transition-all duration-300"
                style={{ width: `${100 - advancePct}%` }}
              />
            </div>
            <span className="text-rose-400 font-bold font-tabular">
              ▼ {breadth.declines}
            </span>
          </div>
        </div>
      </div>

      {/* Indices Ticker Tape (Continuous, touch scrollable, mobile-optimized) */}
      <div className="border-t border-zinc-850 bg-zinc-950 overflow-x-auto no-scrollbar py-1.5 px-3 sm:px-4">
        <div className="max-w-[1700px] mx-auto flex items-center gap-2.5 sm:gap-3 min-w-max">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 pr-2 border-r border-zinc-800">
            <Activity className="w-3 h-3 text-white" />
            <span>Indices</span>
          </div>

          {indices.map((idx) => {
            const isBull = (idx.change ?? 0) >= 0;
            return (
              <div
                key={idx.symbol}
                className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition select-none text-xs"
              >
                <span className="font-bold text-zinc-300 text-[11px]">
                  {idx.symbol}
                </span>

                <span className="font-mono font-bold text-white text-[11px] font-tabular">
                  {Number(idx.value).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>

                <div
                  className={`flex items-center gap-0.5 font-mono text-[10px] font-bold font-tabular ${
                    isBull ? "text-emerald-400" : "text-rose-400"
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
