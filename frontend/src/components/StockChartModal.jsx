import React, { useEffect, useRef, useState } from "react";
import { createChart, ColorType, CandlestickSeries, HistogramSeries } from "lightweight-charts";
import {
  X,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react";
import { fetchStockHistory, fetchStockDetail } from "../services/api";

const TIMEFRAMES = ["1D", "1W", "1M", "3M", "1Y"];

export function StockChartModal({ stock, onClose }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const [liveStock, setLiveStock] = useState(stock);
  const [timeframe, setTimeframe] = useState("1M");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLiveStock(stock);
    if (stock?.symbol) {
      const identifier = stock.id || stock.symbol;
      fetchStockDetail(identifier, stock.exchange)
        .then((detail) => {
          if (detail) setLiveStock((prev) => ({ ...prev, ...detail }));
        })
        .catch(console.error);
    }
  }, [stock]);

  useEffect(() => {
    if (!stock?.symbol) return;

    let isCancelled = false;
    setLoading(true);

    const identifier = stock.id || stock.symbol;
    fetchStockHistory(identifier, timeframe, stock.exchange)
      .then((data) => {
        if (isCancelled || !chartContainerRef.current) return;
        setLoading(false);

        // Remove old chart instance if any
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }

        const isLight = document.documentElement.classList.contains("light");
        const chart = createChart(chartContainerRef.current, {
          layout: {
            background: { type: ColorType.Solid, color: isLight ? "#ffffff" : "#000000" },
            textColor: isLight ? "#09090b" : "#a1a1aa"
          },
          grid: {
            vertLines: { color: isLight ? "#f4f4f5" : "#18181b" },
            horzLines: { color: isLight ? "#f4f4f5" : "#18181b" }
          },
          crosshair: {
            mode: 1
          },
          rightPriceScale: {
            borderColor: isLight ? "#e4e4e7" : "#27272a"
          },
          timeScale: {
            borderColor: isLight ? "#e4e4e7" : "#27272a",
            timeVisible: timeframe === "1D" || timeframe === "1W"
          },
          width: chartContainerRef.current.clientWidth,
          height: 380
        });
        chartRef.current = chart;

        // Candlestick Series (ultra minimal monochrome)
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
          upColor: isLight ? "#000000" : "#ffffff",
          downColor: isLight ? "#ffffff" : "#000000",
          borderVisible: true,
          borderColor: isLight ? "#000000" : "#71717a",
          borderUpColor: isLight ? "#000000" : "#ffffff",
          borderDownColor: isLight ? "#71717a" : "#71717a",
          wickColor: isLight ? "#000000" : "#71717a",
          wickUpColor: isLight ? "#000000" : "#ffffff",
          wickDownColor: isLight ? "#71717a" : "#71717a"
        });

        // Volume Series (ultra minimal monochrome)
        const volumeSeries = chart.addSeries(HistogramSeries, {
          color: isLight ? "#e4e4e7" : "#27272a",
          priceFormat: {
            type: "volume"
          },
          priceScaleId: "",
          scaleMargins: {
            top: 0.8,
            bottom: 0
          }
        });

        const candles = (data.candles || []).map((c) => ({
          time: c.time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close
        }));

        const volumes = (data.candles || []).map((c) => ({
          time: c.time,
          value: c.volume,
          color:
            c.close >= c.open
              ? isLight
                ? "#d4d4d8"
                : "#3f3f46"
              : isLight
              ? "#e4e4e7"
              : "#27272a"
        }));

        if (candles.length > 0) {
          candlestickSeries.setData(candles);
          volumeSeries.setData(volumes);
          chart.timeScale().fitContent();
        }

        const handleResize = () => {
          if (chartContainerRef.current && chartRef.current) {
            chartRef.current.applyOptions({
              width: chartContainerRef.current.clientWidth
            });
          }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      })
      .catch((err) => {
        console.error("Chart load error:", err);
        setLoading(false);
      });

    return () => {
      isCancelled = true;
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [stock?.symbol, stock?.exchange, timeframe]);

  if (!stock) return null;

  const currStock = liveStock || stock;
  const isBull = (currStock.change ?? 0) >= 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-black dark:text-white tracking-tight">
                  {currStock.symbol}
                </h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                    currStock.exchange === "BSE"
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700"
                      : "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                  }`}
                >
                  {currStock.exchange || "NSE"}
                </span>
                {currStock.bse_code && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-mono border border-zinc-200 dark:border-zinc-800">
                    Scrip #{currStock.bse_code}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 font-medium">
                {currStock.name} • {currStock.sector}
              </p>
            </div>

            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

            {/* Price Badge */}
            <div className="hidden sm:flex flex-col">
              <span className="text-lg font-bold text-black dark:text-white font-tabular">
                ₹{currStock.price ? currStock.price.toFixed(2) : "—"}
              </span>
              <span
                className={`text-xs font-bold flex items-center gap-0.5 ${
                  isBull ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
                }`}
              >
                {isBull ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {isBull ? "+" : ""}
                {currStock.change ? currStock.change.toFixed(2) : "0.00"} ({isBull ? "+" : ""}
                {currStock.change_pct ? currStock.change_pct.toFixed(2) : "0.00"}%)
              </span>
            </div>
          </div>

          {/* Timeframe selector & Close */}
          <div className="flex items-center gap-3">
            <div className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center gap-1">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                    timeframe === tf
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="relative p-4 bg-white dark:bg-black">
          {loading && (
            <div className="absolute inset-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center text-zinc-700 dark:text-zinc-300 text-sm gap-2">
              <Activity className="w-5 h-5 text-black dark:text-white animate-spin" />
              <span>Fetching live candlestick data...</span>
            </div>
          )}
          <div ref={chartContainerRef} className="w-full h-[380px] rounded-lg overflow-hidden" />
        </div>

        {/* Technical Indicators & Fundamentals Grid */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs overflow-y-auto">
          {/* RSI (14) */}
          <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <span className="text-zinc-500 dark:text-zinc-400 block font-medium">RSI (14)</span>
            <span className="text-black dark:text-white font-bold text-sm mt-0.5 block">
              {currStock.rsi_14 != null ? currStock.rsi_14.toFixed(1) : "50.0"}
            </span>
            <span className="text-[10px] text-zinc-500 font-semibold">
              {currStock.rsi_14 >= 70 ? "Overbought" : currStock.rsi_14 <= 35 ? "Oversold" : "Neutral"}
            </span>
          </div>

          {/* 20 EMA */}
          <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <span className="text-zinc-500 dark:text-zinc-400 block font-medium">20 EMA</span>
            <span className="text-black dark:text-white font-bold text-sm mt-0.5 block">
              ₹{currStock.ema_20 != null ? currStock.ema_20.toFixed(2) : "—"}
            </span>
            <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-medium">
              {currStock.price && currStock.ema_20 ? (currStock.price >= currStock.ema_20 ? "Above EMA" : "Below EMA") : "Trend"}
            </span>
          </div>

          {/* 50 SMA */}
          <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <span className="text-zinc-500 dark:text-zinc-400 block font-medium">50 SMA</span>
            <span className="text-black dark:text-white font-bold text-sm mt-0.5 block">
              ₹{currStock.sma_50 != null ? currStock.sma_50.toFixed(2) : "—"}
            </span>
            <span className="text-[10px] text-zinc-500 font-medium">Medium Trend</span>
          </div>

          {/* 200 SMA */}
          <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <span className="text-zinc-500 dark:text-zinc-400 block font-medium">200 SMA</span>
            <span className="text-black dark:text-white font-bold text-sm mt-0.5 block">
              ₹{currStock.sma_200 != null ? currStock.sma_200.toFixed(2) : "—"}
            </span>
            <span className="text-[10px] text-zinc-500 font-medium">Long Trend</span>
          </div>

          {/* 52W High / Low */}
          <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <span className="text-zinc-500 dark:text-zinc-400 block font-medium">52W Range</span>
            <span className="text-black dark:text-white font-bold text-sm mt-0.5 block">
              ₹{currStock.week_52_low != null ? currStock.week_52_low.toFixed(0) : "—"} - ₹{currStock.week_52_high != null ? currStock.week_52_high.toFixed(0) : "—"}
            </span>
            <span className="text-[10px] text-zinc-500 font-medium">
              Dist High: {currStock.dist_52w_high_pct ?? 0}%
            </span>
          </div>

          {/* Market Cap & PE */}
          <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <span className="text-zinc-500 dark:text-zinc-400 block font-medium">Market Cap & P/E</span>
            <span className="text-black dark:text-white font-bold text-sm mt-0.5 block">
              {currStock.market_cap_cr ? `₹${Number(currStock.market_cap_cr).toLocaleString("en-IN")} Cr` : "—"}
            </span>
            <span className="text-[10px] text-zinc-500 font-medium">
              P/E: {currStock.pe_ratio > 0 ? currStock.pe_ratio.toFixed(1) : "—"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <span>Official NSE / BSE Market Data Feed</span>
          <span className="font-mono text-[11px]">TracerEdge Engine</span>
        </div>
      </div>
    </div>
  );
}
