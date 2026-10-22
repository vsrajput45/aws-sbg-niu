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
    'Full Name',
    'Email',
    'Phone',
    'College',
    'Course & Year',
    'College ID',
    'Status',
    'Checked In',
    'Checked In At',
    'How Heard',
    'Registration Date',
    'Custom Answers',
  ];

  const rows = registrations.map((r) => [
    escapeCsv(r.registration_code),
    escapeCsv(r.full_name),
    escapeCsv(r.email),
    escapeCsv(r.phone),
    escapeCsv(r.college),
    escapeCsv(r.course_year),
    escapeCsv(r.college_id || ''),
    escapeCsv(r.status),
    escapeCsv(r.checked_in ? 'Yes' : 'No'),
    escapeCsv(r.checked_in_at || ''),
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
