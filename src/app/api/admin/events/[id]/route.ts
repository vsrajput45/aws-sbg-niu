import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { adminEventSchema } from '@/lib/validations';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const event = db.getEventById(id, true);
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  return NextResponse.json({ event });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const existing = db.getEventById(id, true);
  if (!existing) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  try {
    const json = await request.json();
    const validated = adminEventSchema.parse({ ...json, id });

    // Editors cannot publish or modify a published event
    if (session.role === 'editor' && (validated.status === 'published' || existing.status === 'published')) {
      return NextResponse.json({ error: 'Editor role cannot publish or alter published events.' }, { status: 403 });
    }

    const saved = db.saveEvent({
      ...validated,
      id,
    } as Parameters<typeof db.saveEvent>[0]);

    return NextResponse.json({ success: true, event: saved });
  } catch (error: unknown) {
    if (error && typeof error === 'object') {
      if ('issues' in error) {
        const issues = (error as { issues: Array<{ message: string }> }).issues;
        const msg = issues.map((i) => i.message).join(', ');
        return NextResponse.json({ error: msg || 'Validation failed', details: issues }, { status: 400 });
      }
      if ('errors' in error) {
        return NextResponse.json({ error: 'Validation failed', details: (error as { errors: unknown }).errors }, { status: 400 });
      }
    }
    const message = error instanceof Error ? error.message : 'Failed to update event';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden. Admin role required to delete events.' }, { status: 403 });
  }

  const { id } = await params;
  const success = db.deleteEvent(id);
  if (!success) {
    return NextResponse.json({ error: 'Event not found or failed to delete' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
