"""
Master Universe Manager for Indian Stock Market (NSE & BSE).
Manages all 7,640+ listed equities across the whole Indian market,
maintaining distinct, unmixed listings for NSE and BSE so both exchanges
have pure, independent live market prices.
Provides high-performance search across Symbol, Company Name, BSE Scrip Code, and ISIN.
"""
import os
import logging
from typing import Dict, List, Any, Optional, Tuple

from universe_sync import universe_syncer

logger = logging.getLogger("universe_manager")
logging.basicConfig(level=logging.INFO)


class UniverseManager:
    """
    Manages complete 7,640+ Indian Market Equity Universe with continuous sync capabilities.
    """
    def __init__(self):
        self.stocks_list: List[Dict[str, Any]] = []
        self.stocks_by_id: Dict[str, Dict[str, Any]] = {}
        self.stocks_by_symbol: Dict[str, List[Dict[str, Any]]] = {}
        self.stocks_by_bse_code: Dict[str, Dict[str, Any]] = {}
        self.stocks_by_isin: Dict[str, List[Dict[str, Any]]] = {}
        self.refresh_from_syncer()

    def refresh_from_syncer(self):
        """Re-indexes all equities from the universe synchronization manager."""
        raw_stocks = universe_syncer.stocks_map
        self.stocks_list = []
        self.stocks_by_id = {}
        self.stocks_by_symbol = {}
        self.stocks_by_bse_code = {}
        self.stocks_by_isin = {}

        for stock_id, item in raw_stocks.items():
            sym = item["symbol"]
            ex = item.get("exchange", "NSE")
            bse_c = item.get("bse_code")
            ticker = item.get("ticker") or (f"{sym}.NS" if ex == "NSE" else f"{sym}.BO")

            stock_meta = {
                "id": stock_id,
                "symbol": sym,
                "name": item["name"],
                "series": item.get("series", "EQ"),
                "isin": item.get("isin", ""),
                "listing_date": item.get("listing_date", ""),
                "sector": item.get("sector", "Diversified & Industrials"),
                "market_cap_category": "Mid Cap",  # Enriched dynamically with market data
                "exchange": ex,
                "nse_symbol": item.get("nse_symbol"),
                "bse_symbol": item.get("bse_symbol"),
                "bse_code": bse_c,
                "ticker": ticker,
                "primary_ticker": item.get("primary_ticker", ticker)
            }

            self.stocks_list.append(stock_meta)
            self.stocks_by_id[stock_id] = stock_meta

            # Map by symbol (a symbol can exist in both NSE and BSE)
            if sym not in self.stocks_by_symbol:
                self.stocks_by_symbol[sym] = []
            self.stocks_by_symbol[sym].append(stock_meta)

            if bse_c:
                self.stocks_by_bse_code[str(bse_c)] = stock_meta

            isin = stock_meta.get("isin")
            if isin:
                if isin not in self.stocks_by_isin:
                    self.stocks_by_isin[isin] = []
                self.stocks_by_isin[isin].append(stock_meta)

        logger.info(f"Universe Manager indexed {len(self.stocks_list)} complete Indian equities across NSE & BSE.")

    def sync_now(self) -> Tuple[int, int, Dict[str, Any]]:
        """
        Triggers live re-synchronization with NSE & BSE official masters.
        Returns (new_stocks_count, total_count, stats).
        """
        new_count, total_count = universe_syncer.sync_now()
        self.refresh_from_syncer()
        return new_count, total_count, universe_syncer.stats

    def search(self, query: str, limit: int = 50, exchange: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Fast multi-index search across:
        - Symbol (exact, prefix, substring)
        - BSE Scrip Code (e.g. 500325, 500012)
        - ISIN
        - Company Name
        Optionally filters by exchange ('NSE', 'BSE', 'ALL').
        """
        if not query:
            if exchange and exchange != "ALL":
                filtered = [s for s in self.stocks_list if self._matches_exchange(s, exchange)]
                return filtered[:limit]
            return self.stocks_list[:limit]

        q = query.strip().upper()

        # Check direct BSE code match
        if q in self.stocks_by_bse_code:
            code_match = self.stocks_by_bse_code[q]
            if not exchange or exchange == "ALL" or self._matches_exchange(code_match, exchange):
                return [code_match]

        # Check direct ISIN match
        if q in self.stocks_by_isin:
            matches = [s for s in self.stocks_by_isin[q] if not exchange or exchange == "ALL" or self._matches_exchange(s, exchange)]
            if matches:
                return matches[:limit]

        exact_matches = []
        prefix_symbol_matches = []
        substring_symbol_matches = []
        name_matches = []

        for stock in self.stocks_list:
            if exchange and exchange != "ALL" and not self._matches_exchange(stock, exchange):
                continue

            sym = stock["symbol"]
            name_upper = stock["name"].upper()
            bse_c = stock.get("bse_code") or ""

            if sym == q or bse_c == q or stock["id"] == q:
                exact_matches.append(stock)
            elif sym.startswith(q):
                prefix_symbol_matches.append(stock)
            elif q in sym or (bse_c and q in bse_c):
                substring_symbol_matches.append(stock)
            elif q in name_upper:
                name_matches.append(stock)

        results = exact_matches + prefix_symbol_matches + substring_symbol_matches + name_matches
        # Deduplicate while preserving order
        seen_ids = set()
        deduped = []
        for s in results:
            if s["id"] not in seen_ids:
                seen_ids.add(s["id"])
                deduped.append(s)

        return deduped[:limit]

    def _matches_exchange(self, stock: Dict[str, Any], filter_ex: str) -> bool:
        """Helper to match stock against exchange filter."""
        stock_ex = stock.get("exchange", "").upper()
        f = filter_ex.strip().upper()
        if f in ["ALL", ""]:
            return True
        if f == "NSE":
            return stock_ex == "NSE"
        if f == "BSE":
            return stock_ex == "BSE"
        return stock_ex == f

    def get_stock(self, identifier: str, exchange: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Get stock metadata by id (e.g. RELIANCE:NSE), symbol, BSE code, or ISIN."""
        key = identifier.strip().upper()

        # 1. Exact ID match (e.g. 'RELIANCE:NSE', '500325:BSE')
        if key in self.stocks_by_id:
            return self.stocks_by_id[key]

        # 2. BSE Code match
        if key in self.stocks_by_bse_code:
            return self.stocks_by_bse_code[key]

        # 3. Symbol match
        if key in self.stocks_by_symbol:
            candidates = self.stocks_by_symbol[key]
            if exchange:
                ex = exchange.upper()
                for c in candidates:
                    if c["exchange"].upper() == ex:
                        return c
            # Return first (e.g. NSE preference if not specified)
            return candidates[0]

        # 4. ISIN match
        if key in self.stocks_by_isin:
            candidates = self.stocks_by_isin[key]
            if exchange:
                ex = exchange.upper()
                for c in candidates:
                    if c["exchange"].upper() == ex:
                        return c
            return candidates[0]

        return None

    @property
    def stats(self) -> Dict[str, Any]:
        return universe_syncer.stats


# Global universe manager singleton
universe_manager = UniverseManager()

