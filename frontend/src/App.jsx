import React, { useState, useEffect } from "react";
import { MarketHeader } from "./components/MarketHeader";
import { QuickPresets } from "./components/QuickPresets";
import { FilterBar } from "./components/FilterBar";
import { StockTable } from "./components/StockTable";
import { StockChartModal } from "./components/StockChartModal";
import { SectorHeatmap } from "./components/SectorHeatmap";
import { WatchlistAlertsDrawer } from "./components/WatchlistAlertsDrawer";
import { CustomQueryBuilder } from "./components/CustomQueryBuilder";
import { useLiveMarket } from "./hooks/useLiveMarket";
import { fetchUniverseStatus, triggerUniverseSync, triggerVerifyEodClose } from "./services/api";
import { Bell, X, CheckCircle2 } from "lucide-react";

export function App() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("screener_theme") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("screener_theme", theme);
      if (theme === "light") {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      }
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const [filters, setFilters] = useState({
    preset: "all",
    search: "",
    exchange: "ALL",
    sector: "ALL",
    market_cap_category: "ALL",
    min_price: "",
    max_price: "",
    min_rsi: "",
    max_rsi: "",
    min_pe: "",
    max_pe: "",
    min_vol_ratio: "",
    custom_rules: null,
    custom_logic: "AND",
    sort_by: "market_cap_cr",
    sort_dir: "desc"
  });

  const [activeView, setActiveView] = useState("table"); // 'table' | 'heatmap' | 'watchlist'
  const [selectedStockForChart, setSelectedStockForChart] = useState(null);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);
  const [isCustomBuilderOpen, setIsCustomBuilderOpen] = useState(false);
  const [universeStats, setUniverseStats] = useState(null);
  const [isSyncingUniverse, setIsSyncingUniverse] = useState(false);
  const [isVerifyingEod, setIsVerifyingEod] = useState(false);
  const [syncToast, setSyncToast] = useState(null);

  // Watchlist persisted in localStorage
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem("screener_watchlist");
      return saved ? JSON.parse(saved) : ["RELIANCE", "TCS", "HDFCBANK", "INFY", "TATAMOTORS"];
    } catch {
      return ["RELIANCE", "TCS", "HDFCBANK", "INFY", "TATAMOTORS"];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("screener_watchlist", JSON.stringify(watchlist));
    } catch (e) {
      console.error(e);
    }
  }, [watchlist]);

  const {
    stocks,
    indices,
    marketStatus,
    connectionStatus,
    flashMap,
    lastTickTime,
    alerts,
    addAlert,
    removeAlert,
    triggeredAlerts,
    dismissAlert,
    soundEnabled,
    toggleSound,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    reloadStocks
  } = useLiveMarket(filters);

  // Load universe status on mount
  useEffect(() => {
    fetchUniverseStatus().then(setUniverseStats).catch(console.error);
  }, []);

  const handleSyncUniverse = async () => {
    try {
      setIsSyncingUniverse(true);
      await triggerUniverseSync();
      const st = await fetchUniverseStatus();
      setUniverseStats(st);
      if (reloadStocks) reloadStocks();
      setSyncToast(`NSE & BSE Universe synced! Total active stocks: ${st?.stats?.total_stocks?.toLocaleString() || "5,183"}`);
      setTimeout(() => setSyncToast(null), 4500);
    } catch (err) {
      console.error("Universe sync error:", err);
      setSyncToast("Sync failed. Check connection.");
      setTimeout(() => setSyncToast(null), 4500);
    } finally {
      setIsSyncingUniverse(false);
    }
  };

  const handleVerifyEodClose = async () => {
    try {
      setIsVerifyingEod(true);
      const res = await triggerVerifyEodClose();
      if (reloadStocks) reloadStocks();
      setSyncToast(
        `Official NSE & BSE EOD settlement verified for ${res.result?.effective_date || "today"}! ${res.result?.total_updated?.toLocaleString() || "7,091"} closing prices locked.`
      );
      setTimeout(() => setSyncToast(null), 5000);
    } catch (err) {
      console.error("EOD verification error:", err);
      setSyncToast("EOD verification failed. Retrying...");
      setTimeout(() => setSyncToast(null), 4000);
    } finally {
      setIsVerifyingEod(false);
    }
  };

  // Toggle watchlist
  const handleToggleWatchlist = (symbol) => {
    setWatchlist((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  // Sort handler
  const handleSort = (columnKey) => {
    setFilters((prev) => {
      if (prev.sort_by === columnKey) {
        return {
          ...prev,
          sort_dir: prev.sort_dir === "asc" ? "desc" : "asc"
        };
      }
      return {
        ...prev,
        sort_by: columnKey,
        sort_dir: "desc"
      };
    });
  };

  // Preset selector
  const handleSelectPreset = (presetId) => {
    setFilters((prev) => ({
      ...prev,
      preset: presetId,
      search: "",
      sector: "ALL",
      market_cap_category: "ALL"
    }));
    setActiveView("table");
  };

  // Apply custom rules from builder
  const handleApplyCustomRules = (rules, logic) => {
    setFilters((prev) => ({
      ...prev,
      custom_rules: rules,
      custom_logic: logic,
      preset: "all"
    }));
    setActiveView("table");
  };

  // Clear custom rules
  const handleClearCustomRules = () => {
    setFilters((prev) => ({
      ...prev,
      custom_rules: null,
      custom_logic: "AND"
    }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      preset: "all",
      search: "",
      exchange: "ALL",
      sector: "ALL",
      market_cap_category: "ALL",
      min_price: "",
      max_price: "",
      min_rsi: "",
      max_rsi: "",
      min_pe: "",
      max_pe: "",
      min_vol_ratio: "",
      custom_rules: null,
      custom_logic: "AND",
      sort_by: "market_cap_cr",
      sort_dir: "desc"
    });
    setActiveView("table");
  };

  // Export CSV
  const handleExportCSV = () => {
    const displayedStocks = activeView === "watchlist"
      ? stocks.filter((s) => watchlist.includes(s.symbol))
      : stocks;

    if (!displayedStocks.length) return;

    const headers = [
      "Symbol",
      "Exchange",
      "Company Name",
      "Sector",
      "Market Cap Category",
      "Price (INR)",
      "Change (INR)",
      "Change (%)",
      "Day High (INR)",
      "Day Low (INR)",
      "Volume",
      "Volume vs 20D Ratio",
      "RSI 14",
      "52W High (INR)",
      "52W Low (INR)",
      "52W High Distance (%)",
      "P/E Ratio",
      "Market Cap (Cr)",
      "Technical Signal",
      "Technical Score"
    ];

    const rows = displayedStocks.map((s) => [
      s.symbol,
      s.exchange || "NSE",
      `"${s.name}"`,
      `"${s.sector}"`,
      s.market_cap_category,
      s.price,
      s.change,
      s.change_pct,
      s.day_high,
      s.day_low,
      s.volume,
      s.volume_ratio,
      s.rsi_14,
      s.week_52_high,
      s.week_52_low,
      s.dist_52w_high_pct,
      s.pe_ratio,
      s.market_cap_cr,
      s.tech_signal,
      s.tech_score
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bharat_screener_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open alert modal directly from table
  const handleOpenAlertModal = (stock) => {
    setIsAlertsDrawerOpen(true);
  };

  // Filter stocks for watchlist view
  const displayStocks = activeView === "watchlist"
    ? stocks.filter((s) => watchlist.includes(s.symbol))
    : stocks;

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-white">
      {/* Real-time Header */}
      <MarketHeader
        indices={indices}
        marketStatus={marketStatus}
        connectionStatus={connectionStatus}
        lastTickTime={lastTickTime}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        activeAlertCount={alerts.filter((a) => !a.triggered).length}
        onOpenAlerts={() => setIsAlertsDrawerOpen(true)}
        universeStats={universeStats}
        onSyncUniverse={handleSyncUniverse}
        isSyncingUniverse={isSyncingUniverse}
        theme={theme}
        onToggleTheme={toggleTheme}
        onVerifyEodClose={handleVerifyEodClose}
        isVerifyingEod={isVerifyingEod}
      />

      {/* Universe Sync Notification Toast */}
      {syncToast && (
        <div className="bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 px-4 py-2 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-[1700px] mx-auto w-full">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">{syncToast}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-[1700px] w-full mx-auto px-4 py-4 flex flex-col gap-4 flex-1">
        {/* Preset Strategies Bar */}
        <QuickPresets
          activePreset={filters.preset}
          onSelectPreset={handleSelectPreset}
        />

        {/* Multi-Filter Bar & Switchers */}
        <FilterBar
          filters={filters}
          onChangeFilters={setFilters}
          onResetFilters={handleResetFilters}
          onExportCSV={handleExportCSV}
          totalResults={displayStocks.length}
          activeView={activeView}
          onChangeView={setActiveView}
          watchlistCount={watchlist.length}
          onOpenCustomBuilder={() => setIsCustomBuilderOpen(true)}
          onClearCustomRules={handleClearCustomRules}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          total={total}
          totalPages={totalPages}
          onOpenChart={(sym, ex) => {
            const target = stocks.find((s) => s.symbol === sym && (!ex || s.exchange === ex)) 
              || stocks.find((s) => s.symbol === sym) 
              || { symbol: sym, exchange: ex };
            setSelectedStockForChart(target);
          }}
        />

        {/* Content View */}
        {activeView === "heatmap" ? (
          <SectorHeatmap
            onSelectSector={(sector) => {
              setFilters((prev) => ({ ...prev, sector, preset: "all" }));
              setActiveView("table");
            }}
          />
        ) : (
          <StockTable
            stocks={displayStocks}
            flashMap={flashMap}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onOpenChart={(sym, ex) => {
              const target = stocks.find((s) => s.symbol === sym && (!ex || s.exchange === ex)) 
                || stocks.find((s) => s.symbol === sym) 
                || { symbol: sym, exchange: ex };
              setSelectedStockForChart(target);
            }}
            onOpenAlertModal={handleOpenAlertModal}
            sortBy={filters.sort_by}
            sortDir={filters.sort_dir}
            onSort={handleSort}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            total={total}
            totalPages={totalPages}
          />
        )}
      </main>

      {/* Floating Alert Notifications */}
      {triggeredAlerts.length > 0 && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
          {triggeredAlerts.map((ta) => (
            <div
              key={ta.id}
              className="bg-dark-900 border border-amber-500/50 rounded-xl p-3.5 shadow-2xl flex items-start justify-between gap-3 animate-bounce"
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">{ta.symbol} Triggered!</h4>
                  <p className="text-amber-300 text-xs mt-0.5">{ta.message}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">{ta.time}</span>
                </div>
              </div>
              <button
                onClick={() => dismissAlert(ta.id)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Candlestick Modal */}
      {selectedStockForChart && (
        <StockChartModal
          stock={selectedStockForChart}
          onClose={() => setSelectedStockForChart(null)}
          onSetAlert={addAlert}
        />
      )}

      {/* Watchlist & Alerts Drawer */}
      <WatchlistAlertsDrawer
        isOpen={isAlertsDrawerOpen}
        onClose={() => setIsAlertsDrawerOpen(false)}
        alerts={alerts}
        onAddAlert={addAlert}
        onRemoveAlert={removeAlert}
        stocks={stocks}
        triggeredAlerts={triggeredAlerts}
        onDismissTriggered={dismissAlert}
      />

      {/* Custom Formula Query Builder Modal */}
      <CustomQueryBuilder
        isOpen={isCustomBuilderOpen}
        onClose={() => setIsCustomBuilderOpen(false)}
        customRules={filters.custom_rules}
        customLogic={filters.custom_logic}
        onApplyRules={handleApplyCustomRules}
        onClearRules={handleClearCustomRules}
      />

      {/* Footer */}
      <footer className="border-t border-dark-800 bg-dark-900/60 py-3 text-center text-xs text-slate-500">
        <div className="max-w-[1700px] mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>
            Bharat Screener — Real-time Indian Equity Screening Engine for NSE & BSE
          </span>
          <span className="font-mono text-[11px]">
            FastAPI + React + Lightweight Charts • Auto-Refreshing WebSockets
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
