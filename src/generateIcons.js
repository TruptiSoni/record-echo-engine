
// Script to generate placeholder icon files without requiring canvas
const fs = require('fs');
const path = require('path');

function generateIconFile(size, outputPath) {
  // Create a simple SVG instead of using canvas
  const svg = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#8B5CF6" />
  <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="#EF4444" />
</svg>`;

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write SVG to file
  fs.writeFileSync(outputPath, svg);
  console.log(`Created ${outputPath}`);
}

// Generate icons in required sizes
console.log('Generating extension icons...');
[16, 48, 128].forEach(size => {
  generateIconFile(size, `public/icon${size}.svg`);
});
console.log('Icons generated successfully!');
