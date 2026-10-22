import { db } from '@/lib/db';
import { siteConfig as defaultSiteConfig } from '@/config/site';

export function getLiveSiteConfig() {
  try {
    const custom = db.getSiteSettings();
    if (!custom) return defaultSiteConfig;

    const descriptionParagraphs = custom.aboutDescription
      ? custom.aboutDescription
          .split('\n\n')
          .map((p) => p.trim())
          .filter(Boolean)
      : defaultSiteConfig.aboutSource.descriptionParagraphs;

    return {
      ...defaultSiteConfig,
      chapterName: custom.chapterName || defaultSiteConfig.chapterName,
      shortName: custom.shortName || defaultSiteConfig.shortName,
      tagline: custom.tagline || defaultSiteConfig.tagline,
      universityName: custom.universityName || defaultSiteConfig.universityName,
      campusVenue: custom.campusVenue || defaultSiteConfig.campusVenue,
      city: custom.city || defaultSiteConfig.city,
      fullLocation: custom.fullLocation || defaultSiteConfig.fullLocation,
      mapsUrl: custom.mapsUrl || defaultSiteConfig.mapsUrl,
      appleMapsUrl: custom.appleMapsUrl || defaultSiteConfig.appleMapsUrl,
      foundedDate: custom.foundedDate || defaultSiteConfig.foundedDate,
      memberCountSnapshot: typeof custom.memberCountSnapshot === 'number' ? custom.memberCountSnapshot : defaultSiteConfig.memberCountSnapshot,
      snapshotAsOf: custom.snapshotAsOf || defaultSiteConfig.snapshotAsOf,
      officialEmail: custom.officialEmail || defaultSiteConfig.officialEmail,
      meetupUrl: custom.meetupUrl || defaultSiteConfig.meetupUrl,
      instagramUrl: custom.instagramUrl ?? defaultSiteConfig.instagramUrl,
      githubUrl: custom.githubUrl ?? defaultSiteConfig.githubUrl,
      linkedinUrl: custom.linkedinUrl ?? defaultSiteConfig.linkedinUrl,
      twitterUrl: custom.twitterUrl ?? defaultSiteConfig.twitterUrl,
      discordUrl: custom.discordUrl ?? '',
      aboutSource: {
        ...defaultSiteConfig.aboutSource,
        headline: custom.aboutHeadline || defaultSiteConfig.aboutSource.headline,
        descriptionParagraphs: descriptionParagraphs.length > 0 ? descriptionParagraphs : defaultSiteConfig.aboutSource.descriptionParagraphs,
      },
      formLinks: {
        ...defaultSiteConfig.formLinks,
        speakerInterestForm: custom.speakerInterestForm || defaultSiteConfig.formLinks.speakerInterestForm,
        sponsorForm: custom.sponsorForm || defaultSiteConfig.formLinks.sponsorForm,
      },
      marqueeTopics:
        custom.marqueeTopics && custom.marqueeTopics.length > 0
          ? custom.marqueeTopics
          : defaultSiteConfig.marqueeTopics,
    };
  } catch (error) {
    console.error('Failed to load dynamic site settings, falling back to static config', error);
    return defaultSiteConfig;
  }
}
