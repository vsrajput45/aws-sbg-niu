import nodemailer from 'nodemailer';
import { BadgeApplicationRecord } from './db/types';

interface SendBadgeEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
}

/**
 * Configure SMTP transporter using environment variables.
 * Supported variables:
 * - SMTP_USER: Gmail or custom email address (e.g. aws.sbg@niu.ac.in)
 * - SMTP_PASS: App Password (for Gmail) or SMTP password
 * - SMTP_HOST: Optional if Gmail (default: smtp.gmail.com)
 * - SMTP_PORT: 465 (SSL) or 587 (TLS), default: 465
 * - SMTP_FROM: Optional custom display name (default: "AWS SBG NIU <SMTP_USER>")
 */
function getEmailTransporter() {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!user || !pass) {
    return null;
  }

  const host = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const isSecure = port === 465 || process.env.SMTP_SECURE === 'true';

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
 * Generates official AWS SBG branded HTML email for verified badge passes.
 */
function generateBadgeEmailHtml(badge: BadgeApplicationRecord, baseUrl: string): string {
  const code = badge.code || 'PENDING';
  const verifyUrl = `${baseUrl.replace(/\/$/, '')}/verify/${code}`;
  const badgeStudioUrl = `${baseUrl.replace(/\/$/, '')}/badge?name=${encodeURIComponent(badge.full_name)}&role=${encodeURIComponent(badge.role)}`;

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
    .details-table {
      width: 100%;
      border-top: 1px solid #2B1D54;
      padding-top: 14px;
      text-align: left;
      font-size: 12px;
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
        <div class="credential-box">
          <div class="status-badge">✓ Official Pass Verified &amp; Active</div>
          <h2 class="delegate-name">${badge.full_name}</h2>
          <div class="delegate-role">${badge.role}</div>

          <table class="details-table" cellpadding="0" cellspacing="0">
            <tr>
              <td class="label details-row">Pass Code:</td>
              <td class="value code-value details-row">* ${code} *</td>
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
              <td class="label details-row">Cloud Region:</td>
              <td class="value details-row">ap-south-1 (Delhi NCR)</td>
            </tr>
          </table>
        </div>

        <a href="${verifyUrl}" class="cta-btn-primary" target="_blank">
          View &amp; Download Full Pass (PNG) &rarr;
        </a>

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
 * Sends the official badge verified email to the user.
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
  if (!transporter) {
    console.warn(
      `[EMAIL NOTIFICATION SKIPPED] SMTP_USER or SMTP_PASS not configured in environment variables. Email to ${targetEmail} for badge ${badge.code} was skipped.`
    );
    return {
      success: true,
      skipped: true,
      error: 'SMTP credentials (SMTP_USER / SMTP_PASS) not set in environment variables.',
    };
  }

  const senderUser = process.env.SMTP_USER?.trim() || 'aws.sbg@niu.ac.in';
  const from = process.env.SMTP_FROM?.trim() || `"AWS SBG NIU" <${senderUser}>`;
  const subject = `🎉 Official AWS Builder Pass Ready • ${badge.code || 'NIU SBG'} (${badge.full_name})`;
  const html = generateBadgeEmailHtml(badge, baseUrl);

  try {
    const info = await transporter.sendMail({
      from,
      to: targetEmail,
      subject,
      html,
    });

    console.log(`[EMAIL DISPATCHED] Badge ${badge.code} email sent to ${targetEmail}. Message ID: ${info.messageId}`);
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
