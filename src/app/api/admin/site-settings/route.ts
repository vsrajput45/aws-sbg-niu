import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = db.getSiteSettings();
  return NextResponse.json({ success: true, settings });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const json = await request.json();

    if (json.action === 'reset') {
      const reset = db.resetSiteSettings();
      return NextResponse.json({
        success: true,
        message: 'Settings reset to original defaults successfully',
        settings: reset,
      });
    }

    const {
      chapterName,
      shortName,
      tagline,
      universityName,
      campusVenue,
      city,
      fullLocation,
      mapsUrl,
      appleMapsUrl,
      foundedDate,
      memberCountSnapshot,
      snapshotAsOf,
      officialEmail,
      meetupUrl,
      instagramUrl,
      githubUrl,
      linkedinUrl,
      twitterUrl,
      discordUrl,
      upiId,
      upiName,
      upiQrImageUrl,
      speakerInterestForm,
      sponsorForm,
      aboutHeadline,
      aboutDescription,
      marqueeTopics,
    } = json;

    const updated = db.updateSiteSettings({
      ...(chapterName !== undefined && { chapterName: String(chapterName).trim() }),
      ...(shortName !== undefined && { shortName: String(shortName).trim() }),
      ...(tagline !== undefined && { tagline: String(tagline).trim() }),
      ...(universityName !== undefined && { universityName: String(universityName).trim() }),
      ...(campusVenue !== undefined && { campusVenue: String(campusVenue).trim() }),
      ...(city !== undefined && { city: String(city).trim() }),
      ...(fullLocation !== undefined && { fullLocation: String(fullLocation).trim() }),
      ...(mapsUrl !== undefined && { mapsUrl: String(mapsUrl).trim() }),
      ...(appleMapsUrl !== undefined && { appleMapsUrl: String(appleMapsUrl).trim() }),
      ...(foundedDate !== undefined && { foundedDate: String(foundedDate).trim() }),
      ...(memberCountSnapshot !== undefined && { memberCountSnapshot: Number(memberCountSnapshot) || 0 }),
      ...(snapshotAsOf !== undefined && { snapshotAsOf: String(snapshotAsOf).trim() }),
      ...(officialEmail !== undefined && { officialEmail: String(officialEmail).trim() }),
      ...(meetupUrl !== undefined && { meetupUrl: String(meetupUrl).trim() }),
      ...(instagramUrl !== undefined && { instagramUrl: String(instagramUrl).trim() }),
      ...(githubUrl !== undefined && { githubUrl: String(githubUrl).trim() }),
      ...(linkedinUrl !== undefined && { linkedinUrl: String(linkedinUrl).trim() }),
      ...(twitterUrl !== undefined && { twitterUrl: String(twitterUrl).trim() }),
      ...(discordUrl !== undefined && { discordUrl: String(discordUrl).trim() }),
      ...(upiId !== undefined && { upiId: String(upiId).trim() }),
      ...(upiName !== undefined && { upiName: String(upiName).trim() }),
      ...(upiQrImageUrl !== undefined && { upiQrImageUrl: String(upiQrImageUrl).trim() }),
      ...(speakerInterestForm !== undefined && { speakerInterestForm: String(speakerInterestForm).trim() }),
      ...(sponsorForm !== undefined && { sponsorForm: String(sponsorForm).trim() }),
      ...(aboutHeadline !== undefined && { aboutHeadline: String(aboutHeadline).trim() }),
      ...(aboutDescription !== undefined && { aboutDescription: String(aboutDescription).trim() }),
      ...(Array.isArray(marqueeTopics) && {
        marqueeTopics: marqueeTopics.map((t: string) => String(t).trim()).filter(Boolean),
      }),
    });

    return NextResponse.json({
      success: true,
      message: 'Web page details updated successfully!',
      settings: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to update site settings', details: message }, { status: 400 });
  }
}
