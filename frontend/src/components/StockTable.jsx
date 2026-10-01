import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  LineChart,
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
  flashMap = {},
  onOpenChart,
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
      return <ArrowUpDown className="w-3 h-3 text-zinc-400 group-hover:text-black dark:group-hover:text-white" />;
    }
    return sortDir === "asc" ? (
      <ArrowUp className="w-3 h-3 text-black dark:text-white font-bold" />
    ) : (
      <ArrowDown className="w-3 h-3 text-black dark:text-white font-bold" />
    );
  };

  const getRsiColor = (rsi) => {
    if (rsi >= 70) return "text-rose-700 dark:text-rose-400 font-bold";
    if (rsi <= 35) return "text-emerald-700 dark:text-emerald-400 font-bold";
    if (rsi >= 55) return "text-zinc-900 dark:text-zinc-100 font-semibold";
    return "text-zinc-700 dark:text-zinc-300";
  };

  if (!stocks || stocks.length === 0) {
    return (
      <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center text-zinc-600 dark:text-zinc-400 flex flex-col items-center justify-center gap-2 shadow-sm">
        <LineChart className="w-10 h-10 text-zinc-400 dark:text-zinc-600 animate-pulse" />
        <p className="text-base font-bold text-black dark:text-white">No stocks matched your criteria</p>
        <p className="text-xs text-zinc-500">
          Try loosening your search query or reset your custom filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider select-none">
              <th
                onClick={() => onSort("symbol")}
                className="py-3 px-3 cursor-pointer hover:text-black dark:hover:text-white transition group sticky left-0 z-20 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 sm:border-r-0"
              >
                <div className="flex items-center gap-1.5">
                  <span>Stock</span>
                  {renderSortIcon("symbol")}
                </div>
              </th>

              <th
                onClick={() => onSort("price")}
                className="py-3 px-3 cursor-pointer hover:text-black dark:hover:text-white transition group text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Price (₹)</span>
                  {renderSortIcon("price")}
                </div>
              </th>

              <th
                onClick={() => onSort("change_pct")}
                className="py-3 px-3 cursor-pointer hover:text-black dark:hover:text-white transition group text-right"
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
                className="py-3 px-3 cursor-pointer hover:text-black dark:hover:text-white transition group text-right hidden sm:table-cell"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Volume</span>
                  {renderSortIcon("volume")}
                </div>
              </th>

              <th
                onClick={() => onSort("rsi_14")}
                className="py-3 px-3 cursor-pointer hover:text-black dark:hover:text-white transition group text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>RSI (14)</span>
                  {renderSortIcon("rsi_14")}
                </div>
              </th>

              <th
                onClick={() => onSort("dist_52w_high_pct")}
                className="py-3 px-3 cursor-pointer hover:text-black dark:hover:text-white transition group text-center hidden md:table-cell"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>52W High Range</span>
                  {renderSortIcon("dist_52w_high_pct")}
                </div>
              </th>

              <th
                onClick={() => onSort("pe_ratio")}
                className="py-3 px-3 cursor-pointer hover:text-black dark:hover:text-white transition group text-right hidden xl:table-cell"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>P/E</span>
                  {renderSortIcon("pe_ratio")}
                </div>
              </th>

              <th
                onClick={() => onSort("market_cap_cr")}
                className="py-3 px-3 cursor-pointer hover:text-black dark:hover:text-white transition group text-right hidden xl:table-cell"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Market Cap (Cr)</span>
                  {renderSortIcon("market_cap_cr")}
                </div>
              </th>

              <th
                onClick={() => onSort("tech_score")}
                className="py-3 px-3 cursor-pointer hover:text-black dark:hover:text-white transition group text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Signal</span>
                  {renderSortIcon("tech_score")}
                </div>
              </th>

              <th className="py-3 px-3 text-center">Chart</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80 font-tabular">
            {stocks.map((stock) => {
              const stockKey = stock.id || `${stock.symbol}:${stock.exchange || ""}`;
              const isBull = stock.change >= 0;
              const flash = flashMap[stockKey] || flashMap[stock.symbol];

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
                  className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition duration-150 ${
                    flash === "up"
                      ? "bg-emerald-100/50 dark:bg-emerald-950/40"
                      : flash === "down"
                      ? "bg-rose-100/50 dark:bg-rose-950/40"
                      : ""
                  }`}
                >
                  {/* Stock Symbol & Company (Sticky on mobile for smooth horizontal swipe) */}
                  <td className="py-2.5 sm:py-3 px-3 sticky left-0 z-10 bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800 sm:border-r-0">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          onClick={() => onOpenChart(stock.symbol, stock.exchange)}
                          className="font-extrabold text-black dark:text-white text-xs hover:underline cursor-pointer transition font-sans"
                        >
                          {stock.symbol}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                            stock.exchange === "BSE"
                              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700"
                              : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black border-zinc-900 dark:border-zinc-100"
                          }`}
                        >
                          {stock.exchange || "NSE"}
                        </span>
                        {stock.bse_code && (
                          <span className="text-[9px] px-1 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 font-mono" title={`BSE Scrip Code: ${stock.bse_code}`}>
                            #{stock.bse_code}
                          </span>
                        )}
                        <span className="text-[9px] px-1 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-500 font-mono">
                          {stock.series || "EQ"}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-[170px] font-sans mt-0.5">
                        {stock.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-sans">
                        {stock.sector}
                      </span>
                    </div>
                  </td>

                  {/* Live Price */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex flex-col items-end">
                      <span
                        className={`font-bold text-xs transition duration-200 ${
                          flash === "up"
                            ? "text-emerald-700 dark:text-emerald-300 font-black"
                            : flash === "down"
                            ? "text-rose-700 dark:text-rose-300 font-black"
                            : "text-black dark:text-white"
                        }`}
                      >
                        ₹
                        {Number(stock.price).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        Prev: ₹{stock.prev_close?.toFixed(2)}
                      </span>
                    </div>
                  </td>

                  {/* Change & % */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex flex-col items-end">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded font-bold text-xs border ${
                          isBull
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                            : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/60"
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
                        className={`text-[10px] font-semibold mt-0.5 ${
                          isBull ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
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
                      <div className="flex justify-between text-[10px] text-zinc-600 dark:text-zinc-400 font-medium">
                        <span>L: ₹{stock.day_low?.toFixed(1)}</span>
                        <span>H: ₹{stock.day_high?.toFixed(1)}</span>
                      </div>
                      <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden relative">
                        <div
                          className="absolute top-0 bottom-0 bg-black dark:bg-white rounded-full"
                          style={{
                            left: "0%",
                            width: `${dayProgress}%`
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Volume */}
                  <td className="py-3 px-3 text-right hidden sm:table-cell">
                    <div className="flex flex-col items-end">
                      <span className="text-black dark:text-white font-bold">
                        {(stock.volume / 100000).toFixed(2)} L
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium">
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
                      <span className="text-[9px] text-zinc-500 uppercase font-semibold">
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
                      <div className="flex justify-between text-[10px] font-medium">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {stock.dist_52w_high_pct >= 0 ? "+" : ""}
                          {stock.dist_52w_high_pct}%
                        </span>
                        <span className="text-zinc-500">
                          ₹{stock.week_52_high?.toFixed(0)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black dark:bg-white rounded-full"
                          style={{ width: `${progress52}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* P/E */}
                  <td className="py-3 px-3 text-right hidden xl:table-cell text-zinc-800 dark:text-zinc-200 font-medium">
                    {stock.pe_ratio > 0 ? stock.pe_ratio.toFixed(1) : "—"}
                  </td>

                  {/* Market Cap */}
                  <td className="py-3 px-3 text-right hidden xl:table-cell text-zinc-800 dark:text-zinc-200 font-medium">
                    ₹{Number(stock.market_cap_cr).toLocaleString("en-IN")} Cr
                  </td>

                  {/* Signal */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-300 dark:border-zinc-700">
                        {stock.tech_signal}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono">
                        {stock.tech_score}/100
                      </span>
                    </div>
                  </td>

                  {/* Action: Open Chart */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onOpenChart(stock.symbol, stock.exchange)}
                      className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-800 transition shadow-sm"
                      title="Open Interactive Chart"
                    >
                      <LineChart className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modern Responsive Pagination Footer */}
      {totalPages > 1 && setPage && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 flex flex-wrap items-center justify-between gap-4 select-none">
          {/* Left: Rows Per Page & Record Info */}
          <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  if (setPageSize) setPageSize(Number(e.target.value));
                  if (setPage) setPage(1);
                }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white text-xs rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>

            <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">|</span>

            <span className="hidden sm:inline font-tabular">
              Showing <strong className="text-black dark:text-white">{((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)}</strong> of{" "}
              <strong className="text-black dark:text-white">{total.toLocaleString()}</strong> Equities
            </span>
          </div>

          {/* Right: Page Navigation & Quick Jump */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Jump Input */}
            <form onSubmit={handleJumpSubmit} className="hidden md:flex items-center gap-1 mr-2 text-xs text-zinc-600 dark:text-zinc-400">
              <span>Go to:</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                placeholder={page.toString()}
                className="w-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-1.5 py-0.5 text-center text-xs text-black dark:text-white focus:outline-none"
              />
            </form>

            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                onClick={() => setPage(1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed border border-zinc-200 dark:border-zinc-800 text-black dark:text-white transition shadow-sm"
                title="First Page"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              {/* Prev Page */}
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed border border-zinc-200 dark:border-zinc-800 text-black dark:text-white transition shadow-sm"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1">
                {getPageNumbers(page, totalPages).map((p, idx) =>
                  p === "..." ? (
                    <span key={`dots-${idx}`} className="px-1 text-xs text-zinc-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-bold transition ${
                        page === p
                          ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                          : "bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              {/* Next Page */}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed border border-zinc-200 dark:border-zinc-800 text-black dark:text-white transition shadow-sm"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed border border-zinc-200 dark:border-zinc-800 text-black dark:text-white transition shadow-sm"
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
