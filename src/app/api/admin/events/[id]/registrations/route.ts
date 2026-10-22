import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

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

  const registrations = db.getRegistrationsForEvent(id);
  return NextResponse.json({ event, registrations });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { action, registrationId, newStatus } = body;

  if (action === 'toggleCheckIn') {
    if (!registrationId) {
      return NextResponse.json({ error: 'Registration ID required' }, { status: 400 });
    }
    const updated = db.toggleCheckIn(registrationId);
    return NextResponse.json({ success: true, registration: updated });
  }

  if (action === 'updateStatus') {
    if (!registrationId || !newStatus) {
      return NextResponse.json({ error: 'Registration ID and newStatus required' }, { status: 400 });
    }
    const updated = db.updateRegistrationStatus(registrationId, newStatus);
    return NextResponse.json({ success: true, registration: updated });
  }

  if (action === 'remove') {
    if (!registrationId) {
      return NextResponse.json({ error: 'Registration ID required' }, { status: 400 });
    }
    const success = db.removeRegistration(registrationId);
    return NextResponse.json({ success });
  }

  if (action === 'promoteWaitlist') {
    const promotedCount = db.promoteWaitlist(id);
    return NextResponse.json({ success: true, promotedCount });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
