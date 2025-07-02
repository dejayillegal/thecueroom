const fs = require('fs');
const path = require('path');

// Create SVG assets for the mobile app
const createSVGIcon = (size, filename) => {
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff6b35;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ff4500;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="#000000" rx="${size * 0.1}"/>
  <circle cx="${size * 0.5}" cy="${size * 0.3}" r="${size * 0.15}" fill="url(#grad)"/>
  <rect x="${size * 0.2}" y="${size * 0.5}" width="${size * 0.6}" height="${size * 0.08}" fill="url(#grad)" rx="${size * 0.02}"/>
  <rect x="${size * 0.15}" y="${size * 0.62}" width="${size * 0.7}" height="${size * 0.06}" fill="url(#grad)" rx="${size * 0.015}"/>
  <rect x="${size * 0.25}" y="${size * 0.72}" width="${size * 0.5}" height="${size * 0.04}" fill="url(#grad)" rx="${size * 0.01}"/>
  <text x="${size * 0.5}" y="${size * 0.9}" font-family="Arial Black, sans-serif" font-size="${size * 0.08}" font-weight="bold" text-anchor="middle" fill="#ff6b35">TCR</text>
</svg>`;
  
  fs.writeFileSync(path.join(__dirname, '..', 'assets', filename), svg);
  console.log(`Created ${filename} (${size}x${size})`);
};

// Create app icon assets
console.log('Creating mobile app assets...');

// Ensure assets directory exists
const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create various sizes for different platforms
createSVGIcon(1024, 'icon.svg');
createSVGIcon(1024, 'splash.svg');
createSVGIcon(1024, 'adaptive-icon.svg');
createSVGIcon(32, 'favicon.svg');

// Create PNG versions using existing logo assets
const copyLogo = (source, destination) => {
  const sourcePath = path.join(__dirname, '..', '..', 'attached_assets', source);
  const destPath = path.join(assetsDir, destination);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${source} to ${destination}`);
  } else {
    console.log(`Source ${source} not found, using placeholder`);
    // Create a simple placeholder
    fs.writeFileSync(destPath, '# Placeholder - replace with actual PNG');
  }
};

// Use the existing logo assets from the web app
copyLogo('img-logo1024x1024_1751081882323.png', 'icon.png');
copyLogo('img-logo1024x1024_1751081882323.png', 'splash.png');
copyLogo('img-logo1024x1024_1751081882323.png', 'adaptive-icon.png');
copyLogo('img-logo128x128_1751081882323.png', 'favicon.png');

console.log('Mobile app assets created successfully!');
console.log('Ready for APK build process');