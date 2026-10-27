import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { sendTestEmail } from '@/lib/email';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const json = await request.json();
    const testEmail = String(json.testEmail || session.email || '').trim();

    if (!testEmail || !testEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Valid test recipient email is required.' },
        { status: 400 }
      );
    }

    const {
      candidateSenderEmail,
      candidateSenderName,
      candidateReplyToEmail,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      smtpSecure,
    } = json;

    const result = await sendTestEmail(testEmail, {
      ...(candidateSenderEmail && { candidateSenderEmail: String(candidateSenderEmail).trim().toLowerCase() }),
      ...(candidateSenderName && { candidateSenderName: String(candidateSenderName).trim() }),
      ...(candidateReplyToEmail && { candidateReplyToEmail: String(candidateReplyToEmail).trim().toLowerCase() }),
      ...(smtpHost && { smtpHost: String(smtpHost).trim() }),
      ...(smtpPort && { smtpPort: Number(smtpPort) || 465 }),
      ...(smtpUser && { smtpUser: String(smtpUser).trim() }),
      ...(smtpPass && smtpPass !== '••••••••' && { smtpPass: String(smtpPass).trim() }),
      ...(smtpSecure !== undefined && { smtpSecure: Boolean(smtpSecure) }),
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to dispatch test email',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test email successfully dispatched to ${testEmail}!`,
      messageId: result.messageId,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error during test email';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
