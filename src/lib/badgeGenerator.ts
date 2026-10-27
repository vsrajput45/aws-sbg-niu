import sharp from 'sharp';
import QRCode from 'qrcode';

export interface GenerateBadgeOptions {
  name: string;
  role?: string;
  code: string;
  college?: string;
  verifyUrl: string;
  accessLevel?: string;
}

function getInitials(name: string): string {
  const parts = name.replace('.', ' ').split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'AS';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function escapeXml(unsafe: string | undefined | null): string {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Builds the official 1080 x 1350 vector SVG for the AWS SBG NIU badge pass.
 */
export async function generateOfficialBadgeSvg(options: GenerateBadgeOptions): Promise<string> {
  const {
    name,
    role = 'Official Attendee',
    code,
    college = 'Noida International University',
    verifyUrl,
    accessLevel = 'Full Conference & Workshops',
  } = options;

  const W = 1080;
  const H = 1350;
  const ini = getInitials(name);
  const nameD = escapeXml(name);
  const roleD = escapeXml(role.toUpperCase());
  const collegeD = escapeXml(college);
  const codeD = escapeXml(code);
  const accessD = escapeXml(accessLevel.toUpperCase());

  // Generate crisp QR code vector modules
  const qr = QRCode.create(verifyUrl, { errorCorrectionLevel: 'M' });
  const modCount = qr.modules.size;
  const qrX = 824;
  const qrY = 1104;
  const qrSize = 138;
  const modSize = qrSize / modCount;

  let qrRects = '';
  for (let r = 0; r < modCount; r++) {
    for (let c = 0; c < modCount; c++) {
      if (qr.modules.get(c, r)) {
        const x = (qrX + c * modSize).toFixed(2);
        const y = (qrY + r * modSize).toFixed(2);
        const w = (modSize + 0.35).toFixed(2);
        const h = (modSize + 0.35).toFixed(2);
        qrRects += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#080F1E" />`;
      }
    }
  }

  // Barcode simulated high-density lines
  let barcodeLines = '';
  const barStart = 270;
  const barY = 1120;
  const barH = 68;
  let curX = barStart;
  const widths = [3, 1.5, 4, 2, 5, 2, 1.5, 3.5, 2, 4, 1.5, 3, 2, 5, 1.5, 3, 4, 2, 1.5, 3.5, 2, 4, 1.5, 3, 2, 5, 2, 1.5, 3, 4, 2, 1.5, 3.5, 2, 4, 1.5, 3, 2, 5, 1.5, 3, 4, 2, 1.5, 3.5, 2, 4, 1.5, 3, 2, 5, 2];
  for (let i = 0; i < widths.length && curX < 640; i++) {
    const w = widths[i];
    barcodeLines += `<rect x="${curX.toFixed(1)}" y="${barY}" width="${w}" height="${barH}" fill="#080F1E" />`;
    curX += w + ((i % 3 === 0) ? 3 : 2);
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1F0E46" />
      <stop offset="45%" stop-color="#12082C" />
      <stop offset="100%" stop-color="#070314" />
    </linearGradient>
    <linearGradient id="borderGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#A855F7" />
      <stop offset="50%" stop-color="#EC4899" />
      <stop offset="100%" stop-color="#FF9900" />
    </linearGradient>
    <linearGradient id="pillGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#FF9900" />
      <stop offset="100%" stop-color="#FFAA22" />
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FCD34D" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#9333EA" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#9333EA" stop-opacity="0" />
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="#FFFFFF" stroke-opacity="0.04" stroke-width="1" />
    </pattern>
  </defs>

  <!-- Background Base -->
  <rect x="0" y="0" width="${W}" height="${H}" rx="48" fill="url(#bg)" />
  <rect x="0" y="0" width="${W}" height="${H}" rx="48" fill="url(#grid)" />

  <!-- Outer Gradient Border -->
  <rect x="20" y="20" width="1040" height="1310" rx="38" fill="none" stroke="url(#borderGrad)" stroke-width="3.5" stroke-opacity="0.85" />

  <!-- Top Lanyard Notch -->
  <rect x="438" y="42" width="204" height="38" rx="19" fill="#05020C" stroke="#3B2669" stroke-width="2.5" />

  <!-- Header Branding -->
  <text x="540" y="180" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="88" font-weight="900" fill="#FFFFFF" letter-spacing="1">aws</text>
  <path d="M462 188 Q540 224 610 186" fill="none" stroke="#FF9900" stroke-width="8" stroke-linecap="round" />
  <path d="M616 184 L592 176 L598 200 Z" fill="#FF9900" />

  <text x="540" y="264" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="800" fill="#FF9900" letter-spacing="10">STUDENT BUILDER GROUP</text>
  <text x="540" y="318" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="700" fill="#FFFFFF">Noida International University</text>

  <!-- Motto Ribbon -->
  <rect x="88" y="348" width="904" height="44" rx="10" fill="#201140" stroke="#532E96" stroke-width="1.5" />
  <text x="540" y="376" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#D8B4FE" letter-spacing="2.5">LEARN • CONNECT • BUILD • BELONG • OFFICIAL STUDENT BUILDER CREDENTIAL</text>

  <!-- Avatar & Verification Brackets -->
  <circle cx="540" cy="580" r="210" fill="url(#glow)" />
  <g stroke="url(#borderGrad)" stroke-width="6" fill="none" stroke-linecap="round">
    <path d="M340 440 V400 H380" />
    <path d="M740 440 V400 H700" />
    <path d="M340 720 V760 H380" />
    <path d="M740 720 V760 H700" />
  </g>
  <circle cx="540" cy="580" r="145" fill="#1A0D3D" stroke="url(#borderGrad)" stroke-width="6" />
  <text x="540" y="625" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="110" font-weight="900" fill="#FFFFFF" letter-spacing="2">${ini}</text>

  <!-- Verified Check Badge Icon on Avatar -->
  <circle cx="650" cy="690" r="26" fill="#FF9900" stroke="#070314" stroke-width="4" />
  <path d="M638 690 L647 699 L662 681" fill="none" stroke="#0A0518" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />

  <!-- Access Level -->
  <text x="540" y="810" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="700" fill="#94A3B8" letter-spacing="4.5">ACCESS LEVEL • ${accessD}</text>

  <!-- Role Pill -->
  <rect x="308" y="836" width="464" height="64" rx="32" fill="url(#pillGrad)" />
  <text x="540" y="878" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#0A0518" letter-spacing="3">${roleD}</text>

  <!-- Delegate Name & Institution -->
  <text x="540" y="976" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="72" font-weight="800" fill="#FFFFFF">${nameD}</text>
  <text x="540" y="1026" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="600" fill="#C084FC">${collegeD}</text>

  <!-- Bottom NFC + Barcode + QR Panel -->
  <rect x="68" y="1076" width="944" height="196" rx="24" fill="#09041A" stroke="#4C2882" stroke-width="2" />

  <!-- NFC Chip -->
  <g>
    <rect x="100" y="1126" width="86" height="66" rx="10" fill="url(#gold)" />
    <path d="M100 1159 H186 M129 1126 V1192 M157 1126 V1192" stroke="#78350F" stroke-width="3" fill="none" />
    <text x="143" y="1224" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#94A3B8" letter-spacing="1">NFC SMART PASS</text>
  </g>

  <!-- Barcode White Panel -->
  <rect x="250" y="1102" width="410" height="96" rx="12" fill="#FFFFFF" />
  ${barcodeLines}
  <text x="455" y="1228" text-anchor="middle" font-family="'Courier New', Courier, monospace" font-size="24" font-weight="800" fill="#FFAA22" letter-spacing="2">* ${codeD} *</text>
  <text x="455" y="1254" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#7E93B8" letter-spacing="2.5">SCAN TO VALIDATE DELEGATE IDENTITY</text>

  <!-- High-Res QR Pass White Panel -->
  <rect x="814" y="1094" width="158" height="158" rx="14" fill="#FFFFFF" stroke="#FF9900" stroke-width="2" />
  ${qrRects}
  <text x="893" y="1264" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" fill="#FF9900" letter-spacing="2">VERIFIED PASS</text>

  <!-- Footer Tagline -->
  <text x="540" y="1302" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="700" fill="#FFFFFF">#AWSSBGNIU • Greater Noida, Delhi NCR</text>
  <text x="540" y="1326" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" fill="#94A3B8">Official AWS Student Builder Group • Supported by AWS Student Programs</text>
</svg>
`;
}

/**
 * Generates official print-ready PNG buffer of the candidate's complete badge pass.
 */
export async function generateOfficialBadgePng(options: GenerateBadgeOptions): Promise<Buffer> {
  const svg = await generateOfficialBadgeSvg(options);
  return sharp(Buffer.from(svg)).png({ quality: 95 }).toBuffer();
}

