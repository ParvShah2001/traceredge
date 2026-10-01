import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  RotateCcw,
  Sliders,
  Sparkles,
  X,
  LineChart,
  Loader2
} from "lucide-react";
import { searchStocksApi } from "../services/api";

export function FilterBar({
  filters,
  onChangeFilters,
  onResetFilters,
  totalResults,
  onOpenCustomBuilder,
  onClearCustomRules,
  page = 1,
  pageSize = 50,
  total = 0,
  totalPages = 1,
  onOpenChart
}) {
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
        const results = await searchStocksApi(val.trim(), 8, "ALL");
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

  return (
    <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shadow-sm flex flex-col gap-3 transition-colors">
      {/* Primary Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search & Custom Query Action */}
        <div className="flex items-center gap-2 flex-1">
          {/* Autocomplete Search Box across all 7,654+ Equities */}
          <div ref={searchContainerRef} className="relative flex-1 min-w-[200px] max-w-lg">
            <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search 7,650+ stocks (e.g. RELIANCE, TCS, 500325)..."
              value={searchInput}
              onChange={handleInputChange}
              onFocus={() => {
                if (suggestions.length > 0) setShowDropdown(true);
              }}
              onKeyDown={handleKeyDown}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-black dark:focus:border-white rounded-lg pl-9 pr-8 py-2 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none transition shadow-inner"
            />
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
            ) : searchInput ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}

            {/* Floating Autocomplete Dropdown */}
            {showDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                <div className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider flex justify-between items-center">
                  <span>Indian Market Search</span>
                  <span>{suggestions.length} matches</span>
                </div>
                {suggestions.length === 0 && !isSearching && (
                  <div className="px-4 py-4 text-xs text-zinc-600 dark:text-zinc-400 text-center">
                    No matching stocks found for "{searchInput}"
                  </div>
                )}
                {suggestions.map((item) => (
                  <div
                    key={item.id || `${item.symbol}:${item.exchange}`}
                    onClick={() => handleSelectSuggestion(item.symbol)}
                    className="px-3 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer flex items-center justify-between gap-2 transition group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-black dark:text-white group-hover:underline text-xs">
                          {item.symbol}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${
                          item.exchange === "BSE"
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700"
                            : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black border-zinc-900 dark:border-zinc-100"
                        }`}>
                          {item.exchange}
                        </span>
                        {item.bse_code && (
                          <span className="text-[10px] text-zinc-500 font-mono">
                            #{item.bse_code}
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-500 truncate max-w-[120px]">
                          {item.sector}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate mt-0.5">
                        {item.name}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-mono font-bold text-xs text-black dark:text-white">
                          ₹{item.price > 0 ? Number(item.price).toFixed(2) : "—"}
                        </div>
                        <div
                          className={`text-[10px] font-mono font-semibold ${
                            item.change_pct >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
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
                          className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition"
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

          {/* Custom Query Builder Button */}
          <button
            onClick={onOpenCustomBuilder}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition shrink-0 ${
              filters.custom_rules && filters.custom_rules.length > 0
                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm"
                : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700"
            }`}
            title="Create custom comparison rules e.g. Low > Prev High, Low == Open"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Custom Query</span>
            {filters.custom_rules && filters.custom_rules.length > 0 && (
              <span className="text-[10px] bg-white text-black dark:bg-black dark:text-white font-black px-1.5 rounded-full ml-0.5">
                {filters.custom_rules.length}
              </span>
            )}
          </button>

          {/* Reset Filters */}
          <button
            onClick={onResetFilters}
            className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition shrink-0"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Results Count Info */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
          <span className="font-tabular">
            {total > 0 ? (
              <>
                Showing <strong className="text-black dark:text-white font-bold">{((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)}</strong> of <strong className="text-black dark:text-white font-bold">{total.toLocaleString()}</strong> equities
              </>
            ) : (
              <>
                Showing <strong className="text-black dark:text-white font-bold">{totalResults}</strong> equities
              </>
            )}
          </span>
        </div>
      </div>

      {/* Active Custom Rules Banner */}
      {filters.custom_rules && filters.custom_rules.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-black dark:text-white flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Custom Strategy ({filters.custom_rules.length} conditions, {filters.custom_logic || "AND"}):</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {filters.custom_rules.map((r, i) => (
                <span
                  key={i}
                  className="bg-white dark:bg-black text-black dark:text-white px-2 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 font-mono text-[11px] font-medium"
                >
                  {r.left_field} {r.operator} {r.right_type === "field" ? r.right_field : r.right_value}
                  {r.multiplier && r.multiplier !== 1.0 ? ` × ${r.multiplier}` : ""}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={onClearCustomRules}
            className="flex items-center gap-1 text-[11px] font-bold text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      )}
    </div>
  );
}
