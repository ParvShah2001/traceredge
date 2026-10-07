<div align="center">

# ⚡ TracerEdge

### Institutional-Grade Real-Time Indian Equity Screener & Streaming Engine

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-white?style=for-the-badge)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](Dockerfile)

<p align="center">
  A high-speed, minimalist, real-time stock screening platform tracking the complete Indian market universe across the <b>National Stock Exchange (NSE)</b> and <b>Bombay Stock Exchange (BSE)</b>.
</p>

</div>

---

## 📌 Overview

Most retail Indian stock screeners either restrict screening to the Nifty 50 / Large Caps, mix NSE and BSE prices into conflicting quotes, or suffer from sluggish multi-second latency and stale settlement data.

**TracerEdge** solves this by indexing the **entire 7,640+ dual-exchange Indian equity universe** in a high-performance in-memory cache. It broadcasts sub-second tick updates over WebSockets during market hours (09:15–15:30 IST), enables instantaneous microsecond formula evaluation across technical and fundamental metrics, and locks official End-Of-Day (EOD) settlement directly from official NSE and BSE Bhavcopies with zero discrepancy.

---

## 📸 Interface Preview

```
+-------------------------------------------------------------------------------------------------------------+
| [⚡ TRACEREDGE]   [● MARKET OPEN 09:15-15:30 IST]       [Universe: 7,654]  [NIFTY 50: 24,750 ▲] [SENSEX: 81,200 ▲] |
+-------------------------------------------------------------------------------------------------------------+
| [ 🔍 Search 7,650+ stocks (RELIANCE, 500325)... ]   [ ⚙️ Custom Query (3) ]   [ ↺ Reset ]   Showing 1–50 of 7,654 |
+-------------------------------------------------------------------------------------------------------------+
| TICKER / COMPANY         | EXCH | PRICE (₹)  | CHG %   | DAY HIGH  | DAY LOW   | VOLUME   | RSI(14) | M.CAP (Cr)  |
|--------------------------|------|------------|---------|-----------|-----------|----------|---------|-------------|
| RELIANCE Industries      | NSE  |  2,985.40  | +1.24%  | 2,998.00  | 2,950.00  | 4.52M    |  58.4   | 20,20,450   |
| TATA CONSULTANCY SERV.   | NSE  |  4,250.75  | -0.32%  | 4,285.00  | 4,230.10  | 1.15M    |  51.2   | 15,38,000   |
| HDFC BANK LTD            | NSE  |  1,650.20  | +0.48%  | 1,662.00  | 1,644.50  | 8.94M    |  49.8   | 12,55,000   |
| RELIANCE IND (#500325)   | BSE  |  2,984.95  | +1.21%  | 2,997.50  | 2,949.80  | 380K     |  58.2   | 20,20,450   |
+-------------------------------------------------------------------------------------------------------------+
```

> **UI Previews & Media Artifacts:**
> - **Screener & Table**: [Dashboard Screenshot Placeholder](docs/assets/dashboard_preview.png)
> - **Custom Query Builder**: [Query Builder Modal Placeholder](docs/assets/query_builder_preview.png)
> - **TradingView Candlestick Modal**: [Candlestick Chart Modal Placeholder](docs/assets/chart_modal_preview.png)

---

## ⚡ Key Features

- **Complete Dual-Exchange Universe (7,640+ Equities)**:
  - Tracks **2,587+ pure NSE equities** (Series `EQ`, `BE`, `SM`).
  - Tracks **5,053+ pure BSE equities** with official 6-digit scrip codes (e.g. `#500325`).
  - Independent symbol-level order book tracking prevents cross-exchange pricing collisions.
- **Zero Simulated Drift When Closed**:
  - Automatically respects Indian trading hours (**09:15–15:30 IST weekdays**).
  - Price simulations are strictly disabled outside market hours to preserve authentic closing figures.
- **Official Bhavcopy EOD Settlement Reconciliation**:
  - Pulls consolidated clearing Bhavcopies directly from NSE and BSE repositories.
  - Automatically locks official settlement closing prices, day highs, lows, and volume.
- **Custom Dynamic Formula Query Builder**:
  - Construct institutional-grade conditional screens on the fly (e.g., `Today's Low > Yesterday's High AND Today's Low == Today's Open`).
  - Supports field-to-field comparisons, field-to-value filters, multipliers, and float equality tolerance.
- **Sub-Second Live WebSocket Streaming (`/ws/live`)**:
  - High-frequency tick broadcasts with advance/decline breadth metrics and real-time green/red price flashes.
  - Row-level React memoization ensures smooth 60 FPS table rendering with zero DOM layout thrashing.
- **TradingView-Standard Candlestick Modal**:
  - Built with Lightweight Charts featuring `#089981` (bullish emerald) and `#f23645` (bearish red) candles.
  - Live cursor readout showing `O: ₹... H: ₹... L: ₹... C: ₹... Vol: ...` with integrated volume histogram.
- **Ultra-Minimalist Pitch-Black Dark Theme**:
  - Tailored institutional OLED aesthetic (`#000000`, sharp `#ffffff` text, `#18181b` borders).
  - Fully responsive on mobile, tablet, and widescreen monitors with sticky symbol columns.
- **Production Single-Server Architecture**:
  - A single FastAPI process simultaneously serves REST endpoints, WebSocket streams, and compiled React SPA assets.
  - Includes proactive Linux `malloc_trim(0)` heap management engineered specifically for 512MB RAM cloud tiers.

---

## 🛠️ Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) | High-performance async Python web framework |
| **Server / ASGI** | [Uvicorn](https://www.uvicorn.org/) | Lightning-fast ASGI server implementation |
| **Real-Time Transport** | [WebSockets](https://websockets.readthedocs.io/) | Bidirectional low-latency tick broadcast |
| **Market Data Ingestion** | `nselib`, `bseindia`, `yfinance` | Official Bhavcopy parsers & multi-ticker batch quoting |
| **Frontend Framework** | [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) | Modern reactive client with optimized asset bundling |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/) | Pitch-black institutional design system |
| **Financial Charting** | [Lightweight Charts](https://tradingview.github.io/lightweight-charts/) | High-performance TradingView canvas candlestick charts |
| **DevOps & Containers** | [Docker](https://www.docker.com/) | Multi-stage build container with low-memory tunings |

---

## 📂 Project Structure

```
traceredge/
├── backend/
│   ├── main.py              # FastAPI core: REST routes, WebSocket broadcaster & SPA static mount
│   ├── data_engine.py       # In-memory equity store, Bhavcopy reconciler & filter evaluation
│   ├── universe_manager.py  # Dual-exchange symbol, BSE scrip code, and ISIN multi-indexer
│   ├── universe_sync.py     # Continuous sync with official NSE EQUITY_L and BSE scrip master
│   ├── indicators.py        # Technical indicator library (RSI-14, SMA, EMA, MACD, Bollinger Bands)
│   ├── indianapi_client.py  # Optional IndianAPI.in client for fundamentals, peers, and news
│   ├── ramm_stock_api.py    # Multi-ticker Yahoo Finance batch quote retriever with crumb handshake
│   ├── stocks_data.py       # Reference seed universe and Indian benchmark indices
│   ├── requirements.txt     # Python backend dependencies
│   └── data/                # Cached universe master files (ALL_INDIAN_EQUITIES.json)
├── frontend/
│   ├── src/
│   │   ├── components/      # MarketHeader, StockTable, StockChartModal, CustomQueryBuilder, FilterBar
│   │   ├── hooks/           # useLiveMarket: WebSocket listener, tick processor & sequence counter
│   │   ├── services/        # API client and WebSocket URL resolver
│   │   ├── App.jsx          # Root application component with dark mode enforcement
│   │   └── index.css        # Pure OLED black layout styles
│   ├── package.json         # React 19 and frontend dependencies
│   └── vite.config.js       # Vite configuration
├── docs/
│   ├── architecture.md      # Detailed system design, data flows & memory management
│   ├── api.md               # Complete REST and WebSocket endpoint reference
│   └── query_builder.md     # Custom screening formulas and strategy recipes
├── Dockerfile               # Multi-stage Docker build (Node frontend compile -> Python runtime)
├── docker-compose.yml       # Production container orchestration
├── start_traceredge.bat     # Windows one-click local launcher
├── start_traceredge.sh      # Linux / macOS one-click local launcher
├── .env.example             # Template for optional external API keys
├── .gitignore               # Comprehensive Git ignore rules
├── LICENSE                  # MIT License
└── README.md                # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Python**: 3.11 or higher
- **Node.js**: 18.x or higher (only required if building frontend locally)
- **Git**

---

### Method 1: One-Click Quickstart (Recommended)

#### On Windows:
```cmd
.\start_traceredge.bat
```

#### On Linux / macOS:
```bash
chmod +x start_traceredge.sh
./start_traceredge.sh
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

---

### Method 2: Manual Installation (From Scratch)

#### 1. Clone Repository & Setup Environment
```bash
git clone https://github.com/parvshah/traceredge.git
cd traceredge
```

#### 2. Install Backend Dependencies
```bash
python -m venv venv

# On Linux/macOS:
source venv/bin/activate

# On Windows:
.\venv\Scripts\activate

pip install --upgrade pip
pip install -r backend/requirements.txt
```

#### 3. Build Frontend Assets
```bash
cd frontend
npm install
npm run build
cd ..
```

#### 4. Configure Environment (Optional)
```bash
cp .env.example .env
```
*(Optional: add `INDIAN_API_KEY` in `.env` if you have an API key from [IndianAPI.in](https://indianapi.in)).*

#### 5. Run Unified Server
```bash
uvicorn main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
```
Navigate to **[http://localhost:8000](http://localhost:8000)**. Interactive API documentation is available at **[http://localhost:8000/docs](http://localhost:8000/docs)**.

---

### Method 3: Docker & Docker Compose

TracerEdge features an optimized multi-stage `Dockerfile`:
```bash
docker compose up -d --build
```
Your container will automatically compile the client, start the FastAPI server, and expose the application on port `8000`.

---

## 💡 Usage Examples

### 1. Screening Stocks with the REST API

Query top gainers on the NSE with RSI above 50:
```bash
curl "http://localhost:8000/api/stocks?exchange=NSE&min_rsi=50&sort_by=change_pct&sort_dir=desc&page_size=10"
```

#### Sample Output:
```json
{
  "count": 10,
  "total": 842,
  "page": 1,
  "page_size": 10,
  "total_pages": 85,
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
      "market_cap_cr": 2020450
    }
  ]
}
```

---

### 2. Multi-Index Instant Search

Search by company name, ticker, or 6-digit BSE scrip code:
```bash
curl "http://localhost:8000/api/search?q=500325"
```

#### Sample Output:
```json
[
  {
    "id": "RELIANCE:BSE",
    "symbol": "RELIANCE",
    "name": "Reliance Industries Ltd",
    "sector": "Energy & Petrochemicals",
    "exchange": "BSE",
    "bse_code": "500325",
    "price": 2984.95,
    "change": 34.80,
    "change_pct": 1.18
  }
]
```

---

### 3. Custom Strategy Query: Open = Low Bullish Surge

Filter for stocks where today's intraday low equals the opening price:
```bash
curl -X POST "http://localhost:8000/api/screen" \
  -H "Content-Type: application/json" \
  -d '{
    "custom_rules": [
      {
        "left_field": "day_low",
        "operator": "==",
        "right_type": "field",
        "right_field": "open",
        "tolerance_pct": 0.15
      }
    ],
    "custom_logic": "AND"
  }'
```

---

### 4. Connecting to the Live WebSocket Feed

Connect via JavaScript:
```javascript
const ws = new WebSocket("ws://localhost:8000/ws/live");

ws.onopen = () => console.log("Connected to TracerEdge WebSocket");

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "TICK") {
    console.log(`Received tick at ${data.timestamp}:`, data.stocks);
  }
};
```

---

## 🗺️ Roadmap & Future Enhancements

- [ ] **F&O & Options Screener**: Real-time NSE Open Interest (OI) tracking, Put-Call Ratio (PCR), and Max Pain calculations.
- [ ] **Multi-Timeframe Technical Scans**: Real-time 5-min, 15-min, and Hourly supertrend & VWAP filters.
- [ ] **Webhooks & Telegram Alerts**: Instant notifications when user strategies match custom screening criteria.
- [ ] **Historical Strategy Backtesting**: Replay custom formula screens against historical Bhavcopy data.
- [ ] **Redis Pub/Sub Integration**: Optional horizontal cluster scaling across multi-node ASGI workers.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⚖️ License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.

---

## 👨‍💻 Author

**Parv Shah**  
- **GitHub**: [@parvshah](https://github.com/ParvShah2001)  
- **Project Repository**: [TracerEdge on GitHub](https://github.com/ParvShah2001/traceredge)  

*(For questions, issues, or consulting inquiries, feel free to open a GitHub Issue).*
