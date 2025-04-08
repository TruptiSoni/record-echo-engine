
// Simple script to generate icons for the Chrome extension
const fs = require('fs');
const { createCanvas } = require('canvas');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Purple background
  ctx.fillStyle = '#8B5CF6';
  ctx.fillRect(0, 0, size, size);
  
  // Red recording dot
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/3, 0, Math.PI * 2);
  ctx.fill();
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`public/icon${size}.png`, buffer);
  console.log(`Created icon${size}.png`);
}

// Generate icons in required sizes
console.log('Generating extension icons...');
[16, 48, 128].forEach(size => generateIcon(size));
console.log('Icons generated successfully!');
