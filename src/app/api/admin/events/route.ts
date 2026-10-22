import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { adminEventSchema } from '@/lib/validations';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const events = db.getAllEvents(true); // include drafts for admin
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const json = await request.json();
    const validated = adminEventSchema.parse(json);

    // Editors can only create draft events, only Admins can publish
    if (session.role === 'editor' && validated.status === 'published') {
      return NextResponse.json({ error: 'Editor role can only create draft events. Admin required to publish.' }, { status: 403 });
    }

    const saved = db.saveEvent({
      ...validated,
      created_by: session.userId,
    } as Parameters<typeof db.saveEvent>[0]);

    return NextResponse.json({ success: true, event: saved });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'errors' in error) {
      return NextResponse.json({ error: 'Validation failed', details: (error as { errors: unknown }).errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
