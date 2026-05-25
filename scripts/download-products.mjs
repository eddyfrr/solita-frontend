import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname } from 'path';

const assets = [
  { url: 'https://ayyahair.com/wp-content/uploads/2025/10/IMG_3309-1000x1333.png', path: 'public/images/products/boho-beach-wave-cocoa-latte.png' },
  { url: 'https://ayyahair.com/wp-content/uploads/2025/03/Zoe-body-wave-1-1000x1333.jpg', path: 'public/images/products/zoe-body-wave-black.jpg' },
  { url: 'https://ayyahair.com/wp-content/uploads/2025/01/4-scaled.jpg', path: 'public/images/products/boho-beach-wave-caramel.jpg' },
  { url: 'https://ayyahair.com/wp-content/uploads/2024/11/Caramel-Chocolate-3.png', path: 'public/images/products/boho-beach-wave-chocolate-caramel.png' },
  { url: 'https://ayyahair.com/wp-content/uploads/2024/08/Choc-mocha--scaled.jpg', path: 'public/images/products/boho-beach-wave-chocolate-mocha.jpg' },
  { url: 'https://ayyahair.com/wp-content/uploads/2024/06/mini_magick20240606-45863-61k05y-1000x1333.jpg', path: 'public/images/products/boho-beach-wave-mocha.jpg' },
  { url: 'https://ayyahair.com/wp-content/uploads/2024/03/IMG_5410.png', path: 'public/images/products/french-curls-cocoa-ginger.png' },
  { url: 'https://ayyahair.com/wp-content/uploads/2023/10/IMG_8650-1000x1333.png', path: 'public/images/products/raw-cambodian-curly-cocoa-mocha.png' },
  { url: 'https://ayyahair.com/wp-content/uploads/2025/12/Pic-replica-.jpg', path: 'public/images/products/textured-straight-maple-mocha.jpg' },
  { url: 'https://ayyahair.com/wp-content/uploads/2025/12/Pic-icy-e1765288367119-1000x1333.jpg', path: 'public/images/products/french-curls-icy-platinum.jpg' },
  { url: 'https://ayyahair.com/wp-content/uploads/2025/12/Deep-wave-platinum-strawberry-blonde.png', path: 'public/images/products/deep-wave-platinum-strawberry.png' },
  { url: 'https://ayyahair.com/wp-content/uploads/2025/12/Bone-straight-platinum-Barbie-.png', path: 'public/images/products/bone-straight-platinum-barbie.png' },
  { url: 'https://ayyahair.com/wp-content/uploads/2025/12/Bone-straight-Grey-ombre--e1765254269580.png', path: 'public/images/products/bone-straight-grey-ombre.png' },
  { url: 'https://ayyahair.com/wp-content/uploads/2025/12/IMG_4432.png', path: 'public/images/products/cambodian-wavy-custom-burgundy.png' },
];

async function download(url, path) {
  try {
    const dir = dirname(path);
    if (!existsSync(dir)) await mkdir(dir, { recursive: true });
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' } });
    if (!res.ok) { console.error(`FAIL ${res.status}: ${url}`); return; }
    const buffer = Buffer.from(await res.arrayBuffer());
    await writeFile(path, buffer);
    console.log(`OK: ${path} (${(buffer.length / 1024).toFixed(1)}KB)`);
  } catch (err) { console.error(`ERR: ${url} - ${err.message}`); }
}

const batches = [];
for (let i = 0; i < assets.length; i += 4) batches.push(assets.slice(i, i + 4));
for (const batch of batches) await Promise.all(batch.map(a => download(a.url, a.path)));
console.log('\nDone!');
