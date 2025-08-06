// Script para criar ícones PNG da extensão
const fs = require('fs');
const path = require('path');

// Função para criar um PNG simples como base64
function createIconData(size) {
  // PNG header for a simple colored square
  const width = size;
  const height = size;
  
  // Create a simple blue circular icon with white "Z" text
  const canvas = Buffer.alloc(width * height * 4); // RGBA
  
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 2;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      
      // Calculate distance from center
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= radius) {
        // Inside circle - blue background
        canvas[index] = 30;     // R
        canvas[index + 1] = 167; // G  
        canvas[index + 2] = 253; // B (blue #1ea7fd)
        canvas[index + 3] = 255; // A
        
        // Add simple "Z" pattern for larger icons
        if (size >= 32) {
          const relX = (x - centerX) / radius;
          const relY = (y - centerY) / radius;
          
          // Simple Z pattern
          if (Math.abs(relY) < 0.3 && Math.abs(relX) < 0.4) {
            if (Math.abs(relY + relX) < 0.15 || Math.abs(relY) < 0.1) {
              canvas[index] = 255;   // White
              canvas[index + 1] = 255;
              canvas[index + 2] = 255;
            }
          }
        }
        
      } else {
        // Outside circle - transparent
        canvas[index] = 0;
        canvas[index + 1] = 0;
        canvas[index + 2] = 0;
        canvas[index + 3] = 0;
      }
    }
  }
  
  // Convert RGBA buffer to PNG format (simplified)
  // This creates a basic PNG structure
  const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0); // Length
  ihdr.write('IHDR', 4);
  ihdr.writeUInt32BE(width, 8);
  ihdr.writeUInt32BE(height, 12);
  ihdr.writeUInt8(8, 16); // Bit depth
  ihdr.writeUInt8(6, 17); // Color type (RGBA)
  ihdr.writeUInt8(0, 18); // Compression
  ihdr.writeUInt8(0, 19); // Filter
  ihdr.writeUInt8(0, 20); // Interlace
  
  // Calculate CRC for IHDR
  const crc = require('zlib').crc32(ihdr.slice(4, 21));
  ihdr.writeUInt32BE(crc, 21);
  
  // For simplicity, we'll create a base64 data URL instead
  const base64Canvas = canvas.toString('base64');
  
  // Return a minimal PNG data structure
  return createMinimalPNG(width, height, canvas);
}

function createMinimalPNG(width, height, rgba) {
  // Create a very simple PNG by converting to a data URL format
  // and then extracting the base64 part
  
  // Simple approach: create a colored square icon
  const r = 30, g = 167, b = 253; // Blue color
  
  // Create minimal PNG structure
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  ]);
  
  // For demonstration, create a simple colored square
  // This is a simplified approach
  const pixelData = Buffer.alloc(width * height * 3);
  for (let i = 0; i < pixelData.length; i += 3) {
    pixelData[i] = r;     // Red
    pixelData[i + 1] = g; // Green  
    pixelData[i + 2] = b; // Blue
  }
  
  return Buffer.concat([pngHeader, pixelData]);
}

// Alternative: Create a simple base64 PNG
function createBase64PNG(size, color = '#1ea7fd') {
  // Simple SVG to base64 approach
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2-2}" fill="${color}" stroke="#0369a1" stroke-width="1"/>
      <text x="${size/2}" y="${size/2 + 4}" font-family="Arial" font-size="${Math.max(8, size/8)}" font-weight="bold" text-anchor="middle" fill="white">Z</text>
    </svg>
  `;
  
  return Buffer.from(svg);
}

// Create icons directory
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// Create SVG versions first (they work better)
const sizes = [16, 32, 48, 128];
sizes.forEach(size => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1ea7fd;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0ea5e9;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="${size/2}" cy="${size/2}" r="${size/2-1}" fill="url(#grad)" stroke="#0369a1" stroke-width="1"/>
  <circle cx="${size/2}" cy="${size*0.4}" r="${size*0.15}" fill="rgba(255,255,255,0.8)"/>
  <text x="${size/2}" y="${size*0.85}" font-family="Arial, sans-serif" font-size="${Math.max(6, size/10)}" font-weight="bold" text-anchor="middle" fill="white">ZAP</text>
</svg>`;
  
  fs.writeFileSync(path.join(iconsDir, `icon-${size}.svg`), svg);
  console.log(`Created icon-${size}.svg`);
});

// Create a simple fallback PNG using a basic approach
sizes.forEach(size => {
  try {
    // Create a simple colored rectangle as PNG fallback
    const simpleData = createBase64PNG(size);
    fs.writeFileSync(path.join(iconsDir, `icon-${size}.png`), simpleData);
    console.log(`Created icon-${size}.png (SVG format)`);
  } catch (error) {
    console.log(`Could not create PNG for size ${size}:`, error.message);
  }
});

console.log('Icon creation completed!');