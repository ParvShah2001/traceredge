import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Layers, ArrowRight } from "lucide-react";
import { fetchSectors } from "../services/api";

export function SectorHeatmap({ onSelectSector }) {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSectors()
      .then((data) => {
        setSectors(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading sectors:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-dark-900 border border-dark-800 rounded-xl p-12 text-center text-slate-400">
        Loading sector distribution...
      </div>
    );
  }

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>NSE / BSE Sector Performance Heatmap</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any sector to filter stocks in the screener table
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {sectors.map((sec) => {
          const isBull = sec.avg_change_pct >= 0;
          const intensity = Math.min(Math.abs(sec.avg_change_pct) * 25, 45); // color opacity
          const bgColor = isBull
            ? `rgba(16, 185, 129, ${0.1 + intensity / 100})`
            : `rgba(239, 68, 68, ${0.1 + intensity / 100})`;
          const borderColor = isBull
            ? "rgba(16, 185, 129, 0.4)"
            : "rgba(239, 68, 68, 0.4)";

          return (
            <div
              key={sec.sector}
              onClick={() => onSelectSector(sec.sector)}
              className="rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] border flex flex-col justify-between gap-3 shadow-md group"
              style={{ backgroundColor: bgColor, borderColor: borderColor }}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition">
                    {sec.sector}
                  </h3>
                  <div
                    className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                      isBull ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    {isBull ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{isBull ? "+" : ""}{sec.avg_change_pct.toFixed(2)}%</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-1">
                  ₹{Number(sec.total_market_cap_cr).toLocaleString("en-IN")} Cr • {sec.stocks_count} Stocks
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-semibold">▲ {sec.gainers}</span>
                  <span className="text-rose-400 font-semibold">▼ {sec.losers}</span>
                </div>

                {sec.top_performer && (
                  <div className="text-[11px] text-slate-200 flex items-center gap-1 font-medium">
                    <span>Top:</span>
                    <strong className="text-white">{sec.top_performer.symbol}</strong>
                    <span className={sec.top_performer.change_pct >= 0 ? "text-emerald-400" : "text-rose-400"}>
                      ({sec.top_performer.change_pct >= 0 ? "+" : ""}{sec.top_performer.change_pct}%)
                    </span>
                    <ArrowRight className="w-3 h-3 ml-0.5 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
