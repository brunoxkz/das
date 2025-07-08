// Script para gerar ícones SVG para a extensão
import fs from 'fs';

// Função para criar um ícone SVG do WhatsApp com tema Vendzz
function createIcon(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00ff88;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#00cc6a;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fundo circular -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="url(#gradient)" />
  
  <!-- Ícone do WhatsApp simplificado -->
  <g fill="white" transform="translate(${size * 0.15}, ${size * 0.15}) scale(${size * 0.025})">
    <!-- Telefone -->
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.54 0 3-.35 4.31-.99L22 22l-1.01-5.69C21.65 15 22 13.54 22 12c0-5.52-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <!-- Chat bubble -->
    <path d="M8.5 11.5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm4 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z"/>
  </g>
  
  <!-- Pequeno indicador de automação -->
  <circle cx="${size * 0.8}" cy="${size * 0.2}" r="${size * 0.12}" fill="#fff" opacity="0.9"/>
  <text x="${size * 0.8}" y="${size * 0.25}" text-anchor="middle" fill="#00cc6a" font-size="${size * 0.15}" font-weight="bold">A</text>
</svg>`;
}

// Função para converter SVG para base64 data URL
function svgToDataUrl(svg) {
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// Gerar ícones de diferentes tamanhos
const sizes = [16, 48, 128];
const icons = {};

sizes.forEach(size => {
  const svg = createIcon(size);
  icons[size] = svgToDataUrl(svg);
  
  // Salvar também como arquivo SVG para referência
  fs.writeFileSync(`icon-${size}.svg`, svg);
  console.log(`Ícone ${size}x${size} gerado como SVG`);
});

// Criar arquivo HTML para testar os ícones
const testHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Teste dos Ícones Vendzz</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #1a1a1a; color: white; }
    .icon-test { margin: 20px; padding: 20px; background: #2d2d2d; border-radius: 8px; }
    .icon-test img { margin: 10px; }
  </style>
</head>
<body>
  <h1>Ícones da Extensão Vendzz WhatsApp Automation</h1>
  
  ${sizes.map(size => `
  <div class="icon-test">
    <h3>Ícone ${size}x${size}px</h3>
    <img src="data:image/svg+xml;base64,${Buffer.from(createIcon(size)).toString('base64')}" />
    <p>Arquivo: icon-${size}.svg</p>
  </div>
  `).join('')}
  
  <div class="icon-test">
    <h3>Data URLs para uso direto:</h3>
    <pre style="background: #000; padding: 10px; border-radius: 4px; overflow-x: auto;">
${Object.entries(icons).map(([size, dataUrl]) => `icon-${size}: "${dataUrl}"`).join('\n')}
    </pre>
  </div>
</body>
</html>`;

fs.writeFileSync('icons-test.html', testHtml);

console.log('\n✅ Todos os ícones foram gerados:');
console.log('- icon-16.svg (16x16px)');
console.log('- icon-48.svg (48x48px)'); 
console.log('- icon-128.svg (128x128px)');
console.log('- icons-test.html (para visualizar)');
console.log('\n📝 Para usar na extensão, substitua as referências de .png por .svg no manifest.json');