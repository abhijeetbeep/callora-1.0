const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3001;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

function resolveFilePath(reqPath) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(reqPath);
  } catch {
    return null;
  }

  // Remove query params
  decodedPath = decodedPath.split('?')[0];

  // Resolve target on disk
  let safePath = path.normalize(path.join(ROOT_DIR, decodedPath));
  if (!safePath.startsWith(ROOT_DIR)) {
    return null; // Prevent path traversal
  }

  // If path is directory or root, look for index.html or matching .html file
  if (fs.existsSync(safePath) && fs.statSync(safePath).isDirectory()) {
    const indexPath = path.join(safePath, 'index.html');
    if (fs.existsSync(indexPath)) {
      safePath = indexPath;
    } else if (fs.existsSync(safePath + '.html')) {
      safePath = safePath + '.html';
    }
  }

  // Clean URLs support (matching vercel.json)
  if (!fs.existsSync(safePath)) {
    const withHtml = safePath + '.html';
    if (fs.existsSync(withHtml)) {
      safePath = withHtml;
    }
  }

  if (fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
    return safePath;
  }

  return null;
}

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const filePath = resolveFilePath(reqUrl.pathname);

  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache'
  });

  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('500 Internal Server Error');
    }
  });
  stream.pipe(res);
});

function startServer(port) {
  server.listen(port, () => {
    console.log(`\n> Callora website running at: http://localhost:${port}/\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(DEFAULT_PORT);
