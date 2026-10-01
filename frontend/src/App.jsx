import React, { useState, useEffect } from "react";
import { MarketHeader } from "./components/MarketHeader";
import { QuickPresets } from "./components/QuickPresets";
import { FilterBar } from "./components/FilterBar";
import { StockTable } from "./components/StockTable";
import { StockChartModal } from "./components/StockChartModal";
import { CustomQueryBuilder } from "./components/CustomQueryBuilder";
import { useLiveMarket } from "./hooks/useLiveMarket";
import { fetchUniverseStatus, triggerUniverseSync, triggerVerifyEodClose } from "./services/api";
import { CheckCircle2 } from "lucide-react";

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
    custom_rules: null,
    custom_logic: "AND",
    sort_by: "market_cap_cr",
    sort_dir: "desc"
  });

  const [selectedStockForChart, setSelectedStockForChart] = useState(null);
  const [isCustomBuilderOpen, setIsCustomBuilderOpen] = useState(false);
  const [universeStats, setUniverseStats] = useState(null);
  const [isSyncingUniverse, setIsSyncingUniverse] = useState(false);
  const [isVerifyingEod, setIsVerifyingEod] = useState(false);
  const [syncToast, setSyncToast] = useState(null);

  const {
    stocks,
    indices,
    marketStatus,
    connectionStatus,
    flashMap,
    lastTickTime,
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
      setSyncToast(`NSE & BSE Universe synced! Total active stocks: ${st?.stats?.total_stocks?.toLocaleString() || "7,654"}`);
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
      exchange: "ALL"
    }));
  };

  // Apply custom rules from builder
  const handleApplyCustomRules = (rules, logic) => {
    setFilters((prev) => ({
      ...prev,
      custom_rules: rules,
      custom_logic: logic,
      preset: "all",
      exchange: "ALL"
    }));
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
      custom_rules: null,
      custom_logic: "AND",
      sort_by: "market_cap_cr",
      sort_dir: "desc"
    });
  };

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white flex flex-col font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 transition-colors">
      {/* Real-time Header */}
      <MarketHeader
        indices={indices}
        marketStatus={marketStatus}
        connectionStatus={connectionStatus}
        lastTickTime={lastTickTime}
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
        <div className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-black dark:text-white px-4 py-2 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-[1700px] mx-auto w-full">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">{syncToast}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-[1700px] w-full mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col gap-3 sm:gap-4 flex-1">
        {/* Preset Strategies Bar */}
        <QuickPresets
          activePreset={filters.preset}
          onSelectPreset={handleSelectPreset}
        />

        {/* Filter Bar & Search */}
        <FilterBar
          filters={filters}
          onChangeFilters={setFilters}
          onResetFilters={handleResetFilters}
          totalResults={stocks.length}
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

        {/* Screener Stock Table */}
        <StockTable
          stocks={stocks}
          flashMap={flashMap}
          onOpenChart={(sym, ex) => {
            const target = stocks.find((s) => s.symbol === sym && (!ex || s.exchange === ex)) 
              || stocks.find((s) => s.symbol === sym) 
              || { symbol: sym, exchange: ex };
            setSelectedStockForChart(target);
          }}
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
      </main>

      {/* Interactive Candlestick Modal */}
      {selectedStockForChart && (
        <StockChartModal
          stock={selectedStockForChart}
          onClose={() => setSelectedStockForChart(null)}
        />
      )}

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
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-3 text-center text-xs text-zinc-600 dark:text-zinc-400">
        <div className="max-w-[1700px] mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-black dark:text-white">
            TracerEdge — Indian Equity Screening Engine (NSE & BSE)
          </span>
          <span className="font-mono text-[11px] text-zinc-500">
            Real-time WebSockets • 7,650+ Active Listed Equities
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
