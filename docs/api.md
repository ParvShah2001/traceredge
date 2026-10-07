# 📡 TracerEdge API Reference & WebSocket Specification

TracerEdge exposes a unified REST and WebSocket API for equity screening, quotes, index tracking, technical indicators, and historical candlestick charts.

**Base URL**: `http://localhost:8000` (or your deployment domain)  
**Interactive Docs**: `http://localhost:8000/docs` (Swagger UI)

---

## 1. REST Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/info` | Server status, universe counts, and market session |
| `GET` | `/api/universe/status` | Active equities breakdown by exchange (NSE & BSE) |
| `POST` | `/api/universe/sync` | Force refresh exchange master lists from NSE & BSE |
| `GET` | `/api/market/indices` | Live snapshot of major Indian benchmarks |
| `GET` | `/api/market/status` | Current trading session, official EOD state, and market breadth |
| `POST` | `/api/market/verify-eod-close` | Fetch & lock official NSE/BSE Bhavcopy closing prices |
| `GET` | `/api/search` | Multi-index instant search (Symbol, BSE Code, ISIN, Name) |
| `GET` | `/api/stocks` | Paginated screener with filtering, sorting & custom formulas |
| `GET` | `/api/stocks/{symbol}` | Snapshot of a specific equity (enriched on-demand) |
| `GET` | `/api/stocks/{symbol}/details` | Deep fundamentals, valuation ratios, and news |
| `GET` | `/api/stocks/{symbol}/history` | Historical candlestick data for charts (`1D`, `1W`, `1M`, `3M`, `1Y`) |
| `POST` | `/api/screen` | Custom multi-filter JSON execution payload |
| `GET` | `/api/trending` | Top gainers and losers |
| `GET` | `/api/news` | Real-time Indian equity market news |

---

## 2. Core Endpoints Reference

### `GET /api/info`
Returns general system information, tracked stock counts, and WebSocket endpoint metadata.

#### Sample Response:
```json
{
  "app": "TracerEdge",
  "status": "online",
  "market": "NSE / BSE India",
  "stocks_tracked": 7640,
  "universe_stats": {
    "total_stocks": 7640,
    "nse_stocks": 2587,
    "bse_stocks": 5053,
    "last_synced": "2026-10-01T15:30:00+05:30"
  },
  "is_market_open": false,
  "websocket_endpoint": "/ws/live"
}
```

---

### `GET /api/stocks`
The primary screener query endpoint. Supports search, exchange selection, sector filtering, numeric bounds, custom formulas, sorting, and pagination.

#### Query Parameters:
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `search` | `string` | `null` | Symbol, name, BSE code, or ISIN |
| `exchange` | `string` | `"ALL"` | Filter by exchange: `"ALL"`, `"NSE"`, `"BSE"` |
| `sector` | `string` | `"ALL"` | Filter by economic sector |
| `min_price` / `max_price` | `float` | `null` | Current price bounds |
| `min_rsi` / `max_rsi` | `float` | `null` | 14-period RSI bounds |
| `min_pe` / `max_pe` | `float` | `null` | P/E ratio bounds |
| `min_vol_ratio` | `float` | `null` | Volume vs. 20-day average volume ratio |
| `custom_rules` | `string` | `null` | JSON-encoded array of custom condition objects |
| `custom_logic` | `string` | `"AND"` | Combinator logic: `"AND"` or `"OR"` |
| `sort_by` | `string` | `"market_cap_cr"` | Sort field (`price`, `change_pct`, `volume`, `rsi_14`, etc.) |
| `sort_dir` | `string` | `"desc"` | Direction: `"asc"` or `"desc"` |
| `page` | `int` | `1` | Page number |
| `page_size` | `int` | `50` | Equities per page (max 500) |

#### Sample Request:
```bash
curl "http://localhost:8000/api/stocks?exchange=NSE&min_rsi=55&sort_by=change_pct&sort_dir=desc&page=1&page_size=2"
```

#### Sample Response:
```json
{
  "count": 2,
  "total": 1420,
  "page": 1,
  "page_size": 2,
  "total_pages": 710,
  "stocks": [
    {
      "id": "RELIANCE:NSE",
      "symbol": "RELIANCE",
      "name": "Reliance Industries Ltd",
      "exchange": "NSE",
      "price": 2985.40,
      "change": 35.20,
      "change_pct": 1.19,
      "day_high": 2998.00,
      "day_low": 2950.00,
      "volume": 4521000,
      "rsi_14": 58.42,
      "market_cap_cr": 2020450,
      "pe_ratio": 27.8,
      "is_official_close": true
    }
  ]
}
```

---

### `GET /api/search`
High-speed lookup across all 7,640+ equities. Matches ticker symbols, full registered names, 6-digit BSE codes, and ISIN numbers.

#### Query Parameters:
- `q`: Search string (e.g., `500325`, `TCS`, `INE002A01018`)
- `limit`: Maximum results to return (default: `20`)
- `exchange`: Exchange filter (`ALL`, `NSE`, `BSE`)

#### Sample Request:
```bash
curl "http://localhost:8000/api/search?q=500325"
```

#### Sample Response:
```json
[
  {
    "id": "RELIANCE:BSE",
    "symbol": "RELIANCE",
    "name": "Reliance Industries Ltd",
    "sector": "Energy & Petrochemicals",
    "exchange": "BSE",
    "bse_code": "500325",
    "price": 2985.00,
    "change": 34.80,
    "change_pct": 1.18,
    "ticker": "500325.BO"
  }
]
```

---

### `GET /api/stocks/{symbol}/history`
Generates historical candlestick series compatible with TradingView Lightweight Charts.

#### Query Parameters:
- `timeframe`: `"1D"`, `"1W"`, `"1M"`, `"3M"`, or `"1Y"` (default: `"1M"`)
- `exchange`: Optional exchange qualifier (`NSE` or `BSE`)

#### Sample Response:
```json
{
  "symbol": "TCS",
  "timeframe": "1M",
  "exchange": "NSE",
  "count": 22,
  "candles": [
    {
      "time": "2026-09-01",
      "open": 4210.00,
      "high": 4260.50,
      "low": 4195.00,
      "close": 4250.75,
      "volume": 1285000
    }
  ]
}
```

---

## 3. WebSocket Real-Time Feed

**Endpoint**: `ws://localhost:8000/ws/live`

### Initial Connection: `SNAPSHOT`
Upon establishing the WebSocket handshake, the server immediately transmits the full market snapshot:

```json
{
  "type": "SNAPSHOT",
  "indices": [
    {
      "symbol": "NIFTY 50",
      "value": 24750.50,
      "change": 85.20,
      "change_pct": 0.35
    },
    {
      "symbol": "SENSEX",
      "value": 81200.25,
      "change": 275.40,
      "change_pct": 0.34
    }
  ],
  "is_market_open": true,
  "breadth": {
    "advances": 3840,
    "declines": 3110,
    "unchanged": 690,
    "total": 7640
  }
}
```

### Live Broadcast: `TICK`
During active trading hours (09:15–15:30 IST), the server broadcasts micro-ticks every 1.5 seconds:

```json
{
  "type": "TICK",
  "timestamp": "11:42:15 IST",
  "is_market_open": true,
  "stocks": [
    {
      "id": "RELIANCE:NSE",
      "symbol": "RELIANCE",
      "price": 2986.50,
      "change": 36.30,
      "change_pct": 1.23,
      "day_high": 2998.00,
      "day_low": 2950.00,
      "volume": 4532000,
      "volume_ratio": 1.45,
      "tick_direction": "up",
      "last_updated": "11:42:15 IST"
    }
  ],
  "indices": [
    {
      "symbol": "NIFTY 50",
      "value": 24755.10,
      "change": 89.80,
      "change_pct": 0.37,
      "tick_direction": "up"
    }
  ],
  "breadth": {
    "advances": 3845,
    "declines": 3105,
    "unchanged": 690,
    "total": 7640
  }
}
```
