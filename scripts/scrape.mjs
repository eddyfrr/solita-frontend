import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function scrape() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to ayyahair.com...');
  await page.goto('https://ayyahair.com', { waitUntil: 'load', timeout: 60000 });

  // Ensure directories exist
  const designRefsDir = 'docs/design-references';
  const researchDir = 'docs/research';
  if (!fs.existsSync(designRefsDir)) fs.mkdirSync(designRefsDir, { recursive: true });
  if (!fs.existsSync(researchDir)) fs.mkdirSync(researchDir, { recursive: true });

  console.log('Capturing desktop screenshot...');
  await page.screenshot({ path: path.join(designRefsDir, 'desktop.png'), fullPage: true });

  console.log('Capturing mobile screenshot...');
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('https://ayyahair.com', { waitUntil: 'load', timeout: 60000 });
  await mobilePage.screenshot({ path: path.join(designRefsDir, 'mobile.png'), fullPage: true });

  console.log('Extracting design tokens...');
  const tokens = await page.evaluate(() => {
    const getComputedStyles = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const style = window.getComputedStyle(el);
      return {
        color: style.color,
        backgroundColor: style.backgroundColor,
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        fontWeight: style.fontWeight,
        padding: style.padding,
        margin: style.margin,
        borderRadius: style.borderRadius
      };
    };

    return {
      body: getComputedStyles('body'),
      h1: getComputedStyles('h1'),
      h2: getComputedStyles('h2'),
      button: getComputedStyles('button'),
      nav: getComputedStyles('nav'),
      colors: {
        primary: window.getComputedStyle(document.body).getPropertyValue('--primary'),
        secondary: window.getComputedStyle(document.body).getPropertyValue('--secondary')
      }
    };
  });

  const inspectionOutput = `
# ayyahair.com Inspection Results

## Visual Audit
- Desktop Screenshot: [docs/design-references/desktop.png](../design-references/desktop.png)
- Mobile Screenshot: [docs/design-references/mobile.png](../design-references/mobile.png)

## Design Tokens (Extracted)
\`\`\`json
${JSON.stringify(tokens, null, 2)}
\`\`\`

## Component Inventory (Initial)
- Header with Logo and Navigation
- Hero Banner with Call to Action
- Featured Collections / Products
- Promotional Banners
- Testimonials
- Footer with Newsletter and Links
  `;

  fs.writeFileSync(path.join(researchDir, 'INSPECTION_RESULTS.md'), inspectionOutput);
  console.log('Scrape complete. Data saved to docs/research/INSPECTION_RESULTS.md');

  await browser.close();
}

scrape().catch(err => {
  console.error('Scrape failed:', err);
  process.exit(1);
});
