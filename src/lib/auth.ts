import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { db } from './db';
import { UserRole } from './db/types';

export interface AuthSession {
  userId: string;
  email: string;
  role: UserRole;
  expiresAt: number;
}

const SESSION_COOKIE_NAME = 'aws_sbg_session';

function getAdminPassword(): string | undefined {
  if (process.env.ADMIN_PASSWORD) {
    return process.env.ADMIN_PASSWORD.replace(/[\u200B-\u200D\uFEFF]/g, '').trim().replace(/^["']|["']$/g, '');
  }
  // Local development fallback: dynamically read .env.local if dev server wasn't restarted
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(/*turbopackIgnore: true*/ envPath)) {
      const content = fs.readFileSync(/*turbopackIgnore: true*/ envPath, 'utf-8');
      const match = content.match(/^ADMIN_PASSWORD=(.*)$/m);
      if (match && match[1]) {
        return match[1].replace(/[\u200B-\u200D\uFEFF]/g, '').trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch {
    // Ignore error
  }
  return undefined;
}

export async function createSession(email: string, role: UserRole): Promise<AuthSession> {
  // Session safety ceiling: 12 hours while browser is open
  const expiresAt = Date.now() + 12 * 60 * 60 * 1000;
  const profile = db.getProfileByEmail(email);

  const session: AuthSession = {
    userId: profile ? profile.id : 'admin-user',
    email,
    role,
    expiresAt,
  };

  const cookieStore = await cookies();
  // Browser Session Cookie: omitting maxAge/expires means cookie is automatically cleared when browser closes
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return session;
}

export async function getSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!cookie || !cookie.value) return null;

    const session: AuthSession = JSON.parse(cookie.value);
    if (Date.now() > session.expiresAt) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function verifyCredentials(email: string, password: string): Promise<{ success: boolean; role?: UserRole; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  
  // Find profile in db, or recognize standard admin aliases
  let profile = db.getProfileByEmail(normalizedEmail);
  if (!profile) {
    const adminEmailEnv = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const isKnownAdmin = 
      normalizedEmail === 'aws@niu.ac.in' ||
      normalizedEmail === 'aws.sbg@niu.ac.in' ||
      normalizedEmail === 'admin@niu.ac.in' ||
      normalizedEmail === 'editor@niu.ac.in' ||
      (adminEmailEnv && normalizedEmail === adminEmailEnv);

    if (isKnownAdmin) {
      profile = {
        id: '00000000-0000-0000-0000-000000000001',
        email: normalizedEmail,
        role: normalizedEmail.includes('editor') ? 'editor' : 'admin',
        created_at: new Date().toISOString(),
      };
    }
  }

  if (!profile) {
    return { success: false, error: 'No admin or editor account found with this email.' };
  }

  const configuredPassword = getAdminPassword();
  if (!configuredPassword) {
    console.error('CRITICAL: ADMIN_PASSWORD environment variable is not configured.');
    return { success: false, error: 'Server authentication configuration missing. Please set ADMIN_PASSWORD in environment variables.' };
  }

  const cleanConfigured = configuredPassword.replace(/[\u200B-\u200D\uFEFF]/g, '').trim().replace(/^["']|["']$/g, '');
  const cleanInput = password.replace(/[\u200B-\u200D\uFEFF]/g, '').trim().replace(/^["']|["']$/g, '');

  // Check password against securely configured environment variable
  if (cleanInput === cleanConfigured) {
    return { success: true, role: profile.role };
  }

  return { success: false, error: 'Invalid password.' };
}
