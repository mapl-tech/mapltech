// node scripts/email-logo.mjs
//
// Writes the logo pictures for the emails the forms send, from the site's logo
// (public/images/mapl-tech-logo.svg), drawn at 3x. Mail apps don't show SVG.
// src/app/api/contact/emailTemplates.ts shows them at 148x33.
//
// - public/email/mapl-tech-logo-black.png: the black logo (ink, #0B0B0C, as in
//   the brand kit) on paper (#F1EDE7), the emails' own ground.
// - public/email/mapl-tech-logo.png: the white logo on the dark ground
//   (#0a0a0a), for a mail app set to dark mode. Emails already sent link to it
//   too, so it stays.
//
// The ground is in each picture, so the mark stays visible when a mail app
// recolours the email around it.
import { readFileSync } from 'node:fs';
import sharp from 'sharp';

const SOURCE = readFileSync('public/images/mapl-tech-logo.svg', 'utf8');
const WIDTH = 444; // 3 x 148

const LOGOS = [
  { out: 'public/email/mapl-tech-logo-black.png', mark: '#0B0B0C', ground: '#F1EDE7' },
  { out: 'public/email/mapl-tech-logo.png', mark: '#ffffff', ground: '#0a0a0a' },
];

for (const { out, mark, ground } of LOGOS) {
  // The source draws the mark in white (#fff, #ffffff): every white becomes the mark's colour.
  const svg = SOURCE.replace(/#fff(fff)?\b/gi, mark);
  const info = await sharp(Buffer.from(svg), { density: 600 })
    .resize({ width: WIDTH })
    .flatten({ background: ground })
    .png({ compressionLevel: 9, palette: true, colours: 64 })
    .toFile(out);
  console.log(`${out}: ${info.width}x${info.height}, ${info.size} bytes`);
}
