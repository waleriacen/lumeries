const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

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

async function captureTemplates() {
  let browser;

  try {
    // Ensure previews directory exists
    if (!fs.existsSync(PREVIEW_DIR)) {
      fs.mkdirSync(PREVIEW_DIR, { recursive: true });
      console.log(`Created preview directory: ${PREVIEW_DIR}`);
    }

    console.log('Launching Chromium browser...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log(`\nCapturing ${templates.length} templates...\n`);

    for (const template of templates) {
      const templatePath = path.join(TEMPLATE_DIR, template);
      const screenshotPath = path.join(PREVIEW_DIR, `${template.replace('.html', '')}.png`);

      if (!fs.existsSync(templatePath)) {
        console.log(`⚠️  SKIP: ${template} - file not found`);
        continue;
      }

      try {
        const context = await browser.createBrowserContext();
        const page = await context.newPage();

        // Set viewport
        await page.setViewportSize({
          width: VIEWPORT_WIDTH,
          height: VIEWPORT_HEIGHT
        });

        // Navigate to file
        const fileUrl = `file://${templatePath}`;
        console.log(`📸 Capturing: ${template}`);
        await page.goto(fileUrl, { waitUntil: 'networkidle' });

        // Wait a moment for any animations
        await page.waitForTimeout(500);

        // Take screenshot
        await page.screenshot({
          path: screenshotPath,
          fullPage: false
        });

        console.log(`   ✓ Saved to: ${screenshotPath}`);
        await context.close();
      } catch (error) {
        console.log(`   ✗ Error: ${error.message}`);
      }
    }

    await browser.close();
    console.log('\n✅ All screenshots completed!');
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

captureTemplates();
