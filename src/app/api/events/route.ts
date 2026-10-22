import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const publishedEvents = db.getAllEvents(false); // Only published events
  return NextResponse.json({ events: publishedEvents });
}
