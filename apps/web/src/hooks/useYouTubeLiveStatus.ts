import { useState, useEffect, useCallback, useRef } from 'react';

interface YouTubeLiveStream {
  id: string;
  url: string;
  title: string;
  thumbnailUrl: string;
}

interface LiveStatusResponse {
  isLive: boolean;
  stream: YouTubeLiveStream | null;
  cached: boolean;
  error?: string;
}

interface UseYouTubeLiveStatusOptions {
  /** Polling interval in milliseconds (default: 180000 = 3 minutes) */
  pollInterval?: number;
  /** Whether to start polling immediately (default: true) */
  autoStart?: boolean;
  /** Retry delay in milliseconds when API fails (default: 30000 = 30 seconds) */
  retryDelay?: number;
  /** Maximum number of consecutive failed attempts before stopping (default: 5) */
  maxRetries?: number;
}

export function useYouTubeLiveStatus(options: UseYouTubeLiveStatusOptions = {}) {
  const {
    pollInterval = 2 * 60 * 1000, // 2 minutes
    autoStart = true,
    retryDelay = 30 * 1000, // 30 seconds
    maxRetries = 5
  } = options;

  const [isLive, setIsLive] = useState(false);
  const [stream, setStream] = useState<YouTubeLiveStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const isActiveRef = useRef(true);

  const checkLiveStatus = useCallback(async () => {
    if (!isActiveRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/youtube/livestream-status');
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data: LiveStatusResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!isActiveRef.current) return;

      setIsLive(data.isLive);
      setStream(data.stream);
      setLastChecked(new Date());
      
      // Reset retry counter on success
      retryCountRef.current = 0;

    } catch (err) {
      if (!isActiveRef.current) return;

      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to check YouTube live status:', errorMessage);
      
      setError(errorMessage);
      retryCountRef.current++;

      // If we've exceeded max retries, stop polling
      if (retryCountRef.current >= maxRetries) {
        console.warn(`YouTube live status check failed ${maxRetries} times. Stopping automatic polling.`);
        stopPolling();
        return;
      }

      // Schedule retry with shorter delay
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = setTimeout(checkLiveStatus, retryDelay);
      }
      
    } finally {
      if (isActiveRef.current) {
        setIsLoading(false);
      }
    }
  }, [retryDelay, maxRetries]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Reset retry counter when manually starting
    retryCountRef.current = 0;
    isActiveRef.current = true;

    // Initial check
    checkLiveStatus();

    // Set up interval
    intervalRef.current = setInterval(checkLiveStatus, pollInterval);
  }, [checkLiveStatus, pollInterval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isActiveRef.current = false;
  }, []);

  const refresh = useCallback(() => {
    retryCountRef.current = 0;
    checkLiveStatus();
  }, [checkLiveStatus]);

  // Auto-start polling if enabled
  useEffect(() => {
    if (autoStart) {
      startPolling();
    }

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [autoStart, startPolling, stopPolling]);

  // Handle visibility change - pause polling when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else if (autoStart && isActiveRef.current) {
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [autoStart, startPolling, stopPolling]);

  return {
    isLive,
    stream,
    isLoading,
    error,
    lastChecked,
    retryCount: retryCountRef.current,
    startPolling,
    stopPolling,
    refresh,
    isPolling: !!intervalRef.current
  };
}