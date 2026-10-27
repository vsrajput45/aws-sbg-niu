import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email')?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if candidate is registered for any event
    const registration = db.getRegistrationByEmail(email);
    const allRegistrations = db.getAllRegistrations().filter((r) => r.email.toLowerCase() === email);

    // Also check if they already have an issued badge (1 email = 1 badge limit)
    const existingBadge = db.getBadgeByEmail(email);

    if (registration || allRegistrations.length > 0) {
      const activeReg = registration || allRegistrations[0];
      const event = db.getEventById(activeReg.event_id, true);

      return NextResponse.json({
        registered: true,
        source: 'event_registration',
        registration: {
          id: activeReg.id,
          code: activeReg.registration_code,
          full_name: activeReg.full_name,
          email: activeReg.email,
          role: activeReg.role,
          college: activeReg.college,
          event_id: activeReg.event_id,
          event_title: event?.title || 'AWS SBG Official Event',
        },
        existingBadge: existingBadge || null,
        message: existingBadge?.code
          ? `Event registration confirmed. Official badge pass is active: ${existingBadge.code}`
          : 'Event registration confirmed! You are authorized to generate your official pass (Limit: 1 badge per candidate).',
      });
    }

    return NextResponse.json({
      registered: false,
      existingBadge: null,
      message: 'Badge sirf event registered candidates ko hi mil sakta hai. Bina event register kiye badge generate nahi ho sakta. Kripya pehle event ke liye register karein.',
    });
  } catch (error) {
    console.error('Error checking badge eligibility:', error);
    return NextResponse.json({ error: 'Failed to verify eligibility' }, { status: 500 });
  }
}
