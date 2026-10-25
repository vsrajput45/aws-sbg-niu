import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    await db.ensureLoaded();
    const session = await getSession();

    if (!session || !session.role) {
      return NextResponse.json(
        { error: 'Organizer authentication required to check in attendees. Please sign in as admin or volunteer.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, action } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Valid pass code is required.' }, { status: 400 });
    }

    const result = db.checkInBadge(code, action === 'undo' ? 'undo' : 'admit');
    if (!result) {
      return NextResponse.json({ error: 'Badge credential not found in registry.' }, { status: 404 });
    }

    try {
      revalidatePath(`/verify/${code}`);
      revalidatePath('/admin/events', 'layout');
      revalidatePath('/admin/badges', 'layout');
    } catch {
      // Ignore cache revalidation edge cases
    }

    return NextResponse.json({
      success: true,
      code: result.badge.code,
      checked_in: result.checked_in,
      checked_in_at: result.checked_in_at,
      previously_checked_in: result.previously_checked_in,
      message: result.checked_in
        ? result.previously_checked_in
          ? 'Attendee was already checked in!'
          : 'Attendee successfully admitted and checked in!'
        : 'Check-in status reverted.',
    });
  } catch (error) {
    console.error('Check-in API error:', error);
    return NextResponse.json({ error: 'Internal server error processing check-in.' }, { status: 500 });
  }
}
