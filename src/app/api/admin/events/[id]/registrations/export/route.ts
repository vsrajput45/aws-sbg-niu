import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized. Admin role required to export CSV.' }, { status: 403 });
  }

  const { id } = await params;
  const event = db.getEventById(id, true);
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  const registrations = db.getRegistrationsForEvent(id);

  const headers = [
    'Registration Code',
    'Role',
    'Full Name',
    'Email',
    'Phone',
    'College / Company',
    'Course / Year / Designation',
    'College ID',
    'Status',
    'Payment Status',
    'Payment UTR',
    'Checked In',
    'Checked In At',
    'Speaker Talk Title',
    'Speaker Abstract',
    'Speaker Bio',
    'Portfolio / LinkedIn',
    'Sponsor Company',
    'Sponsor Website',
    'Sponsor Tier',
    'Sponsorship Notes',
    'Volunteer Domain',
    'Volunteer Experience',
    'How Heard',
    'Registration Date',
    'Custom Answers',
  ];

  const rows = registrations.map((r) => [
    escapeCsv(r.registration_code),
    escapeCsv(r.role || 'attendee'),
    escapeCsv(r.full_name),
    escapeCsv(r.email),
    escapeCsv(r.phone),
    escapeCsv(r.role === 'sponsor' ? r.company_name || r.college : r.college),
    escapeCsv(r.role === 'sponsor' || r.role === 'speaker' ? r.designation || r.course_year : r.course_year),
    escapeCsv(r.college_id || ''),
    escapeCsv(r.status),
    escapeCsv(r.payment_status || 'verified'),
    escapeCsv(r.payment_utr || ''),
    escapeCsv(r.checked_in ? 'Yes' : 'No'),
    escapeCsv(r.checked_in_at || ''),
    escapeCsv(r.topic_title || ''),
    escapeCsv(r.topic_abstract || ''),
    escapeCsv(r.speaker_bio || ''),
    escapeCsv(r.portfolio_or_linkedin || ''),
    escapeCsv(r.company_name || ''),
    escapeCsv(r.company_website || ''),
    escapeCsv(r.sponsor_tier_interest || ''),
    escapeCsv(r.sponsorship_notes || ''),
    escapeCsv(r.volunteer_interest || ''),
    escapeCsv(r.volunteer_experience || ''),
    escapeCsv(r.hear_about),
    escapeCsv(r.created_at),
    escapeCsv(JSON.stringify(r.custom_answers)),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const filename = `registrations-${event.slug}-${new Date().toISOString().split('T')[0]}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
