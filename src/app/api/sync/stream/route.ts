import { db } from '@/lib/db';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/db/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const encoder = new TextEncoder();
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let isClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      // 1. Initial version dispatch
      let lastVersion = db.getRevision();
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', version: lastVersion })}\n\n`)
      );

      // 2. Heartbeat & Change Detection Interval (runs every 2 seconds)
      intervalId = setInterval(async () => {
        if (isClosed) {
          if (intervalId) clearInterval(intervalId);
          return;
        }

        try {
          let currentVersion = db.getRevision();

          // Check if Supabase has a newer version from another worker / instance
          if (isSupabaseConfigured()) {
            try {
              const supabase = getSupabaseClient();
              if (supabase) {
                const { data } = await supabase
                  .from('app_state')
                  .select('updated_at')
                  .eq('id', 'aws_sbg_niu')
                  .maybeSingle();

                if (data?.updated_at) {
                  const remoteTime = new Date(data.updated_at).getTime();
                  if (!isNaN(remoteTime) && remoteTime > currentVersion) {
                    currentVersion = remoteTime;
                  }
                }
              }
            } catch {
              // Ignore background fetch error
            }
          }

          if (currentVersion > lastVersion) {
            lastVersion = currentVersion;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'update', version: currentVersion })}\n\n`)
            );
          } else {
            // Keep-alive ping
            controller.enqueue(encoder.encode(`: ping\n\n`));
          }
        } catch {
          isClosed = true;
          if (intervalId) clearInterval(intervalId);
          try {
            controller.close();
          } catch {}
        }
      }, 2500);
    },
    cancel() {
      isClosed = true;
      if (intervalId) clearInterval(intervalId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

