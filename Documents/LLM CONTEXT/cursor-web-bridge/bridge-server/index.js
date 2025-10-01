const express = require('express');
const { spawn } = require('child_process');

const PORT = Number(process.env.PORT || 5602);
const CURSOR_DEEPLINK = process.env.CURSOR_DEEPLINK || 'cursor://local.web-bridge';
const SECRET = process.env.BRIDGE_SECRET || null;
const EXTENSION_VERSION = process.env.EXTENSION_VERSION || '0.1.0';

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/config.json', (_req, res) => {
  res.json({
    deeplink: CURSOR_DEEPLINK,
    promptUrl: `http://localhost:${PORT}/prompt`,
    version: EXTENSION_VERSION,
    requiresSecret: Boolean(SECRET)
  });
});

app.post('/prompt', (req, res) => {
  if (SECRET) {
    const provided = req.get('x-bridge-secret') || req.body?.secret;
    if (provided !== SECRET) {
      return res.status(403).json({ error: 'Invalid bridge secret.' });
    }
  }

  const body = req.body || {};
  const validationError = validatePayload(body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const payload = normalizePayload(body);
  const serialized = JSON.stringify(payload);
  const encoded = Buffer.from(serialized, 'utf8').toString('base64');
  const deeplink = `${CURSOR_DEEPLINK}?data=${encodeURIComponent(encoded)}`;

  const child = spawn('open', ['-g', deeplink]);

  let responded = false;
  const respond = (status, data) => {
    if (!responded) {
      responded = true;
      res.status(status).json(data);
    }
  };

  child.on('error', (error) => {
    respond(500, { error: `Failed to launch Cursor: ${error.message}` });
  });

  child.on('close', (code) => {
    if (code === 0) {
      respond(202, { status: 'sent', deeplink });
    } else {
      respond(500, { error: `Cursor launch exited with code ${code}` });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Cursor bridge listening on http://localhost:${PORT}`);
});

function validatePayload(body) {
  if (!body || typeof body !== 'object') {
    return 'Invalid request body.';
  }
  if (!body.userPrompt || typeof body.userPrompt !== 'string') {
    return 'userPrompt is required.';
  }
  return null;
}

function normalizePayload(body) {
  const limit = (value, max) => {
    if (typeof value !== 'string') {
      return '';
    }
    if (value.length <= max) {
      return value;
    }
    return `${value.slice(0, max)}…`;
  };

  return {
    userPrompt: body.userPrompt.trim(),
    selector: body.selector || null,
    elementHtml: limit(body.elementHtml || '', 8000),
    textContent: limit(body.textContent || '', 1200),
    pageUrl: body.pageUrl || null,
    title: body.title || null,
    boundingBox: body.boundingBox || null,
    autoSubmit: body.autoSubmit !== false,
    timestamp: body.timestamp || new Date().toISOString()
  };
}
