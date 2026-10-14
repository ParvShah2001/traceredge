import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Sliders,
  Sparkles,
  Bookmark,
  X,
  Play,
  Check,
  TrendingUp,
  BarChart2,
  Shield,
  Zap,
  Info,
  RotateCcw
} from "lucide-react";

export const FILTER_FIELDS = [
  { id: "price", label: "Current Price (LTP)", category: "Price & Intraday" },
  { id: "open", label: "Today's Open", category: "Price & Intraday" },
  { id: "day_high", label: "Today's High", category: "Price & Intraday" },
  { id: "day_low", label: "Today's Low", category: "Price & Intraday" },
  { id: "prev_close", label: "Previous Day Close", category: "Previous Session" },
  { id: "prev_high", label: "Previous Day High", category: "Previous Session" },
  { id: "prev_low", label: "Previous Day Low", category: "Previous Session" },
  { id: "prev_open", label: "Previous Day Open", category: "Previous Session" },
  { id: "volume", label: "Today's Volume", category: "Volume" },
  { id: "avg_volume_20d", label: "20-Day Avg Volume", category: "Volume" },
  { id: "rsi_14", label: "RSI (14)", category: "Indicators" },
  { id: "ema_20", label: "20 EMA", category: "Indicators" },
  { id: "sma_50", label: "50 SMA", category: "Indicators" },
  { id: "sma_200", label: "200 SMA (DMA)", category: "Indicators" },
  { id: "week_52_high", label: "52-Week High", category: "52-Week Range" },
  { id: "week_52_low", label: "52-Week Low", category: "52-Week Range" },
  { id: "pe_ratio", label: "P/E Ratio", category: "Fundamentals" },
  { id: "market_cap_cr", label: "Market Cap (Cr)", category: "Fundamentals" }
];

export const OPERATORS = [
  { id: ">", label: "is greater than ( > )", symbol: ">", plain: "is greater than" },
  { id: ">=", label: "is greater or equal ( >= )", symbol: ">=", plain: "is at least" },
  { id: "<", label: "is less than ( < )", symbol: "<", plain: "is less than" },
  { id: "<=", label: "is less or equal ( <= )", symbol: "<=", plain: "is at most" },
  { id: "==", label: "is equal to / matches ( == )", symbol: "==", plain: "equals" },
  { id: "!=", label: "is not equal to ( != )", symbol: "!=", plain: "does not equal" }
];

export const STRATEGY_CATEGORIES = [
  { id: "all", label: "All Strategies" },
  { id: "intraday", label: "Intraday Snipers" },
  { id: "momentum", label: "Momentum & Trend" },
  { id: "reversal", label: "Reversal & Dip" },
  { id: "volume", label: "Volume & Breakout" },
  { id: "value", label: "Valuation & Quality" }
];

export const STRATEGY_TEMPLATES = [
  // Intraday
  {
    id: "open_low",
    category: "intraday",
    name: "Open = Low Bullish Surge",
    desc: "Today's low equals today's open. Strong institutional buyers drove the stock higher right from the opening bell with zero lower wick.",
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
    id: "open_high",
    category: "intraday",
    name: "Open = High Bearish Rejection",
    desc: "Today's high equals today's open. Immediate selling pressure at the opening bell, price never rose above the open.",
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
    id: "unfilled_gap_up",
    category: "intraday",
    name: "Unfilled Gap-Up Breakaway",
    desc: "Today's lowest price is strictly higher than yesterday's high, creating an unfilled bullish price gap.",
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
    id: "unfilled_gap_down",
    category: "intraday",
    name: "Unfilled Gap-Down Panic",
    desc: "Today's highest price is strictly lower than yesterday's low, indicating strong gap-down selling pressure.",
    logic: "AND",
    rules: [
      {
        left_field: "day_high",
        operator: "<",
        right_type: "field",
        right_field: "prev_low",
        right_value: 0,
        multiplier: 1.0
      }
    ]
  },
  {
    id: "dual_sniper",
    category: "intraday",
    name: "Dual Sniper (Gap-Up + Open=Low)",
    desc: "High-conviction morning breakout: stock gapped up and continued ripping higher without ever breaching the open.",
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
    id: "prev_high_breakout",
    category: "intraday",
    name: "Previous Day High Breakout",
    desc: "Current price is trading above yesterday's peak with volume confirmation above the 20-day average.",
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
        multiplier: 1.2
      }
    ]
  },
  {
    id: "prev_low_breakdown",
    category: "intraday",
    name: "Previous Day Low Breakdown",
    desc: "Current price has breached below yesterday's floor with elevated volume.",
    logic: "AND",
    rules: [
      {
        left_field: "price",
        operator: "<",
        right_type: "field",
        right_field: "prev_low",
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
    ]
  },
  {
    id: "support_retest",
    category: "intraday",
    name: "Prior High Retest as Support",
    desc: "Today's intraday low cleanly retested and held yesterday's high, confirming previous resistance has turned into support.",
    logic: "AND",
    rules: [
      {
        left_field: "day_low",
        operator: "==",
        right_type: "field",
        right_field: "prev_high",
        right_value: 0,
        multiplier: 1.0,
        tolerance_pct: 0.25
      },
      {
        left_field: "price",
        operator: ">",
        right_type: "field",
        right_field: "open",
        right_value: 0,
        multiplier: 1.0
      }
    ]
  },

  // Momentum & Trend
  {
    id: "golden_cross",
    category: "momentum",
    name: "Golden Cross (50 SMA > 200 SMA)",
    desc: "Classic institutional bullish trend reversal: the 50-day moving average crosses above the 200-day moving average.",
    logic: "AND",
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
    ]
  },
  {
    id: "triple_ma_highway",
    category: "momentum",
    name: "Triple MA Bullish Highway",
    desc: "Strong momentum alignment with Price above 20 EMA, 20 EMA above 50 SMA, and 50 SMA above 200 SMA.",
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
      },
      {
        left_field: "sma_50",
        operator: ">",
        right_type: "field",
        right_field: "sma_200",
        right_value: 0,
        multiplier: 1.0
      }
    ]
  },
  {
    id: "week_52_high_run",
    category: "momentum",
    name: "52-Week High Breakout Run",
    desc: "Price trading within 1% of or above its 52-week peak with active volume expansion.",
    logic: "AND",
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
    ]
  },
  {
    id: "rsi_momentum_zone",
    category: "momentum",
    name: "RSI Bullish Momentum Zone (60-75)",
    desc: "Strong relative strength between 60 and 75 with price comfortably above short-term 20 EMA.",
    logic: "AND",
    rules: [
      {
        left_field: "rsi_14",
        operator: ">=",
        right_type: "number",
        right_field: "rsi_14",
        right_value: 60,
        multiplier: 1.0
      },
      {
        left_field: "rsi_14",
        operator: "<=",
        right_type: "number",
        right_field: "rsi_14",
        right_value: 75,
        multiplier: 1.0
      },
      {
        left_field: "price",
        operator: ">",
        right_type: "field",
        right_field: "ema_20",
        right_value: 0,
        multiplier: 1.0
      }
    ]
  },
  {
    id: "death_cross",
    category: "momentum",
    name: "Death Cross Bearish Warning",
    desc: "Long-term downtrend confirmation: 50-day moving average below 200-day moving average and price under 50 SMA.",
    logic: "AND",
    rules: [
      {
        left_field: "sma_50",
        operator: "<",
        right_type: "field",
        right_field: "sma_200",
        right_value: 0,
        multiplier: 1.0
      },
      {
        left_field: "price",
        operator: "<=",
        right_type: "field",
        right_field: "sma_50",
        right_value: 0,
        multiplier: 1.0
      }
    ]
  },

  // Reversal & Dip
  {
    id: "dma_200_bounce",
    category: "reversal",
    name: "200 DMA Institutional Dip Bounce",
    desc: "Price resting directly on the critical 200 DMA support band with mild oversold RSI.",
    logic: "AND",
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
    ]
  },
  {
    id: "oversold_rsi_panic",
    category: "reversal",
    name: "Deep Oversold Dip (RSI <= 30)",
    desc: "Severe intraday or multi-day selling exhaustion. High probability of mean-reversion technical bounce.",
    logic: "AND",
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
    ]
  },
  {
    id: "week_52_low_bottom",
    category: "reversal",
    name: "52-Week Low Bottom Floor Bounce",
    desc: "Testing 52-week low floor and buyers stepping in to lift the price back above today's open.",
    logic: "AND",
    rules: [
      {
        left_field: "day_low",
        operator: "<=",
        right_type: "field",
        right_field: "week_52_low",
        right_value: 0,
        multiplier: 1.02
      },
      {
        left_field: "price",
        operator: ">",
        right_type: "field",
        right_field: "open",
        right_value: 0,
        multiplier: 1.0
      }
    ]
  },
  {
    id: "rsi_recovery_cross",
    category: "reversal",
    name: "RSI Bullish Recovery (Crossing 40)",
    desc: "RSI climbing out of the oversold trench (40-48) with price crossing above the short-term 20 EMA.",
    logic: "AND",
    rules: [
      {
        left_field: "rsi_14",
        operator: ">=",
        right_type: "number",
        right_field: "rsi_14",
        right_value: 40,
        multiplier: 1.0
      },
      {
        left_field: "rsi_14",
        operator: "<=",
        right_type: "number",
        right_field: "rsi_14",
        right_value: 48,
        multiplier: 1.0
      },
      {
        left_field: "price",
        operator: ">",
        right_type: "field",
        right_field: "ema_20",
        right_value: 0,
        multiplier: 1.0
      }
    ]
  },
  {
    id: "overbought_climax",
    category: "reversal",
    name: "Overbought Climax (RSI >= 75)",
    desc: "Extreme buying euphoria. Useful for taking profits or screening for potential exhaustion pullbacks.",
    logic: "AND",
    rules: [
      {
        left_field: "rsi_14",
        operator: ">=",
        right_type: "number",
        right_field: "rsi_14",
        right_value: 75,
        multiplier: 1.0
      }
    ]
  },

  // Volume & Breakout
  {
    id: "volume_explosion_3x",
    category: "volume",
    name: "3x Volume Explosion Surge",
    desc: "Sudden institutional activity with volume at least 300% of the 20-day normal average and positive price change.",
    logic: "AND",
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
    ]
  },
  {
    id: "volume_surge_green",
    category: "volume",
    name: "Volume Surge with Green Candle",
    desc: "Volume is at least double the 20-day average and today's price is higher than the open.",
    logic: "AND",
    rules: [
      {
        left_field: "volume",
        operator: ">=",
        right_type: "field",
        right_field: "avg_volume_20d",
        right_value: 0,
        multiplier: 2.0
      },
      {
        left_field: "price",
        operator: ">",
        right_type: "field",
        right_field: "open",
        right_value: 0,
        multiplier: 1.0
      }
    ]
  },
  {
    id: "quiet_accumulation",
    category: "volume",
    name: "Quiet Institutional Accumulation",
    desc: "Volume is 2x average while price remains tightly coiled within 1% of previous close.",
    logic: "AND",
    rules: [
      {
        left_field: "volume",
        operator: ">=",
        right_type: "field",
        right_field: "avg_volume_20d",
        right_value: 0,
        multiplier: 2.0
      },
      {
        left_field: "price",
        operator: ">=",
        right_type: "field",
        right_field: "prev_close",
        right_value: 0,
        multiplier: 0.99
      },
      {
        left_field: "price",
        operator: "<=",
        right_type: "field",
        right_field: "prev_close",
        right_value: 0,
        multiplier: 1.01
      }
    ]
  },

  // Valuation & Quality
  {
    id: "large_cap_discount",
    category: "value",
    name: "Large Cap Bluechip Value",
    desc: "Market cap above 25,000 Cr, conservative P/E ratio under 22, and trading securely above the 200 DMA.",
    logic: "AND",
    rules: [
      {
        left_field: "market_cap_cr",
        operator: ">=",
        right_type: "number",
        right_field: "market_cap_cr",
        right_value: 25000,
        multiplier: 1.0
      },
      {
        left_field: "pe_ratio",
        operator: "<=",
        right_type: "number",
        right_field: "pe_ratio",
        right_value: 22,
        multiplier: 1.0
      },
      {
        left_field: "price",
        operator: ">",
        right_type: "field",
        right_field: "sma_200",
        right_value: 0,
        multiplier: 1.0
      }
    ]
  },
  {
    id: "midcap_growth_runway",
    category: "value",
    name: "Mid-Cap Growth Runway",
    desc: "Midcap market capitalization (5,000 - 50,000 Cr) trading above the 50 SMA with volume expansion.",
    logic: "AND",
    rules: [
      {
        left_field: "market_cap_cr",
        operator: ">=",
        right_type: "number",
        right_field: "market_cap_cr",
        right_value: 5000,
        multiplier: 1.0
      },
      {
        left_field: "market_cap_cr",
        operator: "<=",
        right_type: "number",
        right_field: "market_cap_cr",
        right_value: 50000,
        multiplier: 1.0
      },
      {
        left_field: "price",
        operator: ">",
        right_type: "field",
        right_field: "sma_50",
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
    ]
  }
];

// Helper: generates human-friendly sentence for any rule
export function formatRuleSentence(rule) {
  const leftItem = FILTER_FIELDS.find((f) => f.id === rule.left_field);
  const leftName = leftItem ? leftItem.label : rule.left_field;

  const opItem = OPERATORS.find((op) => op.id === rule.operator);
  const opName = opItem ? opItem.plain : rule.operator;

  let rightName = "";
  if (rule.right_type === "field") {
    const rightItem = FILTER_FIELDS.find((f) => f.id === rule.right_field);
    rightName = rightItem ? rightItem.label : (rule.right_field || "Open");
  } else {
    rightName = rule.right_value !== undefined && rule.right_value !== null ? rule.right_value : "0";
  }

  const mult = rule.multiplier && rule.multiplier !== 1.0 ? ` × ${rule.multiplier}` : "";
  return `${leftName} ${opName} ${rightName}${mult}`;
}

export function CustomQueryBuilder({
  customRules,
  customLogic,
  onApplyRules,
  onClearRules,
  isOpen,
  onClose
}) {
  const [activeTab, setActiveTab] = useState("all");
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

  const handleAddRule = (presetType = "blank") => {
    let newRule = {
      left_field: "price",
      operator: ">",
      right_type: "field",
      right_field: "open",
      right_value: 0,
      multiplier: 1.0
    };

    if (presetType === "yesterday") {
      newRule = {
        left_field: "day_low",
        operator: ">",
        right_type: "field",
        right_field: "prev_high",
        right_value: 0,
        multiplier: 1.0
      };
    } else if (presetType === "ma") {
      newRule = {
        left_field: "price",
        operator: ">",
        right_type: "field",
        right_field: "sma_50",
        right_value: 0,
        multiplier: 1.0
      };
    } else if (presetType === "volume") {
      newRule = {
        left_field: "volume",
        operator: ">=",
        right_type: "field",
        right_field: "avg_volume_20d",
        right_value: 0,
        multiplier: 2.0
      };
    } else if (presetType === "rsi") {
      newRule = {
        left_field: "rsi_14",
        operator: "<=",
        right_type: "number",
        right_field: "rsi_14",
        right_value: 30,
        multiplier: 1.0
      };
    }

    setRules((prev) => [...prev, newRule]);
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

  const filteredTemplates =
    activeTab === "all"
      ? STRATEGY_TEMPLATES
      : STRATEGY_TEMPLATES.filter((t) => t.category === activeTab);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-black border border-zinc-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[94vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center">
              <Sliders className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>Strategy Screener & Formula Builder</span>
              </h2>
              <p className="text-xs text-zinc-400 font-medium">
                Select a ready-made template or build custom screening rules in simple steps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-6 text-xs text-white">
          {/* Top Section: Strategy Templates Library */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="font-bold text-sm text-white">One-Click Strategy Templates</span>
                <span className="text-[11px] text-zinc-400 font-mono">({filteredTemplates.length} Available)</span>
              </div>
              <span className="text-[11px] text-zinc-400">
                Click any strategy to automatically load its rules
              </span>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-850">
              {STRATEGY_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                    activeTab === cat.id
                      ? "bg-white text-black border-white shadow-sm"
                      : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Template Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {filteredTemplates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleLoadTemplate(tmpl)}
                  className="p-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-white group-hover:underline text-xs">
                        {tmpl.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 font-mono shrink-0">
                        {tmpl.rules.length} {tmpl.rules.length === 1 ? "rule" : "rules"}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {tmpl.desc}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                    <span className="uppercase">{tmpl.category}</span>
                    <span className="text-white font-bold group-hover:translate-x-0.5 transition-transform">
                      Load &gt;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Middle Section: Active Rules / Sentence Builder */}
          <div className="flex flex-col gap-3 bg-zinc-950 p-4 sm:p-5 rounded-2xl border border-zinc-800">
            {/* Plain-English Live Summary Banner */}
            <div className="p-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-white" />
                  <span>Plain-English Search Description</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  Logic: <strong className="text-white">{logic}</strong>
                </span>
              </div>
              <p className="text-xs text-white font-medium leading-relaxed">
                Finding stocks where{" "}
                <strong className="text-white underline decoration-zinc-600">
                  {logic === "AND" ? "ALL" : "ANY"}
                </strong>{" "}
                of the following conditions match:
              </p>
              <div className="flex flex-col gap-1 pl-2 border-l-2 border-zinc-700 mt-1">
                {rules.map((r, i) => (
                  <div key={i} className="text-xs text-zinc-300 font-mono flex items-center gap-2">
                    <span className="text-zinc-500 font-bold">[{i + 1}]</span>
                    <span>{formatRuleSentence(r)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick-Add Starter Blocks */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">Quick Add:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddRule("yesterday")}
                    className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] font-medium transition"
                  >
                    + Today vs Yesterday
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddRule("ma")}
                    className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] font-medium transition"
                  >
                    + Moving Average
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddRule("volume")}
                    className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] font-medium transition"
                  >
                    + Volume Spike
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddRule("rsi")}
                    className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] font-medium transition"
                  >
                    + RSI Level
                  </button>
                </div>
              </div>

              {/* Match ALL / ANY Toggle */}
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setLogic("AND")}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                    logic === "AND"
                      ? "bg-white text-black shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Match ALL (AND)
                </button>
                <button
                  type="button"
                  onClick={() => setLogic("OR")}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                    logic === "OR"
                      ? "bg-white text-black shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Match ANY (OR)
                </button>
              </div>
            </div>

            {/* Individual Rule Cards */}
            <div className="flex flex-col gap-2.5 mt-1">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col gap-2.5 shadow-sm"
                >
                  {/* Card Header: Step number & Plain English Sentence */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-zinc-800 text-white font-mono font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-zinc-200">
                        {formatRuleSentence(rule)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveRule(idx)}
                      disabled={rules.length === 1}
                      className="p-1 rounded text-zinc-500 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-500 transition"
                      title="Remove condition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Interactive Control Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-850">
                    {/* Left Metric Field */}
                    <div className="flex-1 min-w-[160px]">
                      <label className="block text-[10px] text-zinc-400 mb-0.5">Metric (Left)</label>
                      <select
                        value={rule.left_field}
                        onChange={(e) => handleRuleChange(idx, "left_field", e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-white font-semibold focus:outline-none focus:border-zinc-500"
                      >
                        {FILTER_FIELDS.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Operator */}
                    <div className="w-48 min-w-[140px]">
                      <label className="block text-[10px] text-zinc-400 mb-0.5">Comparison</label>
                      <select
                        value={rule.operator}
                        onChange={(e) => handleRuleChange(idx, "operator", e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-white font-semibold focus:outline-none focus:border-zinc-500"
                      >
                        {OPERATORS.map((op) => (
                          <option key={op.id} value={op.id}>
                            {op.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Target Type Toggle (Field vs Number) */}
                    <div className="w-24">
                      <label className="block text-[10px] text-zinc-400 mb-0.5">Target Type</label>
                      <button
                        type="button"
                        onClick={() =>
                          handleRuleChange(
                            idx,
                            "right_type",
                            rule.right_type === "field" ? "number" : "field"
                          )
                        }
                        className="w-full py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-700 text-white text-[11px] font-bold transition text-center"
                      >
                        {rule.right_type === "field" ? "Stock Field" : "Number"}
                      </button>
                    </div>

                    {/* Right Target Operand */}
                    <div className="flex-1 min-w-[160px]">
                      <label className="block text-[10px] text-zinc-400 mb-0.5">
                        {rule.right_type === "field" ? "Compared With" : "Target Number"}
                      </label>
                      {rule.right_type === "field" ? (
                        <select
                          value={rule.right_field || "open"}
                          onChange={(e) => handleRuleChange(idx, "right_field", e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-white font-semibold focus:outline-none focus:border-zinc-500"
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
                          placeholder="e.g. 50"
                          value={rule.right_value !== undefined ? rule.right_value : 0}
                          onChange={(e) =>
                            handleRuleChange(idx, "right_value", parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-white font-semibold focus:outline-none focus:border-zinc-500"
                        />
                      )}
                    </div>

                    {/* Multiplier */}
                    <div className="w-24">
                      <label className="block text-[10px] text-zinc-400 mb-0.5">Scale (×)</label>
                      <div className="flex items-center bg-black px-2 py-1.5 rounded border border-zinc-800">
                        <span className="text-[11px] text-zinc-500 mr-1">×</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={rule.multiplier !== undefined ? rule.multiplier : 1.0}
                          onChange={(e) =>
                            handleRuleChange(idx, "multiplier", parseFloat(e.target.value) || 1.0)
                          }
                          className="w-full bg-transparent text-white text-xs font-semibold focus:outline-none"
                          title="Multiplier applied to target"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Rule Button */}
            <button
              type="button"
              onClick={() => handleAddRule("blank")}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-zinc-750 hover:border-zinc-500 text-zinc-300 hover:text-white transition font-semibold text-xs mt-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Condition</span>
            </button>
          </div>

          {/* Bottom Section: Save & Saved Strategies */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-zinc-800">
            {/* Save current screen to local storage */}
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <input
                type="text"
                placeholder="Name this custom strategy..."
                value={screenName}
                onChange={(e) => setScreenName(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 flex-1"
              />
              <button
                type="button"
                onClick={handleSaveScreen}
                disabled={!screenName.trim()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition disabled:opacity-40"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>

            {/* Saved Screens List */}
            {savedScreens.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-sm">
                <span className="text-[10px] text-zinc-400 uppercase font-mono">Saved:</span>
                {savedScreens.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-[11px]"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setRules(s.rules);
                        setLogic(s.logic);
                      }}
                      className="font-medium text-white hover:underline truncate max-w-[100px]"
                    >
                      {s.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSavedScreen(s.id)}
                      className="text-zinc-500 hover:text-white p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer / Action Bar */}
        <div className="px-5 py-3.5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClearRules();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-bold transition shadow-lg"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Apply & Run Screener ({rules.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
