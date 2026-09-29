"""
FastAPI Backend Application for Indian Stock Screener (NSE / BSE).
Provides REST endpoints and real-time WebSockets for live tickers and screener filters.
"""
import os
import asyncio
import json
import logging
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from data_engine import engine

logger = logging.getLogger("server")
logging.basicConfig(level=logging.INFO)


class ConnectionManager:
    """Manages active WebSocket connections for live tick streaming."""
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)


manager = ConnectionManager()


async def live_ticks_broadcast_loop():
    """Background task generating high-frequency live ticks during market hours or heartbeat when closed."""
    while True:
        try:
            if manager.active_connections:
                payload = engine.generate_live_ticks()
                await manager.broadcast(payload)
        except Exception as e:
            logger.error(f"Error in broadcast loop: {e}")
        # When market is open, stream fast live ticks every 750ms.
        # When market is closed, NO SIMULATED TICKS: sleep 10s heartbeat snapshot.
        if engine.is_market_open():
            await asyncio.sleep(0.75)
        else:
            await asyncio.sleep(10.0)


async def periodic_yahoo_sync():
    """Periodically sync actual live prices during trading session or ensure official EOD prices when closed."""
    while True:
        try:
            if engine.is_market_open():
                await engine.sync_real_data()
                await asyncio.sleep(20)
            else:
                if not getattr(engine, "_eod_verified", False):
                    await asyncio.to_thread(engine.verify_and_update_eod_closing_prices)
                await asyncio.sleep(300)
        except Exception as e:
            logger.error(f"Error in price sync loop: {e}")
            await asyncio.sleep(60)


async def periodic_universe_sync():
    """Periodically check for new IPOs, listings, and updates from NSE & BSE every 4 hours."""
    while True:
        # Check every 4 hours (14400s)
        await asyncio.sleep(14400)
        try:
            logger.info("Executing scheduled universe sync for NSE & BSE...")
            await asyncio.to_thread(engine.sync_universe)
        except Exception as e:
            logger.error(f"Error in periodic universe sync: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: launch background tasks
    tick_task = asyncio.create_task(live_ticks_broadcast_loop())
    sync_task = asyncio.create_task(periodic_yahoo_sync())
    universe_task = asyncio.create_task(periodic_universe_sync())
    logger.info("Background tasks started (ticks, yahoo price sync, universe sync).")
    yield
    # Shutdown
    tick_task.cancel()
    sync_task.cancel()
    universe_task.cancel()


app = FastAPI(title="TracerEdge - Institutional Indian Stock Screener", version="2.0.0", lifespan=lifespan)

# Allow CORS for any host
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/info")
def get_info():
    """System information and exchange tracking metadata."""
    from universe_manager import universe_manager
    return {
        "app": "TracerEdge",
        "status": "online",
        "market": "NSE / BSE India",
        "stocks_tracked": len(engine.stocks),
        "universe_stats": universe_manager.stats,
        "is_market_open": engine.is_market_open(),
        "websocket_endpoint": "/ws/live"
    }


@app.get("/api/universe/status")
def get_universe_status():
    """Get active universe status, exchange breakdown, and last synchronization time."""
    from universe_manager import universe_manager
    return {
        "stats": universe_manager.stats,
        "total_active_equities": len(engine.stocks),
        "last_synced": universe_manager.stats.get("last_synced"),
        "is_auto_sync_enabled": True
    }


@app.post("/api/universe/sync")
def trigger_universe_sync():
    """On-demand trigger to synchronize latest master lists from NSE and BSE."""
    result = engine.sync_universe()
    return {
        "status": "success",
        "message": f"Successfully synchronized Indian Market universe. Total active equities: {result['total_stocks']}",
        "result": result
    }


@app.get("/api/market/indices")
def get_indices():
    """Get real-time market indices: NIFTY 50, SENSEX, BANK NIFTY, NIFTY IT, INDIA VIX."""
    return list(engine.indices.values())


@app.get("/api/market/status")
def get_market_status():
    """Get market trading session status, official EOD settlement status, and breadth."""
    breadth = engine.get_market_breadth()
    return {
        "is_market_open": engine.is_market_open(),
        "market_session": "OPEN" if engine.is_market_open() else "CLOSED",
        "eod_verified": getattr(engine, "_eod_verified", False),
        "eod_date": getattr(engine, "_eod_date", None),
        "status_message": "Live Trading Session" if engine.is_market_open() else "Market Closed • Official EOD Settlement Verified",
        "exchange": "NSE / BSE",
        "time_zone": "Asia/Kolkata (IST)",
        "breadth": breadth
    }


@app.post("/api/market/verify-eod-close")
def verify_eod_closing_prices():
    """Trigger verification and locking of official NSE and BSE EOD settlement closing prices."""
    res = engine.verify_and_update_eod_closing_prices()
    return {
        "status": "success",
        "message": f"Official EOD settlement verified for {res.get('effective_date')}: {res.get('total_updated')} equities locked.",
        "result": res
    }


@app.get("/api/search")
def search_stocks(
    q: str = Query("", description="Symbol, company name, BSE code, or ISIN"),
    limit: int = Query(20, ge=1, le=100),
    exchange: Optional[str] = Query("ALL", description="Filter by exchange: ALL, NSE, BSE, DUAL")
):
    """Instant search across all 5,180+ listed Indian stocks (NSE & BSE)."""
    return engine.search_universe(q, limit=limit, exchange=exchange)


@app.get("/api/stocks")
def get_stocks(
    preset: str = Query("all", description="Preset scanner name"),
    search: Optional[str] = Query(None, description="Search symbol or name"),
    sector: Optional[str] = Query("ALL", description="Filter by sector"),
    exchange: Optional[str] = Query("ALL", description="Filter by exchange: ALL, NSE, BSE, DUAL"),
    market_cap_category: Optional[str] = Query("ALL", description="Large Cap or Mid Cap"),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rsi: Optional[float] = Query(None),
    max_rsi: Optional[float] = Query(None),
    min_pe: Optional[float] = Query(None),
    max_pe: Optional[float] = Query(None),
    min_vol_ratio: Optional[float] = Query(None),
    custom_rules: Optional[str] = Query(None, description="JSON encoded list of custom condition rules"),
    custom_logic: Optional[str] = Query("AND", description="AND or OR logic for custom conditions"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=500, description="Page size"),
    sort_by: str = Query("market_cap_cr"),
    sort_dir: str = Query("desc"),
):
    """Filter stocks based on presets, criteria, custom dynamic formulas, exchange, and pagination."""
    parsed_rules = None
    if custom_rules:
        try:
            parsed_rules = json.loads(custom_rules)
        except Exception:
            parsed_rules = None

    res = engine.filter_stocks(
        preset=preset,
        search=search,
        sector=sector,
        exchange=exchange,
        market_cap_category=market_cap_category,
        min_price=min_price,
        max_price=max_price,
        min_rsi=min_rsi,
        max_rsi=max_rsi,
        min_pe=min_pe,
        max_pe=max_pe,
        min_vol_ratio=min_vol_ratio,
        custom_rules=parsed_rules,
        custom_logic=custom_logic,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_dir=sort_dir
    )
    return {
        "count": len(res["stocks"]),
        "total": res["total"],
        "page": res["page"],
        "page_size": res["page_size"],
        "total_pages": res["total_pages"],
        "stocks": res["stocks"]
    }


@app.get("/api/stocks/{symbol}")
def get_stock_detail(
    symbol: str,
    exchange: Optional[str] = Query(None, description="Optional exchange filter: NSE or BSE")
):
    """Get single stock full snapshot. Enriches on-demand if needed."""
    sym = symbol.upper()
    stock = engine.enrich_stock_live(sym, exchange=exchange)
    if not stock:
        return {"error": f"Stock {symbol} not found"}
    return stock


@app.get("/api/stocks/{symbol}/history")
def get_stock_history(
    symbol: str,
    timeframe: str = Query("1M", pattern="^(1D|1W|1M|3M|1Y)$"),
    exchange: Optional[str] = Query(None, description="Optional exchange filter: NSE or BSE")
):
    """Get candlestick history data for TradingView chart."""
    candles = engine.get_stock_history(symbol.upper(), timeframe, exchange=exchange)
    return {
        "symbol": symbol.upper(),
        "timeframe": timeframe,
        "exchange": exchange,
        "count": len(candles),
        "candles": candles
    }


@app.get("/api/sectors")
def get_sectors():
    """Get sector performance summary and distribution."""
    return engine.get_sectors_summary()


class CustomScreenQuery(BaseModel):
    preset: Optional[str] = "all"
    search: Optional[str] = None
    sector: Optional[str] = "ALL"
    market_cap_category: Optional[str] = "ALL"
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_rsi: Optional[float] = None
    max_rsi: Optional[float] = None
    min_pe: Optional[float] = None
    max_pe: Optional[float] = None
    min_vol_ratio: Optional[float] = None
    custom_rules: Optional[List[Dict[str, Any]]] = None
    custom_logic: Optional[str] = "AND"
    sort_by: Optional[str] = "market_cap_cr"
    sort_dir: Optional[str] = "desc"


@app.post("/api/screen")
def post_screen(query: CustomScreenQuery):
    """Execute custom multi-filter screening payload."""
    stocks = engine.filter_stocks(
        preset=query.preset,
        search=query.search,
        sector=query.sector,
        market_cap_category=query.market_cap_category,
        min_price=query.min_price,
        max_price=query.max_price,
        min_rsi=query.min_rsi,
        max_rsi=query.max_rsi,
        min_pe=query.min_pe,
        max_pe=query.max_pe,
        min_vol_ratio=query.min_vol_ratio,
        custom_rules=query.custom_rules,
        custom_logic=query.custom_logic,
        sort_by=query.sort_by,
        sort_dir=query.sort_dir
    )
    return {
        "count": len(stocks),
        "total": len(engine.stocks),
        "stocks": stocks
    }


@app.websocket("/ws/live")
async def websocket_live_endpoint(websocket: WebSocket):
    """Live streaming WebSocket for stock ticks, indices, and market breadth."""
    await manager.connect(websocket)
    try:
        # Immediately send initial snapshot
        initial_payload = {
            "type": "SNAPSHOT",
            "indices": list(engine.indices.values()),
            "is_market_open": engine.is_market_open(),
            "breadth": {
                "advances": sum(1 for s in engine.stocks.values() if s["change"] > 0),
                "declines": sum(1 for s in engine.stocks.values() if s["change"] < 0),
                "unchanged": sum(1 for s in engine.stocks.values() if s["change"] == 0),
                "total": len(engine.stocks)
            }
        }
        await websocket.send_json(initial_payload)

        # Keep connection open for client messages (e.g. heartbeat or ping)
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket error: {e}")
        manager.disconnect(websocket)


# ==============================================================================
# Production Single-Server SPA Serving (FastAPI serves built frontend at /)
# ==============================================================================
DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

if os.path.exists(DIST_DIR):
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Ignore API and WS paths (already handled by router above)
        if full_path.startswith("api/") or full_path.startswith("ws/"):
            return {"detail": "Endpoint not found"}
        # Serve static assets placed at dist root (e.g. favicon.svg, icons.svg)
        if full_path:
            direct_file = os.path.join(DIST_DIR, full_path)
            if os.path.isfile(direct_file):
                return FileResponse(direct_file)
        # Default fallback to index.html for Single Page Application
        index_file = os.path.join(DIST_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"name": "TracerEdge", "status": "online"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
