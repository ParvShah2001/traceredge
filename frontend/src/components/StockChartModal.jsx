import React, { useEffect, useRef, useState } from "react";
import { createChart, ColorType, CandlestickSeries, HistogramSeries } from "lightweight-charts";
import {
  X,
  TrendingUp,
  TrendingDown,
  Bell,
  Activity,
  Layers,
  BarChart2
} from "lucide-react";
import { fetchStockHistory, fetchStockDetail } from "../services/api";

const TIMEFRAMES = ["1D", "1W", "1M", "3M", "1Y"];

export function StockChartModal({ stock, onClose, onSetAlert }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const [liveStock, setLiveStock] = useState(stock);
  const [timeframe, setTimeframe] = useState("1M");
  const [loading, setLoading] = useState(true);
  const [targetPrice, setTargetPrice] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false);

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

        const chart = createChart(chartContainerRef.current, {
          layout: {
            background: { type: ColorType.Solid, color: "#0b111e" },
            textColor: "#94a3b8"
          },
          grid: {
            vertLines: { color: "#1e293b" },
            horzLines: { color: "#1e293b" }
          },
          crosshair: {
            mode: 1
          },
          rightPriceScale: {
            borderColor: "#1e293b"
          },
          timeScale: {
            borderColor: "#1e293b",
            timeVisible: timeframe === "1D" || timeframe === "1W"
          },
          width: chartContainerRef.current.clientWidth,
          height: 380
        });
        chartRef.current = chart;

        // Candlestick Series (lightweight-charts v5)
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
          upColor: "#10b981",
          downColor: "#ef4444",
          borderVisible: false,
          wickUpColor: "#10b981",
          wickDownColor: "#ef4444"
        });

        // Volume Series (lightweight-charts v5)
        const volumeSeries = chart.addSeries(HistogramSeries, {
          color: "#26a69a",
          priceFormat: {
            type: "volume"
          },
          priceScaleId: "", // Overlay on separate scale
          scaleMargins: {
            top: 0.8,
            bottom: 0
          }
        });

        const candles = data.candles || [];
        const candleData = candles.map((c) => ({
          time: c.time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close
        }));

        const volumeData = candles.map((c) => ({
          time: c.time,
          value: c.volume,
          color: c.close >= c.open ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)"
        }));

        candlestickSeries.setData(candleData);
        volumeSeries.setData(volumeData);

        // Responsive resize
        const handleResize = () => {
          if (chartContainerRef.current && chartRef.current) {
            chartRef.current.applyOptions({
              width: chartContainerRef.current.clientWidth
            });
          }
        };
        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
        };
      })
      .catch((err) => {
        console.error("Error loading chart data:", err);
        setLoading(false);
      });

    return () => {
      isCancelled = true;
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [stock, timeframe]);

  const currStock = liveStock || stock;
  if (!currStock) return null;

  const isBull = (currStock.change ?? 0) >= 0;

  const handleCreateAlert = (e) => {
    e.preventDefault();
    const val = parseFloat(targetPrice);
    if (!val || isNaN(val)) return;

    onSetAlert({
      symbol: currStock.symbol,
      condition: val > (currStock.price || 0) ? "price_above" : "price_below",
      value: val
    });

    setAlertSuccess(true);
    setTimeout(() => setAlertSuccess(false), 2500);
    setTargetPrice("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-dark-900 border border-dark-750 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-800 flex items-center justify-between bg-dark-950/70">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {currStock.symbol}
                </h2>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-dark-800 text-slate-400 border border-dark-750 font-mono">
                  NSE: {currStock.symbol}
                </span>
                {currStock.series && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-dark-800 text-slate-400 border border-dark-750 font-mono">
                    {currStock.series}
                  </span>
                )}
                {currStock.tech_signal && (
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                    {currStock.tech_signal}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currStock.name} • {currStock.sector} {currStock.market_cap_category ? `• ${currStock.market_cap_category}` : ""}
              </p>
            </div>

            <div className="h-8 w-px bg-dark-800 hidden sm:block" />

            {/* Price Badge */}
            <div className="hidden sm:flex flex-col">
              <span className="text-lg font-bold text-white font-tabular">
                ₹{currStock.price ? currStock.price.toFixed(2) : "—"}
              </span>
              <span
                className={`text-xs font-semibold flex items-center gap-0.5 ${
                  isBull ? "text-emerald-400" : "text-rose-400"
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
            <div className="bg-dark-850 p-1 rounded-lg border border-dark-750 flex items-center gap-1">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                    timeframe === tf
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="relative p-4 bg-dark-900">
          {loading && (
            <div className="absolute inset-0 z-10 bg-dark-900/70 backdrop-blur-xs flex items-center justify-center text-slate-400 text-sm gap-2">
              <Activity className="w-5 h-5 text-emerald-400 animate-spin" />
              <span>Fetching live candlestick data...</span>
            </div>
          )}
          <div ref={chartContainerRef} className="w-full h-[380px] rounded-lg overflow-hidden" />
        </div>

        {/* Technical Indicators & Fundamentals Grid */}
        <div className="px-6 py-4 bg-dark-950 border-t border-dark-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs overflow-y-auto">
          {/* RSI (14) */}
          <div className="bg-dark-900 p-2.5 rounded-lg border border-dark-800">
            <span className="text-slate-500 block">RSI (14)</span>
            <span className="text-white font-bold text-sm mt-0.5 block">
              {currStock.rsi_14 != null ? currStock.rsi_14.toFixed(1) : "50.0"}
            </span>
            <span className="text-[10px] text-slate-400">
              {currStock.rsi_14 >= 70 ? "Overbought" : currStock.rsi_14 <= 35 ? "Oversold" : "Neutral"}
            </span>
          </div>

          {/* 20 EMA */}
          <div className="bg-dark-900 p-2.5 rounded-lg border border-dark-800">
            <span className="text-slate-500 block">20 EMA</span>
            <span className="text-white font-bold text-sm mt-0.5 block">
              ₹{currStock.ema_20 != null ? currStock.ema_20.toFixed(2) : "—"}
            </span>
            <span className="text-[10px] text-emerald-400">
              {currStock.price && currStock.ema_20 ? (currStock.price >= currStock.ema_20 ? "▲ Above EMA" : "▼ Below EMA") : "Trend"}
            </span>
          </div>

          {/* 50 SMA */}
          <div className="bg-dark-900 p-2.5 rounded-lg border border-dark-800">
            <span className="text-slate-500 block">50 SMA</span>
            <span className="text-white font-bold text-sm mt-0.5 block">
              ₹{currStock.sma_50 != null ? currStock.sma_50.toFixed(2) : "—"}
            </span>
            <span className="text-[10px] text-slate-400">Medium Trend</span>
          </div>

          {/* 200 SMA */}
          <div className="bg-dark-900 p-2.5 rounded-lg border border-dark-800">
            <span className="text-slate-500 block">200 SMA (DMA)</span>
            <span className="text-white font-bold text-sm mt-0.5 block">
              ₹{currStock.sma_200 != null ? currStock.sma_200.toFixed(2) : "—"}
            </span>
            <span className="text-[10px] text-slate-400">Long Trend</span>
          </div>

          {/* 52W High / Low */}
          <div className="bg-dark-900 p-2.5 rounded-lg border border-dark-800">
            <span className="text-slate-500 block">52W Range</span>
            <span className="text-white font-bold text-sm mt-0.5 block">
              ₹{currStock.week_52_low != null ? currStock.week_52_low.toFixed(0) : "—"} - ₹{currStock.week_52_high != null ? currStock.week_52_high.toFixed(0) : "—"}
            </span>
            <span className="text-[10px] text-slate-400">
              Dist High: {currStock.dist_52w_high_pct ?? 0}%
            </span>
          </div>

          {/* Market Cap & PE */}
          <div className="bg-dark-900 p-2.5 rounded-lg border border-dark-800">
            <span className="text-slate-500 block">Market Cap & P/E</span>
            <span className="text-white font-bold text-sm mt-0.5 block">
              {currStock.market_cap_cr ? `₹${Number(currStock.market_cap_cr).toLocaleString("en-IN")} Cr` : "—"}
            </span>
            <span className="text-[10px] text-slate-400">
              P/E: {currStock.pe_ratio > 0 ? currStock.pe_ratio.toFixed(1) : "—"} | Div: {currStock.dividend_yield ?? 0}%
            </span>
          </div>
        </div>

        {/* Bottom Alert Set Bar */}
        <div className="px-6 py-3 bg-dark-900 border-t border-dark-800 flex flex-wrap items-center justify-between gap-3">
          <form onSubmit={handleCreateAlert} className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-300 font-medium">Set Price Alert:</span>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₹</span>
              <input
                type="number"
                step="0.05"
                placeholder={currStock.price ? currStock.price.toFixed(2) : "0.00"}
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="bg-dark-850 border border-dark-750 focus:border-amber-400 rounded pl-6 pr-2 py-1 text-xs text-white focus:outline-none w-28"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded text-xs font-semibold transition"
            >
              Add Alert
            </button>
            {alertSuccess && (
              <span className="text-xs text-emerald-400 font-semibold animate-pulse">
                ✓ Alert set!
              </span>
            )}
          </form>

          <div className="text-xs text-slate-500">
            Live tick frequency: <strong className="text-slate-400">1.5s</strong> • Data feed: <strong className="text-slate-400">NSE / BSE</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
