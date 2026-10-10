const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function createOgImage() {
  const width = 1200;
  const height = 630;

  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#14242a" stop-opacity="0.95"/>
          <stop offset="50%" stop-color="#172c34" stop-opacity="0.88"/>
          <stop offset="100%" stop-color="#0e191d" stop-opacity="0.98"/>
        </linearGradient>
        <radialGradient id="orangeGlow" cx="75%" cy="50%" r="45%">
          <stop offset="0%" stop-color="#e64833" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#e64833" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <rect width="${width}" height="${height}" fill="url(#grad)"/>
      <circle cx="880" cy="315" r="380" fill="url(#orangeGlow)"/>
      <rect x="0" y="0" width="${width}" height="6" fill="#e64833"/>

      <!-- Eyebrow Pill -->
      <g transform="translate(80, 110)">
        <rect width="360" height="36" rx="18" fill="#1c353f" stroke="#90aead" stroke-opacity="0.35" stroke-width="1.5"/>
        <text x="24" y="23" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" fill="#fbe9d0" letter-spacing="1.5">
          INDIA&#39;S #1 VIRTUAL RUNNING
        </text>
      </g>

      <!-- Main Headline -->
      <text x="80" y="215" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="900" fill="#ffffff" letter-spacing="-0.5">
        RUN ANYWHERE.
      </text>
      <text x="80" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="900" fill="#e64833" font-style="italic">
        EARN REAL MEDALS.
      </text>

      <!-- Subtitle description -->
      <text x="80" y="350" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="500" fill="#cbd5e1">
        GPS-verified 1.5K, 5K, 10K &amp; 21K Half Marathon challenges.
      </text>
      <text x="80" y="382" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="500" fill="#cbd5e1">
        Track with Strava, Garmin or Apple Watch across India.
      </text>

      <!-- Feature Badges -->
      <g transform="translate(80, 440)">
        <g transform="translate(0, 0)">
          <rect width="180" height="44" rx="12" fill="#172c34" stroke="#e64833" stroke-width="1.5"/>
          <text x="18" y="27" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#fbe9d0">
            SOLID METAL MEDAL
          </text>
        </g>
        <g transform="translate(195, 0)">
          <rect width="165" height="44" rx="12" fill="#172c34" stroke="#90aead" stroke-opacity="0.4" stroke-width="1.5"/>
          <text x="18" y="27" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#fbe9d0">
            E-CERTIFICATE
          </text>
        </g>
        <g transform="translate(375, 0)">
          <rect width="185" height="44" rx="12" fill="#172c34" stroke="#90aead" stroke-opacity="0.4" stroke-width="1.5"/>
          <text x="18" y="27" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#fbe9d0">
            FREE HOME DELIVERY
          </text>
        </g>
      </g>

      <!-- Brand Footer Tag -->
      <text x="80" y="555" font-family="system-ui, sans-serif" font-size="18" font-weight="900" fill="#fbe9d0" letter-spacing="2">
        RUNNERUP.IN
      </text>
      <text x="225" y="555" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#90aead">
        · Pan-India Doorstep Dispatch · 19,000+ Pincodes
      </text>
    </svg>
  `);

  const bg = await sharp('public/runner-hd.jpg')
    .resize(width, height, { fit: 'cover' })
    .toBuffer();

  const medalBuffer = await sharp('public/images/event-medal.png')
    .resize(360, 360, { fit: 'contain' })
    .toBuffer();

  await sharp(bg)
    .composite([
      { input: svgOverlay, top: 0, left: 0 },
      { input: medalBuffer, top: 135, left: 740 }
    ])
    .png({ quality: 90 })
    .toFile('public/og-image.png');

  console.log('og-image.png generated successfully!');
}

createOgImage().catch(console.error);
