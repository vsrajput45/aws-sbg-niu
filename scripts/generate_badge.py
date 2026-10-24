#!/usr/bin/env python3
"""
AWS SBG NIU — Badge Card Generator (1080 x 1350, print-ready PNG)
=================================================================
Ek hi command se kisi ke liye bhi badge ban jata hai:

  python3 generate_badge.py --name "Aarav Sharma" --role "Community Builder" \
      --code "NIU-AWS-2026-5645" --out badge.png

Options:
  --access   Default: "Full Conference & Workshops"
  --photo    Optional photo path (PNG/JPG) — nahi diya to initials avatar banega
  --verify-base  Agar site live hai to e.g. "https://<site>/verify/" —
                 QR seedha verify URL kholega. NAHI diya to QR me badge ki
                 poori verification details (text) encode hoti hain, jo kisi
                 bhi scanner se padhi ja sakti hain.

Deps (ek baar):  pip install segno cairosvg python-barcode pillow
"""
import argparse, base64, io, math, sys
from xml.sax.saxutils import escape as _esc

import segno
from barcode import Code128
from barcode.writer import ImageWriter
from PIL import Image

W, H = 1080, 1350
NAVY_TOP, NAVY_BOT = "#0D1830", "#070D1D"
ORANGE, ORANGE_LT = "#FF9900", "#FFB84D"
INK = "#0B1220"
MUTED = "#8FA8CC"
BLUE = "#57A8E8"


def qr_group(payload: str, x: int, y: int, size: int) -> str:
    """Segno se asli QR banao, SVG rects ke roop me (vector, print-crisp)."""
    qr = segno.make(payload, error="m")
    rows = [list(r) for r in qr.matrix]
    n = len(rows)
    mod = size / n
    parts = [f'<g transform="translate({x},{y})">']
    for r, row in enumerate(rows):
        for c, v in enumerate(row):
            if v:
                parts.append(
                    f'<rect x="{c*mod:.2f}" y="{r*mod:.2f}" '
                    f'width="{mod+0.4:.2f}" height="{mod+0.4:.2f}" fill="{INK}"/>'
                )
    parts.append("</g>")
    return "".join(parts)


def barcode_png_b64(code: str) -> str:
    """Code128 barcode — safed bars, transparent background (dark panel ke liye)."""
    buf = io.BytesIO()
    Code128(code, writer=ImageWriter()).write(
        buf, options={"write_text": False, "module_height": 16.0,
                      "module_width": 0.42, "quiet_zone": 1.0}
    )
    img = Image.open(io.BytesIO(buf.getvalue())).convert("RGBA")
    px = img.load()
    for j in range(img.height):
        for i in range(img.width):
            r, g, b, a = px[i, j]
            lum = (r + g + b) / 3
            if lum > 128:
                px[i, j] = (255, 255, 255, 255)
            else:
                px[i, j] = (11, 18, 32, 255)
    out = io.BytesIO()
    img.save(out, format="PNG")
    return base64.b64encode(out.getvalue()).decode()


def photo_circle_b64(path: str) -> str:
    """Photo ko center-crop karke gol (circle) mask ke sath PNG banao."""
    img = Image.open(path).convert("RGB")
    side = min(img.width, img.height)
    img = img.crop(((img.width - side) // 2, (img.height - side) // 2,
                    (img.width + side) // 2, (img.height + side) // 2))
    img = img.resize((600, 600), Image.LANCZOS)
    mask = Image.new("L", (600, 600), 0)
    from PIL import ImageDraw
    ImageDraw.Draw(mask).ellipse((0, 0, 600, 600), fill=255)
    out = Image.new("RGBA", (600, 600))
    out.paste(img, (0, 0))
    out.putalpha(mask)
    buf = io.BytesIO()
    out.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def initials(name: str) -> str:
    parts = [p for p in name.replace(".", " ").split() if p]
    return "".join(p[0].upper() for p in parts[:2]) or "?"


THEMES = {
    # AWS Student Builder theme — community gradient (purple -> pink -> orange),
    # motto strip "Learn - Connect - Build - Belong"
    "sbg": dict(
        bg_top="#22104D", bg_bot="#0A0618", border="url(#accentGrad)",
        sbg_fill="url(#accentGrad)", ring="url(#accentGrad)",
        bracket="url(#accentGrad)", glow="#A855F7",
        pill="url(#accentGrad)", pill_text="#FFFFFF",
        blue="#C9A7FF", panel_stroke="#4C2A85", strip_fill="#241447",
        strip_stroke="#5B3AA8", strip_text="#D9C8FF", strip_size="17",
        strip="LEARN \u2022 CONNECT \u2022 BUILD \u2022 BELONG \u2022 OFFICIAL STUDENT BUILDER CREDENTIAL",
        blobs=True,
    ),
    # Classic AWS event theme — navy + orange (pehla wala design)
    "classic": dict(
        bg_top="#0D1830", bg_bot="#070D1D", border="#FF9900",
        sbg_fill="#FF9900", ring="#FF9900",
        bracket="#FF9900", glow="#FF9900",
        pill="url(#pill)", pill_text="#0B1220",
        blue="#57A8E8", panel_stroke="#24406E", strip_fill="#16264A",
        strip_stroke="#2C4A7C", strip_text="#A9C2E4", strip_size="18.5",
        strip="OFFICIAL AWS BUILDER CREDENTIAL \u2022 ENCRYPTED PASS \u2022 REGION: ap-south-1",
        blobs=False,
    ),
}


def build_svg(name, role, code, access, verify_base="", photo_b64=None, theme="sbg"):
    T = THEMES[theme]
    name_d, code_d = _esc(name), _esc(code)
    role_d = _esc(role.upper())
    access_d = _esc(access.upper())
    if verify_base:
        payload = verify_base.rstrip("/") + "/" + code
    else:
        payload = (
            "AWS SBG NIU BADGE\n"
            f"ID: {code}\n"
            f"Name: {name}\n"
            f"Role: {role}"
        )
    qr = qr_group(payload, 829, 1109, 128)
    bc = barcode_png_b64(code)
    blobs_svg = ""
    if T["blobs"]:
        blobs_svg = (
            '<circle cx="90" cy="80" r="330" fill="url(#blobP)"/>'
            '<circle cx="1010" cy="330" r="300" fill="url(#blobPk)"/>'
            '<circle cx="60" cy="1100" r="300" fill="url(#blobO)"/>'
            '<circle cx="1030" cy="1280" r="280" fill="url(#blobP)"/>'
            '<g stroke="#FFFFFF" stroke-opacity="0.07" stroke-width="2.5" fill="none">'
            '<path d="M120 560 l34 -20 l34 20 v40 l-34 20 l-34 -20 Z M120 560 l34 20 l34 -20 M154 580 v40"/>'
            '<path d="M880 700 l28 -16 l28 16 v32 l-28 16 l-28 -16 Z M880 700 l28 16 l28 -16 M908 716 v32"/>'
            '</g>'
        )
    ini = initials(name)
    ini_text = "" if photo_b64 else ini
    photo_img = (f'<image x="390" y="468" width="300" height="300" '
                 f'href="data:image/png;base64,{photo_b64}"/>') if photo_b64 else ""

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{T['bg_top']}"/><stop offset="1" stop-color="{T['bg_bot']}"/>
  </linearGradient>
  <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#A855F7"/><stop offset="0.5" stop-color="#EC4899"/><stop offset="1" stop-color="#FF9900"/>
  </linearGradient>
  <radialGradient id="blobP" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#7C3AED" stop-opacity="0.55"/><stop offset="1" stop-color="#7C3AED" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="blobPk" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#EC4899" stop-opacity="0.45"/><stop offset="1" stop-color="#EC4899" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="blobO" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#FF9900" stop-opacity="0.38"/><stop offset="1" stop-color="#FF9900" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="pill" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="{ORANGE}"/><stop offset="1" stop-color="{ORANGE_LT}"/>
  </linearGradient>
  <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#F0D089"/><stop offset="1" stop-color="#B8862E"/>
  </linearGradient>
  <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="{T['glow']}" stop-opacity="0.30"/>
    <stop offset="1" stop-color="{ORANGE}" stop-opacity="0"/>
  </radialGradient>
  <pattern id="grid" width="45" height="45" patternUnits="userSpaceOnUse">
    <path d="M45 0H0V45" fill="none" stroke="#FFFFFF" stroke-opacity="0.045" stroke-width="1"/>
  </pattern>
</defs>

<rect x="0" y="0" width="{W}" height="{H}" rx="48" fill="url(#bg)"/>
<rect x="0" y="0" width="{W}" height="{H}" rx="48" fill="url(#grid)"/>
{blobs_svg}
<rect x="22" y="22" width="1036" height="1306" rx="38" fill="none" stroke="{T['border']}" stroke-opacity="0.85" stroke-width="3"/>

<!-- lanyard slot -->
<rect x="438" y="44" width="204" height="40" rx="20" fill="#05090F" stroke="#33507E" stroke-width="2.5"/>

<!-- AWS wordmark + smile -->
<text x="540" y="196" text-anchor="middle" font-family="Noto Sans, DejaVu Sans, sans-serif" font-size="96" font-weight="700" fill="#FFFFFF" letter-spacing="1">aws</text>
<path d="M462 202 Q540 240 610 200" fill="none" stroke="{ORANGE}" stroke-width="8" stroke-linecap="round"/>
<path d="M616 198 L592 190 L598 214 Z" fill="{ORANGE}"/>

<text x="540" y="286" text-anchor="middle" font-family="Noto Sans, DejaVu Sans, sans-serif" font-size="34" font-weight="700" fill="{T['sbg_fill']}" letter-spacing="11">STUDENT BUILDER GROUP</text>
<text x="540" y="342" text-anchor="middle" font-family="Noto Sans, DejaVu Sans, sans-serif" font-size="46" font-weight="700" fill="#FFFFFF">Noida International University</text>

<!-- official strip -->
<rect x="88" y="372" width="904" height="44" rx="8" fill="{T['strip_fill']}" stroke="{T['strip_stroke']}" stroke-width="1.5"/>
<text x="540" y="401" text-anchor="middle" font-family="Noto Sans, DejaVu Sans, sans-serif" font-size="{T['strip_size']}" font-weight="600" fill="{T['strip_text']}" letter-spacing="2">{T['strip']}</text>

<!-- photo area -->
<circle cx="540" cy="618" r="215" fill="url(#glow)"/>
<g stroke="{T['bracket']}" stroke-width="6" fill="none" stroke-linecap="round">
  <path d="M330 468 V428 H370"/><path d="M710 468 V428 H670"/>
  <path d="M330 768 V808 H370"/><path d="M710 768 V808 H670"/>
</g>
<circle cx="540" cy="618" r="150" fill="#12264D" stroke="{T['ring']}" stroke-width="6"/>
<circle cx="540" cy="618" r="164" fill="none" stroke="{ORANGE}" stroke-opacity="0.35" stroke-width="2.5"/>
{photo_img}
<text x="540" y="662" text-anchor="middle" font-family="Noto Sans, DejaVu Sans, sans-serif" font-size="118" font-weight="700" fill="#FFFFFF">{ini_text}</text>
<circle cx="540" cy="618" r="150" fill="none" stroke="{T['ring']}" stroke-width="6"/>
<circle cx="652" cy="730" r="27" fill="{ORANGE}" stroke="#0B1220" stroke-width="4"/>
<path d="M639 730 L649 740 L666 721" fill="none" stroke="{INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>

<text x="540" y="852" text-anchor="middle" font-family="Noto Sans, DejaVu Sans, sans-serif" font-size="22" font-weight="600" fill="{MUTED}" letter-spacing="4.5">ACCESS LEVEL • {access_d}</text>

<!-- role pill -->
<rect x="308" y="878" width="464" height="64" rx="32" fill="{T['pill']}"/>
<text x="540" y="921" text-anchor="middle" font-family="Noto Sans, DejaVu Sans, sans-serif" font-size="30" font-weight="700" fill="{T['pill_text']}" letter-spacing="3">{role_d}</text>

<text x="540" y="1022" text-anchor="middle" font-family="Noto Sans, DejaVu Sans, sans-serif" font-size="80" font-weight="700" fill="#FFFFFF">{name_d}</text>
<text x="540" y="1072" text-anchor="middle" font-family="Noto Sans, DejaVu Sans, sans-serif" font-size="33" font-weight="600" fill="{T['blue']}">Noida International University</text>

<!-- bottom panel: chip + barcode + QR -->
<rect x="68" y="1090" width="944" height="186" rx="24" fill="#081226" stroke="{T['panel_stroke']}" stroke-width="2"/>
<g>
  <rect x="104" y="1136" width="86" height="64" rx="10" fill="url(#gold)"/>
  <path d="M104 1168 H190 M133 1136 V1200 M161 1136 V1200" stroke="#7A5A14" stroke-width="3" fill="none"/>
  <text x="147" y="1232" text-anchor="middle" font-family="Noto Sans, DejaVu Sans, sans-serif" font-size="14.5" font-weight="600" fill="#7E93B8" letter-spacing="1.5">NFC SMART PASS</text>
</g>
<rect x="252" y="1108" width="400" height="88" rx="12" fill="#FFFFFF"/>
<image x="270" y="1116" width="364" height="72" href="data:image/png;base64,{bc}"/>
<text x="452" y="1226" text-anchor="middle" font-family="DejaVu Sans Mono, monospace" font-size="25" fill="#D7E3F5" letter-spacing="2">* {code_d} *</text>
<text x="452" y="1252" text-anchor="middle" font-family="Noto Sans, DejaVu Sans, sans-serif" font-size="13.5" fill="#7E93B8" letter-spacing="3">SCAN TO VALIDATE DELEGATE IDENTITY</text>
<rect x="818" y="1098" width="150" height="150" rx="14" fill="#FFFFFF"/>
{qr}
<text x="893" y="1266" text-anchor="middle" font-family="Noto Sans, DejaVu Sans, sans-serif" font-size="13.5" font-weight="700" fill="#7E93B8" letter-spacing="2">VERIFY</text>

<text x="540" y="1302" text-anchor="middle" font-family="Noto Sans, DejaVu Sans, sans-serif" font-size="23" font-weight="700" fill="#FFFFFF">#AWSSBGNIU • Greater Noida, Delhi NCR</text>
<text x="540" y="1326" text-anchor="middle" font-family="Noto Sans, DejaVu Sans, sans-serif" font-size="13.5" fill="#66799A">Official AWS Student Builder Group • Supported by AWS Student Programs</text>
</svg>"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--name", required=True)
    ap.add_argument("--role", default="Community Builder")
    ap.add_argument("--code", required=True)
    ap.add_argument("--access", default="Full Conference & Workshops")
    ap.add_argument("--verify-base", default="")
    ap.add_argument("--photo", default="")
    ap.add_argument("--theme", default="sbg", choices=["sbg", "classic"])
    ap.add_argument("--out", default="badge.png")
    a = ap.parse_args()

    photo_b64 = photo_circle_b64(a.photo) if a.photo else None
    svg = build_svg(a.name, a.role, a.code, a.access, a.verify_base, photo_b64, a.theme)
    svg_path = a.out.rsplit(".", 1)[0] + ".svg"
    with open(svg_path, "w") as f:
        f.write(svg)
    try:
        import cairosvg
        cairosvg.svg2png(bytestring=svg.encode(), write_to=a.out,
                         output_width=W * 2, output_height=H * 2)
        print(f"OK -> {a.out} (+ {svg_path})")
    except ImportError:
        print(f"SVG saved to {svg_path} (install cairosvg to export PNG directly)")


if __name__ == "__main__":
    main()
