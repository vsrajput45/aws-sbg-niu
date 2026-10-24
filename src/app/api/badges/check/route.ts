import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email')?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if the candidate is already registered for any event
    const registration = db.getRegistrationByEmail(email);
    const allRegistrations = db.getAllRegistrations().filter((r) => r.email.toLowerCase() === email);

    // Also check if they already have an issued badge
    const existingBadge = db.getBadgeByEmail(email);

    const siteSettings = db.getSiteSettings();
    const upiDetails = {
      upi_id: siteSettings.upiId || 'aws-sbg@niu',
      upi_name: siteSettings.upiName || 'AWS SBG NIU',
      upi_qr_image_url: siteSettings.upiQrImageUrl || null,
    };

    if (registration || allRegistrations.length > 0) {
      const activeReg = registration || allRegistrations[0];
      const event = db.getEventById(activeReg.event_id, true);

      return NextResponse.json({
        registered: true,
        eligibleForFreeBadge: true,
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
        ...upiDetails,
        message: 'Congratulations! You are an active registered event participant. Your official conference badge is 100% FREE.',
      });
    }

    return NextResponse.json({
      registered: false,
      eligibleForFreeBadge: false,
      source: 'community_donation',
      existingBadge: existingBadge || null,
      minDonation: 49,
      suggestedDonations: [49, 99, 199],
      ...upiDetails,
      message: 'Not currently registered for an upcoming event. You can claim an official Community Supporter Pass with a nominal community donation to support student cloud initiatives.',
    });
  } catch (error) {
    console.error('Error checking badge eligibility:', error);
    return NextResponse.json({ error: 'Failed to verify eligibility' }, { status: 500 });
  }
}
