import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import { db } from './db';
import { BadgeApplicationRecord, EventRecord, RegistrationRecord, SiteSettingsRecord } from './db/types';
import { generateOfficialBadgePng } from './badgeGenerator';

interface SendBadgeEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
}

export interface SendEventRegistrationEmailParams {
  registration: RegistrationRecord;
  event: EventRecord;
  baseUrl?: string;
  badgeCode: string;
}

/**
 * Configure SMTP transporter using database site settings or environment variables fallback.
 */
export function getEmailTransporter(overrideConfig?: Partial<SiteSettingsRecord>) {
  const settings = db.getSiteSettings();

  const user = (
    overrideConfig?.smtpUser ||
    settings.smtpUser ||
    process.env.SMTP_USER ||
    overrideConfig?.candidateSenderEmail ||
    settings.candidateSenderEmail ||
    ''
  ).trim();

  const pass = (
    overrideConfig?.smtpPass ||
    settings.smtpPass ||
    process.env.SMTP_PASS ||
    ''
  ).trim();

  if (!user || !pass) {
    console.warn(`[EMAIL DISPATCH WARNING] SMTP credentials incomplete: user=${user ? user : '<missing>'}, pass=${pass ? '<set>' : '<missing>'}`);
    return null;
  }

  const host = (
    overrideConfig?.smtpHost ||
    settings.smtpHost ||
    process.env.SMTP_HOST ||
    'smtp.gmail.com'
  ).trim();

  const port =
    overrideConfig?.smtpPort ||
    settings.smtpPort ||
    parseInt(process.env.SMTP_PORT || '465', 10);

  const isSecure =
    overrideConfig?.smtpSecure !== undefined
      ? Boolean(overrideConfig.smtpSecure)
      : settings.smtpSecure !== undefined
      ? Boolean(settings.smtpSecure)
      : port === 465 || process.env.SMTP_SECURE === 'true';

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Resolves candidate email sender configuration set by Admin in Site Settings.
 */
export function getSenderEmailConfig(overrideConfig?: Partial<SiteSettingsRecord>) {
  const settings = db.getSiteSettings();

  const senderEmail = (
    overrideConfig?.candidateSenderEmail ||
    settings.candidateSenderEmail ||
    process.env.SMTP_FROM_EMAIL ||
    process.env.SMTP_USER ||
    settings.officialEmail ||
    'aws.sbg@niu.ac.in'
  ).trim();

  const senderName = (
    overrideConfig?.candidateSenderName ||
    settings.candidateSenderName ||
    process.env.SMTP_FROM_NAME ||
    settings.shortName ||
    'AWS SBG NIU'
  ).trim();

  const replyTo = (
    overrideConfig?.candidateReplyToEmail ||
    settings.candidateReplyToEmail ||
    senderEmail
  ).trim();

  const from = `"${senderName}" <${senderEmail}>`;

  return {
    senderEmail,
    senderName,
    replyTo,
    from,
  };
}

/**
 * Generates official AWS SBG branded HTML email for verified badge passes.
 */
function generateBadgeEmailHtml(badge: BadgeApplicationRecord, baseUrl: string): string {
  const code = badge.code || 'PENDING';
  const cleanBase = baseUrl.replace(/\/$/, '');
  const verifyUrl = `${cleanBase}/verify/${code}`;
  const badgeStudioUrl = `${cleanBase}/badge?email=${encodeURIComponent(badge.email)}&name=${encodeURIComponent(badge.full_name)}&role=${encodeURIComponent(badge.role)}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Official AWS Student Builder Pass</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #080512;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #E2E8F0;
    }
    .wrapper {
      width: 100%;
      background-color: #080512;
      padding: 40px 10px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #0E0922;
      border: 1px solid #281C4C;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }
    .header-banner {
      background: linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #FF9900 100%);
      padding: 4px;
    }
    .header-content {
      background-color: #0E0922;
      padding: 30px 30px 20px 30px;
      text-align: center;
    }
    .brand-pill {
      display: inline-block;
      padding: 6px 14px;
      background: rgba(255, 153, 0, 0.15);
      border: 1px solid rgba(255, 153, 0, 0.4);
      border-radius: 9999px;
      color: #FFAA22;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 14px;
    }
    .headline {
      font-size: 24px;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0 0 10px 0;
      line-height: 1.3;
    }
    .subtext {
      font-size: 14px;
      color: #94A3B8;
      margin: 0;
      line-height: 1.5;
    }
    .card-body {
      padding: 10px 30px 30px 30px;
    }
    .credential-box {
      background-color: #150F33;
      border: 1px solid #3B286D;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 25px;
      text-align: center;
    }
    .status-badge {
      display: inline-block;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #34D399;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .delegate-name {
      font-size: 22px;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0 0 6px 0;
    }
    .delegate-role {
      display: inline-block;
      background: linear-gradient(90deg, #8B5CF6, #FF9900);
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 800;
      padding: 3px 12px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 18px;
    }
    .qr-container {
      margin: 16px auto;
      text-align: center;
    }
    .qr-frame {
      display: inline-block;
      padding: 12px;
      background: #FFFFFF;
      border-radius: 16px;
      border: 3px solid #FF9900;
      box-shadow: 0 6px 20px rgba(255, 153, 0, 0.25);
    }
    .details-table {
      width: 100%;
      border-top: 1px solid #2B1D54;
      padding-top: 14px;
      text-align: left;
      font-size: 12px;
      margin-top: 16px;
    }
    .details-row {
      padding: 6px 0;
    }
    .label {
      color: #94A3B8;
      width: 40%;
    }
    .value {
      color: #F1F5F9;
      font-weight: 600;
    }
    .code-value {
      color: #FF9900;
      font-family: 'Courier New', Courier, monospace;
      font-weight: 700;
      font-size: 14px;
    }
    .cta-btn-primary {
      display: block;
      background: linear-gradient(90deg, #FF9900, #FFAA22);
      color: #0A0A0A !important;
      font-weight: 800;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      text-decoration: none;
      text-align: center;
      padding: 14px 24px;
      border-radius: 12px;
      margin-bottom: 12px;
      box-shadow: 0 4px 15px rgba(255, 153, 0, 0.3);
    }
    .cta-btn-secondary {
      display: block;
      background-color: #1A133D;
      border: 1px solid #412D7A;
      color: #E2E8F0 !important;
      font-weight: 600;
      font-size: 13px;
      text-decoration: none;
      text-align: center;
      padding: 12px 20px;
      border-radius: 12px;
    }
    .instructions {
      background-color: #0B081A;
      border: 1px solid #231644;
      border-radius: 12px;
      padding: 16px;
      margin-top: 25px;
      font-size: 12px;
      color: #94A3B8;
      line-height: 1.6;
    }
    .instructions strong {
      color: #E2E8F0;
    }
    .footer {
      border-top: 1px solid #1C1338;
      padding: 24px 30px;
      text-align: center;
      font-size: 11px;
      color: #64748B;
      line-height: 1.5;
    }
    .footer a {
      color: #FF9900;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header-banner"></div>
      
      <div class="header-content">
        <div class="brand-pill">AWS Student Builder Group • NIU</div>
        <h1 class="headline">Official Pass Verified &amp; Ready! 🎉</h1>
        <p class="subtext">Your credential for AWS Student Builder Group at Noida International University has been officially issued by the organizers.</p>
      </div>

      <div class="card-body">
        <!-- Complete Official Badge Pass Card -->
        <div style="text-align: center; margin: 10px 0 24px 0;">
          <div class="status-badge" style="margin-bottom: 14px;">✓ Official Digital Credential Pass Issued</div>
          
          <div style="border-radius: 20px; overflow: hidden; border: 2px solid #5A2B9A; box-shadow: 0 16px 45px rgba(0, 0, 0, 0.75), 0 0 25px rgba(168, 85, 247, 0.25); max-width: 480px; margin: 0 auto; background-color: #0E0720;">
            <img src="cid:official-delegate-badge" alt="Official AWS Student Builder Pass - ${badge.full_name}" width="480" style="display: block; width: 100%; height: auto; max-width: 480px; border: 0;" />
          </div>

          <p style="font-size: 11px; color: #94A3B8; margin-top: 10px;">
            Save this badge pass image or screenshot it on your mobile device for direct gate entry.
          </p>
        </div>

        <div class="credential-box">
          <h2 class="delegate-name" style="margin-top: 0;">${badge.full_name}</h2>
          <div class="delegate-role">${badge.role}</div>

          <table class="details-table" cellpadding="0" cellspacing="0">
            <tr>
              <td class="label details-row">Pass Code:</td>
              <td class="value code-value details-row">* ${code} *</td>
            </tr>
            <tr>
              <td class="label details-row">Attendee Name:</td>
              <td class="value details-row">${badge.full_name}</td>
            </tr>
            <tr>
              <td class="label details-row">Affiliation:</td>
              <td class="value details-row">${badge.institution || 'Noida International University'}</td>
            </tr>
            ${badge.event_title ? `
            <tr>
              <td class="label details-row">Event:</td>
              <td class="value details-row">${badge.event_title}</td>
            </tr>` : ''}
            <tr>
              <td class="label details-row">Credential Status:</td>
              <td class="value details-row" style="color: #34D399; font-weight: bold;">Verified &amp; Active</td>
            </tr>
            <tr>
              <td class="label details-row">Cloud Region:</td>
              <td class="value details-row">ap-south-1 (Delhi NCR)</td>
            </tr>
          </table>
        </div>

        <a href="${verifyUrl}" class="cta-btn-primary" target="_blank">
          View &amp; Download Digital Badge &rarr;
        </a>

        <!-- Photo Customization Callout Box -->
        <div style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(255, 153, 0, 0.12) 100%); border: 1.5px dashed #A855F7; border-radius: 18px; padding: 22px 20px; margin: 24px 0; text-align: center;">
          <div style="font-size: 26px; line-height: 1; margin-bottom: 8px;">📸 ✨</div>
          <div style="font-size: 16px; font-weight: 800; color: #FFFFFF; margin-bottom: 6px;">
            Apni Photo / Picture Ke Sath Badge Pass Banayein!
          </div>
          <p style="font-size: 13.5px; color: #D8B4FE; line-height: 1.6; margin: 0 0 16px 0;">
            Agar aap apne badge par apni <strong>Photo (DP/Picture)</strong> lagana chahte hain, toh hamari official website ke Badge Studio me jakar apne verified email (<strong style="color: #FFAA22;">${badge.email}</strong>) se instant customize karke print-ready badge pass download kar sakte hain!
          </p>
          <a href="${badgeStudioUrl}" style="display: inline-block; background: linear-gradient(90deg, #A855F7, #EC4899, #FF9900); color: #FFFFFF !important; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; padding: 12px 26px; border-radius: 12px; box-shadow: 0 6px 20px rgba(168, 85, 247, 0.4);">
            🎨 Customize Badge With Photo &rarr;
          </a>
        </div>

        <a href="${badgeStudioUrl}" class="cta-btn-secondary" target="_blank">
          Customize in Badge Studio &rarr;
        </a>

        <div class="instructions">
          <strong>Gate Admission Instructions:</strong><br>
          • Save this email or screenshot the QR pass on your smartphone.<br>
          • Present the digital pass or printed copy at the entrance registration desk for check-in.<br>
          • Please carry your student / organization photo ID for quick identity verification.<br>
          • This pass is single-admission and validated cryptographically.
        </div>
      </div>

      <div class="footer">
        AWS Student Builder Group at Noida International University<br>
        Greater Noida, Uttar Pradesh, Delhi NCR, India<br>
        Questions? Contact us at <a href="mailto:aws.sbg@niu.ac.in">aws.sbg@niu.ac.in</a><br>
        <span style="font-size: 10px; color: #475569; margin-top: 8px; display: block;">
          Automated official credential dispatch. Please do not forward your private pass link to others.
        </span>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Generates official AWS SBG branded HTML email for event registration confirmation with attendee badge & QR code.
 */
function generateEventRegistrationEmailHtml(params: {
  registration: RegistrationRecord;
  event: EventRecord;
  baseUrl: string;
  badgeCode: string;
}): string {
  const { registration, event, baseUrl, badgeCode } = params;
  const cleanBase = baseUrl.replace(/\/$/, '');
  const verifyUrl = `${cleanBase}/verify/${badgeCode}`;
  const badgeStudioUrl = `${cleanBase}/badge?email=${encodeURIComponent(registration.email)}&name=${encodeURIComponent(registration.full_name)}&role=${encodeURIComponent(registration.role)}`;

  const roleMap: Record<string, string> = {
    attendee: 'Official Attendee',
    speaker: 'Featured Speaker',
    sponsor: 'Official Sponsor',
    volunteer: 'Community Volunteer',
  };
  const roleDisplay = roleMap[registration.role] || registration.role.toUpperCase();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Registration Confirmed - ${event.title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #070514;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #E2E8F0;
    }
    .wrapper {
      width: 100%;
      background-color: #070514;
      padding: 35px 12px;
    }
    .container {
      max-width: 620px;
      margin: 0 auto;
      background-color: #0E0922;
      border: 1px solid #2B1D52;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    .header-banner {
      background: linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #FF9900 100%);
      padding: 5px;
    }
    .header-content {
      background: radial-gradient(circle at top center, #1B133E 0%, #0E0922 100%);
      padding: 32px 30px 24px 30px;
      text-align: center;
      border-bottom: 1px solid #21143D;
    }
    .brand-pill {
      display: inline-block;
      padding: 6px 14px;
      background: rgba(255, 153, 0, 0.12);
      border: 1px solid rgba(255, 153, 0, 0.35);
      border-radius: 9999px;
      color: #FFAA22;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 14px;
    }
    .headline {
      font-size: 26px;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0 0 10px 0;
      line-height: 1.25;
    }
    .subtext {
      font-size: 14px;
      color: #94A3B8;
      margin: 0;
      line-height: 1.5;
    }
    .card-body {
      padding: 24px 30px 32px 30px;
    }
    /* Event Info Highlights Box */
    .event-info-box {
      background-color: #130E2E;
      border: 1px solid #2D1E5A;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .event-title {
      font-size: 18px;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0 0 12px 0;
    }
    .event-detail-item {
      font-size: 13px;
      color: #CBD5E1;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .event-detail-item strong {
      color: #FFAA22;
      min-width: 65px;
      display: inline-block;
    }
    /* Official Badge Pass Box */
    .badge-card {
      background: linear-gradient(180deg, #18113C 0%, #100B28 100%);
      border: 1.5px solid #FF9900;
      border-radius: 20px;
      padding: 24px 20px;
      margin-bottom: 26px;
      text-align: center;
      box-shadow: 0 8px 30px rgba(255, 153, 0, 0.15);
    }
    .badge-status {
      display: inline-block;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #34D399;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 14px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .delegate-name {
      font-size: 22px;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0 0 6px 0;
    }
    .delegate-role {
      display: inline-block;
      background: linear-gradient(90deg, #8B5CF6, #FF9900);
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 800;
      padding: 3px 12px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 18px;
    }
    .qr-container {
      margin: 16px auto;
      text-align: center;
    }
    .qr-frame {
      display: inline-block;
      padding: 12px;
      background: #FFFFFF;
      border-radius: 16px;
      border: 3px solid #FF9900;
      box-shadow: 0 6px 20px rgba(255, 153, 0, 0.25);
    }
    .pass-code-banner {
      margin-top: 10px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 15px;
      color: #FFAA22;
      font-weight: 800;
      letter-spacing: 2px;
    }
    .details-table {
      width: 100%;
      border-top: 1px solid #2B1D54;
      padding-top: 14px;
      text-align: left;
      font-size: 12px;
      margin-top: 16px;
    }
    .details-row {
      padding: 6px 0;
    }
    .label {
      color: #94A3B8;
      width: 38%;
    }
    .value {
      color: #F1F5F9;
      font-weight: 600;
    }
    .cta-btn-primary {
      display: block;
      background: linear-gradient(90deg, #FF9900, #FFAA22);
      color: #0A0A0A !important;
      font-weight: 800;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      text-decoration: none;
      text-align: center;
      padding: 15px 24px;
      border-radius: 12px;
      margin-bottom: 12px;
      box-shadow: 0 4px 18px rgba(255, 153, 0, 0.35);
    }
    .cta-btn-secondary {
      display: block;
      background-color: #1A133D;
      border: 1px solid #412D7A;
      color: #E2E8F0 !important;
      font-weight: 600;
      font-size: 13px;
      text-decoration: none;
      text-align: center;
      padding: 12px 20px;
      border-radius: 12px;
    }
    .guidelines {
      background-color: #0B081A;
      border: 1px solid #231644;
      border-radius: 14px;
      padding: 18px;
      margin-top: 26px;
      font-size: 12px;
      color: #94A3B8;
      line-height: 1.6;
    }
    .guidelines strong {
      color: #E2E8F0;
    }
    .footer {
      border-top: 1px solid #1C1338;
      padding: 24px 30px;
      text-align: center;
      font-size: 11px;
      color: #64748B;
      line-height: 1.5;
    }
    .footer a {
      color: #FF9900;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header-banner"></div>
      
      <!-- Header -->
      <div class="header-content">
        <div class="brand-pill">AWS Student Builder Group • NIU</div>
        <h1 class="headline">You're Registered! 🎉</h1>
        <p class="subtext">
          Thank you for registering for <strong>${event.title}</strong>. Your official entry pass and conference credential are confirmed below.
        </p>
      </div>

      <div class="card-body">
        <!-- Event Overview Box -->
        <div class="event-info-box">
          <h2 class="event-title">📅 Event Schedule &amp; Venue</h2>
          <div class="event-detail-item">
            <strong>Date:</strong> <span>${event.event_date}${event.start_time ? ` • ${event.start_time}` : ''}</span>
          </div>
          <div class="event-detail-item">
            <strong>Location:</strong> <span>${event.venue_name || event.platform || 'Auditorium / Campus Venue, NIU'}</span>
          </div>
          ${event.join_link ? `
          <div class="event-detail-item">
            <strong>Join Link:</strong> <a href="${event.join_link}" style="color: #FF9900; text-decoration: underline;">${event.join_link}</a>
          </div>` : ''}
          <div class="event-detail-item">
            <strong>Status:</strong> <span style="color: #34D399; font-weight: bold;">Confirmed (${registration.status.toUpperCase()})</span>
          </div>
        </div>

        <!-- Complete Official Delegate Badge Pass Card -->
        <div style="text-align: center; margin: 10px 0 24px 0;">
          <div style="display: inline-block; background: rgba(255, 153, 0, 0.12); border: 1px solid rgba(255, 153, 0, 0.4); border-radius: 999px; padding: 5px 16px; color: #FFAA22; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px;">
            ✓ Official Digital Credential Pass Issued
          </div>

          <!-- Full High-Res Badge Pass Image (Inline CID Attachment) -->
          <div style="border-radius: 24px; overflow: hidden; border: 2px solid #5B2C9D; box-shadow: 0 16px 45px rgba(0, 0, 0, 0.75), 0 0 30px rgba(168, 85, 247, 0.25); max-width: 500px; margin: 0 auto; background-color: #0E0720;">
            <img src="cid:official-delegate-badge" alt="Official AWS Student Builder Pass - ${registration.full_name}" width="500" style="display: block; width: 100%; height: auto; max-width: 500px; border: 0;" />
          </div>

          <p style="font-size: 11px; color: #94A3B8; margin-top: 10px;">
            Save this badge pass image or screenshot it on your mobile device for direct gate entry.
          </p>
        </div>

        <!-- Official Badge Pass Credentials Box -->
        <div class="badge-card">
          <div class="badge-status">✓ Verified Delegate Registration</div>
          <h2 class="delegate-name" style="margin-top: 4px;">${registration.full_name}</h2>
          <div class="delegate-role">${roleDisplay}</div>

          <!-- Details Table -->
          <table class="details-table" cellpadding="0" cellspacing="0">
            <tr>
              <td class="label details-row">Attendee Name:</td>
              <td class="value details-row">${registration.full_name}</td>
            </tr>
            <tr>
              <td class="label details-row">Registered Email:</td>
              <td class="value details-row">${registration.email}</td>
            </tr>
            <tr>
              <td class="label details-row">Official Pass Code:</td>
              <td class="value details-row" style="color: #FF9900; font-family: monospace; font-size: 14px; font-weight: bold;">* ${badgeCode} *</td>
            </tr>
            <tr>
              <td class="label details-row">Affiliation:</td>
              <td class="value details-row">${registration.college || 'Noida International University'}</td>
            </tr>
            <tr>
              <td class="label details-row">Registration Status:</td>
              <td class="value details-row" style="color: #34D399; font-weight: bold;">Confirmed (${registration.status.toUpperCase()})</td>
            </tr>
            <tr>
              <td class="label details-row">Access Level:</td>
              <td class="value details-row">Full Conference &amp; Workshops</td>
            </tr>
          </table>
        </div>

        <!-- CTAs -->
        <a href="${verifyUrl}" class="cta-btn-primary" target="_blank">
          View &amp; Download Digital Pass &rarr;
        </a>

        <!-- Photo Customization Callout Box -->
        <div style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(255, 153, 0, 0.12) 100%); border: 1.5px dashed #A855F7; border-radius: 18px; padding: 22px 20px; margin: 24px 0; text-align: center;">
          <div style="font-size: 26px; line-height: 1; margin-bottom: 8px;">📸 ✨</div>
          <div style="font-size: 16px; font-weight: 800; color: #FFFFFF; margin-bottom: 6px;">
            Apni Photo / Picture Ke Sath Badge Pass Banayein!
          </div>
          <p style="font-size: 13.5px; color: #D8B4FE; line-height: 1.6; margin: 0 0 16px 0;">
            Agar aap apne badge par apni <strong>Photo (DP/Picture)</strong> lagana chahte hain, toh hamari official website ke Badge Studio me jakar apne verified email (<strong style="color: #FFAA22;">${registration.email}</strong>) se instant customize karke print-ready badge pass download kar sakte hain!
          </p>
          <a href="${badgeStudioUrl}" style="display: inline-block; background: linear-gradient(90deg, #A855F7, #EC4899, #FF9900); color: #FFFFFF !important; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; padding: 12px 26px; border-radius: 12px; box-shadow: 0 6px 20px rgba(168, 85, 247, 0.4);">
            🎨 Customize Badge With Photo &rarr;
          </a>
        </div>

        <a href="${badgeStudioUrl}" class="cta-btn-secondary" target="_blank">
          Customize in Badge Studio &rarr;
        </a>

        <!-- Admission Guidelines -->
        <div class="guidelines">
          <strong>Entrance &amp; Check-In Guidelines:</strong><br>
          • Keep this email or screenshot your QR pass ready on your phone.<br>
          • Present your QR code at the check-in desk upon arrival for instant gate check-in.<br>
          • Please carry a valid Student / Government photo ID.<br>
          • Doors open 15 minutes before session time.
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        AWS Student Builder Group at Noida International University<br>
        Greater Noida, Uttar Pradesh, Delhi NCR, India<br>
        Questions or assistance? Reach us at <a href="mailto:aws.sbg@niu.ac.in">aws.sbg@niu.ac.in</a><br>
        <span style="font-size: 10px; color: #475569; margin-top: 8px; display: block;">
          Official automated conference registration dispatch. Valid for registered attendee only.
        </span>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Sends the official badge verified email to the user with embedded QR code.
 */
export async function sendBadgeVerifiedEmail(
  badge: BadgeApplicationRecord,
  baseUrl: string = 'https://aws-sbg-niu.vercel.app'
): Promise<SendBadgeEmailResult> {
  const targetEmail = badge.email?.trim();
  if (!targetEmail) {
    return { success: false, error: 'Recipient email is missing.' };
  }

  const transporter = getEmailTransporter();
  const senderConfig = getSenderEmailConfig();

  if (!transporter) {
    console.warn(
      `[EMAIL NOTIFICATION SKIPPED] SMTP credentials not configured in admin settings or environment variables. Email to ${targetEmail} for badge ${badge.code} was skipped.`
    );
    return {
      success: true,
      skipped: true,
      error: 'SMTP credentials not configured in Admin Settings or environment variables.',
    };
  }

  const from = senderConfig.from;
  const replyTo = senderConfig.replyTo;
  const subject = `🎉 Official AWS Builder Pass Ready • ${badge.code || 'NIU SBG'} (${badge.full_name})`;
  const code = badge.code || 'PENDING';
  const verifyUrl = `${baseUrl.replace(/\/$/, '')}/verify/${code}`;

  try {
    // 1. Generate full official delegate badge PNG pass
    const badgePngBuffer = await generateOfficialBadgePng({
      name: badge.full_name,
      role: badge.role || 'Official Attendee',
      code,
      college: badge.institution || 'Noida International University',
      verifyUrl,
      accessLevel: 'Full Conference & Workshops',
    });

    // 2. Generate high-resolution QR code buffer for inline email attachment
    const qrBuffer = await QRCode.toBuffer(verifyUrl, {
      margin: 1,
      width: 320,
      color: {
        dark: '#0B081A',
        light: '#FFFFFF',
      },
    });

    const html = generateBadgeEmailHtml(badge, baseUrl);

    const info = await transporter.sendMail({
      from,
      replyTo,
      to: targetEmail,
      subject,
      html,
      attachments: [
        {
          filename: `AWS-SBG-Badge-${code}.png`,
          content: badgePngBuffer,
          cid: 'official-delegate-badge',
          contentType: 'image/png',
        },
        {
          filename: `aws-sbg-pass-${code}.png`,
          content: qrBuffer,
          cid: 'badge-pass-qr',
          contentType: 'image/png',
        },
      ],
    });

    console.log(`[EMAIL DISPATCHED] Badge ${badge.code} email sent from ${senderConfig.senderEmail} to ${targetEmail}. Message ID: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error(`[EMAIL ERROR] Failed sending badge email to ${targetEmail}:`, error);
    return {
      success: false,
      error: error?.message || 'Failed to dispatch email via SMTP transporter.',
    };
  }
}

/**
 * Sends event registration confirmation email to an attendee with their badge and scannable QR pass.
 */
export async function sendEventRegistrationConfirmationEmail(
  params: SendEventRegistrationEmailParams
): Promise<SendBadgeEmailResult> {
  const { registration, event, baseUrl = 'https://aws-sbg-niu.vercel.app', badgeCode } = params;
  const targetEmail = registration.email?.trim();
  if (!targetEmail) {
    return { success: false, error: 'Recipient email is missing.' };
  }

  const transporter = getEmailTransporter();
  const senderConfig = getSenderEmailConfig();

  if (!transporter) {
    console.warn(
      `[EMAIL NOTIFICATION SKIPPED] SMTP credentials not configured in admin settings or environment variables. Registration confirmation email to ${targetEmail} for event "${event.title}" was skipped.`
    );
    return {
      success: true,
      skipped: true,
      error: 'SMTP credentials not configured in Admin Settings or environment variables.',
    };
  }

  const from = senderConfig.from;
  const replyTo = senderConfig.replyTo;
  const subject = `🎟️ Registration Confirmed: ${event.title} • Pass ${badgeCode} (${registration.full_name})`;
  const cleanBase = baseUrl.replace(/\/$/, '');
  const verifyUrl = `${cleanBase}/verify/${badgeCode}`;

  try {
    // 1. Generate full official delegate badge PNG pass
    const badgePngBuffer = await generateOfficialBadgePng({
      name: registration.full_name,
      role: registration.role || 'Official Attendee',
      code: badgeCode,
      college: registration.college || 'Noida International University',
      verifyUrl,
      accessLevel: 'Full Conference & Workshops',
    });

    // 2. Generate high-resolution QR code buffer for inline email attachment
    const qrBuffer = await QRCode.toBuffer(verifyUrl, {
      margin: 1,
      width: 320,
      color: {
        dark: '#0B081A',
        light: '#FFFFFF',
      },
    });

    const html = generateEventRegistrationEmailHtml({
      registration,
      event,
      baseUrl: cleanBase,
      badgeCode,
    });

    const info = await transporter.sendMail({
      from,
      replyTo,
      to: targetEmail,
      subject,
      html,
      attachments: [
        {
          filename: `AWS-SBG-Badge-${badgeCode}.png`,
          content: badgePngBuffer,
          cid: 'official-delegate-badge',
          contentType: 'image/png',
        },
        {
          filename: `event-pass-${badgeCode}.png`,
          content: qrBuffer,
          cid: 'event-pass-qr',
          contentType: 'image/png',
        },
      ],
    });

    console.log(`[EMAIL DISPATCHED] Registration confirmation with full badge pass ${badgeCode} sent from ${senderConfig.senderEmail} to ${targetEmail}. Message ID: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error(`[EMAIL ERROR] Failed sending registration confirmation email to ${targetEmail}:`, error);
    return {
      success: false,
      error: error?.message || 'Failed to dispatch email via SMTP transporter.',
    };
  }
}

/**
 * Sends an instant test email to verify SMTP configuration and candidate sender settings.
 */
export async function sendTestEmail(
  targetEmail: string,
  overrideConfig?: Partial<SiteSettingsRecord>
): Promise<SendBadgeEmailResult> {
  const cleanEmail = targetEmail.trim();
  if (!cleanEmail) {
    return { success: false, error: 'Recipient email address is required.' };
  }

  const transporter = getEmailTransporter(overrideConfig);
  if (!transporter) {
    return {
      success: false,
      error: 'SMTP credentials missing. Please enter SMTP User & Password (e.g. Gmail App Password) or configure SMTP_USER/SMTP_PASS in environment variables.',
    };
  }

  const senderConfig = getSenderEmailConfig(overrideConfig);
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>AWS SBG Email Test</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0A0A0A; color: #E2E8F0; padding: 30px 15px; margin: 0; }
    .box { max-width: 560px; margin: 0 auto; background: #120D26; border: 1px solid #3B2A68; border-radius: 16px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .pill { display: inline-block; padding: 4px 12px; background: rgba(255,153,0,0.15); border: 1px solid rgba(255,153,0,0.4); color: #FF9900; border-radius: 999px; font-size: 11px; font-weight: bold; }
    h1 { color: #FFFFFF; font-size: 22px; margin: 18px 0 8px; }
    p { color: #94A3B8; font-size: 13px; line-height: 1.6; }
    .status-ok { background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.4); color: #34D399; padding: 14px; border-radius: 10px; font-size: 13px; font-weight: bold; margin: 18px 0; }
    .table-box { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .row { font-size: 12px; border-bottom: 1px solid #241A42; }
    .label { color: #A78BFA; font-weight: 600; padding: 8px 0; width: 38%; }
    .val { color: #F8FAFC; padding: 8px 0; font-family: monospace; }
    .footer { margin-top: 25px; font-size: 11px; color: #64748B; border-top: 1px solid #20153D; padding-top: 14px; text-align: center; }
  </style>
</head>
<body>
  <div class="box">
    <div class="pill">AWS SBG NIU • System Dispatch Test</div>
    <h1>Candidate Email Dispatch Active! 🎉</h1>
    <p>This diagnostic email confirms that candidates will receive conference confirmations, QR passes, and badges from your configured sender address.</p>
    
    <div class="status-ok">✓ SMTP Connection &amp; Candidate Dispatch Verified</div>

    <table class="table-box">
      <tr class="row">
        <td class="label">Candidate "From" Header:</td>
        <td class="val">${senderConfig.from}</td>
      </tr>
      <tr class="row">
        <td class="label">Candidate Reply-To:</td>
        <td class="val">${senderConfig.replyTo}</td>
      </tr>
      <tr class="row">
        <td class="label">Test Recipient:</td>
        <td class="val">${cleanEmail}</td>
      </tr>
      <tr class="row">
        <td class="label">Dispatch Time:</td>
        <td class="val">${now} IST</td>
      </tr>
    </table>

    <!-- Sample Complete Badge Pass Card Preview in Test Email -->
    <div style="margin: 24px 0 16px 0; text-align: center;">
      <div style="font-size: 11px; font-weight: bold; color: #FFAA22; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
        Sample Delegate Badge Preview Attached Below
      </div>
      <div style="border-radius: 16px; overflow: hidden; border: 2px solid #5A2B9A; max-width: 440px; margin: 0 auto;">
        <img src="cid:official-delegate-badge" alt="Sample Official AWS SBG Badge Pass" width="440" style="display: block; width: 100%; height: auto; max-width: 440px;" />
      </div>
    </div>

    <div class="footer">
      AWS Student Builder Group at Noida International University<br>
      Admin Console Diagnostic Tool
    </div>
  </div>
</body>
</html>
  `;

  try {
    const sampleBadgePng = await generateOfficialBadgePng({
      name: 'Organizer / Core Team',
      role: 'Core Team Admin',
      code: 'NIUSBG-TEST-SAMPLE',
      college: 'Noida International University',
      verifyUrl: 'https://aws-sbg-niu.vercel.app/verify/NIUSBG-TEST-SAMPLE',
      accessLevel: 'Full Conference & Workshops',
    });

    const info = await transporter.sendMail({
      from: senderConfig.from,
      replyTo: senderConfig.replyTo,
      to: cleanEmail,
      subject: `✅ AWS SBG Candidate Dispatch Test • Sent From ${senderConfig.senderEmail}`,
      html,
      attachments: [
        {
          filename: 'AWS-SBG-Badge-SAMPLE.png',
          content: sampleBadgePng,
          cid: 'official-delegate-badge',
          contentType: 'image/png',
        },
      ],
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'SMTP delivery failed.',
    };
  }
}
