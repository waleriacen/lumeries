const fs = require('fs');
const path = require('path');
const http = require('http');

const TEMPLATE_DIR = '/sessions/sleepy-peaceful-franklin/mnt/poster/public/mockups/templates';
const PREVIEW_DIR = path.join(TEMPLATE_DIR, 'previews');

// Create previews directory if it doesn't exist
if (!fs.existsSync(PREVIEW_DIR)) {
  fs.mkdirSync(PREVIEW_DIR, { recursive: true });
  console.log(`Created preview directory: ${PREVIEW_DIR}`);
}

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

const server = http.createServer((req, res) => {
  // Serve templates for local rendering
  const templateName = req.url.replace('/', '');

  if (templateName === 'list') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(templates));
    return;
  }

  const templatePath = path.join(TEMPLATE_DIR, templateName);

  if (fs.existsSync(templatePath)) {
    const content = fs.readFileSync(templatePath, 'utf-8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = 3456;
server.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Now running screenshot capture via html2canvas wrapper...\n');

  // Use html2canvas approach via browser automation alternative
  captureLegacy();
});

async function captureLegacy() {
  console.log('Attempting to capture templates...\n');

  // Since we can't use browser automation, let's create a helper that uses canvas rendering
  for (const template of templates) {
    const templatePath = path.join(TEMPLATE_DIR, template);

    if (!fs.existsSync(templatePath)) {
      console.log(`SKIP: ${template} - file not found`);
      continue;
    }

    console.log(`📸 Would capture: ${template}`);
    console.log(`   Template path: ${templatePath}`);

    // Read the HTML to get information about it
    const content = fs.readFileSync(templatePath, 'utf-8');
    const hasSVG = content.includes('<svg');
    const hasCanvas = content.includes('<canvas');

    console.log(`   Content: SVG=${hasSVG}, Canvas=${hasCanvas}`);
  }

  console.log('\nNote: Browser-based screenshot automation requires installed browsers.');
  console.log('The templates have been analyzed but screenshots require a browser engine.\n');

  process.exit(0);
}
