
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Building Chrome extension...');

// Run the normal build process
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully.');
  
  // Ensure the icons are available in the dist directory
  console.log('Checking for icon files...');
  const iconSizes = [16, 48, 128];
  let iconsAvailable = true;
  
  iconSizes.forEach(size => {
    const iconPath = path.join(__dirname, 'public', `icon${size}.svg`);
    if (!fs.existsSync(iconPath)) {
      console.warn(`Warning: icon${size}.svg not found in the public directory.`);
      iconsAvailable = false;
    }
  });
  
  if (!iconsAvailable) {
    console.log('Some icon files are missing. Generating them now...');
    // Run the icon generation script
    require('./src/generateIcons.js');
  }
  
  console.log('\nThe extension is ready for distribution!');
  console.log('\nOptions for sharing with other Chrome users:');
  console.log('1. Package the extension:');
  console.log('   - Open Chrome and go to chrome://extensions/');
  console.log('   - Enable Developer Mode');
  console.log('   - Click "Pack Extension" and select the "dist" directory');
  console.log('   - Share the generated .crx file with other users');
  console.log('\n2. Publish to Chrome Web Store:');
  console.log('   - Create a developer account at the Chrome Web Store');
  console.log('   - Compress the "dist" directory into a ZIP file');
  console.log('   - Upload the ZIP file to the Chrome Web Store Developer Dashboard');
  console.log('   - Submit for review and publish');
  
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
