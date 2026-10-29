import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/db/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  let version = db.getRevision();

  // If Supabase is configured, check if a newer cloud update exists
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
          if (!isNaN(remoteTime) && remoteTime > version) {
            version = remoteTime;
          }
        }
      }
    } catch {
      // Return memory revision on cloud query failure
    }
  }

  return NextResponse.json(
    {
      version,
      timestamp: new Date(version).toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}
