import sharp from 'sharp';
import fs from 'fs';

const svg = fs.readFileSync('public/orbitsync.svg');
sharp(svg).resize(192, 192).png().toFile('public/icon-192x192.png');
sharp(svg).resize(512, 512).png().toFile('public/icon-512x512.png');
