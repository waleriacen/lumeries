const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const TEMPLATE_DIR = '/sessions/sleepy-peaceful-franklin/mnt/poster/public/mockups/templates';
const PORT = 8765;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (pathname === '/' || pathname === '/index.html') {
    // List templates
    const templates = fs.readdirSync(TEMPLATE_DIR)
      .filter(f => f.endsWith('.html') && f.startsWith('template-'))
      .sort();

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Template Previews</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          .template-list { list-style: none; padding: 0; }
          .template-list li { margin: 10px 0; }
          .template-list a {
            display: inline-block;
            padding: 10px 15px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
          }
          .template-list a:hover { background: #0056b3; }
        </style>
      </head>
      <body>
        <h1>Available Templates (${templates.length})</h1>
        <ul class="template-list">
          ${templates.map(t => `<li><a href="/view/${t}">${t.replace('template-', '').replace('.html', '')}</a></li>`).join('')}
        </ul>
      </body>
      </html>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  } else if (pathname.startsWith('/view/')) {
    const templateName = pathname.replace('/view/', '');
    const templatePath = path.join(TEMPLATE_DIR, templateName);

    if (fs.existsSync(templatePath) && templateName.endsWith('.html')) {
      const content = fs.readFileSync(templatePath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`View templates at:`);
  console.log(`  http://localhost:${PORT}/index.html - List all templates`);
  console.log(`  http://localhost:${PORT}/view/template-rosa-gold.html - View specific template`);
  console.log('\nPress Ctrl+C to stop the server');
});
