// node scripts/email-logo.mjs
//
// Writes public/email/mapl-tech-logo.png: the site's logo (public/images/
// mapl-tech-logo.svg) for the emails the forms send, drawn at 3x on the
// brand ground (#0a0a0a). Mail apps don't show SVG, and the ground is in the
// picture itself so the white mark stays visible when an app recolours the
// email. src/app/api/contact/emailTemplates.ts shows it at 148x33.
import sharp from 'sharp';

const SOURCE = 'public/images/mapl-tech-logo.svg';
const OUT = 'public/email/mapl-tech-logo.png';
const WIDTH = 444; // 3 x 148

const info = await sharp(SOURCE, { density: 600 })
  .resize({ width: WIDTH })
  .flatten({ background: '#0a0a0a' })
  .png({ compressionLevel: 9, palette: true, colours: 64 })
  .toFile(OUT);
console.log(`${OUT}: ${info.width}x${info.height}, ${info.size} bytes`);
