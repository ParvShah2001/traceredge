# 🛠️ TracerEdge Custom Query Builder Guide

The TracerEdge Custom Query Builder enables traders and quantitative analysts to compose real-time institutional screening formulas without writing SQL or Python code.

It supports **field-to-field dynamic comparisons**, **field-to-value filters**, **multipliers**, and **boolean combinations (`AND` / `OR`)**.

---

## 1. Core Concepts

### Available Metric Fields
| Field Identifier | Name | Description |
| :--- | :--- | :--- |
| `day_low` | Today's Low | Intraday lowest traded price |
| `day_high` | Today's High | Intraday highest traded price |
| `open` | Today's Open | Official trading session opening price |
| `price` | Current LTP | Last Traded Price |
| `prev_close` | Previous Close | Previous day official EOD settlement price |
| `prev_high` | Previous High | Highest price reached during prior session |
| `prev_low` | Previous Low | Lowest price reached during prior session |
| `prev_open` | Previous Open | Opening price of the prior session |
| `volume` | Cumulative Volume | Total traded share volume today |
| `avg_volume_20d` | 20-Day Avg Volume | 20-session moving average volume |
| `rsi_14` | RSI (14) | 14-period Relative Strength Index |
| `ema_20` | 20 EMA | 20-period Exponential Moving Average |
| `sma_50` | 50 SMA | 50-period Simple Moving Average |
| `sma_200` | 200 SMA (DMA) | 200-period Daily Moving Average |
| `week_52_high` | 52-Week High | 52-week peak price |
| `week_52_low` | 52-Week Low | 52-week trough price |
| `pe_ratio` | P/E Ratio | Price-to-Earnings valuation multiple |
| `market_cap_cr` | Market Cap (₹ Cr) | Total market capitalization in Crores |

### Operators
- `>` (Greater than)
- `>=` (Greater than or equal)
- `<` (Less than)
- `<=` (Less than or equal)
- `==` (Matches with tolerance)
- `!=` (Not equal)

### Multipliers
Any right-side value or field can be scaled with a floating-point multiplier (e.g., `volume > avg_volume_20d * 2.0`).

### Float Tolerance
For equality checks (`==`), prices fluctuate with tick precision. TracerEdge applies a default `0.15%` floating tolerance:
$$\left| \frac{\text{left} - \text{right}}{\text{left}} \right| \le 0.0015$$

---

## 2. Strategy Recipes & JSON Payloads

### Recipe 1: Bullish Unfilled Gap-Up
**Logic**: Today's intraday low is strictly higher than yesterday's high (`day_low > prev_high`).
```json
[
  {
    "left_field": "day_low",
    "operator": ">",
    "right_type": "field",
    "right_field": "prev_high",
    "multiplier": 1.0
  }
]
```

---

### Recipe 2: Open = Low Bullish Surge
**Logic**: The stock opened and buyers immediately drove the price upward, leaving no lower shadow (`day_low == open`).
```json
[
  {
    "left_field": "day_low",
    "operator": "==",
    "right_type": "field",
    "right_field": "open",
    "multiplier": 1.0,
    "tolerance_pct": 0.15
  }
]
```

---

### Recipe 3: Dual Sniper Breakout
**Logic**: A combination where the stock gapped up and also maintained `Low == Open` throughout the session:
- `day_low > prev_high`
- **AND** `day_low == open`
```json
[
  {
    "left_field": "day_low",
    "operator": ">",
    "right_type": "field",
    "right_field": "prev_high",
    "multiplier": 1.0
  },
  {
    "left_field": "day_low",
    "operator": "==",
    "right_type": "field",
    "right_field": "open",
    "multiplier": 1.0,
    "tolerance_pct": 0.15
  }
]
```

---

### Recipe 4: Golden Cross with Volume Confirmation
**Logic**: 50 SMA is above 200 SMA, price is above 50 SMA, and volume is at least 1.5x the 20-day average:
- `sma_50 > sma_200`
- `price >= sma_50`
- `volume >= avg_volume_20d * 1.5`
```json
[
  {
    "left_field": "sma_50",
    "operator": ">",
    "right_type": "field",
    "right_field": "sma_200",
    "multiplier": 1.0
  },
  {
    "left_field": "price",
    "operator": ">=",
    "right_type": "field",
    "right_field": "sma_50",
    "multiplier": 1.0
  },
  {
    "left_field": "volume",
    "operator": ">=",
    "right_type": "field",
    "right_field": "avg_volume_20d",
    "multiplier": 1.5
  }
]
```

---

## 3. Querying the API with Custom Rules

To query from an external script or terminal, URL-encode the JSON array in the `custom_rules` query parameter:

```bash
curl "http://localhost:8000/api/stocks?custom_rules=%5B%7B%22left_field%22%3A%22day_low%22%2C%22operator%22%3A%22%3E%22%2C%22right_type%22%3A%22field%22%2C%22right_field%22%3A%22prev_high%22%7D%5D&custom_logic=AND"
```

Or submit a `POST /api/screen` payload:

```bash
curl -X POST "http://localhost:8000/api/screen" \
  -H "Content-Type: application/json" \
  -d '{
    "custom_rules": [
      {
        "left_field": "day_low",
        "operator": ">",
        "right_type": "field",
        "right_field": "prev_high"
      }
    ],
    "custom_logic": "AND"
  }'
```
