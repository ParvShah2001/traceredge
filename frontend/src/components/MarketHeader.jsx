import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Volume2,
  VolumeX,
  Radio,
  Clock,
  Bell,
  RefreshCw,
  Sun,
  Moon,
  ShieldCheck
} from "lucide-react";

export function MarketHeader({
  indices,
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
    <header className="border-b border-dark-800 bg-dark-900/90 backdrop-blur sticky top-0 z-40">
      {/* Top Bar: Connection, Market State, Breadth & Audio */}
      <div className="max-w-[1700px] mx-auto px-4 py-2 flex flex-wrap items-center justify-between text-xs gap-3">
        {/* Left: Branding & Status Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-base text-white tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-dark-950 font-black text-lg shadow-lg shadow-emerald-500/20">
              ₹
            </div>
            <span>
              BHARAT<span className="text-emerald-400">SCREENER</span>
            </span>
            <span className="text-[10px] bg-dark-800 text-slate-400 px-1.5 py-0.5 rounded font-mono border border-dark-700">
              NSE & BSE
            </span>
          </div>

          <div className="h-4 w-px bg-dark-700 hidden sm:block" />

          {/* Market Status Pill */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
            isMarketOpen
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
          }`}>
            <span
              className={`w-2 h-2 rounded-full ${
                isMarketOpen ? "bg-emerald-400 animate-ping" : "bg-emerald-400"
              }`}
            />
            {isMarketOpen ? (
              <span className="font-semibold text-emerald-400">
                LIVE SESSION
              </span>
            ) : (
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                MARKET CLOSED • OFFICIAL EOD SETTLEMENT
              </span>
            )}
            <span className="text-slate-500 font-mono hidden md:inline">
              09:15 - 15:30 IST
            </span>
          </div>

          {/* On-demand EOD Close Verification Button */}
          {!isMarketOpen && onVerifyEodClose && (
            <button
              onClick={onVerifyEodClose}
              disabled={isVerifyingEod}
              className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/20 transition disabled:opacity-50"
              title="Verify & lock official exchange Bhavcopy closing prices directly from NSE & BSE"
            >
              <RefreshCw className={`w-3 h-3 ${isVerifyingEod ? "animate-spin text-emerald-400" : ""}`} />
              <span>Verify Official EOD</span>
            </button>
          )}

          {/* WebSocket Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-dark-850 text-slate-400 border border-dark-800">
            <Radio
              className={`w-3 h-3 ${
                connectionStatus === "connected"
                  ? "text-emerald-400 animate-pulse"
                  : "text-rose-400"
              }`}
            />
            <span className="capitalize">{connectionStatus}</span>
            {lastTickTime && (
              <span className="text-[11px] text-slate-500 font-mono">
                ({lastTickTime})
              </span>
            )}
          </div>
          {/* Indian Market Universe Stats & Live Sync */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-dark-850 border border-dark-700 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300 font-medium">
              Universe:{" "}
              <strong className="text-emerald-400 font-mono">
                {universeStats?.stats?.total_stocks ? universeStats.stats.total_stocks.toLocaleString() : "7,640"}
              </strong>{" "}
              Equities (<span className="text-emerald-400 font-semibold font-mono">2,587</span> NSE • <span className="text-amber-400 font-semibold font-mono">5,053</span> BSE)
            </span>
            {onSyncUniverse && (
              <button
                onClick={onSyncUniverse}
                disabled={isSyncingUniverse}
                className="p-1 rounded hover:bg-dark-750 text-slate-400 hover:text-emerald-400 transition disabled:opacity-40"
                title={`Last synced: ${universeStats?.last_synced || "Continuous"}. Click to refresh official masters from NSE & BSE.`}
              >
                <RefreshCw
                  className={`w-3 h-3 ${isSyncingUniverse ? "animate-spin text-emerald-400" : ""}`}
                />
              </button>
            )}
          </div>
        </div>

        {/* Right: Market Breadth, Alerts, Sound */}
        <div className="flex items-center gap-4">
          {/* Market Breadth Bar */}
          <div className="hidden sm:flex items-center gap-2 bg-dark-850 px-3 py-1 rounded border border-dark-800">
            <span className="text-slate-400 font-medium">Market Breadth:</span>
            <span className="text-emerald-400 font-semibold font-tabular flex items-center gap-0.5">
              ▲ {breadth.advances}
            </span>
            <div className="w-16 h-2 bg-dark-750 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${advancePct}%` }}
              />
              <div
                className="bg-rose-500 h-full transition-all duration-500"
                style={{ width: `${100 - advancePct}%` }}
              />
            </div>
            <span className="text-rose-400 font-semibold font-tabular flex items-center gap-0.5">
              ▼ {breadth.declines}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-1.5 rounded transition border ${
              soundEnabled
                ? "bg-dark-800 text-emerald-400 border-dark-700 hover:bg-dark-750"
                : "bg-dark-850 text-slate-500 border-dark-800 hover:text-slate-400"
            }`}
            title={soundEnabled ? "Mute Tick Sounds" : "Enable Tick Sounds"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className={`p-1.5 rounded transition border flex items-center justify-center ${
              theme === "light"
                ? "bg-amber-100 text-amber-600 border-amber-300 hover:bg-amber-200"
                : "bg-dark-800 text-amber-400 border-dark-700 hover:bg-dark-750"
            }`}
            title={theme === "light" ? "Switch to Dark Theme" : "Switch to Light Theme"}
          >
            {theme === "light" ? <Sun className="w-4 h-4 text-amber-600" /> : <Moon className="w-4 h-4 text-indigo-300" />}
          </button>

          {/* Alert Bell */}
          <button
            onClick={onOpenAlerts}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-dark-800 hover:bg-dark-750 border border-dark-700 text-slate-300 relative transition"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium">Alerts</span>
            {activeAlertCount > 0 && (
              <span className="w-4 h-4 bg-amber-500 text-dark-950 font-bold rounded-full text-[10px] flex items-center justify-center">
                {activeAlertCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Indices Ticker Tape */}
      <div className="border-t border-dark-800/80 bg-dark-950/80 overflow-x-auto no-scrollbar py-2 px-4">
        <div className="max-w-[1700px] mx-auto flex items-center gap-4 min-w-max">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 pr-2 border-r border-dark-800">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span>Key Indices</span>
          </div>

          {indices.map((idx) => {
            const isBull = idx.change >= 0;
            return (
              <div
                key={idx.symbol}
                className="flex items-center gap-2 px-3 py-1 rounded bg-dark-900 border border-dark-800/80 hover:border-dark-700 transition"
              >
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-slate-200 text-xs">
                    {idx.symbol}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    ({idx.exchange})
                  </span>
                </div>

                <span className="font-semibold text-xs text-white font-tabular">
                  {Number(idx.value).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>

                <div
                  className={`flex items-center gap-0.5 text-xs font-semibold font-tabular ${
                    isBull ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isBull ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {isBull ? "+" : ""}
                    {idx.change > 0 ? idx.change.toFixed(2) : idx.change.toFixed(2)}
                  </span>
                  <span>
                    ({isBull ? "+" : ""}
                    {idx.change_pct.toFixed(2)}%)
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
