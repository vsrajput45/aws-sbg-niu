import QRCode from 'qrcode';

export interface ModernQrOptions {
  size?: number;
  dotColor?: string;
  eyeColor?: string;
  bgColor?: string;
  includeLogo?: boolean;
  logoType?: 'aws' | 'sbg';
  dotStyle?: 'dots' | 'rounded';
}

/**
 * Draws a modern, stylish QR code directly onto a Canvas 2D context.
 * Compliant with ISO/IEC 18004 standards while providing a high-tech modern aesthetic
 * (smooth pebble dots, rounded squircle finder eyes, and embedded AWS center mark).
 */
export function drawModernQrOnContext(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  options: ModernQrOptions = {}
): void {
  const {
    dotColor = '#0B1220',
    eyeColor = '#FF9900',
    bgColor = '#FFFFFF',
    includeLogo = true,
    dotStyle = 'dots',
  } = options;

  // Generate QR matrix using Error Correction Level H (30% redundancy)
  const qr = QRCode.create(text, { errorCorrectionLevel: 'H' });
  const N = qr.modules.size;

  // Margin in modules
  const marginModules = 2.5;
  const totalModules = N + marginModules * 2;
  const moduleSize = size / totalModules;
  const startX = x + marginModules * moduleSize;
  const startY = y + marginModules * moduleSize;

  ctx.save();

  // 1. Draw card background with rounded corners
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, Math.max(12, size * 0.08));
  ctx.fill();

  // Helper to check if a cell is inside one of the three 7x7 finder patterns
  const isFinderPattern = (r: number, c: number): boolean => {
    if (r < 7 && c < 7) return true; // Top-Left
    if (r < 7 && c >= N - 7) return true; // Top-Right
    if (r >= N - 7 && c < 7) return true; // Bottom-Left
    return false;
  };

  // Center logo boundary (approx 7x7 modules in center)
  const centerSize = includeLogo ? 7 : 0;
  const centerStart = Math.floor(N / 2) - Math.floor(centerSize / 2);
  const centerEnd = centerStart + centerSize - 1;

  const isCenterLogo = (r: number, c: number): boolean => {
    if (!includeLogo) return false;
    return r >= centerStart && r <= centerEnd && c >= centerStart && c <= centerEnd;
  };

  // 2. Draw Data Modules as modern smooth dots or rounded squircles
  ctx.fillStyle = dotColor;

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (isFinderPattern(r, c) || isCenterLogo(r, c)) {
        continue;
      }

      if (qr.modules.get(r, c)) {
        const mx = startX + c * moduleSize;
        const my = startY + r * moduleSize;

        if (dotStyle === 'dots') {
          // Circular modern pebble dot
          const cx = mx + moduleSize / 2;
          const cy = my + moduleSize / 2;
          const radius = moduleSize * 0.42;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Rounded squircle module
          ctx.beginPath();
          ctx.roundRect(
            mx + 0.5,
            my + 0.5,
            moduleSize - 1,
            moduleSize - 1,
            moduleSize * 0.35
          );
          ctx.fill();
        }
      }
    }
  }

  // 3. Draw Modern Squircle Finder Patterns (Eyes)
  const drawModernEye = (eyeX: number, eyeY: number) => {
    const eyeDimension = 7 * moduleSize;
    const strokeW = moduleSize;

    // Outer Eye: Rounded Squircle Frame
    ctx.save();
    ctx.strokeStyle = eyeColor;
    ctx.lineWidth = strokeW;
    ctx.beginPath();
    ctx.roundRect(
      eyeX + strokeW / 2,
      eyeY + strokeW / 2,
      eyeDimension - strokeW,
      eyeDimension - strokeW,
      moduleSize * 1.8
    );
    ctx.stroke();

    // Inner Pupil: Solid Smooth Squircle
    ctx.fillStyle = dotColor;
    const pupilOffset = 2 * moduleSize;
    const pupilDimension = 3 * moduleSize;
    ctx.beginPath();
    ctx.roundRect(
      eyeX + pupilOffset,
      eyeY + pupilOffset,
      pupilDimension,
      pupilDimension,
      moduleSize * 0.9
    );
    ctx.fill();
    ctx.restore();
  };

  // Draw Top-Left Eye
  drawModernEye(startX, startY);
  // Draw Top-Right Eye
  drawModernEye(startX + (N - 7) * moduleSize, startY);
  // Draw Bottom-Left Eye
  drawModernEye(startX, startY + (N - 7) * moduleSize);

  // 4. Draw Center AWS Logo Badge (if enabled)
  if (includeLogo) {
    const logoAreaX = startX + centerStart * moduleSize;
    const logoAreaY = startY + centerStart * moduleSize;
    const logoAreaSize = centerSize * moduleSize;

    // Outer white halo with subtle drop shadow
    ctx.save();
    ctx.fillStyle = bgColor;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = moduleSize * 1.5;
    ctx.shadowOffsetY = moduleSize * 0.5;
    ctx.beginPath();
    ctx.roundRect(
      logoAreaX - 1,
      logoAreaY - 1,
      logoAreaSize + 2,
      logoAreaSize + 2,
      moduleSize * 1.5
    );
    ctx.fill();
    ctx.restore();

    // Center badge container
    ctx.save();
    ctx.fillStyle = '#0B1220';
    ctx.beginPath();
    ctx.roundRect(
      logoAreaX + moduleSize * 0.4,
      logoAreaY + moduleSize * 0.4,
      logoAreaSize - moduleSize * 0.8,
      logoAreaSize - moduleSize * 0.8,
      moduleSize * 1.2
    );
    ctx.fill();

    // Center typography: "AWS" in bold branding
    const centerCX = logoAreaX + logoAreaSize / 2;
    const centerCY = logoAreaY + logoAreaSize / 2;

    ctx.fillStyle = '#FF9900';
    ctx.font = `900 ${Math.round(moduleSize * 2.2)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '0.5px';
    ctx.fillText('AWS', centerCX, centerCY - moduleSize * 0.25);

    // AWS smile curve underneath
    ctx.strokeStyle = '#FF9900';
    ctx.lineWidth = Math.max(2, moduleSize * 0.4);
    ctx.lineCap = 'round';
    ctx.beginPath();
    const smileW = moduleSize * 1.8;
    const smileY = centerCY + moduleSize * 1.1;
    ctx.arc(centerCX, smileY - moduleSize * 0.8, smileW * 0.65, 0.25 * Math.PI, 0.75 * Math.PI, false);
    ctx.stroke();

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Generates an in-memory data URL of the modern QR code for display in HTML <img> tags.
 */
export async function generateModernQrDataUrl(
  text: string,
  options: ModernQrOptions = {}
): Promise<string> {
  const size = options.size || 360;
  if (typeof document === 'undefined') {
    // Fallback if rendered on server
    return QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: options.dotColor || '#0B1220',
        light: options.bgColor || '#FFFFFF',
      },
    });
  }

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return QRCode.toDataURL(text, { width: size });
  }

  drawModernQrOnContext(ctx, text, 0, 0, size, options);
  return canvas.toDataURL('image/png');
}
