import fs from "fs";
import https from "https";
import http from "http";
import path from "path";

const allProducts = JSON.parse(fs.readFileSync("/tmp/all_products.json", "utf8"));

function slugToFilename(slug) {
  return slug
    .replace(/^french-curls-/, "french-curls-")
    .replace(/^bone-straight-braid-extension-/, "bone-straight-")
    .replace(/^deep-wave-braid-extension-/, "deep-wave-")
    .replace(/^boho-beach-wave-human-braiding-hair-/, "boho-beach-wave-")
    .replace(/^textured-straight-human-hair-replica-/, "textured-straight-")
    .replace(/^kinky-curly-hair-human-hair-replica-/, "kinky-curly-")
    .replace(/^raw-cambodian-curly-human-hair-/, "raw-cambodian-curly-")
    .replace(/^cambodian-wavy-human-hair-/, "cambodian-wavy-")
    .replace(/^zoe-body-wave-human-braiding-hair-/, "zoe-body-wave-")
    .replace(/^crochet-braids-/, "crochet-")
    .replace(/^satin-bonnet-/, "satin-bonnet-");
}

const outDir = path.resolve("public/images/products");
const existingFiles = new Set(fs.readdirSync(outDir));

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    protocol.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Referer": "https://ayyahair.com/"
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, destPath).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const ws = fs.createWriteStream(destPath);
      res.pipe(ws);
      ws.on("finish", () => { ws.close(); resolve(); });
      ws.on("error", reject);
    }).on("error", reject);
  });
}

// Try multiple URL variants for WordPress images
function getUrlVariants(originalUrl) {
  const variants = [originalUrl];

  // Try without size suffix: IMG_8629-1000x1333.png -> IMG_8629.png
  const noSize = originalUrl.replace(/-\d+x\d+(\.\w+)$/, "$1");
  if (noSize !== originalUrl) variants.push(noSize);

  // Try smaller sizes
  const small = originalUrl.replace(/-\d+x\d+(\.\w+)$/, "-768x1024$1");
  if (small !== originalUrl) variants.push(small);

  const smaller = originalUrl.replace(/-\d+x\d+(\.\w+)$/, "-225x300$1");
  if (smaller !== originalUrl) variants.push(smaller);

  return variants;
}

async function main() {
  const toDownload = [];

  for (const p of allProducts) {
    const localName = slugToFilename(p.s);
    const filename = localName + ".jpg";

    const hasFile = [...existingFiles].some((f) =>
      f.startsWith(localName + ".") || f.startsWith(localName.replace(/-alt$/, "") + ".")
    );

    if (!hasFile) {
      toDownload.push({ slug: p.s, url: p.i, filename, destPath: path.join(outDir, filename) });
    }
  }

  console.log(`Need to download ${toDownload.length} new images`);

  for (let i = 0; i < toDownload.length; i += 4) {
    const batch = toDownload.slice(i, i + 4);
    await Promise.all(
      batch.map(async (item) => {
        const variants = getUrlVariants(item.url);
        let success = false;
        for (const url of variants) {
          try {
            await download(url, item.destPath);
            console.log(`✓ ${item.filename} (from ${url.split('/').pop()})`);
            success = true;
            break;
          } catch (err) {
            // Try next variant
          }
        }
        if (!success) {
          console.error(`✗ ${item.filename}: all URL variants failed`);
        }
      })
    );
  }

  console.log("\nDone!");
}

main().catch(console.error);
