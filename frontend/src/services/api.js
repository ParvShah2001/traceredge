// API service for India NSE/BSE Screener Backend
const API_BASE = "http://127.0.0.1:8000";
const WS_BASE = "ws://127.0.0.1:8000";

export async function fetchIndices() {
  const res = await fetch(`${API_BASE}/api/market/indices`);
  if (!res.ok) throw new Error("Failed to fetch indices");
  return res.json();
}

export async function fetchMarketStatus() {
  const res = await fetch(`${API_BASE}/api/market/status`);
  if (!res.ok) throw new Error("Failed to fetch market status");
  return res.json();
}

export async function fetchStocks(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      if (typeof v === "object") {
        query.append(k, JSON.stringify(v));
      } else {
        query.append(k, v);
      }
    }
  });

  const res = await fetch(`${API_BASE}/api/stocks?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch stocks");
  return res.json();
}

export async function searchStocksApi(query, limit = 20, exchange = "ALL") {
  if (!query) return [];
  const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}&limit=${limit}&exchange=${encodeURIComponent(exchange)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchUniverseStatus() {
  const res = await fetch(`${API_BASE}/api/universe/status`);
  if (!res.ok) throw new Error("Failed to fetch universe status");
  return res.json();
}

export async function triggerUniverseSync() {
  const res = await fetch(`${API_BASE}/api/universe/sync`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to trigger universe sync");
  return res.json();
}

export async function triggerVerifyEodClose() {
  const res = await fetch(`${API_BASE}/api/market/verify-eod-close`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to verify official EOD closing settlement");
  return res.json();
}

export async function fetchStockDetail(symbol, exchange = null) {
  const exParam = exchange ? `?exchange=${encodeURIComponent(exchange)}` : "";
  const res = await fetch(`${API_BASE}/api/stocks/${encodeURIComponent(symbol)}${exParam}`);
  if (!res.ok) throw new Error(`Failed to fetch stock ${symbol}`);
  return res.json();
}

export async function fetchStockHistory(symbol, timeframe = "1M", exchange = null) {
  const exParam = exchange ? `&exchange=${encodeURIComponent(exchange)}` : "";
  const res = await fetch(`${API_BASE}/api/stocks/${encodeURIComponent(symbol)}/history?timeframe=${timeframe}${exParam}`);
  if (!res.ok) throw new Error(`Failed to fetch history for ${symbol}`);
  return res.json();
}

export async function fetchSectors() {
  const res = await fetch(`${API_BASE}/api/sectors`);
  if (!res.ok) throw new Error("Failed to fetch sectors");
  return res.json();
}

export { API_BASE, WS_BASE };
