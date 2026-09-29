import React, { useState } from "react";
import {
  X,
  Bell,
  Trash2,
  CheckCircle,
  Clock,
  Plus,
  AlertTriangle
} from "lucide-react";

export function WatchlistAlertsDrawer({
  isOpen,
  onClose,
  alerts,
  onAddAlert,
  onRemoveAlert,
  stocks,
  triggeredAlerts,
  onDismissTriggered
}) {
  const [symbol, setSymbol] = useState(stocks[0]?.symbol || "RELIANCE");
  const [condition, setCondition] = useState("price_above");
  const [targetValue, setTargetValue] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(targetValue);
    if (!val || isNaN(val)) return;

    onAddAlert({
      symbol,
      condition,
      value: val
    });

    setTargetValue("");
  };

  const selectedStock = stocks.find((s) => s.symbol === symbol);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="bg-dark-900 border-l border-dark-750 w-full max-w-md h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-dark-800 flex items-center justify-between bg-dark-950">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Alerts & Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-dark-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-5 text-xs">
          {/* Create Alert Form */}
          <div className="bg-dark-850 border border-dark-750 rounded-xl p-3.5 flex flex-col gap-3">
            <h3 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Create New Live Alert</span>
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
              <div>
                <label className="text-slate-400 block mb-1">Select Stock</label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-750 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-400"
                >
                  {stocks.map((s) => (
                    <option key={s.symbol} value={s.symbol}>
                      {s.symbol} — ₹{s.price?.toFixed(2)} ({s.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Trigger Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full bg-dark-900 border border-dark-750 rounded px-2 py-1.5 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="price_above">Price Rises Above (≥)</option>
                    <option value="price_below">Price Drops Below (≤)</option>
                    <option value="pct_gain">% Intraday Gain (≥)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">
                    {condition === "pct_gain" ? "Target %" : "Target Price (₹)"}
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    placeholder={
                      condition === "pct_gain"
                        ? "e.g. 2.5"
                        : selectedStock?.price?.toFixed(2) || "100"
                    }
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full bg-dark-900 border border-dark-750 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-1 w-full bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold py-2 rounded-lg transition"
              >
                Set Live Alert
              </button>
            </form>
          </div>

          {/* Triggered Alerts History */}
          {triggeredAlerts.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Recently Triggered</span>
              </h3>
              <div className="flex flex-col gap-2">
                {triggeredAlerts.map((ta) => (
                  <div
                    key={ta.id}
                    className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start justify-between gap-2"
                  >
                    <div>
                      <strong className="text-white block font-bold">{ta.symbol}</strong>
                      <p className="text-rose-300 text-[11px]">{ta.message}</p>
                      <span className="text-[10px] text-slate-500">{ta.time}</span>
                    </div>
                    <button
                      onClick={() => onDismissTriggered(ta.id)}
                      className="text-slate-500 hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Alerts List */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Active Alerts ({alerts.length})</span>
            </h3>

            {alerts.length === 0 ? (
              <p className="text-slate-500 text-center py-6 bg-dark-850/50 rounded-lg border border-dark-800">
                No active price alerts set yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border flex items-center justify-between gap-3 ${
                      alert.triggered
                        ? "bg-dark-850/40 border-dark-800 opacity-60"
                        : "bg-dark-850 border-dark-750"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">
                          {alert.symbol}
                        </span>
                        {alert.triggered ? (
                          <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.2 rounded font-semibold flex items-center gap-1">
                            <CheckCircle className="w-2.5 h-2.5" /> Triggered
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-500/15 text-amber-400 px-1.5 py-0.2 rounded font-semibold">
                            Watching
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        {alert.condition === "price_above"
                          ? `Price ≥ ₹${alert.value}`
                          : alert.condition === "price_below"
                          ? `Price ≤ ₹${alert.value}`
                          : `Gain ≥ +${alert.value}%`}
                      </p>
                    </div>

                    <button
                      onClick={() => onRemoveAlert(alert.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-dark-800 rounded transition"
                      title="Delete Alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
