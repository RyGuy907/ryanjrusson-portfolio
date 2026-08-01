import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#F8ECE0"/>
  <rect x="60" y="60" width="1080" height="510" rx="4" fill="#FFFFFF" stroke="#C9C4BF" stroke-width="2"/>
  <!-- left panel: raw lines -->
  <g opacity="0.4">
    <rect x="120" y="330" width="300" height="14" rx="2" fill="#5C6672"/>
    <rect x="140" y="365" width="230" height="14" rx="2" fill="#5C6672"/>
    <rect x="120" y="400" width="270" height="14" rx="2" fill="#5C6672"/>
    <rect x="140" y="435" width="180" height="14" rx="2" fill="#5C6672"/>
  </g>
  <line x1="600" y1="300" x2="600" y2="480" stroke="#C0C8D1" stroke-width="2"/>
  <text x="570" y="400" font-family="monospace" font-size="34" fill="#5C6672">&#8594;</text>
  <!-- right panel: verified rows -->
  <g>
    <rect x="680" y="330" width="300" height="16" rx="2" fill="#171C23"/>
    <text x="1000" y="345" font-family="monospace" font-size="26" fill="#2F6F5E">&#10003;</text>
    <rect x="680" y="372" width="300" height="16" rx="2" fill="#171C23"/>
    <text x="1000" y="387" font-family="monospace" font-size="26" fill="#2F6F5E">&#10003;</text>
    <rect x="680" y="414" width="300" height="16" rx="2" fill="#171C23"/>
    <text x="1000" y="429" font-family="monospace" font-size="26" fill="#2F6F5E">&#10003;</text>
  </g>
  <text x="120" y="170" font-family="Arial, sans-serif" font-size="72" font-weight="600" fill="#171C23">Ryan Russon</text>
  <text x="120" y="230" font-family="Arial, sans-serif" font-size="30" fill="#5C6672">Production software in daily use. Graduating December 2026.</text>
  <text x="120" y="520" font-family="monospace" font-size="22" fill="#2F6F5E">RYANJRUSSON.COM</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(process.argv[2]);
console.log('og.png written');
