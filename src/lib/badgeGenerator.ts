import sharp from 'sharp';
import QRCode from 'qrcode';
import { parse, Font, Path } from 'opentype.js';
import {
  INTER_BOLD_BASE64,
  INTER_SEMIBOLD_BASE64,
  INTER_REGULAR_BASE64,
} from './fonts/embeddedFonts';

export interface GenerateBadgeOptions {
  name: string;
  role?: string;
  code: string;
  college?: string;
  verifyUrl: string;
  accessLevel?: string;
  photoUrl?: string | null;
  theme?: 'sbg' | 'classic';
}

// In-memory cached parsed fonts so they are only initialized once per lambda/server
let cachedFontBold: Font | null = null;
let cachedFontSemiBold: Font | null = null;
let cachedFontRegular: Font | null = null;

function getFonts(): { fontBold: Font; fontSemiBold: Font; fontRegular: Font } {
  if (!cachedFontBold) {
    const bufBold = Buffer.from(INTER_BOLD_BASE64, 'base64');
    cachedFontBold = parse(
      bufBold.buffer.slice(bufBold.byteOffset, bufBold.byteOffset + bufBold.byteLength)
    );
  }
  if (!cachedFontSemiBold) {
    const bufSemi = Buffer.from(INTER_SEMIBOLD_BASE64, 'base64');
    cachedFontSemiBold = parse(
      bufSemi.buffer.slice(bufSemi.byteOffset, bufSemi.byteOffset + bufSemi.byteLength)
    );
  }
  if (!cachedFontRegular) {
    const bufReg = Buffer.from(INTER_REGULAR_BASE64, 'base64');
    cachedFontRegular = parse(
      bufReg.buffer.slice(bufReg.byteOffset, bufReg.byteOffset + bufReg.byteLength)
    );
  }
  return {
    fontBold: cachedFontBold,
    fontSemiBold: cachedFontSemiBold,
    fontRegular: cachedFontRegular,
  };
}

function getInitials(name: string): string {
  const parts = name.replace('.', ' ').split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'AS';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function calculateTextWidth(font: Font, text: string, fontSize: number, letterSpacing = 0): number {
  const scale = (1 / font.unitsPerEm) * fontSize;
  let totalAdvance = 0;
  for (let i = 0; i < text.length; i++) {
    const glyph = font.charToGlyph(text[i]);
    const advance = (glyph.advanceWidth || font.unitsPerEm * 0.5) * scale;
    totalAdvance += advance + (i < text.length - 1 ? letterSpacing : 0);
  }
  return totalAdvance;
}

/**
 * Converts text into 100% pure SVG vector geometry (<path d="..." />).
 * This completely eliminates OS font dependencies, preventing tofu boxes (□) on any serverless Linux/Docker environment.
 */
function textToSvgPath(
  font: Font,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  letterSpacing = 0,
  align: 'center' | 'left' | 'right' = 'center',
  fill = '#FFFFFF'
): string {
  if (!text || text.trim().length === 0) return '';
  const scale = (1 / font.unitsPerEm) * fontSize;

  let totalAdvance = 0;
  const glyphs = [];
  for (let i = 0; i < text.length; i++) {
    const glyph = font.charToGlyph(text[i]);
    glyphs.push(glyph);
    const advance = (glyph.advanceWidth || font.unitsPerEm * 0.5) * scale;
    totalAdvance += advance + (i < text.length - 1 ? letterSpacing : 0);
  }

  let startX = x;
  if (align === 'center') {
    startX = x - totalAdvance / 2;
  } else if (align === 'right') {
    startX = x - totalAdvance;
  }

  let curX = startX;
  const combinedPath = new Path();
  for (let i = 0; i < glyphs.length; i++) {
    const glyph = glyphs[i];
    const gPath = glyph.getPath(curX, y, fontSize);
    combinedPath.extend(gPath);
    const advance = (glyph.advanceWidth || font.unitsPerEm * 0.5) * scale;
    curX += advance + letterSpacing;
  }

  const d = combinedPath.toPathData(2);
  if (!d || d.length === 0) return '';
  return `<path d="${d}" fill="${fill}" />`;
}

/**
 * Builds the official 1080 x 1350 vector SVG for the AWS SBG NIU badge pass,
 * mirroring the website's BadgeCanvas design with pixel precision.
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

  const { fontBold, fontSemiBold, fontRegular } = getFonts();

  const W = 1080;
  const H = 1350;

  const cleanName = (name || 'Aarav Sharma').trim();
  const cleanRole = (role || 'Official Attendee').trim().toUpperCase();
  const cleanCollege = (college || 'Noida International University').trim();
  const cleanCode = (code || 'NIUSBG-PASS').trim().toUpperCase();
  const cleanAccess = (accessLevel || 'Full Conference & Workshops').trim().toUpperCase();
  const initials = getInitials(cleanName);

  // Generate crisp QR code vector modules
  const qr = QRCode.create(verifyUrl, { errorCorrectionLevel: 'M' });
  const modCount = qr.modules.size;
  const qrX = 824;
  const qrY = 1108;
  const qrSize = 134;
  const modSize = qrSize / modCount;

  let qrRects = '';
  for (let r = 0; r < modCount; r++) {
    for (let c = 0; c < modCount; c++) {
      if (qr.modules.get(c, r)) {
        const x = (qrX + c * modSize).toFixed(2);
        const y = (qrY + r * modSize).toFixed(2);
        const w = (modSize + 0.35).toFixed(2);
        const h = (modSize + 0.35).toFixed(2);
        qrRects += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#081226" />`;
      }
    }
  }

  // Barcode simulated high-contrast lines
  let barcodeLines = '';
  const barPattern = [3, 1, 4, 2, 5, 2, 1, 3, 2, 4, 1, 3, 5, 2, 2, 4, 1, 3, 2, 5, 1, 4, 2, 3, 1, 4, 2, 5, 3, 1, 2, 4, 1, 5, 2, 3, 2, 4, 1, 3, 4, 2, 5, 1, 3];
  let curBx = 270;
  let bIdx = 0;
  while (curBx < 634) {
    const bw = barPattern[bIdx % barPattern.length];
    const gap = (barPattern[(bIdx + 1) % barPattern.length] % 3) + 2;
    barcodeLines += `<rect x="${curBx.toFixed(1)}" y="1116" width="${bw}" height="72" fill="#0B1220" />`;
    curBx += bw + gap;
    bIdx++;
  }

  // Dynamically scale long candidate name to guarantee proper fit
  let nameSize = 80;
  while (calculateTextWidth(fontBold, cleanName, nameSize) > 880 && nameSize > 40) {
    nameSize -= 2;
  }

  // Dynamically scale college name if exceptionally long
  let collegeSize = 33;
  while (calculateTextWidth(fontSemiBold, cleanCollege, collegeSize) > 880 && collegeSize > 24) {
    collegeSize -= 2;
  }

  // Vector Typography paths
  const pAws = textToSvgPath(fontBold, 'aws', 540, 196, 96, 1, 'center', '#FFFFFF');
  const pSbg = textToSvgPath(fontBold, 'STUDENT BUILDER GROUP', 540, 286, 34, 11, 'center', 'url(#accentGrad)');
  const pNiu = textToSvgPath(fontBold, 'Noida International University', 540, 342, 46, 0, 'center', '#FFFFFF');
  const pMotto = textToSvgPath(
    fontSemiBold,
    'LEARN • CONNECT • BUILD • BELONG • OFFICIAL STUDENT BUILDER CREDENTIAL',
    540,
    401,
    17,
    2,
    'center',
    '#D9C8FF'
  );

  const pInitials = textToSvgPath(fontBold, initials, 540, 662, 118, 2, 'center', '#FFFFFF');
  const pAccess = textToSvgPath(fontSemiBold, `ACCESS LEVEL • ${cleanAccess}`, 540, 852, 22, 4.5, 'center', '#8FA8CC');
  const pRole = textToSvgPath(fontBold, cleanRole, 540, 921, 30, 3, 'center', '#FFFFFF');
  const pName = textToSvgPath(fontBold, cleanName, 540, 1022, nameSize, 0, 'center', '#FFFFFF');
  const pCollege = textToSvgPath(fontSemiBold, cleanCollege, 540, 1072, collegeSize, 0, 'center', '#C9A7FF');

  const pNfc = textToSvgPath(fontSemiBold, 'NFC SMART PASS', 147, 1232, 14.5, 1.5, 'center', '#7E93B8');
  const pCode = textToSvgPath(fontBold, `* ${cleanCode} *`, 452, 1226, 24, 2, 'center', '#D7E3F5');
  const pScan = textToSvgPath(fontSemiBold, 'SCAN TO VALIDATE DELEGATE IDENTITY', 452, 1252, 13.5, 3, 'center', '#7E93B8');

  const pVerifiedText = textToSvgPath(fontBold, 'VERIFIED PASS', 897, 1269, 11, 1.5, 'center', '#00D084');

  const pFooter1 = textToSvgPath(fontBold, '#AWSSBGNIU • Greater Noida, Delhi NCR', 540, 1302, 23, 0, 'center', '#FFFFFF');
  const pFooter2 = textToSvgPath(
    fontRegular,
    'Official AWS Student Builder Group • Supported by AWS Student Programs',
    540,
    1326,
    13.5,
    0,
    'center',
    '#66799A'
  );

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#22104D" />
      <stop offset="100%" stop-color="#0A0618" />
    </linearGradient>

    <!-- Accent Border Gradient -->
    <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#A855F7" />
      <stop offset="50%" stop-color="#EC4899" />
      <stop offset="100%" stop-color="#FF9900" />
    </linearGradient>

    <!-- Gold Chip Gradient -->
    <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F0D089" />
      <stop offset="100%" stop-color="#B8862E" />
    </linearGradient>

    <!-- Radiant Glows -->
    <radialGradient id="glowTopLeft" cx="90" cy="80" r="330" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#7C3AED" stop-opacity="0.55" />
      <stop offset="100%" stop-color="#7C3AED" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glowTopRight" cx="1010" cy="330" r="300" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#EC4899" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#EC4899" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glowBotLeft" cx="60" cy="1100" r="300" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FF9900" stop-opacity="0.38" />
      <stop offset="100%" stop-color="#FF9900" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glowBotRight" cx="1030" cy="1280" r="280" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#7C3AED" stop-opacity="0.55" />
      <stop offset="100%" stop-color="#7C3AED" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="avatarGlow" cx="540" cy="618" r="215" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#A855F7" stop-opacity="0.30" />
      <stop offset="100%" stop-color="#FF9900" stop-opacity="0" />
    </radialGradient>

    <!-- Subtle 45px Grid -->
    <pattern id="grid" width="45" height="45" patternUnits="userSpaceOnUse">
      <path d="M45 0H0V45" fill="none" stroke="#FFFFFF" stroke-opacity="0.045" stroke-width="1" />
    </pattern>

    <clipPath id="cardClip">
      <rect x="0" y="0" width="${W}" height="${H}" rx="48" />
    </clipPath>
  </defs>

  <!-- Base Card -->
  <g clip-path="url(#cardClip)">
    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#bgGrad)" />
    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#grid)" />

    <!-- Radiant Blobs -->
    <circle cx="90" cy="80" r="330" fill="url(#glowTopLeft)" />
    <circle cx="1010" cy="330" r="300" fill="url(#glowTopRight)" />
    <circle cx="60" cy="1100" r="300" fill="url(#glowBotLeft)" />
    <circle cx="1030" cy="1280" r="280" fill="url(#glowBotRight)" />

    <!-- Wireframe Isometric Cubes -->
    <g stroke="#FFFFFF" stroke-opacity="0.07" stroke-width="2.5" fill="none">
      <!-- Left Cube at 120, 560 -->
      <polygon points="120,560 154,540 188,560 188,600 154,620 120,600" />
      <polyline points="120,560 154,580 188,560" />
      <line x1="154" y1="580" x2="154" y2="620" />
      <!-- Right Cube at 880, 700 -->
      <polygon points="880,700 908,684 936,700 936,732 908,748 880,732" />
      <polyline points="880,700 908,716 936,700" />
      <line x1="908" y1="716" x2="908" y2="748" />
    </g>

    <!-- Outer Gradient Border -->
    <rect x="22" y="22" width="1036" height="1306" rx="38" fill="none" stroke="url(#accentGrad)" stroke-width="3" stroke-opacity="0.85" />

    <!-- Lanyard Notch -->
    <rect x="438" y="44" width="204" height="40" rx="20" fill="#05090F" stroke="#33507E" stroke-width="2.5" />

    <!-- AWS Logo (Vector Text Path + Smile Curve + Arrowhead) -->
    ${pAws}
    <path d="M462 202 Q540 240 610 200" fill="none" stroke="#FF9900" stroke-width="8" stroke-linecap="round" />
    <path d="M616 198 L592 190 L598 214 Z" fill="#FF9900" />

    <!-- Header Texts -->
    ${pSbg}
    ${pNiu}

    <!-- Official Motto Strip -->
    <rect x="88" y="372" width="904" height="44" rx="8" fill="#241447" stroke="#5B3AA8" stroke-width="1.5" />
    ${pMotto}

    <!-- Avatar Area -->
    <circle cx="540" cy="618" r="215" fill="url(#avatarGlow)" />

    <!-- Cyber Corner Brackets -->
    <g stroke="url(#accentGrad)" stroke-width="6" fill="none" stroke-linecap="round">
      <path d="M330 468 V428 H370" />
      <path d="M710 468 V428 H670" />
      <path d="M330 768 V808 H370" />
      <path d="M710 768 V808 H670" />
    </g>

    <!-- Outer Orange Ring -->
    <circle cx="540" cy="618" r="164" fill="none" stroke="#FF9900" stroke-opacity="0.35" stroke-width="2.5" />

    <!-- Inner Avatar Fill -->
    <circle cx="540" cy="618" r="150" fill="#12264D" />

    <!-- Initials -->
    ${pInitials}

    <!-- Accent Avatar Circle Border -->
    <circle cx="540" cy="618" r="150" fill="none" stroke="url(#accentGrad)" stroke-width="6" />

    <!-- Verified Checkmark Badge -->
    <circle cx="652" cy="730" r="27" fill="#FF9900" stroke="#0B1220" stroke-width="4" />
    <path d="M639 730 L649 740 L666 721" fill="none" stroke="#0B1220" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />

    <!-- Access Level -->
    ${pAccess}

    <!-- Role Pill -->
    <rect x="308" y="878" width="464" height="64" rx="32" fill="url(#accentGrad)" />
    ${pRole}

    <!-- Attendee Name & College -->
    ${pName}
    ${pCollege}

    <!-- Bottom Panel -->
    <rect x="68" y="1090" width="944" height="186" rx="24" fill="#081226" stroke="#4C2A85" stroke-width="2" />

    <!-- NFC Smart Pass -->
    <rect x="104" y="1136" width="86" height="64" rx="10" fill="url(#goldGrad)" />
    <path d="M104 1168 H190 M133 1136 V1200 M161 1136 V1200" stroke="#7A5A14" stroke-width="3" fill="none" />
    ${pNfc}

    <!-- Barcode White Box -->
    <rect x="252" y="1108" width="400" height="88" rx="12" fill="#FFFFFF" />
    ${barcodeLines}
    ${pCode}
    ${pScan}

    <!-- Modern QR Pass Box -->
    <rect x="814" y="1098" width="154" height="154" rx="16" fill="#FFFFFF" stroke="#A855F7" stroke-opacity="0.7" stroke-width="2" />
    ${qrRects}
    <circle cx="848" cy="1265" r="4.5" fill="#00D084" />
    ${pVerifiedText}

    <!-- Footer -->
    ${pFooter1}
    ${pFooter2}
  </g>
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
