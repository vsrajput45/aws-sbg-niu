import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { sendBadgeVerifiedEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await db.ensureLoaded();
    const badges = db.getAllBadges();
    const badge = badges.find((b) => b.id === id || b.code === id);

    if (!badge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    const host = request.headers.get('host') || 'aws-sbg-niu.vercel.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const emailResult = await sendBadgeVerifiedEmail(badge, baseUrl);

    return NextResponse.json({
      success: emailResult.success,
      skipped: emailResult.skipped,
      error: emailResult.error,
      message: emailResult.skipped
        ? 'SMTP not configured in environment variables, but badge details prepared.'
        : `Official pass email dispatched to ${badge.email}!`,
    });
  } catch (error) {
    console.error('Error dispatching badge email:', error);
    return NextResponse.json({ error: 'Failed to dispatch email' }, { status: 500 });
  }
}

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

    const host = request.headers.get('host') || 'aws-sbg-niu.vercel.app';
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

    // Automatically send verified badge pass email to the user if badge is verified
    if (updated.status === 'verified' && updated.code) {
      void sendBadgeVerifiedEmail(updated, baseUrl).catch((err) => {
        console.error('Background badge email dispatch error:', err);
      });
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
