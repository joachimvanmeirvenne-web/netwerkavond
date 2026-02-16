const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'registrations.json');

function ensureStorage() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, '[]', 'utf-8');
}

function readRegistrations() {
  ensureStorage();
  return JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
}

function writeRegistrations(registrations) {
  fs.writeFileSync(dataFile, JSON.stringify(registrations, null, 2), 'utf-8');
}

function summarizeExtraInfo(text = '') {
  const clean = text.trim();
  if (!clean) return null;
  const words = clean.split(/\s+/);
  const signal = words.filter((word) => word.length > 4).slice(0, 8);
  return signal.join(' ');
}

function validate(body) {
  const required = ['fullName', 'email', 'phone', 'studyProgram', 'studyYear', 'studyCity'];
  for (const field of required) {
    if (!body[field] || String(body[field]).trim() === '') {
      return `${field} is verplicht.`;
    }
  }

  const year = Number(body.studyYear);
  if (!Number.isInteger(year) || year < 1 || year > 10) {
    return 'studyYear moet een getal tussen 1 en 10 zijn.';
  }

  if (!/^\S+@\S+\.\S+$/.test(String(body.email))) {
    return 'email is ongeldig.';
  }

  return null;
}

function serveStatic(res, filePath, contentType) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Interne serverfout');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    return serveStatic(res, path.join(__dirname, 'public', 'index.html'), 'text/html; charset=utf-8');
  }

  if (req.method === 'GET' && req.url === '/styles.css') {
    return serveStatic(res, path.join(__dirname, 'public', 'styles.css'), 'text/css; charset=utf-8');
  }

  if (req.method === 'GET' && req.url === '/app.js') {
    return serveStatic(res, path.join(__dirname, 'public', 'app.js'), 'application/javascript; charset=utf-8');
  }

  if (req.method === 'POST' && req.url === '/api/register') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const validationError = validate(payload);

        if (validationError) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: validationError }));
          return;
        }

        const registrations = readRegistrations();
        const record = {
          id: registrations.length + 1,
          fullName: payload.fullName.trim(),
          email: payload.email.trim(),
          phone: payload.phone.trim(),
          studyProgram: payload.studyProgram.trim(),
          studyYear: Number(payload.studyYear),
          studyCity: payload.studyCity.trim(),
          extraInfo: (payload.extraInfo || '').trim() || null,
          aiSummary: summarizeExtraInfo(payload.extraInfo || ''),
          createdAt: new Date().toISOString()
        };

        registrations.push(record);
        writeRegistrations(registrations);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Inschrijving ontvangen!', registration: record }));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Ongeldige aanvraag.' }));
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/api/registrations') {
    const registrations = readRegistrations();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(registrations));
    return;
  }

  res.writeHead(404);
  res.end('Niet gevonden');
});

server.listen(PORT, () => {
  ensureStorage();
  console.log(`Server actief op http://localhost:${PORT}`);
});
