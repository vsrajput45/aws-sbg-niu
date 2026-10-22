import { NextResponse } from 'next/server';
import { verifyCredentials, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const verification = await verifyCredentials(email, password);
    if (!verification.success || !verification.role) {
      return NextResponse.json({ error: verification.error || 'Authentication failed.' }, { status: 401 });
    }

    const session = await createSession(email, verification.role);

    return NextResponse.json({
      success: true,
      user: {
        email: session.email,
        role: session.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error during authentication.' }, { status: 500 });
  }
}
