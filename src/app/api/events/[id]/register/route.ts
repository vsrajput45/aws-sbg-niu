import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { publicRegistrationSchema } from '@/lib/validations';

// In-memory sliding window rate limiter (max 5 attempts per IP per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) {
    return false;
  }
  entry.count += 1;
  return true;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many registration requests. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Honeypot check for spam bots
    if (body.website_trap && body.website_trap.length > 0) {
      return NextResponse.json({ error: 'Spam detected.' }, { status: 400 });
    }

    // Zod validation
    const validation = publicRegistrationSchema.safeParse({
      ...body,
      eventId: id,
    });

    if (!validation.success) {
      const errorMsg = validation.error.issues.map((e) => e.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const data = validation.data;

    // Verify event exists & published
    const event = db.getEventById(id, false);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found or registration is not open to the public.' },
        { status: 404 }
      );
    }

    // Process registration deterministically
    const result = db.createRegistration({
      eventId: id,
      role: data.role,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      college: data.college,
      courseYear: data.courseYear,
      collegeId: data.collegeId,
      hearAbout: data.hearAbout,
      customAnswers: data.customAnswers as Record<string, string> | undefined,

      // Role fields
      topicTitle: data.topicTitle,
      topicAbstract: data.topicAbstract,
      speakerBio: data.speakerBio,
      portfolioOrLinkedin: data.portfolioOrLinkedin,
      previousSpeakingLinks: data.previousSpeakingLinks,

      companyName: data.companyName,
      companyWebsite: data.companyWebsite,
      sponsorTierInterest: data.sponsorTierInterest,
      designation: data.designation,
      sponsorshipNotes: data.sponsorshipNotes,

      volunteerInterest: data.volunteerInterest,
      volunteerExperience: data.volunteerExperience,

      paymentUtr: data.paymentUtr,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    if (result.alreadyRegistered && result.registration) {
      return NextResponse.json({
        success: true,
        alreadyRegistered: true,
        message: `You're already registered as ${result.registration.role || 'an attendee'} for this event!`,
        registration: {
          code: result.registration.registration_code,
          role: result.registration.role || 'attendee',
          status: result.registration.status,
          fullName: result.registration.full_name,
          email: result.registration.email,
          createdAt: result.registration.created_at,
          eventTitle: event.title,
          eventDate: event.event_date,
          startTime: event.start_time,
          venue: event.venue_name || event.platform,
          joinLink: result.registration.status === 'confirmed' ? event.join_link : null,
        },
      });
    }

    const reg = result.registration!;
    
    // Calculate waitlist position if applicable (attendees only)
    let waitlistPosition: number | null = null;
    if (reg.status === 'waitlisted') {
      const allRegs = db.getRegistrationsForEvent(id);
      const waitlistQueue = allRegs
        .filter((r) => (r.role || 'attendee') === 'attendee' && r.status === 'waitlisted')
        .sort((a, b) => a.created_at.localeCompare(b.created_at));
      waitlistPosition = waitlistQueue.findIndex((r) => r.id === reg.id) + 1;
    }

    return NextResponse.json({
      success: true,
      registration: {
        code: reg.registration_code,
        role: reg.role,
        status: reg.status,
        fullName: reg.full_name,
        email: reg.email,
        createdAt: reg.created_at,
        eventTitle: event.title,
        eventDate: event.event_date,
        startTime: event.start_time,
        venue: event.venue_name || event.platform,
        waitlistPosition,
        // Online join link is shared ONLY with confirmed registrants!
        joinLink: reg.status === 'confirmed' ? event.join_link : null,
      },
    });
  } catch (error) {
    console.error('Registration processing error:', error);
    return NextResponse.json({ error: 'Failed to process registration.' }, { status: 500 });
  }
}
