'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Download, ShieldCheck, Camera, Sparkles, RefreshCw, Palette, Lock } from 'lucide-react';
import { drawModernQrOnContext } from '@/lib/modernQr';

interface BadgeCanvasProps {
  initialName?: string;
  initialRole?: string;
  initialEmail?: string;
}

type BadgeTheme = 'sbg' | 'classic';

const THEME_CONFIGS = {
  sbg: {
    name: 'AWS SBG Gradient',
    bgTop: '#22104D',
    bgBot: '#0A0618',
    glow: '#A855F7',
    pillText: '#FFFFFF',
    blue: '#C9A7FF',
    panelStroke: '#4C2A85',
    stripFill: '#241447',
    stripStroke: '#5B3AA8',
    stripText: '#D9C8FF',
    stripSize: 17,
    strip: 'LEARN • CONNECT • BUILD • BELONG • OFFICIAL STUDENT BUILDER CREDENTIAL',
    blobs: true,
  },
  classic: {
    name: 'Classic AWS Navy & Orange',
    bgTop: '#0D1830',
    bgBot: '#070D1D',
    glow: '#FF9900',
    pillText: '#0B1220',
    blue: '#57A8E8',
    panelStroke: '#24406E',
    stripFill: '#16264A',
    stripStroke: '#2C4A7C',
    stripText: '#A9C2E4',
    stripSize: 18.5,
    strip: 'OFFICIAL AWS BUILDER CREDENTIAL • ENCRYPTED PASS • REGION: ap-south-1',
    blobs: false,
  },
};

const ROLES = [
  'Community Builder',
  'Official Attendee',
  'Featured Speaker',
  'Organizer / Core Team',
  'Official Sponsor',
  'Community Volunteer',
];

export function BadgeCanvas({ initialName = '', initialRole = 'Community Builder', initialEmail = '' }: BadgeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [fullName, setFullName] = useState(initialName || '');
  const [email, setEmail] = useState(initialEmail || '');
  const [institution, setInstitution] = useState('Noida International University');
  const [role, setRole] = useState(
    ROLES.find((r) => r.toLowerCase() === initialRole.toLowerCase()) || 'Community Builder'
  );
  const [badgeCode, setBadgeCode] = useState<string | null>(null);
  const [accessLevel, setAccessLevel] = useState('Full Conference & Workshops');
  const [theme, setTheme] = useState<BadgeTheme>('sbg');
  const [photoImage, setPhotoImage] = useState<HTMLImageElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [useInitials, setUseInitials] = useState(true);

  // Verification & Claim States
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [claimSource, setClaimSource] = useState<'event_registration' | 'community_member' | 'community_donation' | null>(null);
  const [claimEventTitle, setClaimEventTitle] = useState<string | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [downloadedBadge, setDownloadedBadge] = useState<string | null>(null);

  // Strictly lock name and credentials when email matches a verified participant or issued badge
  const isLocked = Boolean(
    (eligibilityResult?.registered && eligibilityResult?.registration) ||
    (eligibilityResult?.existingBadge?.status === 'verified' && badgeCode)
  );

  // Compute initials (e.g. "Aarav Sharma" -> "AS")
  const getInitials = (name: string) => {
    const parts = name.replace('.', ' ').split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'AS';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        setPhotoImage(img);
        setUseInitials(false);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleResetToInitials = () => {
    setPhotoImage(null);
    setUseInitials(true);
  };

  // Render High-Res (1080 x 1350) exactly matching python script & SVG specification
  const drawBadge = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080;
    const H = 1350;
    canvas.width = W;
    canvas.height = H;

    const T = THEME_CONFIGS[theme];
    const ORANGE = '#FF9900';
    const ORANGE_LT = '#FFB84D';
    const INK = '#0B1220';
    const MUTED = '#8FA8CC';

    // 1. Background linear gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, T.bgTop);
    bgGrad.addColorStop(1, T.bgBot);

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(0, 0, W, H, 48);
    ctx.clip();

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Grid Pattern (45px cells, white with 0.045 opacity)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.045)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 45) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y += 45) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Atmospheric Radiant Blobs (if theme.blobs == true)
    if (T.blobs) {
      // Blob 1: Top-Left Purple
      const b1 = ctx.createRadialGradient(90, 80, 0, 90, 80, 330);
      b1.addColorStop(0, 'rgba(124, 58, 237, 0.55)');
      b1.addColorStop(1, 'rgba(124, 58, 237, 0)');
      ctx.fillStyle = b1;
      ctx.beginPath();
      ctx.arc(90, 80, 330, 0, Math.PI * 2);
      ctx.fill();

      // Blob 2: Top-Right Pink
      const b2 = ctx.createRadialGradient(1010, 330, 0, 1010, 330, 300);
      b2.addColorStop(0, 'rgba(236, 72, 153, 0.45)');
      b2.addColorStop(1, 'rgba(236, 72, 153, 0)');
      ctx.fillStyle = b2;
      ctx.beginPath();
      ctx.arc(1010, 330, 300, 0, Math.PI * 2);
      ctx.fill();

      // Blob 3: Bottom-Left Orange
      const b3 = ctx.createRadialGradient(60, 1100, 0, 60, 1100, 300);
      b3.addColorStop(0, 'rgba(255, 153, 0, 0.38)');
      b3.addColorStop(1, 'rgba(255, 153, 0, 0)');
      ctx.fillStyle = b3;
      ctx.beginPath();
      ctx.arc(60, 1100, 300, 0, Math.PI * 2);
      ctx.fill();

      // Blob 4: Bottom-Right Purple
      const b4 = ctx.createRadialGradient(1030, 1280, 0, 1030, 1280, 280);
      b4.addColorStop(0, 'rgba(124, 58, 237, 0.55)');
      b4.addColorStop(1, 'rgba(124, 58, 237, 0)');
      ctx.fillStyle = b4;
      ctx.beginPath();
      ctx.arc(1030, 1280, 280, 0, Math.PI * 2);
      ctx.fill();

      // Wireframe Builder Cubes
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 2.5;
      ctx.fillStyle = 'none';

      // Left cube at 120, 560
      ctx.beginPath();
      ctx.moveTo(120, 560);
      ctx.lineTo(154, 540);
      ctx.lineTo(188, 560);
      ctx.lineTo(188, 600);
      ctx.lineTo(154, 620);
      ctx.lineTo(120, 600);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(120, 560);
      ctx.lineTo(154, 580);
      ctx.lineTo(188, 560);
      ctx.moveTo(154, 580);
      ctx.lineTo(154, 620);
      ctx.stroke();

      // Right cube at 880, 700
      ctx.beginPath();
      ctx.moveTo(880, 700);
      ctx.lineTo(908, 684);
      ctx.lineTo(936, 700);
      ctx.lineTo(936, 732);
      ctx.lineTo(908, 748);
      ctx.lineTo(880, 732);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(880, 700);
      ctx.lineTo(908, 716);
      ctx.lineTo(936, 700);
      ctx.moveTo(908, 716);
      ctx.lineTo(908, 748);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Accent Gradient Generator
    const getAccentGrad = (x1: number, y1: number, x2: number, y2: number) => {
      if (theme === 'classic') {
        return ORANGE;
      }
      const g = ctx.createLinearGradient(x1, y1, x2, y2);
      g.addColorStop(0, '#A855F7');
      g.addColorStop(0.5, '#EC4899');
      g.addColorStop(1, '#FF9900');
      return g;
    };

    // 3. Card Border (rect x=22, y=22, width=1036, height=1306, rx=38)
    ctx.save();
    ctx.strokeStyle = getAccentGrad(22, 0, 1058, 0);
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.roundRect(22, 22, 1036, 1306, 38);
    ctx.stroke();
    ctx.restore();

    // 4. Lanyard Slot (rect x=438, y=44, width=204, height=40, rx=20)
    ctx.fillStyle = '#05090F';
    ctx.strokeStyle = '#33507E';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(438, 44, 204, 40, 20);
    ctx.fill();
    ctx.stroke();

    // 5. AWS Wordmark + Smile Arrow
    // "aws" text at x=540, y=196
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 96px "Noto Sans", DejaVu Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '1px';
    ctx.fillText('aws', 540, 196);

    // Smile Curve: M462 202 Q540 240 610 200
    ctx.save();
    ctx.strokeStyle = ORANGE;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(462, 202);
    ctx.quadraticCurveTo(540, 240, 610, 200);
    ctx.stroke();

    // Arrowhead: M616 198 L592 190 L598 214 Z
    ctx.fillStyle = ORANGE;
    ctx.beginPath();
    ctx.moveTo(616, 198);
    ctx.lineTo(592, 190);
    ctx.lineTo(598, 214);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 6. Header: STUDENT BUILDER GROUP
    ctx.fillStyle = getAccentGrad(200, 0, 880, 0);
    ctx.font = '700 34px "Noto Sans", DejaVu Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '11px';
    ctx.fillText('STUDENT BUILDER GROUP', 540, 286);

    // Chapter Name: Noida International University
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 46px "Noto Sans", DejaVu Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '0px';
    ctx.fillText('Noida International University', 540, 342);

    // 7. Official Motto Strip
    ctx.fillStyle = T.stripFill;
    ctx.strokeStyle = T.stripStroke;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(88, 372, 904, 44, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = T.stripText;
    ctx.font = `600 ${T.stripSize}px "Noto Sans", DejaVu Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '2px';
    ctx.fillText(T.strip, 540, 401);

    // 8. Photo Area: Glow + Brackets + Circle + Checked Seal
    // Glow: circle cx=540, cy=618, r=215
    const glowGrad = ctx.createRadialGradient(540, 618, 0, 540, 618, 215);
    glowGrad.addColorStop(0, `${T.glow}4D`); // ~0.30 opacity
    glowGrad.addColorStop(1, `${ORANGE}00`);
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(540, 618, 215, 0, Math.PI * 2);
    ctx.fill();

    // Corner Brackets: stroke-width=6, stroke=bracket, linecap=round
    ctx.save();
    ctx.strokeStyle = getAccentGrad(330, 0, 710, 0);
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    // Top-Left: M330 468 V428 H370
    ctx.moveTo(330, 468);
    ctx.lineTo(330, 428);
    ctx.lineTo(370, 428);
    // Top-Right: M710 468 V428 H670
    ctx.moveTo(710, 468);
    ctx.lineTo(710, 428);
    ctx.lineTo(670, 428);
    // Bottom-Left: M330 768 V808 H370
    ctx.moveTo(330, 768);
    ctx.lineTo(330, 808);
    ctx.lineTo(370, 808);
    // Bottom-Right: M710 768 V808 H670
    ctx.moveTo(710, 768);
    ctx.lineTo(710, 808);
    ctx.lineTo(670, 808);
    ctx.stroke();
    ctx.restore();

    // Photo Ring:
    // Outer circle cx=540, cy=618, r=164, stroke=ORANGE, opacity=0.35, width=2.5
    ctx.strokeStyle = 'rgba(255, 153, 0, 0.35)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(540, 618, 164, 0, Math.PI * 2);
    ctx.stroke();

    // Inner circle fill #12264D, stroke=ring, width=6, r=150
    ctx.save();
    ctx.beginPath();
    ctx.arc(540, 618, 150, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.fillStyle = '#12264D';
    ctx.fillRect(390, 468, 300, 300);

    if (photoImage && !useInitials) {
      // Draw centered cropped user photo
      const side = Math.min(photoImage.width, photoImage.height);
      const sx = (photoImage.width - side) / 2;
      const sy = (photoImage.height - side) / 2;
      ctx.drawImage(photoImage, sx, sy, side, side, 390, 468, 300, 300);
    } else {
      // Bold Initials "AS" (font-size 118, font-weight 700)
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 118px "Noto Sans", DejaVu Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '2px';
      ctx.fillText(getInitials(fullName), 540, 662);
    }
    ctx.restore();

    // Circle border on top of photo
    ctx.save();
    ctx.strokeStyle = getAccentGrad(390, 0, 690, 0);
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(540, 618, 150, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Verified checkmark: cx=652, cy=730, r=27, fill=ORANGE, stroke=#0B1220, width=4
    ctx.save();
    ctx.fillStyle = ORANGE;
    ctx.strokeStyle = '#0B1220';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(652, 730, 27, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Checkmark path: M639 730 L649 740 L666 721, stroke=#0B1220, width=6, round
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(639, 730);
    ctx.lineTo(649, 740);
    ctx.lineTo(666, 721);
    ctx.stroke();
    ctx.restore();

    // 9. Access Level Text
    ctx.fillStyle = MUTED;
    ctx.font = '600 22px "Noto Sans", DejaVu Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '4.5px';
    ctx.fillText(`ACCESS LEVEL • ${accessLevel.toUpperCase()}`, 540, 852);

    // 10. Role Pill: rect x=308, y=878, width=464, height=64, rx=32
    ctx.save();
    if (theme === 'sbg') {
      const pillGrad = ctx.createLinearGradient(308, 0, 772, 0);
      pillGrad.addColorStop(0, '#A855F7');
      pillGrad.addColorStop(0.5, '#EC4899');
      pillGrad.addColorStop(1, '#FF9900');
      ctx.fillStyle = pillGrad;
    } else {
      const pillGrad = ctx.createLinearGradient(308, 0, 772, 0);
      pillGrad.addColorStop(0, ORANGE);
      pillGrad.addColorStop(1, ORANGE_LT);
      ctx.fillStyle = pillGrad;
    }
    ctx.beginPath();
    ctx.roundRect(308, 878, 464, 64, 32);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = T.pillText;
    ctx.font = '700 30px "Noto Sans", DejaVu Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '3px';
    ctx.fillText(role.toUpperCase(), 540, 921);

    // 11. Attendee Name & College
    const cleanName = fullName.trim() || 'Aarav Sharma';
    ctx.fillStyle = '#FFFFFF';
    ctx.letterSpacing = '0px';

    let nSize = 80;
    ctx.font = `700 ${nSize}px "Noto Sans", DejaVu Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    while (ctx.measureText(cleanName).width > 900 && nSize > 40) {
      nSize -= 2;
      ctx.font = `700 ${nSize}px "Noto Sans", DejaVu Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    }
    ctx.textAlign = 'center';
    ctx.fillText(cleanName, 540, 1022);

    ctx.fillStyle = T.blue;
    ctx.font = '600 33px "Noto Sans", DejaVu Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Noida International University', 540, 1072);

    // 12. Bottom Panel: rect x=68, y=1090, width=944, height=186, rx=24
    ctx.fillStyle = '#081226';
    ctx.strokeStyle = T.panelStroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(68, 1090, 944, 186, 24);
    ctx.fill();
    ctx.stroke();

    // A. Smart Chip: rect x=104, y=1136, width=86, height=64, rx=10, fill=gold
    const goldGrad = ctx.createLinearGradient(104, 1136, 190, 1200);
    goldGrad.addColorStop(0, '#F0D089');
    goldGrad.addColorStop(1, '#B8862E');
    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.roundRect(104, 1136, 86, 64, 10);
    ctx.fill();

    // Chip contacts: M104 1168 H190 M133 1136 V1200 M161 1136 V1200
    ctx.strokeStyle = '#7A5A14';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(104, 1168);
    ctx.lineTo(190, 1168);
    ctx.moveTo(133, 1136);
    ctx.lineTo(133, 1200);
    ctx.moveTo(161, 1136);
    ctx.lineTo(161, 1200);
    ctx.stroke();

    ctx.fillStyle = '#7E93B8';
    ctx.font = '600 14.5px "Noto Sans", DejaVu Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '1.5px';
    ctx.fillText('NFC SMART PASS', 147, 1232);

    // B. Barcode: rect x=252, y=1108, width=400, height=88, rx=12, fill=#FFFFFF
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(252, 1108, 400, 88, 12);
    ctx.fill();

    // Crisp high-contrast black barcode lines (dark navy #0B1220 bars on white)
    ctx.fillStyle = INK;
    const barPattern = [3, 1, 4, 2, 5, 2, 1, 3, 2, 4, 1, 3, 5, 2, 2, 4, 1, 3, 2, 5, 1, 4, 2, 3, 1, 4, 2, 5, 3, 1, 2, 4, 1, 5, 2, 3, 2, 4, 1, 3, 4, 2, 5, 1, 3, 2, 4, 2, 5, 1, 3];
    let curBx = 270;
    let bIdx = 0;
    while (curBx < 634) {
      const bw = barPattern[bIdx % barPattern.length];
      const gap = (barPattern[(bIdx + 1) % barPattern.length] % 3) + 2;
      ctx.fillRect(curBx, 1116, bw, 72);
      curBx += bw + gap;
      bIdx++;
    }

    if (badgeCode) {
      const cleanCode = badgeCode.trim().toUpperCase();
      ctx.fillStyle = '#D7E3F5';
      ctx.font = '25px "DejaVu Sans Mono", Courier, monospace';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '2px';
      ctx.fillText(`* ${cleanCode} *`, 452, 1226);

      ctx.fillStyle = '#7E93B8';
      ctx.font = '13.5px "Noto Sans", DejaVu Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('SCAN TO VALIDATE DELEGATE IDENTITY', 452, 1252);
    } else {
      ctx.fillStyle = '#FF9900';
      ctx.font = '700 20px "DejaVu Sans Mono", Courier, monospace';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '2px';
      ctx.fillText(`* PASS CODE PENDING ADMIN ISSUANCE *`, 452, 1226);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '13px "Noto Sans", DejaVu Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('OFFICIAL CODE ISSUED BY ADMIN UPON APPROVAL', 452, 1252);
    }

    // C. Modern Verification QR Code (High-redundancy ISO-18004 scannable pass, pebble dots, squircle eyes, AWS center)
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://aws-sbg-niu.ac.in';
    const cleanCode = badgeCode?.trim().toUpperCase();
    const qrPayload = cleanCode ? `${origin}/verify/${cleanCode}` : `${origin}/badge`;

    const qrBoxX = 814;
    const qrBoxY = 1098;
    const qrBoxSize = 154;

    // Glowing cyber-frame border around modern QR
    ctx.save();
    ctx.shadowColor = theme === 'sbg' ? 'rgba(168, 85, 247, 0.45)' : 'rgba(255, 153, 0, 0.45)';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = theme === 'sbg' ? 'rgba(168, 85, 247, 0.7)' : 'rgba(255, 153, 0, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(qrBoxX - 2, qrBoxY - 2, qrBoxSize + 4, qrBoxSize + 4, 16);
    ctx.stroke();
    ctx.restore();

    // Direct vector modern QR render
    drawModernQrOnContext(ctx, qrPayload, qrBoxX, qrBoxY, qrBoxSize, {
      dotColor: '#081226',
      eyeColor: theme === 'sbg' ? '#9333EA' : '#FF9900',
      bgColor: '#FFFFFF',
      includeLogo: true,
      dotStyle: 'dots',
    });

    // Verification status label below modern QR
    ctx.fillStyle = badgeCode ? '#00D084' : '#FF9900';
    ctx.font = '700 11px "Noto Sans", DejaVu Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '1.5px';
    ctx.fillText(badgeCode ? '● VERIFIED PASS' : '○ PREVIEW PASS', qrBoxX + qrBoxSize / 2, 1269);

    // 13. Footer
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 23px "Noto Sans", DejaVu Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '0px';
    ctx.fillText('#AWSSBGNIU • Greater Noida, Delhi NCR', 540, 1302);

    ctx.fillStyle = '#66799A';
    ctx.font = '13.5px "Noto Sans", DejaVu Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Official AWS Student Builder Group • Supported by AWS Student Programs', 540, 1326);

    ctx.restore();
  }, [fullName, role, badgeCode, accessLevel, theme, photoImage, useInitials]);

  useEffect(() => {
    drawBadge();
  }, [drawBadge]);

  useEffect(() => {
    if (initialEmail && initialEmail.includes('@')) {
      void handleCheckEligibility(initialEmail);
    }
  }, [initialEmail]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const filename = `AWS-SBG-NIU-${role.replace(/\s+/g, '-')}-${fullName.replace(/\s+/g, '-').toLowerCase() || 'builder'}.png`;
      link.download = filename;
      link.href = dataUrl;
      link.click();
      if (badgeCode) {
        setDownloadedBadge(badgeCode);
      }
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  const handleShareOnLinkedIn = () => {
    const text = encodeURIComponent(
      `Excited to connect with student cloud builders as a ${role} at the AWS Student Builder Group, Noida International University! 🚀☁️\n\nOfficial Pass Code: ${badgeCode}\nJoin our community: https://www.meetup.com/aws-sbg-at-noida-international-university/\n\n#AWSSBGNIU #AWSCommunity #AWSCloud #NoidaInternationalUniversity #CloudBuilders`
    );
    window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${text}`, '_blank');
  };

  const handleCheckEligibility = async (candidateEmail?: string) => {
    const targetEmail = (candidateEmail || email).trim().toLowerCase();
    if (!targetEmail) {
      alert('Please enter your email to check registration.');
      return;
    }

    setCheckingEligibility(true);
    try {
      const res = await fetch(`/api/badges/check?email=${encodeURIComponent(targetEmail)}`);
      const data = await res.json();
      setEligibilityResult(data);

      if (data.existingBadge) {
        if (data.existingBadge.code && data.existingBadge.status === 'verified') {
          setBadgeCode(data.existingBadge.code);
          setIsClaimed(true);
          setClaimSource(data.existingBadge.source);
          setClaimEventTitle(data.existingBadge.event_title);
          if (data.existingBadge.full_name) {
            setFullName(data.existingBadge.full_name);
          }
          if (data.existingBadge.role) {
            setRole(data.existingBadge.role);
          }
          if (data.existingBadge.institution) {
            setInstitution(data.existingBadge.institution);
          }
        } else {
          setBadgeCode(null);
          setIsClaimed(false);
        }
      }

      if (data.registered && data.registration) {
        if (data.registration.full_name) {
          setFullName(data.registration.full_name);
        }
        if (data.registration.role) {
          const roleMap: Record<string, string> = {
            attendee: 'Official Attendee',
            speaker: 'Featured Speaker',
            sponsor: 'Official Sponsor',
            volunteer: 'Community Volunteer',
          };
          setRole(roleMap[data.registration.role] || 'Community Builder');
        }
        if (data.registration.college) {
          setInstitution(data.registration.college);
        }
      }
    } catch {
      alert('Failed to check event registration.');
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleApplyBadge = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setIsClaimModalOpen(true);
      return;
    }

    if (eligibilityResult && !eligibilityResult.registered) {
      alert('❌ Badge sirf event registered candidates ko hi mil sakta hai.\nBina event register kiye badge nahi mil sakta. Kripya pehle kisi event ke liye register karein.');
      return;
    }

    setSubmittingClaim(true);
    try {
      const res = await fetch('/api/badges/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          full_name: fullName,
          role,
          institution,
          theme,
          access_level: accessLevel,
        }),
      });

      const data = await res.json();
      if (res.ok && data.badge) {
        if (data.badge.code) {
          setBadgeCode(data.badge.code);
          setIsClaimed(true);
          setClaimSource(data.badge.source);
          setClaimEventTitle(data.badge.event_title);
          if (data.badge.full_name) setFullName(data.badge.full_name);
          if (data.badge.role) setRole(data.badge.role);
          if (data.badge.institution) setInstitution(data.badge.institution);
          setIsClaimModalOpen(false);

          if (data.alreadyIssued) {
            alert('ℹ️ Aapka official badge already issued hai (1 email se sirf 1 badge allow hai). Badge load ho gaya hai!');
          }

          // Immediate Download
          setTimeout(() => {
            handleDownload();
          }, 600);
        }
      } else {
        alert(data.error || 'Failed to verify badge.');
      }
    } catch {
      alert('Network error while verifying badge.');
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleDownloadClick = () => {
    if (badgeCode) {
      handleDownload();
    } else {
      if (!email.trim()) {
        setIsClaimModalOpen(true);
      } else if (eligibilityResult?.registered) {
        handleApplyBadge();
      } else if (eligibilityResult && !eligibilityResult.registered) {
        alert('❌ Badge sirf event registered candidates ko hi mil sakta hai. Kripya pehle kisi event ke liye register karein.');
      } else {
        handleCheckEligibility(email);
      }
    }
  };

  const handleShareOnX = () => {
    const text = encodeURIComponent(
      `Excited to connect with student cloud builders as a ${role} at @AWSSBGNIU! ☁️🚀\n\nOfficial Credential: ${badgeCode}\nGenerate yours at: https://aws-sbg-niu.ac.in/badge`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&hashtags=AWSSBGNIU,AWSCommunity,CloudBuilders,AWS`, '_blank');
  };

  return (
    <div className="space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Input Form Controls */}
        <div className="lg:col-span-5 bg-[#0D0A24] border border-[#261B48] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-purple-950/40 relative overflow-hidden">
          {/* Top Accent Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#FF9900]" />

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF9900] animate-pulse" />
                <span className="text-xs font-bold text-[#FF9900] uppercase tracking-wider block">
                  Official Credential Generator
                </span>
              </div>
              <span className="text-[11px] text-purple-300 font-mono">1080 × 1350 px</span>
            </div>
            <h2 className="text-xl font-bold font-heading text-white">
              Badge Personalization
            </h2>
            <p className="text-xs text-purple-200/70">
              Exclusively for registered event participants • Strictly 1 official badge per candidate.
            </p>
          </div>

          {/* Verification Status Banner */}
          {isClaimed && badgeCode ? (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-bold text-emerald-400 block">
                  Official Pass Active: {badgeCode}
                </span>
                <p className="text-slate-300 text-[11px]">
                  Registered Event Pass ({claimEventTitle || 'Event Participant'}) • 1 Badge per Candidate
                </p>
                <Link
                  href={`/verify/${badgeCode}`}
                  target="_blank"
                  className="inline-block text-[#FF9900] font-semibold text-[11px] hover:underline"
                >
                  View Live Public Verification Page &rarr;
                </Link>
              </div>
            </div>
          ) : eligibilityResult && !eligibilityResult.registered ? (
            <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Lock className="w-4 h-4" />
                <span>Event Registration Required</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Badge sirf event registered candidates ko hi mil sakta hai. Bina event register kiye badge generate nahi ho sakta.
              </p>
              <Link
                href="/#events"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF9900] text-black text-xs font-bold hover:bg-[#FFAA22] transition"
              >
                Register for an Event &rarr;
              </Link>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#A855F7]/15 via-[#EC4899]/15 to-[#FF9900]/15 border border-[#FF9900]/40 flex items-center justify-between gap-3">
              <div className="text-xs">
                <span className="font-bold text-white block">Event Delegate Pass</span>
                <span className="text-purple-200/80 text-[11px]">
                  Enter registered email below to unlock your pass
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (email.trim()) {
                    handleCheckEligibility(email);
                  } else {
                    setIsClaimModalOpen(true);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#FF9900] text-white text-xs font-bold uppercase tracking-wider shrink-0 hover:scale-[1.02] transition shadow-md cursor-pointer"
              >
                Verify Email
              </button>
            </div>
          )}

          <div className="space-y-4">
            {/* Theme Toggle */}
            <div>
              <label className="block text-xs font-medium text-purple-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#FF9900]" />
                Badge Theme Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('sbg')}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border cursor-pointer ${
                    theme === 'sbg'
                      ? 'bg-gradient-to-r from-[#A855F7]/20 via-[#EC4899]/20 to-[#FF9900]/20 border-[#FF9900] text-white shadow-md shadow-[#FF9900]/20'
                      : 'bg-[#151036] border-[#291E4E] text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#FF9900]" />
                  <span>SBG Community Gradient</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('classic')}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border cursor-pointer ${
                    theme === 'classic'
                      ? 'bg-[#16264A] border-[#FF9900] text-white shadow-md shadow-[#FF9900]/20'
                      : 'bg-[#151036] border-[#291E4E] text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF9900]" />
                  <span>Classic AWS Navy</span>
                </button>
              </div>
            </div>

            {/* Email Address with Check Button */}
            <div>
              <label className="block text-xs font-medium text-purple-200 uppercase tracking-wider mb-2">
                Registered Event Email *
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    const newEmail = e.target.value;
                    setEmail(newEmail);
                    setEligibilityResult(null);
                    setBadgeCode(null);
                    setIsClaimed(false);
                    setClaimSource(null);
                    setClaimEventTitle(null);
                    setDownloadedBadge(null);
                  }}
                  placeholder="Enter your registered event email"
                  className="flex-1 px-3.5 py-2.5 bg-[#17123B] border border-[#30235C] rounded-xl text-white text-sm focus:outline-none focus:border-[#FF9900] transition"
                />
                <button
                  type="button"
                  onClick={() => handleCheckEligibility(email)}
                  disabled={checkingEligibility}
                  className="px-3.5 py-2.5 bg-[#251A52] hover:bg-[#342470] border border-[#432A85] text-xs font-bold text-white rounded-xl transition cursor-pointer shrink-0"
                >
                  {checkingEligibility ? 'Verifying...' : 'Check Status'}
                </button>
              </div>
              {eligibilityResult && (
                <div className="mt-2 text-[11px]">
                  {eligibilityResult.registered ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Event Participant Verified! Authorized for 1 official pass.
                    </span>
                  ) : (
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      Registration Not Found: Badge sirf event registered candidates ko hi milega.
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-purple-200 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Full Name *</span>
                {isLocked && (
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 normal-case">
                    <Lock className="w-3 h-3" />
                    Locked to Verified Attendee
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  readOnly={isLocked}
                  value={fullName}
                  onChange={(e) => {
                    if (!isLocked) setFullName(e.target.value);
                  }}
                  placeholder="Enter your name"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition ${
                    isLocked
                      ? 'bg-[#120B2E] border border-emerald-500/40 text-emerald-100 cursor-not-allowed select-none font-bold'
                      : 'bg-[#17123B] border border-[#30235C] text-white focus:outline-none focus:border-[#FF9900]'
                  }`}
                />
                {isLocked && (
                  <div className="absolute right-3 top-2.5 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                )}
              </div>
              {isLocked && (
                <p className="text-[11px] text-gray-400 mt-1">
                  1 Registered Email = 1 Official Badge. Name cannot be altered or transferred to other participants.
                </p>
              )}
            </div>

            {/* Role Preset Selector */}
            <div>
              <label className="block text-xs font-medium text-purple-200 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Attendee Role *</span>
                {isLocked && (
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 normal-case">
                    <Lock className="w-3 h-3" />
                    Assigned Credential Role
                  </span>
                )}
              </label>
              <select
                disabled={isLocked}
                value={role}
                onChange={(e) => {
                  if (!isLocked) setRole(e.target.value);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition ${
                  isLocked
                    ? 'bg-[#120B2E] border border-emerald-500/40 text-emerald-100 cursor-not-allowed select-none'
                    : 'bg-[#17123B] border border-[#30235C] text-white focus:outline-none focus:border-[#FF9900] cursor-pointer'
                }`}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} className="bg-[#17123B] text-white">
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Pass Code (Admin Issued) & Access Level in 2 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-purple-200 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Pass Code</span>
                  <span className="text-[10px] text-[#FF9900] normal-case font-normal">(Admin Issued)</span>
                </label>
                {badgeCode ? (
                  <div className="px-3.5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-400">{badgeCode}</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-400/20 px-1.5 py-0.5 rounded font-semibold">Active</span>
                  </div>
                ) : (
                  <div className="px-3.5 py-2.5 bg-[#17123B] border border-amber-500/40 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-amber-400 font-semibold truncate">Pending Admin Issuance</span>
                    <span className="text-[10px] text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded shrink-0">Admin</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-purple-200 uppercase tracking-wider mb-2">
                  Access Level
                </label>
                <input
                  type="text"
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value)}
                  placeholder="Full Conference & Workshops"
                  className="w-full px-3.5 py-2.5 bg-[#17123B] border border-[#30235C] rounded-xl text-white text-xs focus:outline-none focus:border-[#FF9900] transition"
                />
              </div>
            </div>

            {/* College / Organization */}
            <div>
              <label className="block text-xs font-medium text-purple-200 uppercase tracking-wider mb-2">
                College / Organization
              </label>
              <input
                type="text"
                readOnly={isLocked}
                value={institution}
                onChange={(e) => {
                  if (!isLocked) setInstitution(e.target.value);
                }}
                placeholder="Noida International University"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition ${
                  isLocked
                    ? 'bg-[#120B2E] border border-emerald-500/40 text-emerald-100 cursor-not-allowed select-none'
                    : 'bg-[#17123B] border border-[#30235C] text-white focus:outline-none focus:border-[#FF9900]'
                }`}
              />
            </div>

            {/* Avatar Mode: Photo Upload vs Bold Initials */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-purple-200 uppercase tracking-wider">
                  Avatar Display
                </label>
                {photoImage && (
                  <button
                    type="button"
                    onClick={handleResetToInitials}
                    className="text-[11px] text-[#FF9900] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Use &quot;{getInitials(fullName)}&quot; Initials
                  </button>
                )}
              </div>

              <label className="border-2 border-dashed border-[#30235C] hover:border-[#FF9900] rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-[#140F35] group">
                <div className="w-10 h-10 rounded-full bg-[#1F1749] group-hover:bg-[#FF9900]/20 flex items-center justify-center text-[#FF9900] transition">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-white">
                  {photoImage && !useInitials ? 'Change uploaded photo' : 'Upload photo or keep bold initials'}
                </span>
                <span className="text-[11px] text-purple-300/70">
                  Current: {photoImage && !useInitials ? 'Custom Photo' : `Initials ("${getInitials(fullName)}")`}
                </span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2 space-y-2">
            {!badgeCode ? (
              eligibilityResult && !eligibilityResult.registered ? (
                <Link
                  href="/#events"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-[#FF9900] hover:brightness-110 text-white text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.01] shadow-xl flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <Lock className="w-4 h-4" />
                  <span>Register for an Event to Unlock Badge &rarr;</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleDownloadClick}
                  disabled={submittingClaim}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#FF9900] hover:brightness-110 text-white text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.01] shadow-xl shadow-purple-950/50 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{submittingClaim ? 'Verifying Event Pass...' : 'Verify Registration & Download Official Pass'}</span>
                </button>
              )
            ) : (
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF9900] via-[#EC7211] to-[#FF9900] hover:brightness-110 text-[#0F172A] text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.01] shadow-xl shadow-orange-950/40 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#0F172A]" />
                  <span>{downloading ? 'Rendering Print PNG...' : `Download Official Pass (${badgeCode})`}</span>
                </button>
                <p className="text-[11px] text-center text-emerald-400/90 font-mono">
                  {downloadedBadge === badgeCode
                    ? `✓ Official Pass Code ${badgeCode} issued (1 badge per registered email)`
                    : `Official Credential Bound to ${fullName} (${email})`}
                </p>
              </div>
            )}
          </div>

          {/* Share Intents */}
          <div className="space-y-2 pt-2 border-t border-[#261B48]">
            <span className="text-purple-300 text-[11px] font-semibold uppercase tracking-wider block">
              Share Your Badge with #AWSSBGNIU
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareOnLinkedIn}
                className="flex-1 py-2 bg-[#17123B] hover:bg-[#22184F] border border-[#30235C] rounded-lg text-xs font-semibold text-purple-200 hover:text-white transition cursor-pointer"
              >
                Share on LinkedIn
              </button>
              <button
                onClick={handleShareOnX}
                className="flex-1 py-2 bg-[#17123B] hover:bg-[#22184F] border border-[#30235C] rounded-lg text-xs font-semibold text-purple-200 hover:text-white transition cursor-pointer"
              >
                Share on X
              </button>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-[#140F35] border border-[#261B48] rounded-xl flex items-start gap-2.5 text-[11px] text-purple-200/80">
            <ShieldCheck className="w-4 h-4 text-[#FF9900] shrink-0 mt-0.5" />
            <span>
              <strong>Official Credential Policy:</strong> Badge generation is strictly reserved for registered event participants. Bina event register kiye badge generate nahi kiya ja sakta. Exactly 1 badge per candidate.
            </span>
          </div>
        </div>

        {/* Right Column: Live Badge Canvas Preview */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full max-w-md shadow-2xl rounded-2xl overflow-hidden border border-[#3D256C] bg-[#070514] transition hover:shadow-orange-500/10">
            <canvas
              ref={canvasRef}
              className="w-full h-auto aspect-[1080/1350] block"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-purple-300/70 mt-3 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9900]" />
            <span>Live 1080 × 1350 px • Vector Barcode &amp; NFC SmartChip Emulation</span>
          </div>
        </div>
      </div>

      {/* Verification & Pass Generation Modal */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0D0A24] border border-[#3D256C] rounded-3xl w-full max-w-md shadow-2xl relative my-auto max-h-[92vh] flex flex-col overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#FF9900] z-20" />

            {/* Modal Header */}
            <div className="p-5 sm:p-6 pb-3 border-b border-[#21143D] shrink-0 flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-[#FF9900] uppercase tracking-wider block">
                  Official Event Delegate Pass
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white font-heading mt-0.5">
                  Verify Event Registration
                </h3>
                <p className="text-xs text-purple-200/70 mt-1">
                  Badges are exclusively issued to registered event delegates (Strictly 1 badge per email).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsClaimModalOpen(false)}
                className="text-gray-400 hover:text-white text-lg p-1 rounded-lg hover:bg-white/5 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 flex-1">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-medium text-purple-200 uppercase tracking-wider mb-1.5">
                  Registered Event Email Address *
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEligibilityResult(null);
                    }}
                    placeholder="Enter your registered event email"
                    className="flex-1 px-3.5 py-2.5 bg-[#17123B] border border-[#30235C] rounded-xl text-white text-xs focus:outline-none focus:border-[#FF9900]"
                  />
                  <button
                    type="button"
                    onClick={() => handleCheckEligibility(email)}
                    disabled={checkingEligibility}
                    className="px-3.5 py-2 bg-[#FF9900] text-black font-bold text-xs rounded-xl hover:bg-[#FFAA22] transition shrink-0 cursor-pointer"
                  >
                    {checkingEligibility ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>

              {/* Eligibility Info Box */}
              {eligibilityResult ? (
                eligibilityResult.registered ? (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Event Registration Confirmed (1 Badge Authorized)</span>
                    </div>
                    <div className="text-slate-300 text-[11px]">
                      Event: <strong>{eligibilityResult.registration?.event_title || 'AWS SBG Event'}</strong><br />
                      Participant: <strong>{eligibilityResult.registration?.full_name || fullName}</strong> ({eligibilityResult.registration?.role || role})
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-rose-400 font-bold uppercase tracking-wider text-[11px]">
                      <Lock className="w-4 h-4" />
                      <span>Registration Not Found</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Badge sirf event registered candidates ko hi mil sakta hai. Bina event register kiye badge generate nahi kiya ja sakta.
                    </p>
                    <Link
                      href="/#events"
                      onClick={() => setIsClaimModalOpen(false)}
                      className="inline-block text-[#FF9900] font-semibold text-xs hover:underline"
                    >
                      Browse Upcoming Events &amp; Register &rarr;
                    </Link>
                  </div>
                )
              ) : (
                <div className="p-3.5 rounded-xl bg-[#140F35] border border-[#2B1E54] text-[11px] text-purple-200/80">
                  Enter your registered email above to unlock your official badge. Only registered event participants can generate a pass (Limit: 1 badge per email).
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 sm:p-5 pt-3 bg-[#0D0A24] border-t border-[#21143D] flex items-center gap-3 shrink-0 z-10">
              <button
                type="button"
                onClick={handleApplyBadge}
                disabled={submittingClaim || (eligibilityResult && !eligibilityResult.registered)}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#FF9900] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-purple-950/40 cursor-pointer disabled:opacity-50"
              >
                {submittingClaim ? 'Verifying Pass...' : 'Verify & Unlock Official Pass'}
              </button>
              <button
                type="button"
                onClick={() => setIsClaimModalOpen(false)}
                className="py-3 px-4 rounded-xl bg-[#17123B] hover:bg-[#231A56] text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Python CLI Instructions */}
      <section className="bg-[#0D0A24] border border-[#261B48] rounded-2xl p-8 sm:p-10 space-y-6 shadow-xl">
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#FF9900] uppercase tracking-wider block">
            Command Line Tool
          </span>
          <h3 className="text-xl font-bold font-heading text-white">
            Generate Badges in Bulk via Python CLI
          </h3>
          <p className="text-xs text-purple-200/80">
            A CLI generator is also available in this repository at <code className="text-[#FF9900] font-mono">scripts/generate_badge.py</code> to batch generate crystal-clear SVG and 2x print-ready PNG badges!
          </p>
        </div>

        <div className="bg-[#070514] border border-[#261B48] rounded-xl p-4 font-mono text-xs text-purple-200 space-y-2 overflow-x-auto">
          <div className="text-slate-400"># Install dependencies (once)</div>
          <div className="text-[#FFB84D]">pip install segno cairosvg python-barcode pillow</div>
          <div className="text-slate-400 mt-2"># Generate single badge</div>
          <div className="text-white">
            python scripts/generate_badge.py --name &quot;Aarav Sharma&quot; --role &quot;Community Builder&quot; --code &quot;NIU-AWS-2026-5645&quot; --out badge.png
          </div>
        </div>
      </section>
    </div>
  );
}


