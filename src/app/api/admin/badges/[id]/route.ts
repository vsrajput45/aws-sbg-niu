import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, code } = body;

    const host = request.headers.get('host') || 'aws-sbg-niu.ac.in';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    let updated;
    if (code) {
      // Admin is generating or updating the official pass code
      updated = db.issueBadgeCode(id, code, session.email, baseUrl);
    } else if (status) {
      if (!['verified', 'pending', 'revoked'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updated = db.updateBadgeStatus(id, status, session.email, undefined, baseUrl);
    } else {
      return NextResponse.json({ error: 'Status or pass code is required' }, { status: 400 });
    }

    if (!updated) {
      return NextResponse.json({ error: 'Badge application not found' }, { status: 404 });
    }

    revalidatePath('/', 'layout');
    revalidatePath('/badge');
    revalidatePath('/admin/badges');

    return NextResponse.json({ success: true, badge: updated });
  } catch (error) {
    console.error('Error updating badge:', error);
    return NextResponse.json({ error: 'Failed to update badge' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const deleted = db.deleteBadge(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    revalidatePath('/', 'layout');
    revalidatePath('/badge');
    revalidatePath('/admin/badges');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting badge:', error);
    return NextResponse.json({ error: 'Failed to delete badge' }, { status: 500 });
  }
}
