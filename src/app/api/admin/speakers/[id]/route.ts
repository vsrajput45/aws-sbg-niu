import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['pending', 'accepted', 'shortlisted', 'declined']),
  admin_notes: z.string().optional(),
});

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const json = await request.json();
    const parsed = updateSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const updated = db.updateSpeakerProposalStatus(id, parsed.data.status, parsed.data.admin_notes);
    if (!updated) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, proposal: updated });
  } catch (error) {
    console.error('Failed to update speaker proposal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const ok = db.deleteSpeakerProposal(id);
    if (!ok) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete speaker proposal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
