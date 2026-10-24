import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const proposals = db.getSpeakerProposals();
    return NextResponse.json({ proposals });
  } catch (error) {
    console.error('Failed to get speaker proposals:', error);
    return NextResponse.json({ error: 'Failed to retrieve speaker proposals' }, { status: 500 });
  }
}
