'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Download, ShieldCheck, Camera } from 'lucide-react';

interface BadgeCanvasProps {
  initialName?: string;
  initialRole?: string;
}

export function BadgeCanvas({ initialName = '', initialRole = 'Community Member' }: BadgeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [fullName, setFullName] = useState(initialName || 'Aarav Sharma');
  const [role, setRole] = useState(initialRole || 'Community Member');
  const [institution, setInstitution] = useState('Noida International University');
  const [photoImage, setPhotoImage] = useState<HTMLImageElement | null>(null);
  const [downloading, setDownloading] = useState(false);

  // Load a default avatar if none uploaded
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = '/sbg-logo.svg';
    img.onload = () => {
      setPhotoImage(img);
    };
  }, []);

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
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Render high-res canvas (1080 x 1350)
  const drawBadge = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;

    // 1. Background Obsidian / Deep Cosmic Purple Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0C061E');
    bgGrad.addColorStop(0.5, '#140A2E');
    bgGrad.addColorStop(1, '#070312');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle Geometric Grid / Wireframe Pattern
    ctx.strokeStyle = '#24143D';
    ctx.lineWidth = 1;
    const gridSize = 45;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 3. Purple & Violet Glow Orbs (Top Right & Bottom Left)
    const glow1 = ctx.createRadialGradient(900, 150, 20, 900, 150, 450);
    glow1.addColorStop(0, 'rgba(168, 85, 247, 0.30)');
    glow1.addColorStop(1, 'rgba(168, 85, 247, 0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, width, height);

    const glow2 = ctx.createRadialGradient(150, 1200, 10, 150, 1200, 400);
    glow2.addColorStop(0, 'rgba(192, 132, 252, 0.20)');
    glow2.addColorStop(1, 'rgba(192, 132, 252, 0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, width, height);

    // 4. Pass Card Inner Frame
    const margin = 50;
    const cardRadius = 36;
    ctx.strokeStyle = '#2D1854';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(margin, margin, width - margin * 2, height - margin * 2, cardRadius);
    ctx.stroke();

    // 5. Header: AWS SBG Logos & Chapter Header
    // Lanyard punch hole aesthetic
    ctx.fillStyle = '#070312';
    ctx.strokeStyle = '#381C66';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 90, margin + 25, 180, 26, 13);
    ctx.fill();
    ctx.stroke();

    // Top Category Eyebrow
    ctx.fillStyle = '#C084FC';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '4px';
    ctx.fillText('AWS STUDENT BUILDER GROUP', width / 2, 160);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '0px';
    ctx.fillText('Noida International University', width / 2, 215);

    // Decorative Divider Line with Diamond
    ctx.strokeStyle = '#2D1854';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(180, 260);
    ctx.lineTo(width - 180, 260);
    ctx.stroke();

    ctx.fillStyle = '#C084FC';
    ctx.beginPath();
    ctx.arc(width / 2, 260, 6, 0, Math.PI * 2);
    ctx.fill();

    // 6. User Avatar Photo (Circular Mask with Purple Ring)
    const centerX = width / 2;
    const centerY = 470;
    const radius = 160;

    // Outer Glowing Ring
    ctx.save();
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 8;
    ctx.shadowColor = 'rgba(168, 85, 247, 0.55)';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Circular Photo
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    if (photoImage) {
      // Aspect-ratio cover calculation
      const imgAspect = photoImage.width / photoImage.height;
      let drawW = radius * 2;
      let drawH = radius * 2;
      let drawX = centerX - radius;
      let drawY = centerY - radius;

      if (imgAspect > 1) {
        drawW = drawH * imgAspect;
        drawX = centerX - drawW / 2;
      } else {
        drawH = drawW / imgAspect;
        drawY = centerY - drawH / 2;
      }

      ctx.drawImage(photoImage, drawX, drawY, drawW, drawH);
    } else {
      ctx.fillStyle = '#180C36';
      ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
    }
    ctx.restore();

    // 7. Role Pill Badge
    const pillY = 700;
    const roleText = role.toUpperCase();
    ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const textMetrics = ctx.measureText(roleText);
    const pillWidth = Math.max(260, textMetrics.width + 60);
    const pillHeight = 52;

    ctx.fillStyle = '#8B5CF6';
    ctx.beginPath();
    ctx.roundRect(centerX - pillWidth / 2, pillY - pillHeight / 2, pillWidth, pillHeight, 26);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(roleText, centerX, pillY);

    // 8. Attendee Name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 58px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(fullName || 'Your Full Name', centerX, 810);

    // 9. College / Company Name
    ctx.fillStyle = '#C084FC';
    ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(institution || 'Noida International University', centerX, 865);

    // 10. Pass ID / Unique Chapter Badge Code
    ctx.fillStyle = '#9CA3AF';
    ctx.font = 'bold 22px "Courier New", Courier, monospace';
    ctx.fillText('OFFICIAL COMMUNITY PASS • NIUSBG-2026', centerX, 920);

    // 11. Bottom Banner & Watermark
    ctx.strokeStyle = '#24143D';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 1180);
    ctx.lineTo(width - 100, 1180);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('#AWSSBGNIU • Greater Noida, Uttar Pradesh', centerX, 1225);

    ctx.fillStyle = '#555555';
    ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Independent Academic Group • Supported by AWS Student Programs', centerX, 1260);
  }, [fullName, role, institution, photoImage]);

  useEffect(() => {
    drawBadge();
  }, [drawBadge]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const filename = `AWSSBG-NIU-Badge-${fullName.replace(/\s+/g, '-').toLowerCase() || 'member'}.png`;
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  const handleShareOnLinkedIn = () => {
    const text = encodeURIComponent(
      `Excited to connect with student cloud builders as a ${role} at the AWS Student Builder Group, Noida International University! 🚀\n\nJoin us: https://www.meetup.com/aws-sbg-at-noida-international-university/\n\n#AWSSBGNIU #AWSCommunity #CloudComputing #NoidaInternationalUniversity`
    );
    window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${text}`, '_blank');
  };

  const handleShareOnX = () => {
    const text = encodeURIComponent(
      `Excited to connect with student cloud builders as a ${role} at @AWSSBGNIU! ☁️\n\nGenerated my community badge at:\nhttps://aws-sbg-niu.ac.in/badge`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&hashtags=AWSSBGNIU,AWSCommunity,CloudBuilders`, '_blank');
  };

  return (
    <div className="space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Input Form Controls */}
        <div className="lg:col-span-5 bg-[#0E0724] border border-[#24143D] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#C084FC] uppercase tracking-wider block">
              Customizer
            </span>
            <h2 className="text-xl font-bold font-heading text-white">
              Badge Details
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-purple-200 uppercase tracking-wider mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full px-3.5 py-2.5 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-sm focus:outline-none focus:border-[#A855F7]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-purple-200 uppercase tracking-wider mb-2">
                Community Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-sm focus:outline-none focus:border-[#A855F7]"
              >
                <option value="Community Member">Community Member (Default)</option>
                <option value="Attendee">Attendee</option>
                <option value="Speaker">Speaker</option>
                <option value="Organizer">Organizer</option>
                <option value="Volunteer">Volunteer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-purple-200 uppercase tracking-wider mb-2">
                College / Organization
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Noida International University"
                className="w-full px-3.5 py-2.5 bg-[#180C36] border border-[#24143D] rounded-lg text-white text-sm focus:outline-none focus:border-[#A855F7]"
              />
            </div>

            {/* Photo Upload Zone */}
            <div>
              <label className="block text-xs font-medium text-purple-200 uppercase tracking-wider mb-2">
                Your Photo (PNG / JPG / WEBP)
              </label>
              <label className="border-2 border-dashed border-[#24143D] hover:border-[#A855F7] rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-[#13092B]">
                <Camera className="w-6 h-6 text-[#C084FC]" />
                <span className="text-xs font-semibold text-white">Click or drag photo here</span>
                <span className="text-[10px] text-gray-400">Square or portrait recommended</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.01] shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Generating PNG...' : 'Download High-Res Badge (1080×1350)'}</span>
            </button>
          </div>

          {/* Share Intents */}
          <div className="space-y-2 pt-2 border-t border-[#24143D]">
            <span className="text-purple-300 text-[11px] font-semibold uppercase tracking-wider block">
              Share Your Badge with #AWSSBGNIU
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareOnLinkedIn}
                className="flex-1 py-2 bg-[#180C36] hover:bg-[#201045] border border-[#24143D] rounded-lg text-xs font-semibold text-purple-200 hover:text-white transition"
              >
                Share on LinkedIn
              </button>
              <button
                onClick={handleShareOnX}
                className="flex-1 py-2 bg-[#180C36] hover:bg-[#201045] border border-[#24143D] rounded-lg text-xs font-semibold text-purple-200 hover:text-white transition"
              >
                Share on X
              </button>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-[#13092B] border border-[#24143D] rounded-xl flex items-start gap-2.5 text-[11px] text-gray-300">
            <ShieldCheck className="w-4 h-4 text-[#C084FC] shrink-0 mt-0.5" />
            <span>
              <strong>Privacy Guaranteed:</strong> Your photo is processed 100% inside your local browser canvas and is never uploaded to any server.
            </span>
          </div>
        </div>

        {/* Right Column: Live Badge Canvas Preview */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full max-w-md shadow-2xl rounded-2xl overflow-hidden border border-[#24143D] bg-[#070312]">
            <canvas
              ref={canvasRef}
              className="w-full h-auto aspect-[1080/1350] block"
            />
          </div>
          <span className="text-xs text-purple-300/70 mt-3">
            Live client-side canvas render • 1080 × 1350 px
          </span>
        </div>
      </div>

      {/* 3-Step "How to Share" Guide */}
      <section className="bg-[#0E0724] border border-[#24143D] rounded-2xl p-8 sm:p-10 space-y-6 shadow-xl">
        <h3 className="text-xl font-bold font-heading text-white text-center">
          How to Share Your Badge
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-[#13092B] border border-[#24143D] rounded-xl space-y-2">
            <span className="text-xs font-mono font-bold text-[#C084FC] block">01 / DOWNLOAD</span>
            <h4 className="text-sm font-bold text-white font-heading">Download High-Res Image</h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Click &quot;Download High-Res Badge&quot; to save the crystal clear 1080×1350 PNG file to your computer or mobile.
            </p>
          </div>

          <div className="p-5 bg-[#13092B] border border-[#24143D] rounded-xl space-y-2">
            <span className="text-xs font-mono font-bold text-[#C084FC] block">02 / POST ONLINE</span>
            <h4 className="text-sm font-bold text-white font-heading">Post on LinkedIn &amp; X</h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Attach the downloaded badge to a new post sharing your excitement for learning cloud computing with AWS SBG NIU.
            </p>
          </div>

          <div className="p-5 bg-[#13092B] border border-[#24143D] rounded-xl space-y-2">
            <span className="text-xs font-mono font-bold text-[#C084FC] block">03 / TAG #AWSSBGNIU</span>
            <h4 className="text-sm font-bold text-white font-heading">Tag the Community</h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Use hashtag <code className="text-[#C084FC]">#AWSSBGNIU</code> so our community builders can discover and repost your badge!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
