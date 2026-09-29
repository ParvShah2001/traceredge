import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Star,
  LineChart,
  Bell,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = [];
  if (currentPage <= 4) {
    pages.push(1, 2, 3, 4, 5, "...", totalPages);
  } else if (currentPage >= totalPages - 3) {
    pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
  }
  return pages;
}

export function StockTable({
  stocks,
  flashMap,
  watchlist,
  onToggleWatchlist,
  onOpenChart,
  onOpenAlertModal,
  sortBy,
  sortDir,
  onSort,
  page = 1,
  setPage,
  pageSize = 50,
  setPageSize,
  total = 0,
  totalPages = 1
}) {
  const [jumpPageInput, setJumpPageInput] = useState("");

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages && setPage) {
      setPage(p);
      setJumpPageInput("");
    }
  };
  const renderSortIcon = (columnKey) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />;
    }
    return sortDir === "asc" ? (
      <ArrowUp className="w-3 h-3 text-emerald-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-emerald-400" />
    );
  };

  const getSignalBadge = (signal, color) => {
    switch (color) {
      case "emerald":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "teal":
        return "bg-teal-500/15 text-teal-400 border-teal-500/30";
      case "rose":
      case "red":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      default:
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    }
  };

  const getRsiColor = (rsi) => {
    if (rsi >= 70) return "text-rose-400 font-bold";
    if (rsi <= 35) return "text-emerald-400 font-bold";
    if (rsi >= 55) return "text-teal-300";
    return "text-slate-300";
  };

  if (!stocks || stocks.length === 0) {
    return (
      <div className="bg-dark-900 border border-dark-800 rounded-xl p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
        <LineChart className="w-10 h-10 text-slate-600 animate-pulse" />
        <p className="text-base font-medium text-slate-300">No stocks matched your criteria</p>
        <p className="text-xs text-slate-500">
          Try loosening your filter parameters or selecting a broader preset.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-dark-800 bg-dark-950/80 text-slate-400 font-semibold uppercase tracking-wider select-none">
              <th className="py-3 px-3 w-10 text-center">⭐</th>
              
              <th
                onClick={() => onSort("symbol")}
                className="py-3 px-3 cursor-pointer hover:text-white transition group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Stock</span>
                  {renderSortIcon("symbol")}
                </div>
              </th>

              <th
                onClick={() => onSort("price")}
                className="py-3 px-3 cursor-pointer hover:text-white transition group text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Live Price (₹)</span>
                  {renderSortIcon("price")}
                </div>
              </th>

              <th
                onClick={() => onSort("change_pct")}
                className="py-3 px-3 cursor-pointer hover:text-white transition group text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Change (%)</span>
                  {renderSortIcon("change_pct")}
                </div>
              </th>

              <th className="py-3 px-3 hidden lg:table-cell text-center">
                <span>Day's Range</span>
              </th>

              <th
                onClick={() => onSort("volume")}
                className="py-3 px-3 cursor-pointer hover:text-white transition group text-right hidden sm:table-cell"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Volume & Ratio</span>
                  {renderSortIcon("volume")}
                </div>
              </th>

              <th
                onClick={() => onSort("rsi_14")}
                className="py-3 px-3 cursor-pointer hover:text-white transition group text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>RSI (14)</span>
                  {renderSortIcon("rsi_14")}
                </div>
              </th>

              <th
                onClick={() => onSort("dist_52w_high_pct")}
                className="py-3 px-3 cursor-pointer hover:text-white transition group text-center hidden md:table-cell"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>52W High Range</span>
                  {renderSortIcon("dist_52w_high_pct")}
                </div>
              </th>

              <th
                onClick={() => onSort("pe_ratio")}
                className="py-3 px-3 cursor-pointer hover:text-white transition group text-right hidden xl:table-cell"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>P/E</span>
                  {renderSortIcon("pe_ratio")}
                </div>
              </th>

              <th
                onClick={() => onSort("market_cap_cr")}
                className="py-3 px-3 cursor-pointer hover:text-white transition group text-right hidden xl:table-cell"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Market Cap (Cr)</span>
                  {renderSortIcon("market_cap_cr")}
                </div>
              </th>

              <th
                onClick={() => onSort("tech_score")}
                className="py-3 px-3 cursor-pointer hover:text-white transition group text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Tech Score</span>
                  {renderSortIcon("tech_score")}
                </div>
              </th>

              <th className="py-3 px-3 text-center">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-dark-800/60 font-tabular">
            {stocks.map((stock) => {
              const stockKey = stock.id || `${stock.symbol}:${stock.exchange || ""}`;
              const isBull = stock.change >= 0;
              const flash = flashMap[stockKey] || flashMap[stock.symbol];
              const isPinned = watchlist.includes(stockKey) || watchlist.includes(stock.symbol);

              // Calculate intraday progress
              const dayRange = stock.day_high - stock.day_low;
              const dayProgress =
                dayRange > 0
                  ? Math.min(
                      100,
                      Math.max(
                        0,
                        Math.round(((stock.price - stock.day_low) / dayRange) * 100)
                      )
                    )
                  : 50;

              // Calculate 52w range progress
              const range52 = stock.week_52_high - stock.week_52_low;
              const progress52 =
                range52 > 0
                  ? Math.min(
                      100,
                      Math.max(
                        0,
                        Math.round(((stock.price - stock.week_52_low) / range52) * 100)
                      )
                    )
                  : 50;

              return (
                <tr
                  key={stockKey}
                  className={`hover:bg-dark-850/60 transition duration-150 ${
                    flash === "up"
                      ? "bg-emerald-500/20"
                      : flash === "down"
                      ? "bg-rose-500/20"
                      : ""
                  }`}
                >
                  {/* Bookmark Star */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onToggleWatchlist(stock.symbol)}
                      className="p-1 rounded hover:bg-dark-800 transition"
                      title={isPinned ? "Remove from Watchlist" : "Add to Watchlist"}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          isPinned
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-600 hover:text-slate-400"
                        }`}
                      />
                    </button>
                  </td>

                  {/* Stock Symbol & Company */}
                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span
                          onClick={() => onOpenChart(stock.symbol, stock.exchange)}
                          className="font-bold text-white text-xs hover:text-emerald-400 cursor-pointer transition font-sans"
                        >
                          {stock.symbol}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${
                            stock.exchange === "BSE"
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          }`}
                        >
                          {stock.exchange || "NSE"}
                        </span>
                        {stock.bse_code && (
                          <span className="text-[9px] px-1 rounded bg-dark-800 text-slate-400 border border-dark-750 font-mono" title={`BSE Scrip Code: ${stock.bse_code}`}>
                            #{stock.bse_code}
                          </span>
                        )}
                        <span className="text-[9px] px-1 rounded bg-dark-800 text-slate-500 font-mono">
                          {stock.series || "EQ"}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 truncate max-w-[170px] font-sans">
                        {stock.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-sans">
                        {stock.sector}
                      </span>
                    </div>
                  </td>

                  {/* Live Price */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex flex-col items-end">
                      <span
                        className={`font-semibold text-xs transition duration-200 ${
                          flash === "up"
                            ? "text-emerald-300 font-bold"
                            : flash === "down"
                            ? "text-rose-300 font-bold"
                            : "text-slate-100"
                        }`}
                      >
                        ₹
                        {Number(stock.price).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Prev: ₹{stock.prev_close?.toFixed(2)}
                      </span>
                    </div>
                  </td>

                  {/* Change & % */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex flex-col items-end">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded font-semibold text-xs ${
                          isBull
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-rose-500/15 text-rose-400"
                        }`}
                      >
                        {isBull ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {isBull ? "+" : ""}
                        {stock.change_pct?.toFixed(2)}%
                      </span>
                      <span
                        className={`text-[10px] font-medium mt-0.5 ${
                          isBull ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {isBull ? "+₹" : "-₹"}
                        {Math.abs(stock.change || 0).toFixed(2)}
                      </span>
                    </div>
                  </td>

                  {/* Day's Range */}
                  <td className="py-3 px-3 hidden lg:table-cell">
                    <div className="flex flex-col gap-1 w-32 mx-auto">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>L: ₹{stock.day_low?.toFixed(1)}</span>
                        <span>H: ₹{stock.day_high?.toFixed(1)}</span>
                      </div>
                      <div className="h-1.5 bg-dark-750 rounded-full overflow-hidden relative">
                        <div
                          className="absolute top-0 bottom-0 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 rounded-full"
                          style={{
                            left: "0%",
                            width: `${dayProgress}%`
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Volume & Volume Ratio */}
                  <td className="py-3 px-3 text-right hidden sm:table-cell">
                    <div className="flex flex-col items-end">
                      <span className="text-slate-200 font-medium">
                        {(stock.volume / 100000).toFixed(2)} L
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          stock.volume_ratio >= 1.5
                            ? "text-amber-400"
                            : "text-slate-500"
                        }`}
                      >
                        {stock.volume_ratio}x 20D Avg
                      </span>
                    </div>
                  </td>

                  {/* RSI (14) */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className={`text-xs ${getRsiColor(stock.rsi_14)}`}>
                        {stock.rsi_14?.toFixed(1) || 50.0}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase">
                        {stock.rsi_14 >= 70
                          ? "Overbought"
                          : stock.rsi_14 <= 35
                          ? "Oversold"
                          : "Neutral"}
                      </span>
                    </div>
                  </td>

                  {/* 52W High Range */}
                  <td className="py-3 px-3 hidden md:table-cell">
                    <div className="flex flex-col gap-1 w-28 mx-auto">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400">
                          {stock.dist_52w_high_pct >= 0 ? "+" : ""}
                          {stock.dist_52w_high_pct}%
                        </span>
                        <span className="text-slate-500">
                          ₹{stock.week_52_high?.toFixed(0)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-dark-750 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            stock.dist_52w_high_pct > -5
                              ? "bg-emerald-400"
                              : "bg-slate-500"
                          }`}
                          style={{ width: `${progress52}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* P/E */}
                  <td className="py-3 px-3 text-right hidden xl:table-cell text-slate-300">
                    {stock.pe_ratio > 0 ? stock.pe_ratio.toFixed(1) : "—"}
                  </td>

                  {/* Market Cap */}
                  <td className="py-3 px-3 text-right hidden xl:table-cell text-slate-300">
                    ₹{Number(stock.market_cap_cr).toLocaleString("en-IN")} Cr
                  </td>

                  {/* Tech Score & Signal */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getSignalBadge(
                          stock.tech_signal,
                          stock.tech_color
                        )}`}
                      >
                        {stock.tech_signal}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {stock.tech_score}/100
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onOpenChart(stock.symbol, stock.exchange)}
                        className="p-1.5 rounded-lg bg-dark-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-dark-750 transition"
                        title="Interactive Candlestick Chart"
                      >
                        <LineChart className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenAlertModal(stock)}
                        className="p-1.5 rounded-lg bg-dark-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 border border-dark-750 transition"
                        title="Create Price Alert"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modern Responsive Pagination Footer */}
      {totalPages > 1 && setPage && (
        <div className="border-t border-dark-800 bg-dark-950/90 px-4 py-3 flex flex-wrap items-center justify-between gap-4 select-none">
          {/* Left: Rows Per Page & Record Info */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  if (setPageSize) setPageSize(Number(e.target.value));
                  if (setPage) setPage(1);
                }}
                className="bg-dark-850 border border-dark-750 text-slate-200 text-xs rounded-lg px-2 py-1 focus:border-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>

            <span className="hidden sm:inline text-slate-700">|</span>

            <span className="hidden sm:inline font-tabular">
              Showing <strong className="text-white">{((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)}</strong> of{" "}
              <strong className="text-white">{total.toLocaleString()}</strong> Indian Equities
            </span>
          </div>

          {/* Right: Page Navigation & Quick Jump */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Jump Input */}
            <form onSubmit={handleJumpSubmit} className="hidden md:flex items-center gap-1 mr-2 text-xs text-slate-400">
              <span>Go to:</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                placeholder={page.toString()}
                className="w-12 bg-dark-850 border border-dark-750 rounded px-1.5 py-0.5 text-center text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </form>

            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                onClick={() => setPage(1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg bg-dark-850 hover:bg-dark-800 disabled:opacity-30 disabled:cursor-not-allowed border border-dark-750 text-slate-300 transition"
                title="First Page"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              {/* Prev Page */}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-dark-850 hover:bg-dark-800 disabled:opacity-30 disabled:cursor-not-allowed border border-dark-750 text-slate-300 text-xs transition"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1">
                {getPageNumbers(page, totalPages).map((p, idx) =>
                  p === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-slate-600 text-xs font-mono">
                      •••
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-medium font-tabular transition ${
                        page === p
                          ? "bg-emerald-500 text-dark-950 font-bold shadow-md shadow-emerald-500/20"
                          : "bg-dark-850 hover:bg-dark-800 text-slate-300 border border-dark-750"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              {/* Next Page */}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-dark-850 hover:bg-dark-800 disabled:opacity-30 disabled:cursor-not-allowed border border-dark-750 text-slate-300 text-xs transition"
                title="Next Page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg bg-dark-850 hover:bg-dark-800 disabled:opacity-30 disabled:cursor-not-allowed border border-dark-750 text-slate-300 transition"
                title="Last Page"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
