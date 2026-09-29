// API and WebSocket configuration for TracerEdge (supports Cloudflare Pages & Unified Hosting)
const envApi = import.meta.env.VITE_API_URL;
const envWs = import.meta.env.VITE_WS_URL;

const isDev = typeof window !== "undefined" && window.location.port === "5173";
const API_BASE = envApi || (isDev ? "http://127.0.0.1:8000" : "");
const wsProtocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:";
const defaultWs = typeof window !== "undefined" ? `${wsProtocol}//${window.location.host}` : "ws://127.0.0.1:8000";
const WS_BASE = envWs || (isDev ? "ws://127.0.0.1:8000" : (envApi ? envApi.replace(/^http/, "ws") : defaultWs));

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
