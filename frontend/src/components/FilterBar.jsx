import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  RotateCcw,
  Sliders,
  Sparkles,
  X,
  LineChart,
  Loader2,
  Check,
  ChevronRight
} from "lucide-react";
import { searchStocksApi } from "../services/api";
import { formatRuleSentence, STRATEGY_TEMPLATES } from "./CustomQueryBuilder";

// High-conviction one-click strategies exposed directly on the toolbar
const TOOLBAR_QUICK_PRESETS = [
  {
    id: "open_low",
    label: "Open = Low",
    tooltip: "Intraday buying drive from bell",
    rules: [
      {
        left_field: "day_low",
        operator: "==",
        right_type: "field",
        right_field: "open",
        right_value: 0,
        multiplier: 1.0,
        tolerance_pct: 0.15
      }
    ],
    logic: "AND"
  },
  {
    id: "unfilled_gap_up",
    label: "Unfilled Gap-Up",
    tooltip: "Low strictly higher than yesterday's high",
    rules: [
      {
        left_field: "day_low",
        operator: ">",
        right_type: "field",
        right_field: "prev_high",
        right_value: 0,
        multiplier: 1.0
      }
    ],
    logic: "AND"
  },
  {
    id: "prev_high_breakout",
    label: "Prev High Breakout",
    tooltip: "Price above yesterday's ceiling with volume",
    rules: [
      {
        left_field: "price",
        operator: ">",
        right_type: "field",
        right_field: "prev_high",
        right_value: 0,
        multiplier: 1.0
      },
      {
        left_field: "volume",
        operator: ">",
        right_type: "field",
        right_field: "avg_volume_20d",
        right_value: 0,
        multiplier: 1.2
      }
    ],
    logic: "AND"
  },
  {
    id: "golden_cross",
    label: "Golden Cross",
    tooltip: "50 SMA crossed above 200 SMA",
    rules: [
      {
        left_field: "sma_50",
        operator: ">",
        right_type: "field",
        right_field: "sma_200",
        right_value: 0,
        multiplier: 1.0
      },
      {
        left_field: "price",
        operator: ">=",
        right_type: "field",
        right_field: "sma_50",
        right_value: 0,
        multiplier: 1.0
      }
    ],
    logic: "AND"
  },
  {
    id: "volume_explosion_3x",
    label: "3x Volume Spike",
    tooltip: "Volume at least 300% of 20-day average with green price",
    rules: [
      {
        left_field: "volume",
        operator: ">=",
        right_type: "field",
        right_field: "avg_volume_20d",
        right_value: 0,
        multiplier: 3.0
      },
      {
        left_field: "price",
        operator: ">",
        right_type: "field",
        right_field: "prev_close",
        right_value: 0,
        multiplier: 1.0
      }
    ],
    logic: "AND"
  },
  {
    id: "dma_200_bounce",
    label: "200 DMA Dip",
    tooltip: "Pullback resting right on long-term 200 DMA floor",
    rules: [
      {
        left_field: "price",
        operator: ">=",
        right_type: "field",
        right_field: "sma_200",
        right_value: 0,
        multiplier: 0.98
      },
      {
        left_field: "price",
        operator: "<=",
        right_type: "field",
        right_field: "sma_200",
        right_value: 0,
        multiplier: 1.03
      },
      {
        left_field: "rsi_14",
        operator: "<=",
        right_type: "number",
        right_field: "rsi_14",
        right_value: 45,
        multiplier: 1.0
      }
    ],
    logic: "AND"
  },
  {
    id: "oversold_rsi_panic",
    label: "Oversold RSI <= 30",
    tooltip: "Extreme oversold condition ripe for bounce",
    rules: [
      {
        left_field: "rsi_14",
        operator: "<=",
        right_type: "number",
        right_field: "rsi_14",
        right_value: 30,
        multiplier: 1.0
      },
      {
        left_field: "price",
        operator: ">",
        right_type: "field",
        right_field: "day_low",
        right_value: 0,
        multiplier: 1.0
      }
    ],
    logic: "AND"
  },
  {
    id: "week_52_high_run",
    label: "52W High Breakout",
    tooltip: "Within 1% of or above 52-week peak with volume",
    rules: [
      {
        left_field: "price",
        operator: ">=",
        right_type: "field",
        right_field: "week_52_high",
        right_value: 0,
        multiplier: 0.99
      },
      {
        left_field: "volume",
        operator: ">",
        right_type: "field",
        right_field: "avg_volume_20d",
        right_value: 0,
        multiplier: 1.3
      }
    ],
    logic: "AND"
  }
];

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

  // Helper to determine if a quick preset is currently selected
  const isPresetActive = (preset) => {
    if (!filters.custom_rules || filters.custom_rules.length !== preset.rules.length) {
      return false;
    }
    const currentRulesJson = JSON.stringify(filters.custom_rules);
    const presetRulesJson = JSON.stringify(preset.rules);
    return currentRulesJson === presetRulesJson;
  };

  const handleToggleQuickPreset = (preset) => {
    if (isPresetActive(preset)) {
      onClearCustomRules();
    } else {
      onChangeFilters({
        ...filters,
        custom_rules: preset.rules,
        custom_logic: preset.logic || "AND"
      });
    }
  };

  return (
    <div className="bg-black border border-zinc-800 rounded-xl p-3 shadow-sm flex flex-col gap-3 transition-colors">
      {/* Primary Toolbar Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search & Custom Query Action */}
        <div className="flex items-center gap-2 flex-1">
          {/* Autocomplete Search Box across all 7,650+ Equities */}
          <div ref={searchContainerRef} className="relative flex-1 min-w-[200px] max-w-lg">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search 7,650+ stocks (e.g. RELIANCE, TCS, 500325)..."
              value={searchInput}
              onChange={handleInputChange}
              onFocus={() => {
                if (suggestions.length > 0) setShowDropdown(true);
              }}
              onKeyDown={handleKeyDown}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-white rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition shadow-inner"
            />
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
            ) : searchInput ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}

            {/* Floating Autocomplete Dropdown */}
            {showDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto divide-y divide-zinc-800">
                <div className="px-3 py-1.5 bg-zinc-950 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider flex justify-between items-center">
                  <span>Indian Market Search</span>
                  <span>{suggestions.length} matches</span>
                </div>
                {suggestions.length === 0 && !isSearching && (
                  <div className="px-4 py-4 text-xs text-zinc-400 text-center">
                    No matching stocks found for "{searchInput}"
                  </div>
                )}
                {suggestions.map((item) => (
                  <div
                    key={item.id || `${item.symbol}:${item.exchange}`}
                    onClick={() => handleSelectSuggestion(item.symbol)}
                    className="px-3 py-2.5 hover:bg-zinc-800/80 cursor-pointer flex items-center justify-between gap-2 transition group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-white group-hover:underline text-xs">
                          {item.symbol}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${
                          item.exchange === "BSE"
                            ? "bg-zinc-800 text-zinc-200 border-zinc-700"
                            : "bg-white text-black border-white"
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
                      <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {item.name}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-mono font-bold text-xs text-white">
                          ₹{item.price > 0 ? Number(item.price).toFixed(2) : "—"}
                        </div>
                        <div
                          className={`text-[10px] font-mono font-semibold ${
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
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition"
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
                ? "bg-white text-black border-white shadow-sm"
                : "bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border-zinc-700"
            }`}
            title="Create custom comparison rules e.g. Low > Prev High, Low == Open"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Custom Query</span>
            {filters.custom_rules && filters.custom_rules.length > 0 && (
              <span className="text-[10px] bg-black text-white font-black px-1.5 rounded-full ml-0.5">
                {filters.custom_rules.length}
              </span>
            )}
          </button>

          {/* Reset Filters */}
          <button
            onClick={onResetFilters}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition shrink-0"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Results Count Info */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-zinc-400 font-medium">
          <span className="font-tabular">
            {total > 0 ? (
              <>
                Showing <strong className="text-white font-bold">{((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)}</strong> of <strong className="text-white font-bold">{total.toLocaleString()}</strong> equities
              </>
            ) : (
              <>
                Showing <strong className="text-white font-bold">{totalResults}</strong> equities
              </>
            )}
          </span>
        </div>
      </div>

      {/* Horizontal One-Click Strategy Chips Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-zinc-850">
        <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold shrink-0 mr-1">
          One-Click:
        </span>

        {/* All Equities Button */}
        <button
          type="button"
          onClick={onClearCustomRules}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition border shrink-0 ${
            !filters.custom_rules || filters.custom_rules.length === 0
              ? "bg-white text-black border-white shadow-sm"
              : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800 hover:text-white"
          }`}
        >
          All Equities
        </button>

        {/* Strategy Chips */}
        {TOOLBAR_QUICK_PRESETS.map((preset) => {
          const active = isPresetActive(preset);
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleToggleQuickPreset(preset)}
              title={preset.tooltip}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition border shrink-0 ${
                active
                  ? "bg-white text-black border-white shadow-sm"
                  : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800 hover:text-white"
              }`}
            >
              {active && <Check className="w-3 h-3 stroke-[3]" />}
              <span>{preset.label}</span>
            </button>
          );
        })}

        {/* More Strategies Link */}
        <button
          type="button"
          onClick={onOpenCustomBuilder}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-dashed border-zinc-700 transition shrink-0 ml-auto"
        >
          <span>More Strategies</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Active Custom Rules Banner */}
      {filters.custom_rules && filters.custom_rules.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Active Strategy ({filters.custom_rules.length} conditions, {filters.custom_logic || "AND"}):</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {filters.custom_rules.map((r, i) => (
                <span
                  key={i}
                  className="bg-black text-white px-2 py-0.5 rounded border border-zinc-700 font-mono text-[11px] font-medium"
                >
                  {formatRuleSentence(r)}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={onClearCustomRules}
            className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-white transition"
            title="Clear all rules"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      )}
    </div>
  );
}
