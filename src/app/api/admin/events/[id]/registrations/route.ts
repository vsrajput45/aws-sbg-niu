import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { sendEventRegistrationConfirmationEmail } from '@/lib/email';

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
  const event = db.getEventById(id, true);
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  const body = await request.json();
  const { action, registrationId, newStatus } = body;

  const host = request.headers.get('host') || 'aws-sbg-niu.vercel.app';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const badgeRoleMap: Record<string, string> = {
    attendee: 'Official Attendee',
    speaker: 'Featured Speaker',
    sponsor: 'Official Sponsor',
    volunteer: 'Community Volunteer',
  };

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
    if (!updated) {
      return NextResponse.json({ error: 'Registration record not found' }, { status: 404 });
    }

    let emailSent = false;

    // When Admin confirms/approves a registration: generate verified badge and dispatch confirmation email!
    if (newStatus === 'confirmed') {
      const finalBadgeRole = badgeRoleMap[updated.role] || 'Official Attendee';

      try {
        db.createBadgeApplication({
          code: updated.registration_code,
          full_name: updated.full_name,
          email: updated.email,
          role: finalBadgeRole,
          institution: updated.college || 'Noida International University',
          source: 'event_registration',
          event_id: event.id,
          event_title: event.title,
          registration_code: updated.registration_code,
          donation_amount: 0,
          donation_utr: null,
          status: 'verified',
          qr_payload: `${baseUrl}/verify/${updated.registration_code}`,
          access_level: 'Full Event & Workshops Access',
          theme: 'sbg',
          verified_by: session.email || 'Admin',
          verified_at: new Date().toISOString(),
        });
      } catch (badgeErr) {
        console.warn('Could not auto-create badge application on confirm:', badgeErr);
      }

      try {
        const emailResult = await sendEventRegistrationConfirmationEmail({
          registration: updated,
          event,
          baseUrl,
          badgeCode: updated.registration_code,
        });
        emailSent = Boolean(emailResult.success && !emailResult.skipped);
      } catch (emailErr) {
        console.error('[CONFIRM EMAIL DISPATCH ERROR]:', emailErr);
      }
    }

    return NextResponse.json({ 
      success: true, 
      registration: updated,
      emailSent,
      message: newStatus === 'confirmed' 
        ? `Registration confirmed! Official badge pass & code dispatched to ${updated.email}` 
        : `Status changed to ${newStatus}` 
    });
  }

  if (action === 'remove') {
    if (!registrationId) {
      return NextResponse.json({ error: 'Registration ID required' }, { status: 400 });
    }
    const success = db.removeRegistration(registrationId);
    return NextResponse.json({ success });
  }

  if (action === 'promoteWaitlist') {
    const promoteResult = db.promoteWaitlist(id);
    const count = typeof promoteResult === 'number' ? promoteResult : promoteResult.count;
    const promotedList = typeof promoteResult === 'object' && Array.isArray(promoteResult.promoted) ? promoteResult.promoted : [];

    // Dispatch badge pass and confirmation emails for each promoted candidate
    for (const reg of promotedList) {
      const finalBadgeRole = badgeRoleMap[reg.role] || 'Official Attendee';
      try {
        db.createBadgeApplication({
          code: reg.registration_code,
          full_name: reg.full_name,
          email: reg.email,
          role: finalBadgeRole,
          institution: reg.college || 'Noida International University',
          source: 'event_registration',
          event_id: event.id,
          event_title: event.title,
          registration_code: reg.registration_code,
          donation_amount: 0,
          donation_utr: null,
          status: 'verified',
          qr_payload: `${baseUrl}/verify/${reg.registration_code}`,
          access_level: 'Full Event & Workshops Access',
          theme: 'sbg',
          verified_by: session.email || 'Admin',
          verified_at: new Date().toISOString(),
        });

        void sendEventRegistrationConfirmationEmail({
          registration: reg,
          event,
          baseUrl,
          badgeCode: reg.registration_code,
        }).catch((err) => console.error('Failed to email promoted candidate:', err));
      } catch (e) {
        console.warn('Error during waitlist promotion badge creation:', e);
      }
    }

    return NextResponse.json({ success: true, promotedCount: count });
  }

  if (action === 'updatePaymentStatus') {
    const { newPaymentStatus, paymentUtr } = body;
    if (!registrationId || !newPaymentStatus) {
      return NextResponse.json({ error: 'Registration ID and newPaymentStatus required' }, { status: 400 });
    }
    const updated = db.updatePaymentStatus(registrationId, newPaymentStatus, paymentUtr);
    return NextResponse.json({ success: true, registration: updated });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
