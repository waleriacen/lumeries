import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templates = [
  'template-rosa-gold.html',
  'template-beton-silber.html',
  'template-botanical.html',
  'template-marmor-gold.html',
  'template-ziegel-minimal.html',
  'template-midnight-stars.html',
  'template-terracotta-boho.html',
  'template-sage-gold.html',
  'template-lavendel-romantic.html',
  'template-showcase-triple.html'
];

const TEMPLATE_DIR = '/sessions/sleepy-peaceful-franklin/mnt/poster/public/mockups/templates';
const PREVIEW_DIR = path.join(TEMPLATE_DIR, 'previews');
const VIEWPORT_WIDTH = 1080;
const VIEWPORT_HEIGHT = 1080;

async function captureWithBrowser(templatePath, screenshotPath) {
  // Dynamic import to avoid requiring playwright as a dependency
  const playwright = await import('playwright').catch(() => null);

  if (!playwright) {
    throw new Error('Playwright not installed');
  }

  const browser = await playwright.chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });

    const fileUrl = `file://${templatePath}`;
    await page.goto(fileUrl, { waitUntil: 'networkidle' });

    await page.screenshot({ path: screenshotPath });
    await page.close();
  } finally {
    await browser.close();
  }
}

async function captureTemplates() {
  try {
    // Ensure previews directory exists
    if (!fs.existsSync(PREVIEW_DIR)) {
      fs.mkdirSync(PREVIEW_DIR, { recursive: true });
      console.log(`Created preview directory: ${PREVIEW_DIR}`);
    }

    console.log(`\nCapturing ${templates.length} templates...\n`);

    for (const template of templates) {
      const templatePath = path.join(TEMPLATE_DIR, template);
      const screenshotPath = path.join(PREVIEW_DIR, `${template.replace('.html', '')}.png`);

      if (!fs.existsSync(templatePath)) {
        console.log(`⚠️  SKIP: ${template} - file not found`);
        continue;
      }

      try {
        console.log(`📸 Capturing: ${template}`);
        await captureWithBrowser(templatePath, screenshotPath);
        console.log(`   ✓ Saved to: ${screenshotPath}`);
      } catch (error) {
        console.log(`   ✗ Error: ${error.message}`);
      }
    }

    console.log('\n✅ All screenshots completed!');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

captureTemplates();
