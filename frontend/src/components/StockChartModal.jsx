import React, { useEffect, useRef, useState } from "react";
import { createChart, ColorType, CandlestickSeries, HistogramSeries } from "lightweight-charts";
import {
  X,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart2
} from "lucide-react";
import { fetchStockHistory, fetchStockDetail } from "../services/api";

const TIMEFRAMES = ["1D", "1W", "1M", "3M", "1Y"];

export function StockChartModal({ stock, onClose }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const [liveStock, setLiveStock] = useState(stock);
  const [timeframe, setTimeframe] = useState("1M");
  const [loading, setLoading] = useState(true);
  const [hoveredCandle, setHoveredCandle] = useState(null);

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

        // TradingView-Standard Professional Dark Canvas
        const chart = createChart(chartContainerRef.current, {
          layout: {
            background: { type: ColorType.Solid, color: "#09090b" },
            textColor: "#a1a1aa",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          },
          grid: {
            vertLines: { color: "#18181b" },
            horzLines: { color: "#18181b" }
          },
          crosshair: {
            mode: 1, // Magnet crosshair
            vertLine: {
              color: "#52525b",
              width: 1,
              style: 3,
              labelBackgroundColor: "#27272a"
            },
            horzLine: {
              color: "#52525b",
              width: 1,
              style: 3,
              labelBackgroundColor: "#27272a"
            }
          },
          rightPriceScale: {
            borderColor: "#27272a",
            scaleMargins: {
              top: 0.1,
              bottom: 0.2
            }
          },
          timeScale: {
            borderColor: "#27272a",
            timeVisible: timeframe === "1D" || timeframe === "1W",
            secondsVisible: false
          },
          width: chartContainerRef.current.clientWidth,
          height: 400
        });
        chartRef.current = chart;

        // TradingView-Standard Bullish & Bearish Candlesticks
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
          upColor: "#089981",          // TradingView standard Bullish Emerald
          downColor: "#f23645",        // TradingView standard Bearish Crimson
          borderVisible: true,
          borderColor: "#089981",
          borderUpColor: "#089981",
          borderDownColor: "#f23645",
          wickColor: "#71717a",
          wickUpColor: "#089981",
          wickDownColor: "#f23645"
        });

        // Volume Series with subtle transparency
        const volumeSeries = chart.addSeries(HistogramSeries, {
          priceFormat: {
            type: "volume"
          },
          priceScaleId: "",
          scaleMargins: {
            top: 0.82,
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
          color: c.close >= c.open ? "rgba(8, 153, 129, 0.45)" : "rgba(242, 54, 69, 0.45)"
        }));

        if (candles.length > 0) {
          candlestickSeries.setData(candles);
          volumeSeries.setData(volumes);
          chart.timeScale().fitContent();

          // Set latest candle as initial OHLC display
          const lastCandle = candles[candles.length - 1];
          const lastVol = volumes[volumes.length - 1];
          setHoveredCandle({
            ...lastCandle,
            volume: lastVol?.value
          });
        }

        // Interactive Crosshair OHLC readout
        chart.subscribeCrosshairMove((param) => {
          if (!param || !param.time || !param.seriesData) {
            if (candles.length > 0) {
              const lastCandle = candles[candles.length - 1];
              const lastVol = volumes[volumes.length - 1];
              setHoveredCandle({ ...lastCandle, volume: lastVol?.value });
            }
            return;
          }
          const candleData = param.seriesData.get(candlestickSeries);
          const volData = param.seriesData.get(volumeSeries);
          if (candleData) {
            setHoveredCandle({
              open: candleData.open,
              high: candleData.high,
              low: candleData.low,
              close: candleData.close,
              volume: volData?.value
            });
          }
        });

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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 overflow-y-auto animate-fadeIn select-none">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[95vh]">
        {/* Header Bar */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-900/60">
          <div className="flex items-center gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {currStock.symbol}
                </h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-extrabold border ${
                    currStock.exchange === "BSE"
                      ? "bg-zinc-900 text-zinc-300 border-zinc-700"
                      : "bg-white text-black border-white"
                  }`}
                >
                  {currStock.exchange || "NSE"}
                </span>
                {currStock.bse_code && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono border border-zinc-800">
                    #{currStock.bse_code}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 font-medium truncate max-w-[280px] sm:max-w-md">
                {currStock.name} • {currStock.sector}
              </p>
            </div>

            <div className="h-8 w-px bg-zinc-800 hidden sm:block" />

            {/* Price Snapshot */}
            <div className="hidden sm:flex flex-col">
              <span className="text-lg font-bold text-white font-tabular">
                ₹{currStock.price ? Number(currStock.price).toFixed(2) : "—"}
              </span>
              <span
                className={`text-xs font-bold flex items-center gap-0.5 ${
                  isBull ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isBull ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {isBull ? "+" : ""}
                {currStock.change ? Number(currStock.change).toFixed(2) : "0.00"} ({isBull ? "+" : ""}
                {currStock.change_pct ? Number(currStock.change_pct).toFixed(2) : "0.00"}%)
              </span>
            </div>
          </div>

          {/* Timeframe Selector & Close */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 flex items-center gap-0.5">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                    timeframe === tf
                      ? "bg-white text-black shadow-xs"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
              aria-label="Close chart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time Interactive TradingView-Style OHLC Bar */}
        <div className="px-4 sm:px-6 py-1.5 bg-black border-b border-zinc-900 flex items-center justify-between text-[11px] font-mono font-medium text-zinc-400 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-3 sm:gap-5 min-w-max">
            {hoveredCandle ? (
              <>
                <div>
                  <span className="text-zinc-500">O: </span>
                  <span className="text-white font-bold">₹{hoveredCandle.open?.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-zinc-500">H: </span>
                  <span className="text-emerald-400 font-bold">₹{hoveredCandle.high?.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-zinc-500">L: </span>
                  <span className="text-rose-400 font-bold">₹{hoveredCandle.low?.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-zinc-500">C: </span>
                  <span className={hoveredCandle.close >= hoveredCandle.open ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                    ₹{hoveredCandle.close?.toFixed(2)}
                  </span>
                </div>
                {hoveredCandle.volume != null && (
                  <div>
                    <span className="text-zinc-500">Vol: </span>
                    <span className="text-zinc-300">{(hoveredCandle.volume / 100000).toFixed(2)} L</span>
                  </div>
                )}
              </>
            ) : (
              <span className="text-zinc-500">Move cursor over candles to inspect OHLC</span>
            )}
          </div>
          <div className="text-[10px] text-zinc-600 hidden sm:block">
            TradingView Lightweight Charts
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="relative p-2 sm:p-4 bg-zinc-950">
          {loading && (
            <div className="absolute inset-0 z-10 bg-black/75 backdrop-blur-xs flex items-center justify-center text-zinc-300 text-sm gap-2">
              <Activity className="w-5 h-5 text-emerald-400 animate-spin" />
              <span>Fetching live historical candles...</span>
            </div>
          )}
          <div ref={chartContainerRef} className="w-full h-[380px] sm:h-[400px] rounded-lg overflow-hidden" />
        </div>

        {/* Technical Indicators & Fundamentals Grid */}
        <div className="px-4 sm:px-6 py-3.5 bg-black border-t border-zinc-850 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 text-xs overflow-y-auto">
          {/* RSI (14) */}
          <div className="bg-zinc-900/90 p-2.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-400 block font-medium">RSI (14)</span>
            <span className="text-white font-bold text-sm mt-0.5 block">
              {currStock.rsi_14 != null ? currStock.rsi_14.toFixed(1) : "50.0"}
            </span>
            <span className="text-[10px] text-zinc-500 font-semibold">
              {currStock.rsi_14 >= 70 ? "Overbought" : currStock.rsi_14 <= 35 ? "Oversold" : "Neutral"}
            </span>
          </div>

          {/* 20 EMA */}
          <div className="bg-zinc-900/90 p-2.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-400 block font-medium">20 EMA</span>
            <span className="text-white font-bold text-sm mt-0.5 block">
              ₹{currStock.ema_20 != null ? currStock.ema_20.toFixed(2) : "—"}
            </span>
            <span className="text-[10px] text-zinc-500 font-medium">
              {currStock.price && currStock.ema_20 ? (currStock.price >= currStock.ema_20 ? "Above EMA" : "Below EMA") : "Trend"}
            </span>
          </div>

          {/* 50 SMA */}
          <div className="bg-zinc-900/90 p-2.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-400 block font-medium">50 SMA</span>
            <span className="text-white font-bold text-sm mt-0.5 block">
              ₹{currStock.sma_50 != null ? currStock.sma_50.toFixed(2) : "—"}
            </span>
            <span className="text-[10px] text-zinc-500 font-medium">Medium Trend</span>
          </div>

          {/* 200 SMA */}
          <div className="bg-zinc-900/90 p-2.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-400 block font-medium">200 SMA</span>
            <span className="text-white font-bold text-sm mt-0.5 block">
              ₹{currStock.sma_200 != null ? currStock.sma_200.toFixed(2) : "—"}
            </span>
            <span className="text-[10px] text-zinc-500 font-medium">Long Trend</span>
          </div>

          {/* 52W High / Low */}
          <div className="bg-zinc-900/90 p-2.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-400 block font-medium">52W Range</span>
            <span className="text-white font-bold text-sm mt-0.5 block">
              ₹{currStock.week_52_low != null ? currStock.week_52_low.toFixed(0) : "—"} - ₹{currStock.week_52_high != null ? currStock.week_52_high.toFixed(0) : "—"}
            </span>
            <span className="text-[10px] text-zinc-500 font-medium">
              Dist High: {currStock.dist_52w_high_pct ?? 0}%
            </span>
          </div>

          {/* Market Cap & PE */}
          <div className="bg-zinc-900/90 p-2.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-400 block font-medium">Market Cap & P/E</span>
            <span className="text-white font-bold text-sm mt-0.5 block">
              {currStock.market_cap_cr ? `₹${Number(currStock.market_cap_cr).toLocaleString("en-IN")} Cr` : "—"}
            </span>
            <span className="text-[10px] text-zinc-500 font-medium">
              P/E: {currStock.pe_ratio > 0 ? currStock.pe_ratio.toFixed(1) : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(StockChartModal);
