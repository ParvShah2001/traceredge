import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Volume2,
  VolumeX,
  Radio,
  Bell,
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
  soundEnabled,
  onToggleSound,
  activeAlertCount,
  onOpenAlerts,
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
    <header className="border-b border-dark-800 bg-dark-900/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      {/* Primary Bar */}
      <div className="max-w-[1700px] mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 text-xs">
        {/* Left: TracerEdge Brand & Session Status */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Logo */}
          <div className="flex items-center gap-2 font-black tracking-tight select-none">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-white text-black dark:bg-white dark:text-black flex items-center justify-center text-sm font-black">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-white dark:text-white">
                TRACER<span className="text-zinc-400 dark:text-zinc-400">EDGE</span>
              </span>
              <span className="hidden sm:inline-block text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 dark:bg-zinc-950 dark:border-zinc-800">
                NSE / BSE
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-zinc-800 hidden md:block" />

          {/* Session Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition ${
              isMarketOpen
                ? "bg-zinc-900 border-zinc-700 text-white"
                : "bg-zinc-950 border-zinc-800 text-zinc-300"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isMarketOpen ? "bg-white animate-ping" : "bg-zinc-400"
              }`}
            />
            {isMarketOpen ? (
              <span className="font-semibold text-white">
                LIVE SESSION
              </span>
            ) : (
              <span className="flex items-center gap-1 font-semibold text-zinc-200">
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
              className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-dark-850 hover:bg-dark-800 text-slate-300 hover:text-emerald-400 border border-dark-750 transition text-[11px] disabled:opacity-40"
              title="Verify & lock official Bhavcopy closing prices directly from NSE & BSE"
            >
              <RefreshCw className={`w-3 h-3 ${isVerifyingEod ? "animate-spin text-emerald-400" : ""}`} />
              <span>Verify Official EOD</span>
            </button>
          )}

          {/* Universe Meta Info */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-dark-850 border border-dark-750 text-slate-400 text-[11px]">
            <span>
              Universe: <strong className="text-emerald-500 dark:text-emerald-400 font-mono font-semibold">{universeStats?.stats?.total_stocks ? universeStats.stats.total_stocks.toLocaleString() : "7,640"}</strong>
            </span>
            <span className="text-slate-500">•</span>
            <span>2,587 NSE</span>
            <span className="text-slate-500">•</span>
            <span>5,053 BSE</span>
            {onSyncUniverse && (
              <button
                onClick={onSyncUniverse}
                disabled={isSyncingUniverse}
                className="p-0.5 rounded hover:text-emerald-400 transition"
                title="Refresh master lists"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isSyncingUniverse ? "animate-spin text-emerald-400" : ""}`} />
              </button>
            )}
          </div>
        </div>

        {/* Right: Breadth, Audio, Theme, Alerts */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Market Breadth Indicator (Tablet & Desktop) */}
          <div className="hidden sm:flex items-center gap-2 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 text-[11px]">
            <span className="text-zinc-400 font-medium">Breadth:</span>
            <span className="text-white font-semibold font-tabular">
              ▲ {breadth.advances}
            </span>
            <div className="w-14 h-1.5 bg-zinc-800 rounded-full overflow-hidden flex">
              <div
                className="bg-white h-full transition-all duration-300"
                style={{ width: `${advancePct}%` }}
              />
              <div
                className="bg-zinc-600 h-full transition-all duration-300"
                style={{ width: `${100 - advancePct}%` }}
              />
            </div>
            <span className="text-zinc-400 font-semibold font-tabular">
              ▼ {breadth.declines}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-1.5 rounded-lg transition border text-xs ${
              soundEnabled
                ? "bg-zinc-800 text-white border-zinc-700"
                : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300"
            }`}
            title={soundEnabled ? "Mute Tick Sounds" : "Enable Tick Sounds"}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Theme Switcher Toggle (Sun / Moon) */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg transition border flex items-center justify-center text-xs bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Alerts Drawer Button */}
          <button
            onClick={onOpenAlerts}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition text-xs font-medium"
          >
            <Bell className="w-3.5 h-3.5 text-zinc-300" />
            <span className="hidden sm:inline">Alerts</span>
            {activeAlertCount > 0 && (
              <span className="w-4 h-4 bg-white text-black font-bold rounded-full text-[10px] flex items-center justify-center">
                {activeAlertCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Indices Ticker Tape (Touch scrollable, mobile-optimized) */}
      <div className="border-t border-dark-800/80 bg-dark-950/70 overflow-x-auto no-scrollbar py-1.5 px-3 sm:px-4">
        <div className="max-w-[1700px] mx-auto flex items-center gap-2.5 sm:gap-3 min-w-max">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 pr-2 border-r border-dark-800">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span>Indices</span>
          </div>

          {indices.map((idx) => {
            const isBull = idx.change >= 0;
            return (
              <div
                key={idx.symbol}
                className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-dark-900 border border-dark-800 hover:border-dark-700 transition select-none text-xs"
              >
                <div className="flex items-baseline gap-1">
                  <span className="font-semibold text-slate-300">
                    {idx.symbol}
                  </span>
                </div>

                <span className="font-mono font-semibold text-white font-tabular">
                  {Number(idx.value).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>

                <div
                  className={`flex items-center gap-0.5 font-mono text-[11px] font-medium font-tabular ${
                    isBull ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
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
