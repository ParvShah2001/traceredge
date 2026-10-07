"""
IndianAPI.in Client Integration for TracerEdge.
Connects to https://stock.indianapi.in with API authentication (x-api-key).
Provides live NSE & BSE prices, valuation metrics, 52-week statistics, trending stocks, and market news.
"""
import os
import time
import json
import logging
import urllib.request
import urllib.parse
from typing import Dict, List, Any, Optional, Tuple

logger = logging.getLogger("indianapi_client")

# API key configured via environment variable
DEFAULT_API_KEY = os.environ.get("INDIAN_API_KEY", "").strip()
BASE_URL = "https://stock.indianapi.in"


class IndianApiClient:
    def __init__(self, api_key: str = DEFAULT_API_KEY):
        self.api_key = api_key
        self._cache_stock: Dict[str, Tuple[float, Dict[str, Any]]] = {}
        self._cache_trending: Optional[Tuple[float, Dict[str, Any]]] = None
        self._cache_news: Optional[Tuple[float, List[Dict[str, Any]]]] = None
        self.stock_ttl = 60       # 60s cache per stock
        self.trending_ttl = 120   # 2m cache for trending
        self.news_ttl = 300       # 5m cache for news

    def _make_request(self, endpoint: str, params: Optional[Dict[str, str]] = None) -> Optional[Any]:
        if not self.api_key:
            logger.debug("IndianAPI.in request skipped: INDIAN_API_KEY not set in environment.")
            return None

        url = f"{BASE_URL}/{endpoint.lstrip('/')}"
        if params:
            url += f"?{urllib.parse.urlencode(params)}"

        headers = {
            "x-api-key": self.api_key,
            "User-Agent": "TracerEdge/2.0"
        }

        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status == 200:
                    raw_data = resp.read().decode("utf-8")
                    return json.loads(raw_data)
        except Exception as e:
            logger.warning(f"IndianAPI.in request failed for {url}: {e}")
            return None

    def get_stock(self, symbol_or_name: str) -> Optional[Dict[str, Any]]:
        """
        Fetches stock profile, distinct NSE and BSE prices, fundamentals, and recent news.
        """
        key = symbol_or_name.strip().upper()
        now = time.time()

        if key in self._cache_stock:
            cached_time, cached_val = self._cache_stock[key]
            if now - cached_time < self.stock_ttl:
                return cached_val

        data = self._make_request("stock", {"name": key})
        if not data or not isinstance(data, dict):
            return None

        parsed = self._parse_stock_response(data)
        if parsed:
            self._cache_stock[key] = (now, parsed)
        return parsed

    def _parse_stock_response(self, d: Dict[str, Any]) -> Dict[str, Any]:
        curr_price = d.get("currentPrice") or {}
        bse_price = None
        nse_price = None

        if isinstance(curr_price, dict):
            if curr_price.get("BSE"):
                try:
                    bse_price = float(str(curr_price["BSE"]).replace(",", ""))
                except Exception:
                    pass
            if curr_price.get("NSE"):
                try:
                    nse_price = float(str(curr_price["NSE"]).replace(",", ""))
                except Exception:
                    pass

        pct_change = None
        if d.get("percentChange"):
            try:
                pct_change = float(str(d["percentChange"]).replace(",", ""))
            except Exception:
                pass

        year_high = None
        if d.get("yearHigh"):
            try:
                year_high = float(str(d["yearHigh"]).replace(",", ""))
            except Exception:
                pass

        year_low = None
        if d.get("yearLow"):
            try:
                year_low = float(str(d["yearLow"]).replace(",", ""))
            except Exception:
                pass

        # Valuation & Financials
        pe_ratio = None
        pb_ratio = None
        dividend_yield = None
        market_cap_cr = None
        debt_to_equity = None
        analyst_rating = None
        promoter_holding = None
        mutual_fund_holding = None
        peers = []

        # 1. Parse stockDetailsReusableData (standardized across stocks)
        sd = d.get("stockDetailsReusableData")
        if isinstance(sd, dict):
            if not pct_change and sd.get("percentChange"):
                try:
                    pct_change = float(str(sd["percentChange"]).replace(",", ""))
                except Exception:
                    pass
            if not year_high and sd.get("yhigh"):
                try:
                    year_high = float(str(sd["yhigh"]).replace(",", ""))
                except Exception:
                    pass
            if not year_low and sd.get("ylow"):
                try:
                    year_low = float(str(sd["ylow"]).replace(",", ""))
                except Exception:
                    pass
            if sd.get("marketCap"):
                try:
                    market_cap_cr = round(float(str(sd["marketCap"]).replace(",", "")), 2)
                except Exception:
                    pass
            if sd.get("pPerEBasicExcludingExtraordinaryItemsTTM"):
                try:
                    pe_ratio = float(str(sd["pPerEBasicExcludingExtraordinaryItemsTTM"]).replace(",", ""))
                except Exception:
                    pass
            if sd.get("currentDividendYieldCommonStockPrimaryIssueLTM"):
                try:
                    dividend_yield = float(str(sd["currentDividendYieldCommonStockPrimaryIssueLTM"]).replace(",", ""))
                except Exception:
                    pass
            if sd.get("totalDebtPerTotalEquityMostRecentQuarter"):
                try:
                    debt_to_equity = float(str(sd["totalDebtPerTotalEquityMostRecentQuarter"]).replace(",", ""))
                except Exception:
                    pass
            if sd.get("averageRating"):
                analyst_rating = str(sd["averageRating"])
            if sd.get("promoterShareHolding"):
                try:
                    promoter_holding = float(str(sd["promoterShareHolding"]).replace(",", ""))
                except Exception:
                    pass
            if sd.get("mutualFundShareHolding"):
                try:
                    mutual_fund_holding = float(str(sd["mutualFundShareHolding"]).replace(",", ""))
                except Exception:
                    pass
            if isinstance(sd.get("peerCompanyList"), list):
                peers = [p for p in sd["peerCompanyList"] if isinstance(p, (str, dict))]

        # 2. Check financials if pe_ratio or pb_ratio still missing
        financials = d.get("financials")
        if isinstance(financials, dict):
            valuation = financials.get("valuation")
            if isinstance(valuation, list):
                for item in valuation:
                    k = item.get("key", "")
                    val = item.get("value")
                    if not val or val == "None":
                        continue
                    try:
                        v_float = float(str(val).replace(",", ""))
                        if not pe_ratio and ("peRatio" in k or "PE" in k):
                            pe_ratio = v_float
                        elif not pb_ratio and ("priceToBook" in k or "PB" in k):
                            pb_ratio = v_float
                        elif not dividend_yield and "dividendYield" in k:
                            dividend_yield = v_float
                    except Exception:
                        pass

        # 3. Check priceandVolume list
        price_vol = d.get("priceandVolume")
        if isinstance(price_vol, list):
            for item in price_vol:
                k = item.get("key", "")
                val = item.get("value")
                if not market_cap_cr and k == "marketCap" and val and val != "None":
                    try:
                        market_cap_cr = round(float(str(val).replace(",", "")), 2)
                    except Exception:
                        pass
                if not year_high and k == "52WeekHigh" and val:
                    try:
                        year_high = float(str(val).replace(",", ""))
                    except Exception:
                        pass
                if not year_low and k == "52WeekLow" and val:
                    try:
                        year_low = float(str(val).replace(",", ""))
                    except Exception:
                        pass

        # Recent news
        news_list = []
        for n in (d.get("recentNews") or [])[:5]:
            news_list.append({
                "title": n.get("headline") or n.get("title") or "",
                "summary": n.get("summary") or "",
                "url": n.get("url") or "",
                "date": n.get("date") or n.get("lastPublishedDate") or "",
                "image": (n.get("leadMedia", {}).get("image", {}).get("images", {}).get("thumbnailImage")
                          if isinstance(n.get("leadMedia"), dict) else None)
            })

        return {
            "company_name": d.get("companyName"),
            "industry": d.get("industry"),
            "company_profile": d.get("companyProfile"),
            "bse_price": bse_price,
            "nse_price": nse_price,
            "percent_change": pct_change,
            "year_high": year_high,
            "year_low": year_low,
            "pe_ratio": pe_ratio,
            "pb_ratio": pb_ratio,
            "dividend_yield": dividend_yield,
            "market_cap_cr": market_cap_cr,
            "debt_to_equity": debt_to_equity,
            "analyst_rating": analyst_rating,
            "promoter_holding": promoter_holding,
            "mutual_fund_holding": mutual_fund_holding,
            "peers": peers,
            "news": news_list,
            "source": "indianapi.in"
        }

    def get_trending(self) -> Optional[Dict[str, List[Dict[str, Any]]]]:
        """
        Fetches official trending top gainers and top losers from IndianAPI.in.
        """
        now = time.time()
        if self._cache_trending:
            cached_time, cached_val = self._cache_trending
            if now - cached_time < self.trending_ttl:
                return cached_val

        data = self._make_request("trending")
        if not data or not isinstance(data, dict):
            return None

        tr = data.get("trending_stocks") or {}
        gainers = []
        for g in tr.get("top_gainers") or []:
            try:
                gainers.append({
                    "symbol": (g.get("ric") or "").replace(".NS", "").replace(".BO", "") or g.get("ticker_id"),
                    "name": g.get("company_name"),
                    "price": float(g.get("price") or 0.0),
                    "change": float(g.get("net_change") or 0.0),
                    "change_pct": float(g.get("percent_change") or 0.0),
                    "exchange": "NSE" if (g.get("ric") or "").endswith(".NS") else "BSE",
                    "high": float(g.get("high") or 0.0),
                    "low": float(g.get("low") or 0.0),
                    "volume": int(g.get("volume") or 0),
                    "rating": g.get("overall_rating", "Neutral")
                })
            except Exception:
                continue

        losers = []
        for l in tr.get("top_losers") or []:
            try:
                losers.append({
                    "symbol": (l.get("ric") or "").replace(".NS", "").replace(".BO", "") or l.get("ticker_id"),
                    "name": l.get("company_name"),
                    "price": float(l.get("price") or 0.0),
                    "change": float(l.get("net_change") or 0.0),
                    "change_pct": float(l.get("percent_change") or 0.0),
                    "exchange": "NSE" if (l.get("ric") or "").endswith(".NS") else "BSE",
                    "high": float(l.get("high") or 0.0),
                    "low": float(l.get("low") or 0.0),
                    "volume": int(l.get("volume") or 0),
                    "rating": l.get("overall_rating", "Neutral")
                })
            except Exception:
                continue

        result = {"top_gainers": gainers, "top_losers": losers}
        self._cache_trending = (now, result)
        return result

    def get_news(self) -> List[Dict[str, Any]]:
        """
        Fetches live market news articles from IndianAPI.in.
        """
        now = time.time()
        if self._cache_news:
            cached_time, cached_val = self._cache_news
            if now - cached_time < self.news_ttl:
                return cached_val

        data = self._make_request("news")
        if not data or not isinstance(data, list):
            return []

        articles = []
        for a in data:
            articles.append({
                "title": a.get("title", ""),
                "summary": a.get("summary", ""),
                "url": a.get("url", ""),
                "image_url": a.get("image_url", ""),
                "pub_date": a.get("pub_date", ""),
                "source": a.get("source", "IndianAPI.in"),
                "topics": a.get("topics", [])
            })

        self._cache_news = (now, articles)
        return articles


# Global client instance
indian_api_client = IndianApiClient()
