import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const members = db.getTeamMembers();
  return NextResponse.json({ success: true, members });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const json = await request.json();

    // Reset action
    if (json.action === 'reset') {
      const resetMembers = db.resetTeamMembers();
      return NextResponse.json({
        success: true,
        message: 'Core team members reset to initial appointed leads',
        members: resetMembers,
      });
    }

    // Reorder action
    if (json.action === 'reorder' && Array.isArray(json.ids)) {
      db.reorderTeamMembers(json.ids);
      const updatedMembers = db.getTeamMembers();
      return NextResponse.json({
        success: true,
        message: 'Team order updated successfully',
        members: updatedMembers,
      });
    }

    // Add or Edit member
    const {
      id,
      name,
      role,
      department,
      bio,
      avatarUrl,
      cardUrl,
      session: memberSession,
      badge,
      sort_order,
      linkedin_url,
      github_url,
    } = json;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Member full name is required' }, { status: 400 });
    }

    if (!role || typeof role !== 'string' || !role.trim()) {
      return NextResponse.json({ error: 'Role title is required' }, { status: 400 });
    }

    const saved = db.saveTeamMember({
      ...(id ? { id: String(id).trim() } : {}),
      name: name.trim(),
      role: role.trim(),
      department: department ? String(department).trim() : 'Computer Science & Engineering',
      bio: bio ? String(bio).trim() : '',
      avatarUrl: avatarUrl ? String(avatarUrl).trim() : '/sbg-logo.svg',
      cardUrl: cardUrl ? String(cardUrl).trim() : (avatarUrl ? String(avatarUrl).trim() : '/sbg-logo.svg'),
      session: memberSession ? String(memberSession).trim() : '2026-27',
      badge: badge ? String(badge).trim() : 'Leadership Core',
      ...(typeof sort_order === 'number' ? { sort_order } : {}),
      linkedin_url: linkedin_url ? String(linkedin_url).trim() : '',
      github_url: github_url ? String(github_url).trim() : '',
    });

    const currentMembers = db.getTeamMembers();

    return NextResponse.json({
      success: true,
      message: id ? 'Team member updated successfully!' : 'New team member added successfully!',
      member: saved,
      members: currentMembers,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to process team member', details: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    let memberId = searchParams.get('id');

    if (!memberId) {
      try {
        const body = await request.json();
        memberId = body?.id;
      } catch {
        // body might be empty if query param used
      }
    }

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const deleted = db.deleteTeamMember(memberId);
    if (!deleted) {
      return NextResponse.json({ error: 'Member not found or could not be deleted' }, { status: 404 });
    }

    const currentMembers = db.getTeamMembers();
    return NextResponse.json({
      success: true,
      message: 'Member removed from Core Team successfully',
      members: currentMembers,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to delete team member', details: message }, { status: 400 });
  }
}
