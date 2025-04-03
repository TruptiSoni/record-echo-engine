
// This is a placeholder for generating icons
// In a real scenario, you would use actual icon files
// For this demo, we'll create simple canvas-based icons

export function generateIcons() {
  const sizes = [16, 48, 128];
  
  sizes.forEach(size => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Background
    ctx.fillStyle = '#8B5CF6'; // Purple background
    ctx.fillRect(0, 0, size, size);
    
    // Recording circle
    ctx.fillStyle = '#EF4444'; // Red recording dot
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/3, 0, Math.PI * 2);
    ctx.fill();
    
    // Export the icon
    const link = document.createElement('a');
    link.download = `icon${size}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}
