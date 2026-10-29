'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface LiveSyncProviderProps {
  children: React.ReactNode;
}

export function LiveSyncProvider({ children }: LiveSyncProviderProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const lastVersionRef = useRef<number>(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [syncedRecently, setSyncedRecently] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Trigger in-place Next.js soft refresh & notify custom event listeners
    const applyLiveUpdate = (version: number) => {
      if (!version || version <= lastVersionRef.current) return;
      lastVersionRef.current = version;

      startTransition(() => {
        router.refresh();
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('aws-sbg-live-update', { detail: { version } })
        );
      }

      setSyncedRecently(true);
      setTimeout(() => {
        if (isMounted) setSyncedRecently(false);
      }, 2500);
    };

    // Fallback version fetcher (used on visibility change, focus, and as safety heartbeat)
    const checkVersion = async () => {
      try {
        const res = await fetch('/api/sync/version', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.version && data.version > lastVersionRef.current) {
          if (lastVersionRef.current === 0) {
            // First baseline check
            lastVersionRef.current = data.version;
          } else {
            applyLiveUpdate(data.version);
          }
        }
      } catch {
        // Silently swallow fetch errors during network changes
      }
    };

    // Connect to Server-Sent Events stream
    const connectSSE = () => {
      if (typeof window === 'undefined' || !window.EventSource) return;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      try {
        const es = new EventSource('/api/sync/stream');
        eventSourceRef.current = es;

        es.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'connected') {
              if (lastVersionRef.current === 0) {
                lastVersionRef.current = data.version || Date.now();
              }
            } else if (data.type === 'update' && data.version) {
              applyLiveUpdate(data.version);
            }
          } catch {
            // Ignore non-json lines or ping keep-alives
          }
        };

        es.onerror = () => {
          es.close();
          eventSourceRef.current = null;
          if (isMounted) {
            // Reconnect after 3 seconds
            reconnectTimeoutRef.current = setTimeout(connectSSE, 3000);
          }
        };
      } catch {
        if (isMounted) {
          reconnectTimeoutRef.current = setTimeout(connectSSE, 4000);
        }
      }
    };

    // 1. Initial connection & baseline check
    void checkVersion();
    connectSSE();

    // 2. Periodic safety heartbeat polling (every 4 seconds)
    const pollInterval = setInterval(() => {
      if (isMounted) void checkVersion();
    }, 4000);

    // 3. Tab visibility listener: when user returns to tab, sync immediately
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isMounted) {
        void checkVersion();
        if (!eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED) {
          connectSSE();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, [router]);

  return (
    <>
      {children}
      {/* Subtle, sleek live-sync pulse indicator in bottom corner */}
      <div
        aria-live="polite"
        className={`fixed bottom-4 right-4 z-50 pointer-events-none transition-all duration-300 transform ${
          syncedRecently
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-2 scale-95'
        }`}
      >
        <div className="flex items-center gap-2 bg-[#0E0620]/90 backdrop-blur-md border border-[#A855F7]/40 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg shadow-purple-900/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live Synced</span>
        </div>
      </div>
    </>
  );
}

