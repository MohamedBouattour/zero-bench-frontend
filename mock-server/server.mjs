import express from 'express';
import { analyticsRouter } from './routes/analytics.mjs';
import { clientsRouter } from './routes/clients.mjs';
import { consultantsRouter } from './routes/consultants.mjs';
import { pitchRouter } from './routes/pitch.mjs';
import { placementsRouter } from './routes/placements.mjs';
import { workspaceRouter } from './routes/workspace.mjs';

const app = express();
const PORT = process.env['PORT'] || 3001;
// Simulated network latency so loading states and skeletons are visible during development.
const LATENCY_MS = Number(process.env['MOCK_LATENCY'] ?? 250);

app.use(express.json());

// CORS for direct development calls if needed
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use('/api', (_req, _res, next) => {
  if (LATENCY_MS > 0) setTimeout(next, LATENCY_MS);
  else next();
});

// --- REST Endpoints ---
app.use('/api/consultants', consultantsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/placements', placementsRouter);
app.use('/api/pitch', pitchRouter);
app.use('/api', analyticsRouter);
app.use('/api', workspaceRouter);

app.use('/api', (req, res) => {
  res.status(404).json({ error: `No mock endpoint for ${req.method} ${req.originalUrl}` });
});

app.listen(PORT, () => {
  console.log(`[Mock Server] BenchZero Mock API listening on http://localhost:${PORT} (latency ${LATENCY_MS}ms)`);
});
