import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  RotateCcw,
  Download,
  LayoutGrid,
  ListFilter,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkles,
  X,
  LineChart,
  Loader2
} from "lucide-react";
import { searchStocksApi } from "../services/api";

export const SECTORS = [
  "ALL",
  "Banking & Financials",
  "Information Technology",
  "Energy & Power",
  "Chemicals & Petrochemicals",
  "Automobile",
  "Pharmaceuticals & Healthcare",
  "Consumer Goods (FMCG)",
  "Metals & Mining",
  "Infrastructure & Capital Goods",
  "Defense & Aerospace",
  "Telecommunications",
  "Consumer Internet & Tech"
];

export function FilterBar({
  filters,
  onChangeFilters,
  onResetFilters,
  onExportCSV,
  totalResults,
  activeView,
  onChangeView,
  watchlistCount,
  onOpenCustomBuilder,
  onClearCustomRules,
  page = 1,
  pageSize = 50,
  total = 0,
  totalPages = 1,
  onOpenChart
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Sync external search filter changes
  useEffect(() => {
    setSearchInput(filters.search || "");
  }, [filters.search]);

  // Click outside listener to dismiss autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);

    if (!val.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      onChangeFilters({ ...filters, search: "" });
      return;
    }

    setShowDropdown(true);
    setIsSearching(true);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchStocksApi(val.trim(), 8, filters.exchange || "ALL");
        setSuggestions(results);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 200);
  };

  const handleSelectSuggestion = (sym) => {
    setSearchInput(sym);
    setShowDropdown(false);
    onChangeFilters({ ...filters, search: sym });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setShowDropdown(false);
      onChangeFilters({ ...filters, search: searchInput.trim() });
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSuggestions([]);
    setShowDropdown(false);
    onChangeFilters({ ...filters, search: "" });
  };

  const handleExchangeChange = (e) => {
    onChangeFilters({ ...filters, exchange: e.target.value });
  };

  const handleSectorChange = (e) => {
    onChangeFilters({ ...filters, sector: e.target.value });
  };

  const handleCapChange = (e) => {
    onChangeFilters({ ...filters, market_cap_category: e.target.value });
  };

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-xl p-3 shadow-lg flex flex-col gap-3">
      {/* Primary Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search & Quick Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Autocomplete Search Box across 5,180+ Equities */}
          <div ref={searchContainerRef} className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search 7,640+ stocks (e.g. RELIANCE, TCS, 500325)..."
              value={searchInput}
              onChange={handleInputChange}
              onFocus={() => {
                if (suggestions.length > 0) setShowDropdown(true);
              }}
              onKeyDown={handleKeyDown}
              className="w-full bg-dark-850 border border-dark-750 focus:border-emerald-500 rounded-lg pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
            />
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
            ) : searchInput ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}

            {/* Floating Autocomplete Dropdown */}
            {showDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-dark-900 border border-dark-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto divide-y divide-dark-800">
                <div className="px-3 py-1.5 bg-dark-950 text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex justify-between items-center">
                  <span>Whole Indian Market Search</span>
                  <span>{suggestions.length} matches</span>
                </div>
                {suggestions.length === 0 && !isSearching && (
                  <div className="px-4 py-4 text-xs text-slate-400 text-center">
                    No matching stocks found for "{searchInput}"
                  </div>
                )}
                {suggestions.map((item) => (
                  <div
                    key={item.id || `${item.symbol}:${item.exchange}`}
                    onClick={() => handleSelectSuggestion(item.symbol)}
                    className="px-3 py-2.5 hover:bg-dark-800/90 cursor-pointer flex items-center justify-between gap-2 transition group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-white group-hover:text-emerald-400 text-xs">
                          {item.symbol}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${
                          item.exchange === "BSE"
                            ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                            : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        }`}>
                          {item.exchange}
                        </span>
                        {item.bse_code && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            #{item.bse_code}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          {item.sector}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.name}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-mono text-xs text-white">
                          ₹{item.price > 0 ? Number(item.price).toFixed(2) : "—"}
                        </div>
                        <div
                          className={`text-[10px] font-mono ${
                            item.change_pct >= 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {item.change_pct >= 0 ? "+" : ""}
                          {item.change_pct}%
                        </div>
                      </div>

                      {onOpenChart && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDropdown(false);
                            onOpenChart(item.symbol, item.exchange);
                          }}
                          className="p-1.5 rounded-lg bg-dark-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 border border-dark-750 transition"
                          title="Open Candlestick Chart"
                        >
                          <LineChart className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prominent Exchange Filter Switcher Pills */}
          <div className="flex items-center bg-dark-850 p-0.5 rounded-lg border border-dark-750">
            <button
              type="button"
              onClick={() => onChangeFilters({ ...filters, exchange: "ALL" })}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                !filters.exchange || filters.exchange === "ALL"
                  ? "bg-slate-700 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All (7,640)
            </button>
            <button
              type="button"
              onClick={() => onChangeFilters({ ...filters, exchange: "NSE" })}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
                filters.exchange === "NSE"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-emerald-400/80 hover:text-emerald-300"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              NSE (2,587)
            </button>
            <button
              type="button"
              onClick={() => onChangeFilters({ ...filters, exchange: "BSE" })}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
                filters.exchange === "BSE"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-amber-400/80 hover:text-amber-300"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              BSE (5,053)
            </button>
          </div>

          {/* Sector Selector */}
          <select
            value={filters.sector || "ALL"}
            onChange={handleSectorChange}
            className="bg-dark-850 border border-dark-750 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            {SECTORS.map((sec) => (
              <option key={sec} value={sec}>
                {sec === "ALL" ? "All Sectors" : sec}
              </option>
            ))}
          </select>

          {/* Market Cap Selector */}
          <select
            value={filters.market_cap_category || "ALL"}
            onChange={handleCapChange}
            className="bg-dark-850 border border-dark-750 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Market Caps</option>
            <option value="Large Cap">Large Cap (Nifty 50)</option>
            <option value="Mid Cap">Mid Cap Growth</option>
          </select>

          {/* Toggle Advanced Sliders */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              showAdvanced
                ? "bg-dark-800 text-emerald-400 border-emerald-500/40"
                : "bg-dark-850 text-slate-300 border-dark-750 hover:bg-dark-800"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Multi-Filter</span>
            {showAdvanced ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>

          {/* Custom Query Builder Button */}
          <button
            onClick={onOpenCustomBuilder}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              filters.custom_rules && filters.custom_rules.length > 0
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-sm shadow-emerald-500/20"
                : "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border-emerald-500/30 text-emerald-300"
            }`}
            title="Create custom comparison rules e.g. Low > Prev High, Low == Open"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Custom Query Builder</span>
            {filters.custom_rules && filters.custom_rules.length > 0 && (
              <span className="text-[10px] bg-emerald-500 text-dark-950 font-bold px-1.5 rounded-full">
                {filters.custom_rules.length}
              </span>
            )}
          </button>

          {/* Reset Filters */}
          <button
            onClick={onResetFilters}
            className="p-1.5 rounded-lg bg-dark-850 hover:bg-dark-800 border border-dark-750 text-slate-400 hover:text-white transition"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View Switchers & Export */}
        <div className="flex items-center gap-2">
          {/* Results count */}
          <span className="text-xs text-slate-400 mr-2 font-tabular">
            {total > 0 ? (
              <>
                Showing <strong className="text-emerald-400 font-semibold">{((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)}</strong> of <strong className="text-white font-semibold">{total.toLocaleString()}</strong> stocks
              </>
            ) : (
              <>
                Showing <strong className="text-white">{totalResults}</strong> stocks
              </>
            )}
          </span>

          {/* View Mode Buttons */}
          <div className="bg-dark-850 p-1 rounded-lg border border-dark-750 flex items-center gap-1">
            <button
              onClick={() => onChangeView("table")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${
                activeView === "table"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Screener</span>
            </button>

            <button
              onClick={() => onChangeView("heatmap")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${
                activeView === "heatmap"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Sector Heatmap</span>
            </button>

            <button
              onClick={() => onChangeView("watchlist")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${
                activeView === "watchlist"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Watchlist</span>
              {watchlistCount > 0 && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded-full font-bold">
                  {watchlistCount}
                </span>
              )}
            </button>
          </div>

          {/* Export to CSV */}
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-850 hover:bg-dark-800 border border-dark-750 text-slate-300 hover:text-white text-xs font-medium transition"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Active Custom Rules Banner */}
      {filters.custom_rules && filters.custom_rules.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Custom Strategy Active ({filters.custom_rules.length} conditions, {filters.custom_logic || "AND"}):</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {filters.custom_rules.map((r, i) => (
                <span
                  key={i}
                  className="bg-dark-900/90 text-slate-200 px-2 py-0.5 rounded border border-dark-700 font-mono text-[11px]"
                >
                  {r.left_field} {r.operator} {r.right_type === "field" ? r.right_field : r.right_value}
                  {r.multiplier && r.multiplier !== 1.0 ? ` × ${r.multiplier}` : ""}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCustomBuilder}
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline text-[11px]"
            >
              Edit Rules
            </button>
            <button
              onClick={onClearCustomRules}
              className="p-1 rounded bg-dark-850 hover:bg-dark-800 text-slate-400 hover:text-rose-400 border border-dark-750 transition"
              title="Clear Custom Strategy"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Expandable Advanced Multi-Filters Panel */}
      {showAdvanced && (
        <div className="pt-3 border-t border-dark-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {/* Price Range */}
          <div className="flex flex-col gap-1.5">
            <span className="text-slate-400 font-medium">Price Range (₹)</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={filters.min_price || ""}
                onChange={(e) => onChangeFilters({ ...filters, min_price: e.target.value })}
                className="w-full bg-dark-850 border border-dark-750 rounded px-2 py-1 text-white text-xs focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-slate-500">-</span>
              <input
                type="number"
                placeholder="Max ₹"
                value={filters.max_price || ""}
                onChange={(e) => onChangeFilters({ ...filters, max_price: e.target.value })}
                className="w-full bg-dark-850 border border-dark-750 rounded px-2 py-1 text-white text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* RSI Range */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-slate-400">
              <span className="font-medium">RSI (14) Range</span>
              <span className="text-slate-300 font-mono">
                {filters.min_rsi || 0} - {filters.max_rsi || 100}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min RSI"
                min="0"
                max="100"
                value={filters.min_rsi || ""}
                onChange={(e) => onChangeFilters({ ...filters, min_rsi: e.target.value })}
                className="w-full bg-dark-850 border border-dark-750 rounded px-2 py-1 text-white text-xs focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-slate-500">-</span>
              <input
                type="number"
                placeholder="Max RSI"
                min="0"
                max="100"
                value={filters.max_rsi || ""}
                onChange={(e) => onChangeFilters({ ...filters, max_rsi: e.target.value })}
                className="w-full bg-dark-850 border border-dark-750 rounded px-2 py-1 text-white text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* P/E Ratio Range */}
          <div className="flex flex-col gap-1.5">
            <span className="text-slate-400 font-medium">P/E Ratio Range</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min P/E"
                value={filters.min_pe || ""}
                onChange={(e) => onChangeFilters({ ...filters, min_pe: e.target.value })}
                className="w-full bg-dark-850 border border-dark-750 rounded px-2 py-1 text-white text-xs focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-slate-500">-</span>
              <input
                type="number"
                placeholder="Max P/E"
                value={filters.max_pe || ""}
                onChange={(e) => onChangeFilters({ ...filters, max_pe: e.target.value })}
                className="w-full bg-dark-850 border border-dark-750 rounded px-2 py-1 text-white text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Volume Multiplier */}
          <div className="flex flex-col gap-1.5">
            <span className="text-slate-400 font-medium">Min Volume vs 20D Avg</span>
            <select
              value={filters.min_vol_ratio || ""}
              onChange={(e) => onChangeFilters({ ...filters, min_vol_ratio: e.target.value })}
              className="bg-dark-850 border border-dark-750 text-slate-200 text-xs rounded px-2 py-1 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">Any Volume</option>
              <option value="1.0">≥ 1.0x (Average)</option>
              <option value="1.5">≥ 1.5x (Elevated)</option>
              <option value="2.0">≥ 2.0x (Heavy Spike)</option>
              <option value="3.0">≥ 3.0x (Shocking Volume)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
