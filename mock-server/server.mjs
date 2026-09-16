import express from 'express';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env['PORT'] || 3001;

app.use(express.json());

// CORS for direct development calls if needed
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const readData = (filename) => {
  const filePath = join(__dirname, 'data', filename);
  return JSON.parse(readFileSync(filePath, 'utf-8'));
};

const writeData = (filename, data) => {
  const filePath = join(__dirname, 'data', filename);
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// --- REST Endpoints ---

// 1. Consultants
app.get('/api/consultants', (req, res) => {
  let consultants = readData('consultants.json');
  const { status, search } = req.query;

  if (status && status !== 'ALL') {
    consultants = consultants.filter((c) => c.status === status);
  }

  if (search) {
    const q = String(search).toLowerCase();
    consultants = consultants.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.primarySkill.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q)
    );
  }

  res.json(consultants);
});

app.get('/api/consultants/:id', (req, res) => {
  const consultants = readData('consultants.json');
  const consultant = consultants.find((c) => c.id === req.params.id);
  if (!consultant) {
    return res.status(404).json({ error: 'Consultant not found' });
  }
  res.json(consultant);
});

app.post('/api/consultants', (req, res) => {
  const consultants = readData('consultants.json');
  const newConsultant = {
    id: String(Date.now()),
    ...req.body,
  };
  consultants.unshift(newConsultant);
  writeData('consultants.json', consultants);
  res.status(201).json(newConsultant);
});

// 2. Risk Overview
app.get('/api/risk/overview', (req, res) => {
  const riskOverview = readData('risk-overview.json');
  const allConsultants = readData('consultants.json');
  
  const highRiskConsultants = allConsultants.filter((c) =>
    riskOverview.highRiskConsultantIds.includes(c.id)
  );

  res.json({
    metrics: riskOverview.metrics,
    highRiskConsultants,
  });
});

// 3. Clients
app.get('/api/clients', (req, res) => {
  const clients = readData('clients.json');
  res.json(clients);
});

// 4. Placements
app.get('/api/placements', (req, res) => {
  const placements = readData('placements.json');
  res.json(placements);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[Mock Server] BenchZero Mock API listening on http://localhost:${PORT}`);
});
