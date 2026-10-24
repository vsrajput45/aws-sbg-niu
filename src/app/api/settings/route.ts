import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const settings = db.getSiteSettings();
    return NextResponse.json({
      chapterName: settings.chapterName,
      shortName: settings.shortName,
      officialEmail: settings.officialEmail,
      upiId: settings.upiId || 'aws-sbg@niu',
      upiName: settings.upiName || 'AWS SBG NIU',
      upiQrImageUrl: settings.upiQrImageUrl || null,
    });
  } catch (error) {
    console.error('Failed to get public site settings:', error);
    return NextResponse.json({
      upiId: 'aws-sbg@niu',
      upiName: 'AWS SBG NIU',
      upiQrImageUrl: null,
    });
  }
}
