const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const html2canvas = require('html2canvas');

const TEMPLATE_DIR = '/sessions/sleepy-peaceful-franklin/mnt/poster/public/mockups/templates';
const PREVIEW_DIR = path.join(TEMPLATE_DIR, 'previews');

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

// Ensure previews directory exists
if (!fs.existsSync(PREVIEW_DIR)) {
  fs.mkdirSync(PREVIEW_DIR, { recursive: true });
  console.log(`Created preview directory: ${PREVIEW_DIR}\n`);
}

async function captureTemplate(templateName) {
  const templatePath = path.join(TEMPLATE_DIR, templateName);
  const screenshotPath = path.join(PREVIEW_DIR, templateName.replace('.html', '.png'));

  if (!fs.existsSync(templatePath)) {
    console.log(`SKIP: ${templateName} - file not found`);
    return;
  }

  try {
    console.log(`Capturing: ${templateName}`);

    // Read the HTML file
    const htmlContent = fs.readFileSync(templatePath, 'utf-8');

    // Create a virtual DOM with 1080x1080 viewport
    const dom = new JSDOM(htmlContent, {
      resources: 'usable',
      runScripts: 'outside-only',
      url: `file://${templatePath}`
    });

    const { document, window } = dom.window;

    // Set viewport size
    Object.defineProperty(window, 'innerWidth', { value: 1080 });
    Object.defineProperty(window, 'innerHeight', { value: 1080 });
    Object.defineProperty(document.documentElement, 'clientWidth', { value: 1080 });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: 1080 });

    // Wait a bit for any scripts to execute
    await new Promise(resolve => setTimeout(resolve, 500));

    // Use html2canvas to render
    const canvas = await html2canvas(document.body, {
      width: 1080,
      height: 1080,
      backgroundColor: '#ffffff'
    });

    // Convert canvas to PNG buffer
    const buffer = canvas.toBuffer('image/png');

    // Save to file
    fs.writeFileSync(screenshotPath, buffer);

    const fileSize = (fs.statSync(screenshotPath).size / 1024).toFixed(2);
    console.log(`  Saved: ${screenshotPath} (${fileSize}KB)\n`);
  } catch (error) {
    console.error(`  Error: ${error.message}\n`);
  }
}

async function captureAll() {
  console.log(`Capturing ${templates.length} templates using html2canvas...\n`);

  for (const template of templates) {
    await captureTemplate(template);
  }

  console.log('All screenshots completed!');
}

captureAll().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
