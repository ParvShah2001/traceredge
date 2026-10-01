import { useState, useEffect, useRef, useCallback } from "react";
import { WS_BASE, fetchStocks, fetchIndices, fetchMarketStatus } from "../services/api";

const DEFAULT_INDICES = [
  { symbol: "NIFTY 50", name: "Nifty 50", value: 24750.50, change: 85.20, change_pct: 0.35, high: 24820.00, low: 24690.00 },
  { symbol: "SENSEX", name: "BSE Sensex", value: 81200.25, change: 275.40, change_pct: 0.34, high: 81450.00, low: 81050.00 },
  { symbol: "BANK NIFTY", name: "Nifty Bank", value: 52350.00, change: 160.00, change_pct: 0.31, high: 52500.00, low: 52100.00 },
  { symbol: "NIFTY IT", name: "Nifty IT", value: 41800.75, change: -120.30, change_pct: -0.29, high: 42100.00, low: 41650.00 },
  { symbol: "INDIA VIX", name: "India VIX", value: 12.85, change: -0.35, change_pct: -2.65, high: 13.50, low: 12.60 }
];

export function useLiveMarket(filters = {}) {
  const [stocks, setStocks] = useState([]);
  const [indices, setIndices] = useState(DEFAULT_INDICES);
  const [marketStatus, setMarketStatus] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting"); // 'connected' | 'connecting' | 'disconnected'
  const [flashMap, setFlashMap] = useState({}); // { [symbol]: 'up' | 'down' }
  const [lastTickTime, setLastTickTime] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // Initial load or filter change
  const reloadStocks = useCallback(async () => {
    try {
      const data = await fetchStocks({
        ...filtersRef.current,
        page,
        page_size: pageSize
      });
      setStocks(data.stocks || []);
      setTotal(data.total || (data.stocks ? data.stocks.length : 0));
      setTotalPages(data.total_pages || 1);
    } catch (e) {
      console.error("Error fetching stocks:", e);
    }
  }, [page, pageSize]);

  // Auto-reset page to 1 when search or filter criteria change
  const prevFilterHash = useRef("");
  const filterCriteriaHash = JSON.stringify([
    filters.preset,
    filters.search,
    filters.sort_by,
    filters.sort_dir,
    filters.custom_rules,
    filters.custom_logic
  ]);

  useEffect(() => {
    if (prevFilterHash.current && prevFilterHash.current !== filterCriteriaHash) {
      setPage(1);
    }
    prevFilterHash.current = filterCriteriaHash;
  }, [filterCriteriaHash]);

  useEffect(() => {
    reloadStocks();
  }, [
    filters.preset,
    filters.search,
    filters.sort_by,
    filters.sort_dir,
    JSON.stringify(filters.custom_rules),
    filters.custom_logic,
    reloadStocks
  ]);

  // Fetch indices and market status on mount and on a reliable background interval
  useEffect(() => {
    const updateMarketData = () => {
      fetchIndices()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setIndices(data);
          }
        })
        .catch(console.error);

      fetchMarketStatus()
        .then(setMarketStatus)
        .catch(console.error);
    };

    updateMarketData();
    const interval = setInterval(updateMarketData, 15000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket Live Updates
  useEffect(() => {
    let isMounted = true;

    function connectWs() {
      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        return;
      }

      setConnectionStatus("connecting");
      const ws = new WebSocket(`${WS_BASE}/ws/live`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMounted) return;
        setConnectionStatus("connected");
      };

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const data = JSON.parse(event.data);

          if (data.type === "SNAPSHOT") {
            if (Array.isArray(data.indices) && data.indices.length > 0) {
              setIndices(data.indices);
            }
            if (data.breadth) {
              setMarketStatus((prev) => ({
                ...(prev || {}),
                is_market_open: data.is_market_open,
                breadth: data.breadth
              }));
            }
          } else if (data.type === "TICK") {
            setLastTickTime(data.timestamp);

            if (data.breadth) {
              setMarketStatus((prev) => ({
                ...(prev || {}),
                is_market_open: data.is_market_open,
                breadth: data.breadth
              }));
            }

            // Update indices reliably without ever wiping out
            if (Array.isArray(data.indices) && data.indices.length > 0) {
              setIndices((prevIndices) => {
                const map = new Map(prevIndices.map((idx) => [idx.symbol, idx]));
                data.indices.forEach((newIdx) => {
                  const curr = map.get(newIdx.symbol);
                  map.set(newIdx.symbol, { ...(curr || {}), ...newIdx });
                });
                return Array.from(map.values());
              });
            }

            // Update stocks & apply flash animations
            if (data.stocks && data.stocks.length > 0) {
              const newFlashes = {};
              const getStockKey = (s) => s.id || `${s.symbol}:${s.exchange || ""}`;
              const tickUpdates = new Map();

              data.stocks.forEach((s) => {
                const k = getStockKey(s);
                tickUpdates.set(k, s);
                if (s.tick_direction !== "same") {
                  newFlashes[k] = s.tick_direction;
                  newFlashes[s.symbol] = s.tick_direction;
                }
              });

              setFlashMap((prev) => ({ ...prev, ...newFlashes }));

              // Clear flash after 500ms
              setTimeout(() => {
                if (!isMounted) return;
                setFlashMap((prev) => {
                  const next = { ...prev };
                  Object.keys(newFlashes).forEach((k) => delete next[k]);
                  return next;
                });
              }, 500);

              // Update stocks in state
              setStocks((prevStocks) => {
                return prevStocks.map((stock) => {
                  const k = getStockKey(stock);
                  const update = tickUpdates.get(k) || (stock.exchange ? tickUpdates.get(`${stock.symbol}:${stock.exchange}`) : tickUpdates.get(stock.symbol));
                  if (update && (!update.exchange || !stock.exchange || update.exchange === stock.exchange)) {
                    return {
                      ...stock,
                      price: update.price,
                      change: update.change,
                      change_pct: update.change_pct,
                      day_high: update.day_high,
                      day_low: update.day_low,
                      volume: update.volume,
                      volume_ratio: update.volume_ratio,
                      tick_direction: update.tick_direction,
                      last_updated: update.last_updated
                    };
                  }
                  return stock;
                });
              });
            }
          }
        } catch (err) {
          console.error("WS message parse error:", err);
        }
      };

      ws.onclose = () => {
        if (!isMounted) return;
        setConnectionStatus("disconnected");
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isMounted) connectWs();
        }, 3000);
      };

      ws.onerror = () => {
        if (ws.readyState === WebSocket.OPEN) ws.close();
      };
    }

    connectWs();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return {
    stocks,
    indices,
    marketStatus,
    connectionStatus,
    flashMap,
    lastTickTime,
    reloadStocks,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages
  };
}
