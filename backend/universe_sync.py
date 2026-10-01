"""
Continuous Universe Synchronization Manager for NSE & BSE India.
Automatically fetches, merges, deduplicates, and continuously updates
all active listed equities across both the National Stock Exchange (NSE)
and Bombay Stock Exchange (BSE).
"""
import os
import json
import logging
import urllib.request
from datetime import datetime
from zoneinfo import ZoneInfo
from typing import Dict, List, Any, Tuple, Optional
import pandas as pd
try:
    import bseindia
except ImportError:
    bseindia = None

logger = logging.getLogger("universe_sync")
logging.basicConfig(level=logging.INFO)

IST = ZoneInfo("Asia/Kolkata")
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)
UNIVERSE_CACHE_PATH = os.path.join(DATA_DIR, "ALL_INDIAN_EQUITIES.json")

NSE_URL = "https://archives.nseindia.com/content/equities/EQUITY_L.csv"
FALLBACK_NSE_PATH = os.path.join(os.path.dirname(__file__), "EQUITY_L.csv")


FALLBACK_BSE_PATH = os.path.join(DATA_DIR, "BSE_EQUITIES.csv")
FALLBACK_BSE_ROOT = os.path.join(os.path.dirname(__file__), "BSE_EQUITIES.csv")


def infer_sector_from_name(name: str) -> str:
    """Classifies an Indian company into an economic sector based on keywords in its name."""
    n = name.upper()
    if any(k in n for k in ["BANK", "FINANC", "CAPITAL", "INVEST", "HOLDING", "SECURIT", "LEASING", "WEALTH"]):
        return "Banking & Financials"
    if any(k in n for k in ["TECH", "SOFT", "INFOSYS", "CYBER", "DIGITAL", "CONSULT", "INFO", "SYSTEM", "DATA"]):
        return "Information Technology"
    if any(k in n for k in ["POWER", "ENERGY", "SOLAR", "WIND", "ELECTRIC", "GRID", "THERMAL", "RENEWABLE"]):
        return "Energy & Power"
    if any(k in n for k in ["PETRO", "OIL", "GAS", "REFINER", "CHEM", "ORGANIC", "FERTILIZ", "POLYMER"]):
        return "Chemicals & Petrochemicals"
    if any(k in n for k in ["MOTORS", "AUTO", "TYRE", "VEHICLE", "TRACTOR", "AUTOMOTIVE", "WHEEL"]):
        return "Automobile"
    if any(k in n for k in ["PHARMA", "DRUG", "HEALTH", "LAB", "BIO", "REMED", "HOSPITAL", "CLINIC", "MED"]):
        return "Pharmaceuticals & Healthcare"
    if any(k in n for k in ["CONSUMER", "FOOD", "BEVERAGE", "FMCG", "DAIRY", "TEA", "COFFEE", "SUGAR", "BREW", "TOBACCO"]):
        return "Consumer Goods (FMCG)"
    if any(k in n for k in ["STEEL", "METAL", "MINING", "IRON", "ALUMIN", "COPPER", "ZINC", "MINERAL", "ALLOY"]):
        return "Metals & Mining"
    if any(k in n for k in ["INFRA", "CONSTRUCT", "ENGIN", "CEMENT", "BUILD", "REALTY", "HOUSING", "ESTATE"]):
        return "Infrastructure & Real Estate"
    if any(k in n for k in ["DEFENCE", "AERO", "DYNAMICS", "ELECTRONIC", "RADAR"]):
        return "Defense & Aerospace"
    if any(k in n for k in ["TELECOM", "COMMUNICATION", "NETWORK", "CABLE", "BROADBAND"]):
        return "Telecommunications"
    if any(k in n for k in ["TEXTILE", "SPINNING", "SILK", "COTTON", "WEAVING", "GARMENT", "FASHION", "FABRIC"]):
        return "Textiles & Apparels"
    if any(k in n for k in ["HOTEL", "RESORT", "TRAVEL", "TOURISM", "AIRLINE", "HOSPITALITY"]):
        return "Hospitality & Travel"
    if any(k in n for k in ["MEDIA", "ENTERTAIN", "FILM", "BROADCAST", "PUBLISH", "PRINT"]):
        return "Media & Entertainment"
    return "Diversified & Industrials"


class UniverseSyncManager:
    """
    Manages continuous synchronization between NSE & BSE India official equity masters.
    """
    def __init__(self):
        self.stocks_map: Dict[str, Dict[str, Any]] = {}
        self.last_synced: Optional[str] = None
        self.stats: Dict[str, Any] = {
            "total_stocks": 0,
            "nse_count": 0,
            "bse_count": 0,
            "dual_listed_count": 0,
            "nse_only_count": 0,
            "bse_only_count": 0,
            "last_synced": None,
            "status": "initializing"
        }
        self.load_cache_or_build()

    def fetch_nse_df(self) -> pd.DataFrame:
        """Fetches active equity list from NSE official archives with fallback."""
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        try:
            req = urllib.request.Request(NSE_URL, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as resp:
                df = pd.read_csv(resp)
                df.columns = [c.strip() for c in df.columns]
                # Save copy locally
                df.to_csv(FALLBACK_NSE_PATH, index=False)
                logger.info(f"Downloaded fresh NSE master with {len(df)} equities.")
                return df
        except Exception as e:
            logger.warning(f"Could not download live NSE master ({e}). Loading fallback.")
            if os.path.exists(FALLBACK_NSE_PATH):
                df = pd.read_csv(FALLBACK_NSE_PATH)
                df.columns = [c.strip() for c in df.columns]
                return df
            return pd.DataFrame()

    def fetch_bse_df(self) -> pd.DataFrame:
        """Fetches active equity securities master from BSE India with multi-stage fallback."""
        if bseindia is not None:
            try:
                bse_df = bseindia.all_listed_securities(refresh=True)
                active_eq = bse_df[
                    (bse_df["status"].astype(str).str.lower() == "active") &
                    (bse_df["instrument"].astype(str).str.lower() == "equity")
                ].copy()
                if len(active_eq) > 1000:
                    logger.info(f"Fetched live BSE master with {len(active_eq)} active equities.")
                    try:
                        active_eq.to_csv(FALLBACK_BSE_PATH, index=False)
                    except Exception:
                        pass
                    return active_eq
            except Exception as e:
                logger.warning(f"Live BSE fetch failed ({e}). Loading cached BSE securities if any.")

            try:
                bse_df = bseindia.all_listed_securities(refresh=False)
                active_eq = bse_df[
                    (bse_df["status"].astype(str).str.lower() == "active") &
                    (bse_df["instrument"].astype(str).str.lower() == "equity")
                ].copy()
                if len(active_eq) > 1000:
                    logger.info(f"Loaded bseindia cached master with {len(active_eq)} active equities.")
                    return active_eq
            except Exception as e2:
                logger.debug(f"bseindia cached master not available: {e2}")

        # Fallback to local CSV cache
        for bse_path in [FALLBACK_BSE_PATH, FALLBACK_BSE_ROOT]:
            if os.path.exists(bse_path):
                try:
                    df = pd.read_csv(bse_path)
                    df.columns = [c.strip() for c in df.columns]
                    logger.info(f"Loaded fallback BSE master from {bse_path} with {len(df)} equities.")
                    return df
                except Exception as ex:
                    logger.warning(f"Failed to read BSE fallback {bse_path}: {ex}")

        return pd.DataFrame()

    def merge_and_build(self, nse_df: pd.DataFrame, bse_df: pd.DataFrame) -> Dict[str, Dict[str, Any]]:
        """
        Builds separate, dedicated equity listings for NSE and BSE.
        Does NOT drop existing equities if one exchange fails to fetch.
        Produces complete 7,650+ Indian Market equity universe.
        """
        all_equities: Dict[str, Dict[str, Any]] = {}
        nse_count = 0
        bse_count = 0

        # Build ISIN to BSE mapping for cross-referencing BSE codes
        bse_code_by_isin: Dict[str, str] = {}
        if not bse_df.empty:
            for _, row in bse_df.iterrows():
                isin = str(row.get("isin_no", "")).strip().upper()
                code = str(row.get("security_code", "")).strip()
                if isin and isin.startswith("IN") and code:
                    bse_code_by_isin[isin] = code

        # 1. Process NSE equities (~2,592 listings)
        if not nse_df.empty:
            for _, row in nse_df.iterrows():
                sym = str(row.get("SYMBOL", "")).strip().upper()
                if not sym or sym == "NAN":
                    continue
                name = str(row.get("NAME OF COMPANY", sym)).strip()
                isin = str(row.get("ISIN NUMBER", "")).strip().upper()
                series = str(row.get("SERIES", "EQ")).strip()
                listing_date = str(row.get("DATE OF LISTING", "")).strip()
                sector = infer_sector_from_name(name)
                bse_c = bse_code_by_isin.get(isin)

                stock_id = f"{sym}:NSE"
                nse_count += 1
                all_equities[stock_id] = {
                    "id": stock_id,
                    "symbol": sym,
                    "name": name,
                    "isin": isin,
                    "exchange": "NSE",
                    "nse_symbol": sym,
                    "bse_symbol": None,
                    "bse_code": bse_c,
                    "series": series,
                    "listing_date": listing_date,
                    "sector": sector,
                    "ticker": f"{sym}.NS",
                    "primary_ticker": f"{sym}.NS"
                }
        elif self.stocks_map:
            # Preserve existing NSE stocks if fetch returned empty
            for k, v in self.stocks_map.items():
                if v.get("exchange") == "NSE":
                    all_equities[k] = v
                    nse_count += 1

        # 2. Process BSE equities (~5,061 listings)
        if not bse_df.empty:
            for _, row in bse_df.iterrows():
                code = str(row.get("security_code", "")).strip()
                if not code or code == "NAN":
                    continue
                raw_sym = str(row.get("symbol", "")).strip().upper()
                if not raw_sym or raw_sym == "NAN":
                    raw_sym = code

                name = str(row.get("issuer_name", "")).strip()
                if not name or name == "NAN":
                    name = str(row.get("security_name", raw_sym)).strip()

                isin = str(row.get("isin_no", "")).strip().upper()
                group = str(row.get("group", "B")).strip()
                sector = infer_sector_from_name(name)

                stock_id = f"{code}:BSE"
                bse_count += 1
                all_equities[stock_id] = {
                    "id": stock_id,
                    "symbol": raw_sym,
                    "name": name,
                    "isin": isin,
                    "exchange": "BSE",
                    "nse_symbol": None,
                    "bse_symbol": raw_sym,
                    "bse_code": code,
                    "series": group,
                    "listing_date": "",
                    "sector": sector,
                    "ticker": f"{raw_sym}.BO" if raw_sym and raw_sym != code else f"{code}.BO",
                    "primary_ticker": f"{raw_sym}.BO" if raw_sym and raw_sym != code else f"{code}.BO"
                }
        elif self.stocks_map:
            # CRITICAL PRESERVATION: If BSE fetch returned empty, preserve all existing BSE stocks
            for k, v in self.stocks_map.items():
                if v.get("exchange") == "BSE":
                    all_equities[k] = v
                    bse_count += 1

        # Safety check: Never allow universe to drop drastically
        if len(all_equities) < 3000 and len(self.stocks_map) >= 3000:
            logger.warning(f"Merged universe count ({len(all_equities)}) is suspiciously low. Preserving current universe of {len(self.stocks_map)}.")
            return self.stocks_map

        now_str = datetime.now(IST).strftime("%Y-%m-%d %H:%M:%S IST")
        self.last_synced = now_str
        self.stats = {
            "total_stocks": len(all_equities),
            "nse_count": nse_count,
            "bse_count": bse_count,
            "last_synced": now_str,
            "status": "synced"
        }

        # Save to local cache
        try:
            with open(UNIVERSE_CACHE_PATH, "w", encoding="utf-8") as f:
                json.dump({
                    "stats": self.stats,
                    "stocks": all_equities
                }, f, indent=2)
            logger.info(f"Saved split Indian equities universe to {UNIVERSE_CACHE_PATH}. Total: {len(all_equities)} (NSE: {nse_count}, BSE: {bse_count})")
        except Exception as e:
            logger.error(f"Failed to write universe cache: {e}")

        return all_equities

    def load_cache_or_build(self):
        """Loads unified cache from disk or builds it immediately."""
        if os.path.exists(UNIVERSE_CACHE_PATH):
            try:
                with open(UNIVERSE_CACHE_PATH, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.stats = data.get("stats", self.stats)
                    self.stocks_map = data.get("stocks", {})
                    self.last_synced = self.stats.get("last_synced")
                    logger.info(f"Loaded {len(self.stocks_map)} Indian equities from cache ({self.last_synced}).")
                    return
            except Exception as e:
                logger.warning(f"Failed to read cache {UNIVERSE_CACHE_PATH}: {e}")

        # Build fresh if cache missing
        self.sync_now()

    def sync_now(self) -> Tuple[int, int]:
        """
        Executes live sync with NSE & BSE.
        Returns (new_stocks_count, total_stocks_count).
        """
        logger.info("Executing live synchronization with NSE & BSE India official masters...")
        old_count = len(self.stocks_map)
        nse_df = self.fetch_nse_df()
        bse_df = self.fetch_bse_df()

        if nse_df.empty and bse_df.empty:
            logger.warning("Both NSE and BSE returns empty. Retaining current universe.")
            return 0, old_count

        merged = self.merge_and_build(nse_df, bse_df)
        new_count = len(merged) - old_count
        self.stocks_map = merged
        logger.info(f"Sync complete. Total Indian Equities: {len(self.stocks_map)} (New: {max(0, new_count)})")
        return max(0, new_count), len(self.stocks_map)


# Global instance
universe_syncer = UniverseSyncManager()
