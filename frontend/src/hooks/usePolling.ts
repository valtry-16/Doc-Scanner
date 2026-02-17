import { useEffect, useRef, useCallback } from 'react';
import { POLLING_INTERVAL } from '@/utils/constants';

interface UsePollingOptions {
  interval?: number;
  enabled?: boolean;
  onPoll: () => Promise<any>;
  shouldStop?: (result: any) => boolean;
}

export function usePolling({
  interval = POLLING_INTERVAL,
  enabled = true,
  onPoll,
  shouldStop,
}: UsePollingOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const enabledRef = useRef(enabled);
  const inFlightRef = useRef(false);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (!enabledRef.current) return;

    stopPolling();

    // Immediate first poll
    if (!inFlightRef.current) {
      inFlightRef.current = true;
      onPoll()
        .then((result) => {
          if (shouldStop && shouldStop(result)) {
            stopPolling();
            return;
          }
        })
        .finally(() => {
          inFlightRef.current = false;
        });
    }

    // Set up interval
    intervalRef.current = setInterval(async () => {
      if (!enabledRef.current) {
        stopPolling();
        return;
      }

      if (inFlightRef.current) {
        return;
      }

      inFlightRef.current = true;
      try {
        const result = await onPoll();
        if (shouldStop && shouldStop(result)) {
          stopPolling();
        }
      } finally {
        inFlightRef.current = false;
      }
    }, interval);
  }, [interval, onPoll, shouldStop, stopPolling]);

  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, startPolling, stopPolling]);

  return { startPolling, stopPolling };
}
