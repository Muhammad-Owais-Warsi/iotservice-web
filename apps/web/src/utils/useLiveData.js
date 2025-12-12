import { useState, useEffect, useCallback, useRef } from "react";

// Client-side caching utility for sensor data
const CACHE_KEY_PREFIX = "sensor_cache_";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function getCachedData(key) {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    // Return cached data if less than 24 hours old
    if (age < CACHE_DURATION) {
      return data;
    }

    // Clear expired cache
    localStorage.removeItem(CACHE_KEY_PREFIX + key);
    return null;
  } catch (error) {
    console.error("Cache read error:", error);
    return null;
  }
}

export function setCachedData(key, data) {
  if (typeof window === "undefined") return;

  try {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(cacheEntry));
  } catch (error) {
    console.error("Cache write error:", error);
  }
}

export function clearCache(key) {
  if (typeof window === "undefined") return;

  if (key) {
    localStorage.removeItem(CACHE_KEY_PREFIX + key);
  } else {
    // Clear all sensor caches
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(k);
      }
    });
  }
}

// Hook for live data updates with polling
export function useLiveData(fetchFn, options = {}) {
  const {
    refreshInterval = 15000, // 15 seconds default
    cacheKey = null,
    enabled = true,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef(null);

  const fetchData = useCallback(
    async (useCache = true) => {
      try {
        // Try cache first if enabled
        if (useCache && cacheKey) {
          const cached = getCachedData(cacheKey);
          if (cached) {
            setData(cached);
            setLoading(false);
            return;
          }
        }

        setError(null);
        const result = await fetchFn();

        setData(result);
        setLastUpdate(Date.now());

        // Cache the result
        if (cacheKey) {
          setCachedData(cacheKey, result);
        }

        setLoading(false);
      } catch (err) {
        console.error("Live data fetch error:", err);
        setError(err);
        setLoading(false);
      }
    },
    [fetchFn, cacheKey],
  );

  const refresh = useCallback(() => {
    setLoading(true);
    fetchData(false); // Force fresh data
  }, [fetchData]);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchData();

    // Set up polling interval
    intervalRef.current = setInterval(() => {
      fetchData(false);
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, refreshInterval, enabled]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh,
  };
}

// Format last update timestamp
export function formatLastUpdate(timestamp) {
  if (!timestamp) return "Never";

  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 10) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
