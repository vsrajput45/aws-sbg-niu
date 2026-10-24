import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const cfpSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
  designation: z.string().min(2, 'Designation / job title is required'),
  organization: z.string().min(2, 'Organization / company / university is required'),
  city: z.string().optional(),
  linkedinUrl: z.string().min(5, 'LinkedIn profile link is required'),
  portfolioUrl: z.string().optional(),
  bio: z.string().min(10, 'Please provide a short speaker bio (at least 10 characters)'),
  talkTitle: z.string().min(5, 'Proposed session title is required (at least 5 characters)'),
  track: z.string().min(2, 'Please select a session track'),
  sessionFormat: z.string().min(2, 'Please select a session format'),
  deliveryMode: z.enum(['in_person', 'online', 'flexible']).default('in_person'),
  abstract: z.string().min(20, 'Please describe what student builders will learn (at least 20 characters)'),
  prerequisites: z.string().optional(),
  experienceLinks: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const result = cfpSchema.safeParse(json);

    if (!result.success) {
      const errorMsg = result.error.issues?.[0]?.message || 'Validation failed. Please verify form fields.';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const data = result.data;

    // 1. Create Speaker Proposal Record
    const proposal = db.createSpeakerProposal(data);

    // 2. Pre-register a pending speaker badge in the credential system
    try {
      db.createBadgeApplication({
        full_name: data.fullName,
        email: data.email,
        role: 'Featured Speaker',
        institution: data.organization,
        source: 'event_registration',
        access_level: 'VIP Speaker Pass & All Access',
        theme: 'sbg',
      });
    } catch (e) {
      console.warn('Could not auto-queue speaker badge application:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Speaker proposal submitted successfully.',
      proposal,
      referenceCode: proposal.reference_code,
    });
  } catch (err: unknown) {
    console.error('Error submitting CFP proposal:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while submitting your proposal. Please try again.' },
      { status: 500 }
    );
  }
}
