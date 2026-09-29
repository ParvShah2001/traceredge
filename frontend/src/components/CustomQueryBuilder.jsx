import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Sliders,
  CheckCircle,
  Sparkles,
  Zap,
  Bookmark,
  X,
  Play
} from "lucide-react";

export const FILTER_FIELDS = [
  { id: "day_low", label: "Today's Low" },
  { id: "day_high", label: "Today's High" },
  { id: "open", label: "Today's Open" },
  { id: "price", label: "Current Price (LTP)" },
  { id: "prev_close", label: "Previous Day Close" },
  { id: "prev_high", label: "Previous Day High" },
  { id: "prev_low", label: "Previous Day Low" },
  { id: "prev_open", label: "Previous Day Open" },
  { id: "volume", label: "Today's Volume" },
  { id: "avg_volume_20d", label: "20-Day Avg Volume" },
  { id: "rsi_14", label: "RSI (14)" },
  { id: "ema_20", label: "20 EMA" },
  { id: "sma_50", label: "50 SMA" },
  { id: "sma_200", label: "200 SMA (DMA)" },
  { id: "week_52_high", label: "52-Week High" },
  { id: "week_52_low", label: "52-Week Low" },
  { id: "pe_ratio", label: "P/E Ratio" },
  { id: "market_cap_cr", label: "Market Cap (₹ Cr)" }
];

export const OPERATORS = [
  { id: ">", label: "> (Greater than)" },
  { id: ">=", label: "≥ (Greater or equal)" },
  { id: "<", label: "< (Less than)" },
  { id: "<=", label: "≤ (Less or equal)" },
  { id: "==", label: "== (Equal / Matches)" },
  { id: "!=", label: "≠ (Not equal)" }
];

export const STRATEGY_TEMPLATES = [
  {
    name: "User Example 1: Bullish Gap-Up (Low > Prev High)",
    desc: "Today's low is greater than previous day's high (unfilled gap up)",
    logic: "AND",
    rules: [
      {
        left_field: "day_low",
        operator: ">",
        right_type: "field",
        right_field: "prev_high",
        right_value: 0,
        multiplier: 1.0
      }
    ]
  },
  {
    name: "User Example 2: Open = Low Bullish Surge",
    desc: "Today's low equals today's open (strong buyers right from open)",
    logic: "AND",
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
    ]
  },
  {
    name: "Dual Sniper: Low > Prev High AND Low == Open",
    desc: "Stocks gapping up where today's low is also today's open",
    logic: "AND",
    rules: [
      {
        left_field: "day_low",
        operator: ">",
        right_type: "field",
        right_field: "prev_high",
        right_value: 0,
        multiplier: 1.0
      },
      {
        left_field: "day_low",
        operator: "==",
        right_type: "field",
        right_field: "open",
        right_value: 0,
        multiplier: 1.0,
        tolerance_pct: 0.15
      }
    ]
  },
  {
    name: "Open = High Bearish Rejection",
    desc: "Today's high equals today's open (immediate selling pressure)",
    logic: "AND",
    rules: [
      {
        left_field: "day_high",
        operator: "==",
        right_type: "field",
        right_field: "open",
        right_value: 0,
        multiplier: 1.0,
        tolerance_pct: 0.15
      }
    ]
  },
  {
    name: "Prev Day High Breakout + Volume Surge",
    desc: "Current price above previous day high and volume > 1.5x 20D average",
    logic: "AND",
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
        multiplier: 1.5
      }
    ]
  },
  {
    name: "Golden Alignment: Price > 20 EMA > 50 SMA",
    desc: "Strong momentum with price above short and medium term moving averages",
    logic: "AND",
    rules: [
      {
        left_field: "price",
        operator: ">",
        right_type: "field",
        right_field: "ema_20",
        right_value: 0,
        multiplier: 1.0
      },
      {
        left_field: "ema_20",
        operator: ">",
        right_type: "field",
        right_field: "sma_50",
        right_value: 0,
        multiplier: 1.0
      }
    ]
  }
];

export function CustomQueryBuilder({
  customRules,
  customLogic,
  onApplyRules,
  onClearRules,
  isOpen,
  onClose
}) {
  const [rules, setRules] = useState(
    customRules && customRules.length > 0
      ? customRules
      : [
          {
            left_field: "day_low",
            operator: ">",
            right_type: "field",
            right_field: "prev_high",
            right_value: 0,
            multiplier: 1.0
          }
        ]
  );
  const [logic, setLogic] = useState(customLogic || "AND");
  const [savedScreens, setSavedScreens] = useState(() => {
    try {
      const saved = localStorage.getItem("saved_custom_screens");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [screenName, setScreenName] = useState("");

  if (!isOpen) return null;

  const handleAddRule = () => {
    setRules((prev) => [
      ...prev,
      {
        left_field: "day_low",
        operator: "==",
        right_type: "field",
        right_field: "open",
        right_value: 0,
        multiplier: 1.0,
        tolerance_pct: 0.15
      }
    ]);
  };

  const handleRemoveRule = (index) => {
    setRules((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleRuleChange = (index, key, value) => {
    setRules((prev) =>
      prev.map((r, idx) => (idx === index ? { ...r, [key]: value } : r))
    );
  };

  const handleLoadTemplate = (template) => {
    setRules(template.rules);
    setLogic(template.logic);
  };

  const handleSaveScreen = () => {
    if (!screenName.trim()) return;
    const newScreen = {
      id: Date.now().toString(),
      name: screenName.trim(),
      logic,
      rules
    };
    const updated = [newScreen, ...savedScreens];
    setSavedScreens(updated);
    try {
      localStorage.setItem("saved_custom_screens", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setScreenName("");
  };

  const handleDeleteSavedScreen = (id) => {
    const updated = savedScreens.filter((s) => s.id !== id);
    setSavedScreens(updated);
    try {
      localStorage.setItem("saved_custom_screens", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleApply = () => {
    onApplyRules(rules, logic);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-dark-900 border border-dark-750 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-800 flex items-center justify-between bg-dark-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Custom Stock Screener Formula Builder
              </h2>
              <p className="text-xs text-slate-400">
                Filter Indian equities by custom comparative rules (e.g. Today's Low &gt; Prev High, Open = Low)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex flex-col gap-6 text-xs">
          {/* Quick Popular Strategy Templates */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>One-Click Strategy Templates</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Select a preset to populate rules automatically
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {STRATEGY_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLoadTemplate(tmpl)}
                  className="text-left p-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-dark-750 hover:border-emerald-500/40 transition group flex flex-col justify-between"
                >
                  <span className="font-bold text-white group-hover:text-emerald-400 transition text-[11px]">
                    {tmpl.name}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                    {tmpl.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Rules List */}
          <div className="flex flex-col gap-3 bg-dark-950 p-4 rounded-xl border border-dark-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-200">Conditions List</span>
                {/* Logic Toggle */}
                <div className="flex items-center bg-dark-900 border border-dark-750 rounded-lg p-0.5">
                  <button
                    onClick={() => setLogic("AND")}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                      logic === "AND"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Match ALL (AND)
                  </button>
                  <button
                    onClick={() => setLogic("OR")}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                      logic === "OR"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Match ANY (OR)
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddRule}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Condition</span>
              </button>
            </div>

            {/* Rules Table / Rows */}
            <div className="flex flex-col gap-2.5 mt-1">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-center gap-2 p-2.5 bg-dark-900 rounded-lg border border-dark-750"
                >
                  <span className="w-5 text-center font-bold text-slate-500">
                    #{idx + 1}
                  </span>

                  {/* Left Field */}
                  <select
                    value={rule.left_field}
                    onChange={(e) => handleRuleChange(idx, "left_field", e.target.value)}
                    className="bg-dark-850 border border-dark-750 rounded px-2.5 py-1.5 text-white font-medium focus:border-emerald-500 focus:outline-none flex-1 min-w-[140px]"
                  >
                    {FILTER_FIELDS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>

                  {/* Operator */}
                  <select
                    value={rule.operator}
                    onChange={(e) => handleRuleChange(idx, "operator", e.target.value)}
                    className="bg-dark-850 border border-dark-750 rounded px-2 py-1.5 text-emerald-400 font-bold focus:border-emerald-500 focus:outline-none w-28"
                  >
                    {OPERATORS.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.label}
                      </option>
                    ))}
                  </select>

                  {/* Right Operand Type Toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      handleRuleChange(
                        idx,
                        "right_type",
                        rule.right_type === "field" ? "number" : "field"
                      )
                    }
                    className="px-2 py-1.5 bg-dark-800 hover:bg-dark-750 rounded border border-dark-700 text-slate-300 text-[11px] font-mono"
                    title="Toggle between comparing against another stock attribute or a static number"
                  >
                    {rule.right_type === "field" ? "Stock Field" : "Number"}
                  </button>

                  {/* Right Value / Field */}
                  {rule.right_type === "field" ? (
                    <select
                      value={rule.right_field || "open"}
                      onChange={(e) => handleRuleChange(idx, "right_field", e.target.value)}
                      className="bg-dark-850 border border-dark-750 rounded px-2.5 py-1.5 text-white font-medium focus:border-emerald-500 focus:outline-none flex-1 min-w-[140px]"
                    >
                      {FILTER_FIELDS.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      step="any"
                      placeholder="Constant value"
                      value={rule.right_value || ""}
                      onChange={(e) =>
                        handleRuleChange(idx, "right_value", parseFloat(e.target.value) || 0)
                      }
                      className="bg-dark-850 border border-dark-750 rounded px-2.5 py-1.5 text-white focus:border-emerald-500 focus:outline-none flex-1 min-w-[120px]"
                    />
                  )}

                  {/* Multiplier (e.g. 1.5x) */}
                  <div className="flex items-center gap-1 bg-dark-850 px-2 py-1 rounded border border-dark-750">
                    <span className="text-[10px] text-slate-500">×</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={rule.multiplier !== undefined ? rule.multiplier : 1.0}
                      onChange={(e) =>
                        handleRuleChange(idx, "multiplier", parseFloat(e.target.value) || 1.0)
                      }
                      className="w-12 bg-transparent text-white text-xs focus:outline-none"
                      title="Multiplier applied to right operand"
                    />
                  </div>

                  {/* Delete Rule */}
                  <button
                    onClick={() => handleRemoveRule(idx)}
                    disabled={rules.length <= 1}
                    className={`p-1.5 rounded transition ${
                      rules.length <= 1
                        ? "text-slate-600 cursor-not-allowed"
                        : "text-slate-400 hover:text-rose-400 hover:bg-dark-800"
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Save to Saved Screens */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-dark-850 rounded-xl border border-dark-750">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Bookmark className="w-4 h-4 text-amber-400" />
              <input
                type="text"
                placeholder="Name this custom strategy to save (e.g. Gap Up Open=Low)..."
                value={screenName}
                onChange={(e) => setScreenName(e.target.value)}
                className="bg-dark-900 border border-dark-750 rounded px-3 py-1.5 text-white text-xs focus:border-amber-400 focus:outline-none flex-1"
              />
              <button
                onClick={handleSaveScreen}
                disabled={!screenName.trim()}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold rounded transition disabled:opacity-50"
              >
                Save
              </button>
            </div>

            {savedScreens.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400">My Saved:</span>
                {savedScreens.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-1 bg-dark-900 px-2 py-1 rounded border border-dark-750 text-slate-300"
                  >
                    <button
                      onClick={() => {
                        setRules(s.rules);
                        setLogic(s.logic);
                      }}
                      className="hover:text-emerald-400 font-medium"
                    >
                      {s.name}
                    </button>
                    <button
                      onClick={() => handleDeleteSavedScreen(s.id)}
                      className="text-slate-500 hover:text-rose-400 ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-dark-950 border-t border-dark-800 flex items-center justify-between">
          <button
            onClick={() => {
              onClearRules();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-dark-850 hover:bg-dark-800 text-slate-400 hover:text-white transition font-medium"
          >
            Clear Custom Rules
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-dark-850 hover:bg-dark-800 text-slate-300 hover:text-white transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-bold shadow-lg shadow-emerald-500/20 transition"
            >
              <Play className="w-4 h-4 fill-dark-950" />
              <span>Apply Custom Screen ({rules.length} Rules)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
