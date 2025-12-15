// Open Graph Image Generator
// This file generates OG images for better social media sharing

export const runtime = 'edge';

export const alt = 'MediStream OCMS - Smart Clinical Companion';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new Response(
    `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Background Gradient -->
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="url(#grad1)"/>
      
      <!-- Overlay Pattern -->
      <rect width="1200" height="630" fill="black" opacity="0.05"/>
      
      <!-- Content Container -->
      <rect x="80" y="140" width="1040" height="350" rx="20" fill="white" opacity="0.95"/>
      
      <!-- Logo/Icon Area -->
      <circle cx="160" cy="315" r="60" fill="#10B981"/>
      <path d="M 160 285 L 160 345 M 140 315 L 180 315" stroke="white" stroke-width="8" stroke-linecap="round"/>
      
      <!-- Main Title -->
      <text x="260" y="290" font-family="Arial, sans-serif" font-size="56" font-weight="bold" fill="#1F2937">
        MediStream OCMS
      </text>
      
      <!-- Subtitle -->
      <text x="260" y="350" font-family="Arial, sans-serif" font-size="32" fill="#6B7280">
        Smart Clinical Companion for Kasr Al Ainy Hospital
      </text>
      
      <!-- Tagline -->
      <text x="260" y="410" font-family="Arial, sans-serif" font-size="24" fill="#9CA3AF">
        AI-Powered Patient Management &amp; Medical Records
      </text>
      
      <!-- Footer Badge -->
      <rect x="80" y="520" width="200" height="40" rx="20" fill="#10B981"/>
      <text x="180" y="547" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle">
        Healthcare Tech
      </text>
    </svg>`,
    {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    }
  );
}
