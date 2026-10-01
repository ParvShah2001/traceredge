"""
0xramm Indian Stock Market API Integration for TracerEdge.
Based on https://github.com/0xramm/Indian-Stock-Market-API
Provides direct, real-time quote feeds for NSE (.NS) and BSE (.BO) equities using
high-performance Yahoo Finance JSON endpoints with automatic cookie/crumb handshake,
plus optional integration with any deployed 0xramm Cloudflare Worker.
"""
import os
import time
import json
import logging
import urllib.request
import urllib.parse
from typing import Dict, List, Any, Optional, Tuple

logger = logging.getLogger("ramm_stock_api")

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
REMOTE_WORKER_URL = os.environ.get("RAM_STOCK_API_URL", "").rstrip("/")


class RammStockApiClient:
    def __init__(self, remote_url: str = REMOTE_WORKER_URL):
        self.remote_url = remote_url
        self._cookie: Optional[str] = None
        self._crumb: Optional[str] = None
        self._crumb_expires_at: float = 0.0

    def _ensure_crumb_handshake(self, force_refresh: bool = False) -> Tuple[Optional[str], Optional[str]]:
        now = time.time()
        if not force_refresh and self._crumb and self._cookie and now < self._crumb_expires_at:
            return self._crumb, self._cookie

        try:
            req_cookie = urllib.request.Request("https://fc.yahoo.com", headers={"User-Agent": UA})
            cookie = ""
            try:
                urllib.request.urlopen(req_cookie, timeout=5)
            except urllib.error.HTTPError as e:
                set_cookie = e.headers.get("set-cookie") or ""
                cookie = set_cookie.split(";")[0]

            if not cookie:
                return None, None

            crumb_url = "https://query1.finance.yahoo.com/v1/test/getcrumb"
            req_crumb = urllib.request.Request(crumb_url, headers={"User-Agent": UA, "Cookie": cookie})
            with urllib.request.urlopen(req_crumb, timeout=5) as resp:
                crumb = resp.read().decode("utf-8").strip()
                if crumb and not crumb.startswith("<"):
                    self._crumb = crumb
                    self._cookie = cookie
                    self._crumb_expires_at = now + 1800  # 30 min cache
                    return self._crumb, self._cookie
        except Exception as e:
            logger.debug(f"Crumb handshake failed: {e}")

        return None, None

    def fetch_quotes_direct(self, tickers: List[str]) -> Dict[str, Dict[str, Any]]:
        """
        Direct high-speed multi-ticker quote fetcher inspired by 0xramm /src/yahoo.js.
        Supports both NSE (.NS) and BSE (.BO) tickers.
        """
        if not tickers:
            return {}

        results: Dict[str, Dict[str, Any]] = {}

        # 1. Try remote worker if URL is provided
        if self.remote_url:
            try:
                syms_str = ",".join(tickers[:50])
                req = urllib.request.Request(f"{self.remote_url}/stock/list?symbols={syms_str}&res=num", headers={"User-Agent": UA})
                with urllib.request.urlopen(req, timeout=6) as resp:
                    if resp.status == 200:
                        data = json.loads(resp.read().decode("utf-8"))
                        for item in data.get("results", []):
                            sym = item.get("symbol")
                            if sym:
                                results[sym] = item
                        if results:
                            return results
            except Exception as e:
                logger.debug(f"Remote worker fetch failed: {e}")

        # 2. Local direct handshake implementation from 0xramm architecture
        crumb, cookie = self._ensure_crumb_handshake()
        if not crumb or not cookie:
            return results

        chunk_size = 50
        for i in range(0, len(tickers), chunk_size):
            chunk = tickers[i:i + chunk_size]
            syms_param = urllib.parse.quote(",".join(chunk))
            url = f"https://query1.finance.yahoo.com/v7/finance/quote?symbols={syms_param}&crumb={crumb}"

            try:
                req = urllib.request.Request(url, headers={"User-Agent": UA, "Cookie": cookie})
                with urllib.request.urlopen(req, timeout=6) as resp:
                    if resp.status == 200:
                        d = json.loads(resp.read().decode("utf-8"))
                        for r in d.get("quoteResponse", {}).get("result", []):
                            sym = r.get("symbol", "").upper()
                            if not sym:
                                continue
                            price = r.get("regularMarketPrice")
                            prev_close = r.get("regularMarketPreviousClose", price) or price
                            results[sym] = {
                                "symbol": sym,
                                "price": float(price) if price is not None else None,
                                "prev_close": float(prev_close) if prev_close is not None else None,
                                "change": round(float(r.get("regularMarketChange", 0.0) or 0.0), 2),
                                "change_pct": round(float(r.get("regularMarketChangePercent", 0.0) or 0.0), 2),
                                "open": float(r.get("regularMarketOpen", price) or price),
                                "day_high": float(r.get("regularMarketDayHigh", price) or price),
                                "day_low": float(r.get("regularMarketDayLow", price) or price),
                                "volume": int(r.get("regularMarketVolume", 0) or 0),
                                "market_cap": r.get("marketCap"),
                                "week_52_high": float(r.get("fiftyTwoWeekHigh", price) or price),
                                "week_52_low": float(r.get("fiftyTwoWeekLow", price) or price),
                                "pe_ratio": float(r.get("trailingPE", 0.0) or 0.0) if r.get("trailingPE") else None,
                                "dividend_yield": float(r.get("trailingAnnualDividendYield", 0.0) or 0.0) * 100 if r.get("trailingAnnualDividendYield") else None,
                                "source": "0xramm-direct"
                            }
            except urllib.error.HTTPError as he:
                if he.code == 401:
                    # Invalidate crumb cache on 401
                    self._crumb = None
                    self._crumb_expires_at = 0.0
                logger.debug(f"Direct quote chunk error: {he}")
            except Exception as e:
                logger.debug(f"Direct quote chunk error: {e}")

        return results


# Global instance
ramm_stock_api_client = RammStockApiClient()
