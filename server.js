const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const flightsRouter = require('./routes/flights');
const aiRouter      = require('./routes/ai');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Static Files (serve the HTML pages) ─────────────────
// Serves everything from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ───────────────────────────────────────────
app.use('/api/flights', flightsRouter);
app.use('/api/ai', aiRouter);

// ── Health Check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', platform: 'AZCON DirectX', timestamp: new Date().toISOString() });
});

// ── Fallback → serve index ────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'azcon-one.html'));
});

// ── Start ─────────────────────────────────────────────────
// Only listen if not running in a serverless environment (like Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n╔══════════════════════════════════════════╗`);
    console.log(`║   AZCON DirectX · Server Running         ║`);
    console.log(`║   http://localhost:${PORT}                  ║`);
    console.log(`╚══════════════════════════════════════════╝\n`);
  });
}

// Export the Express API for Vercel
module.exports = app;
