import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      photo_url, 
      theme = 'sbg', 
      access_level = 'Full Conference & Workshops'
    } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const host = request.headers.get('host') || 'aws-sbg-niu.vercel.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // 1. Strictly verify that the candidate is registered for an event
    const registration = db.getRegistrationByEmail(cleanEmail);
    if (!registration) {
      return NextResponse.json({ 
        error: 'Badge sirf event registered candidates ko hi mil sakta hai. Bina event register kiye badge generate nahi ho sakta. Pehle kisi upcoming event ke liye register karein.',
        notRegistered: true,
      }, { status: 403 });
    }

    // 2. Strictly enforce 1 badge per registered email (no duplicates allowed)
    const existing = db.getBadgeByEmail(cleanEmail);
    if (existing && existing.code) {
      return NextResponse.json({
        success: true,
        alreadyIssued: true,
        badge: existing,
        message: 'Aapka official event pass already generate ho chuka hai (1 email se sirf 1 badge allow hai).',
      });
    }

    const event = db.getEventById(registration.event_id, true);
    const roleMap: Record<string, string> = {
      attendee: 'Official Attendee',
      speaker: 'Featured Speaker',
      sponsor: 'Official Sponsor',
      volunteer: 'Community Volunteer',
    };

    const finalRole = roleMap[registration.role] || 'Official Attendee';
    const finalName = registration.full_name;
    const finalInstitution = registration.college || 'Noida International University';
    const assignedCode = registration.registration_code;
    const qrPayload = `${baseUrl}/verify/${assignedCode}`;

    const badge = db.createBadgeApplication({
      code: assignedCode,
      full_name: finalName,
      email: cleanEmail,
      role: finalRole,
      institution: finalInstitution,
      photo_url: photo_url || null,
      source: 'event_registration',
      event_id: registration.event_id,
      event_title: event?.title || 'AWS SBG Official Event',
      registration_code: registration.registration_code,
      donation_amount: 0,
      donation_utr: null,
      status: 'verified',
      qr_payload: qrPayload,
      access_level,
      theme,
      verified_by: 'Auto (Event Registration)',
      verified_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      badge,
      message: 'Official conference badge verified and generated successfully!',
    });
  } catch (error) {
    console.error('Error generating badge:', error);
    return NextResponse.json({ error: 'Failed to process badge generation' }, { status: 500 });
  }
}
