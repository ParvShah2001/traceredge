import { useState, useEffect, useRef, useCallback } from "react";
import { WS_BASE, fetchStocks, fetchIndices, fetchMarketStatus } from "../services/api";
import { soundManager } from "../utils/sound";

export function useLiveMarket(filters = {}) {
  const [stocks, setStocks] = useState([]);
  const [indices, setIndices] = useState([]);
  const [marketStatus, setMarketStatus] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting"); // 'connected' | 'connecting' | 'disconnected'
  const [flashMap, setFlashMap] = useState({}); // { [symbol]: 'up' | 'down' }
  const [lastTickTime, setLastTickTime] = useState("");
  const [alerts, setAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem("screener_alerts");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [triggeredAlerts, setTriggeredAlerts] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // Persist alerts
  useEffect(() => {
    try {
      localStorage.setItem("screener_alerts", JSON.stringify(alerts));
    } catch (e) {
      console.error(e);
    }
  }, [alerts]);

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
    filters.exchange,
    filters.sector,
    filters.market_cap_category,
    filters.min_price,
    filters.max_price,
    filters.min_rsi,
    filters.max_rsi,
    filters.min_pe,
    filters.max_pe,
    filters.min_vol_ratio,
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
    filters.exchange,
    filters.sector,
    filters.market_cap_category,
    filters.min_price,
    filters.max_price,
    filters.min_rsi,
    filters.max_rsi,
    filters.min_pe,
    filters.max_pe,
    filters.min_vol_ratio,
    filters.sort_by,
    filters.sort_dir,
    JSON.stringify(filters.custom_rules),
    filters.custom_logic,
    reloadStocks
  ]);

  // Initial fetch for indices and market status
  useEffect(() => {
    fetchIndices().then(setIndices).catch(console.error);
    fetchMarketStatus().then(setMarketStatus).catch(console.error);
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
            if (data.indices) setIndices(data.indices);
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

            // Update indices
            if (data.indices && data.indices.length > 0) {
              setIndices((prevIndices) => {
                const map = new Map(prevIndices.map((idx) => [idx.symbol, idx]));
                data.indices.forEach((newIdx) => {
                  const curr = map.get(newIdx.symbol);
                  map.set(newIdx.symbol, { ...(curr || {}), ...newIdx });
                });
                return Array.from(map.values());
              });
            }

            // Update stocks & apply flash animations keyed by unique stock ID and exchange
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

              // Play subtle sound if enabled
              if (data.stocks.some((s) => s.tick_direction === "up")) {
                soundManager.playTick("up");
              } else if (data.stocks.some((s) => s.tick_direction === "down")) {
                soundManager.playTick("down");
              }

              // Clear flash after 500ms for snappy, fluid visuals
              setTimeout(() => {
                if (!isMounted) return;
                setFlashMap((prev) => {
                  const next = { ...prev };
                  Object.keys(newFlashes).forEach((k) => delete next[k]);
                  return next;
                });
              }, 500);

              // Update stocks in state without mixing NSE and BSE prices
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

              // Check alerts
              checkAlerts(data.stocks);
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

  // Alert verification
  const checkAlerts = (updatedStockList) => {
    if (!alerts.length) return;
    const alertMap = new Map(updatedStockList.map((s) => [s.symbol, s]));

    alerts.forEach((alert) => {
      const stock = alertMap.get(alert.symbol);
      if (!stock || alert.triggered) return;

      let triggered = false;
      let message = "";

      if (alert.condition === "price_above" && stock.price >= alert.value) {
        triggered = true;
        message = `${alert.symbol} reached ₹${stock.price} (Above target ₹${alert.value})`;
      } else if (alert.condition === "price_below" && stock.price <= alert.value) {
        triggered = true;
        message = `${alert.symbol} fell to ₹${stock.price} (Below target ₹${alert.value})`;
      } else if (alert.condition === "pct_gain" && stock.change_pct >= alert.value) {
        triggered = true;
        message = `${alert.symbol} gained +${stock.change_pct}% (Target +${alert.value}%)`;
      }

      if (triggered) {
        soundManager.playAlertNotification();
        setTriggeredAlerts((prev) => [
          {
            id: Date.now() + Math.random(),
            symbol: alert.symbol,
            message,
            time: new Date().toLocaleTimeString("en-IN")
          },
          ...prev.slice(0, 4)
        ]);

        setAlerts((prevAlerts) =>
          prevAlerts.map((a) => (a.id === alert.id ? { ...a, triggered: true } : a))
        );
      }
    });
  };

  const addAlert = (alertObj) => {
    const newAlert = {
      id: Date.now().toString(),
      triggered: false,
      createdAt: new Date().toLocaleTimeString("en-IN"),
      ...alertObj
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const removeAlert = (alertId) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const toggleSound = () => {
    const nextState = soundManager.toggleSound();
    setSoundEnabled(nextState);
  };

  return {
    stocks,
    indices,
    marketStatus,
    connectionStatus,
    flashMap,
    lastTickTime,
    reloadStocks,
    alerts,
    addAlert,
    removeAlert,
    triggeredAlerts,
    dismissAlert: (id) => setTriggeredAlerts((prev) => prev.filter((a) => a.id !== id)),
    soundEnabled,
    toggleSound,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages
  };
}
