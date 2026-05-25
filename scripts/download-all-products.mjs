import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname } from 'path';

const BASE = 'https://ayyahair.com/wp-content/uploads';

const assets = [
  // Shop page products (not already downloaded)
  { url: `${BASE}/2022/02/IMG_8619-1000x1333.png`, path: 'public/images/products/french-curls-ginger-ruby.png' },
  { url: `${BASE}/2021/06/0E262C50-CB6D-409F-A1EC-B51F8942A413-1000x1333.jpg`, path: 'public/images/products/french-curls-onyx-black.jpg' },
  { url: `${BASE}/2023/02/Facetune_24-02-2023-11-52-32-2-1000x1333.jpg`, path: 'public/images/products/french-curls-honey-cocoa.jpg' },
  { url: `${BASE}/2022/10/IMG_0728-2-1000x1333.png`, path: 'public/images/products/deep-wave-cinnamon-mocha-alt.png' },
  { url: `${BASE}/2022/09/E3168697-A71B-4A19-B73F-418FFD817E1D-1000x1333.jpg`, path: 'public/images/products/french-curls-cinnamon-ombre.jpg' },
  { url: `${BASE}/2021/06/IMG_0263-2.png`, path: 'public/images/products/french-curls-cinnamon-mocha.png' },
  { url: `${BASE}/2022/12/IMG_5241-1000x1333.png`, path: 'public/images/products/french-curls-chocolate-cinnamon-ombre.png' },
  { url: `${BASE}/2021/06/D6BF5695-FA4F-4CC9-ACAB-392CEDA94332-scaled-1000x1333.jpg`, path: 'public/images/products/french-curls-strawberry-blonde.jpg' },
  { url: `${BASE}/2021/06/60C7F269-C556-4333-B4C8-C9DDC582C5CE-1000x1333.jpg`, path: 'public/images/products/french-curls-amaka-blonde.jpg' },
  { url: `${BASE}/2021/06/IMG_2280-scaled-1000x1333.jpg`, path: 'public/images/products/french-curls-honey-onyx-blonde.jpg' },
  { url: `${BASE}/2022/05/AE495A91-DA7B-4495-94F0-7B87188EDC25-1000x1333.jpg`, path: 'public/images/products/bone-straight-platinum-strawberry-blonde.jpg' },
  { url: `${BASE}/2021/06/prod-img4@2x.png`, path: 'public/images/products/french-curls-ayya-ombre.png' },
  { url: `${BASE}/2021/06/prod-img2@2x.png`, path: 'public/images/products/french-curls-platinum-barbie.png' },
  { url: `${BASE}/2022/09/IMG_8455-1000x1333.png`, path: 'public/images/products/bone-straight-cinnamon-ombre.png' },
  { url: `${BASE}/2022/05/IMG_5740.png`, path: 'public/images/products/bone-straight-honey-cocoa.png' },
  { url: `${BASE}/2021/06/IMG_2194-1000x1333.png`, path: 'public/images/products/french-curls-caramel-blonde.png' },
  // Crochet braids
  { url: `${BASE}/2021/08/IMG_7274-1000x1333.jpg`, path: 'public/images/products/satin-bonnet-black.jpg' },
  // Product detail - secondary image
  { url: `${BASE}/2024/08/Ginger-spice-1.png`, path: 'public/images/products/french-curls-ginger-spice-2.png' },
];

async function download(url, path) {
  try {
    const dir = dirname(path);
    if (!existsSync(dir)) await mkdir(dir, { recursive: true });
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) { console.error(`FAIL ${res.status}: ${path}`); return; }
    const buffer = Buffer.from(await res.arrayBuffer());
    await writeFile(path, buffer);
    console.log(`OK: ${path} (${(buffer.length / 1024).toFixed(1)}KB)`);
  } catch (err) { console.error(`ERR: ${path} - ${err.message}`); }
}

const batches = [];
for (let i = 0; i < assets.length; i += 4) batches.push(assets.slice(i, i + 4));
for (const batch of batches) await Promise.all(batch.map(a => download(a.url, a.path)));
console.log('\nDone!');
