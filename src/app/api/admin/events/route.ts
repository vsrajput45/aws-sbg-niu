import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { adminEventSchema } from '@/lib/validations';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await db.ensureLoaded();
  const events = db.getAllEvents(true); // include drafts for admin
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await db.ensureLoaded();
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

    revalidatePath('/', 'layout');
    revalidatePath('/events');
    revalidatePath(`/events/${saved.slug}`);
    revalidatePath('/admin');
    revalidatePath('/admin/events');

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
    const message = error instanceof Error ? error.message : 'Failed to create event';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
