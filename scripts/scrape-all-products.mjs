import fs from "fs";
import https from "https";
import path from "path";

const allProducts = JSON.parse(fs.readFileSync("/tmp/all_products.json", "utf8"));
const outDir = path.resolve("public/images/products");

function slugToFilename(slug) {
  return slug
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

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchPage(res.headers.location).then(resolve, reject);
      }
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const ws = fs.createWriteStream(dest);
      res.pipe(ws);
      ws.on("finish", () => { ws.close(); resolve(); });
      ws.on("error", reject);
    }).on("error", reject);
  });
}

const existingFiles = new Set(fs.readdirSync(outDir));

async function main() {
  const missing = allProducts.filter(p => {
    const localName = slugToFilename(p.s);
    return ![...existingFiles].some(f => f.startsWith(localName + "."));
  });

  console.log(`${missing.length} products need images (${allProducts.length - missing.length} already have images)`);

  // For each missing product, fetch the product page and extract the main image
  const results = [];
  for (let i = 0; i < missing.length; i += 3) {
    const batch = missing.slice(i, i + 3);
    await Promise.all(batch.map(async (p) => {
      const localName = slugToFilename(p.s);
      const productUrl = `https://ayyahair.com/product/${p.s}/`;

      try {
        const html = await fetchPage(productUrl);

        // Extract main product image - look for woocommerce-product-gallery image
        const imgMatches = html.match(/https:\/\/ayyahair\.com\/wp-content\/uploads\/[^"'\s]+/g) || [];
        const productImages = imgMatches.filter(u =>
          !u.includes("logo") &&
          !u.includes("cropped") &&
          !u.includes("prod-img") &&
          !u.includes("icon") &&
          !u.includes("-150x150")
        );

        // Get the full-res version (no size suffix)
        let mainImage = productImages.find(u => !u.match(/-\d+x\d+\.\w+$/));
        if (!mainImage && productImages.length > 0) {
          // Use the largest available
          mainImage = productImages[0];
        }

        if (mainImage) {
          const ext = mainImage.match(/\.\w+$/)?.[0] || ".jpg";
          const destFile = localName + ".jpg";
          const destPath = path.join(outDir, destFile);

          await downloadFile(mainImage, destPath);
          console.log(`✓ ${destFile} (from ${mainImage.split('/').pop()})`);
          results.push({ slug: p.s, file: destFile, ok: true });
        } else {
          console.error(`✗ ${p.s}: no image found on product page`);
          results.push({ slug: p.s, ok: false });
        }
      } catch (err) {
        console.error(`✗ ${p.s}: ${err.message}`);
        results.push({ slug: p.s, ok: false });
      }
    }));
  }

  const succeeded = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  console.log(`\nDone: ${succeeded} downloaded, ${failed} failed`);
}

main().catch(console.error);
