import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname } from 'path';

const assets = [
  {
    url: 'https://ayyahair.com/wp-content/uploads/2022/05/Banner-main-1-scaled.jpg',
    path: 'public/images/hero-banner.jpg',
  },
  {
    url: 'https://ayyahair.com/wp-content/uploads/2021/06/logo-main@2x.png',
    path: 'public/images/logo-main@2x.png',
  },
  {
    url: 'https://ayyahair.com/wp-content/uploads/2021/06/logo-light@2x.png',
    path: 'public/images/logo-light@2x.png',
  },
  {
    url: 'https://ayyahair.com/wp-content/uploads/2025/10/IMG_3688-scaled-1000x1333.png',
    path: 'public/images/products/boho-beach-wave-hazel-brownie.png',
  },
  {
    url: 'https://ayyahair.com/wp-content/uploads/2024/08/Ginger-spice-2.png',
    path: 'public/images/products/french-curls-ginger-spice.png',
  },
  {
    url: 'https://ayyahair.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-03-at-15.34.44.jpeg',
    path: 'public/images/products/deep-wave-cinnamon-mocha.jpeg',
  },
  {
    url: 'https://ayyahair.com/wp-content/uploads/2025/11/IMG_3894-1-1000x1333.jpg',
    path: 'public/images/products/kinky-curly-honey-maple.jpg',
  },
  {
    url: 'https://ayyahair.com/wp-content/uploads/2021/07/fb-icon@2x.png',
    path: 'public/images/icons/fb-icon@2x.png',
  },
  {
    url: 'https://ayyahair.com/wp-content/uploads/2021/07/ig-icon@2x.png',
    path: 'public/images/icons/ig-icon@2x.png',
  },
  {
    url: 'https://ayyahair.com/wp-content/uploads/2021/07/pnt-icon@2x.png',
    path: 'public/images/icons/pnt-icon@2x.png',
  },
];

async function download(url, path) {
  try {
    const dir = dirname(path);
    if (!existsSync(dir)) await mkdir(dir, { recursive: true });

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
    });

    if (!res.ok) {
      console.error(`FAIL ${res.status}: ${url}`);
      return;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    await writeFile(path, buffer);
    console.log(`OK: ${path} (${(buffer.length / 1024).toFixed(1)}KB)`);
  } catch (err) {
    console.error(`ERR: ${url} - ${err.message}`);
  }
}

// Download 4 at a time
const batches = [];
for (let i = 0; i < assets.length; i += 4) {
  batches.push(assets.slice(i, i + 4));
}

for (const batch of batches) {
  await Promise.all(batch.map(a => download(a.url, a.path)));
}

console.log('\nDone!');
