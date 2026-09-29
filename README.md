# 🇮🇳 Bharat Screener — Live Indian Stock Screener (NSE & BSE)

A real-time Indian stock market screener and technical analysis platform for **NSE (National Stock Exchange)** and **BSE (Bombay Stock Exchange)**.

---

## ⚡ Live Features

1. **🔴 Live Market Streaming & Tickers**:
   - Real-time WebSocket feed updating prices every **1.5 seconds**.
   - Price flash animations (pulsing green on up-ticks, red on down-ticks).
   - Market session detector (**9:15 AM - 3:30 PM IST**, Monday–Friday).
   - Key Indices ticker tape: **NIFTY 50**, **SENSEX**, **BANK NIFTY**, **NIFTY IT**, **INDIA VIX**.
   - Market Breadth gauge showing live **Advances / Declines** distribution.

2. **🔍 One-Click Preset Scanners**:
   - ⚡ **52-Week High Breakouts**: Stocks within 3% of yearly highs.
   - 📉 **RSI Oversold Bounce**: Stocks with 14-period RSI < 35 (reversal watch).
   - 🔥 **RSI Momentum Surge**: Stocks with RSI > 70 in strong uptrends.
   - 📊 **Volume Shockers**: Stocks trading with volume > 1.4x 20-day average.
   - ✨ **Golden Crossover**: Stocks where 50 SMA > 200 SMA and price > 50 SMA.
   - 🟢 **Top Intraday Gainers** & 🔴 **Top Intraday Losers**.
   - 💎 **Value Gems**: P/E < 25, steady earnings, and dividend yield.
   - 💰 **High Dividend Yielders**: Income-focused stocks with yield > 1.5%.
   - 🏛️ **Large Caps (Nifty 50)** & 📈 **Mid Cap Leaders**.

3. **🎛️ Custom Multi-Filter & Comparative Rule Builder (Chartink / Screener.in style)**:
   - **Dynamic Condition Builder**: Build and combine arbitrary comparative conditions:
     - Compare any stock attribute against another attribute or fixed numbers (e.g. `Today's Low > Previous Day High`, `Today's Low == Today's Open`, `Today's High == Today's Open`, `Price > 20 EMA`, etc.).
     - Operators supported: `>`, `≥`, `<`, `≤`, `==`, `≠`.
     - Multiplier modifier (e.g. `Volume > 1.5 × 20D Avg Volume`).
     - Logic combinator: **AND** (all rules match) or **OR** (any rule matches).
     - **One-Click Pre-Built Strategy Templates**:
       - *User Example 1: Bullish Gap-Up (`Today's Low > Previous Day High`)*
       - *User Example 2: Open = Low Bullish Surge (`Today's Low == Today's Open`)*
       - *Dual Sniper: `Today's Low > Prev High` AND `Today's Low == Today's Open`*
       - *Open = High Bearish Rejection (`Today's High == Today's Open`)*
       - *Previous Day High Breakout + Volume Surge*
       - *Golden Alignment: `Price > 20 EMA > 50 SMA`*
     - **Save Custom Screens**: Name and store custom screening strategies in your browser for 1-click access anytime!
   - Multi-column sort (Price, Change %, Volume, Market Cap, P/E, RSI, Tech Score).
   - One-click **Export to CSV**.

4. **📈 Interactive TradingView Candlestick Charts**:
   - Embedded **TradingView Lightweight Charts** modal for any selected stock.
   - Timeframes: **1D (Intraday)**, **1W**, **1M**, **3M**, **1Y**.
   - Candlestick series with interactive crosshairs and volume histogram.
   - Overlay technical indicators: **20 EMA**, **50 SMA**, **200 SMA (DMA)**, **14 RSI**, **MACD**.
   - Direct alert creation from inside the chart modal.

5. **🗺️ Sector Performance Heatmap**:
   - Visual tiles showing sector-by-sector performance (% change, market cap, advance/decline ratio).
   - Highlights top-performing stock in each sector.
   - Click any sector tile to filter screener table instantly.

6. **🔔 Watchlist & Real-Time Price/RSI Alerts**:
   - Bookmark favorite stocks to your personal Watchlist (persisted in browser storage).
   - Custom price alerts (e.g. "Alert when RELIANCE ≥ ₹1250" or "Alert when INFY drops ≤ ₹1800").
   - Pop-up notifications + pleasant Web Audio API synthesised chimes with mute toggle.

---

## 🚀 How to Run

### Quick Launch (Windows)
Double-click `run_screener.bat` or run:
```powershell
.\run_screener.ps1
```

### Manual Launch

#### 1. Backend (FastAPI + WebSocket Server)
```powershell
.\venv\Scripts\python.exe -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
- API Docs: `http://127.0.0.1:8000/docs`
- WebSocket Endpoint: `ws://127.0.0.1:8000/ws/live`

#### 2. Frontend (React + Vite)
```powershell
cd frontend
npm run dev
```
- Open in your browser: **`http://localhost:5173/`**

---

## 🛠️ Architecture & Tech Stack

```
Stock Market/
├── backend/
│   ├── main.py              # FastAPI server & WebSocket broadcast loop
│   ├── data_engine.py       # Market caching, live tick simulator & Yahoo sync
│   ├── indicators.py        # RSI, SMA, EMA, MACD, Bollinger Bands algorithms
│   └── stocks_data.py       # Universe of Indian equities (NSE & BSE) & indices
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MarketHeader.jsx         # Live index ticker tape & breadth
│   │   │   ├── QuickPresets.jsx         # One-click scanner presets
│   │   │   ├── FilterBar.jsx            # Multi-filters, search & CSV export
│   │   │   ├── StockTable.jsx           # Live updating screener table
│   │   │   ├── StockChartModal.jsx      # TradingView Candlestick charts
│   │   │   ├── SectorHeatmap.jsx        # Sector distribution & heatmap
│   │   │   └── WatchlistAlertsDrawer.jsx# Watchlist & alerts management
│   │   ├── hooks/
│   │   │   └── useLiveMarket.js         # WebSocket auto-reconnect & state hook
│   │   ├── services/
│   │   │   └── api.js                   # REST & WebSocket client
│   │   ├── utils/
│   │   │   └── sound.js                 # Web Audio API alert sound synthesizer
│   │   ├── App.jsx                      # Main app layout & state coordinator
│   │   └── index.css                    # Tailwind CSS & financial styling
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── run_screener.bat         # 1-click Windows batch runner
├── run_screener.ps1         # 1-click PowerShell runner
└── README.md
```
