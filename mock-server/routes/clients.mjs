import { Router } from 'express';
import {
  AVAILABLE_STATUSES,
  CLIENT_STATUSES,
  SENIORITIES,
  badRequest,
  db,
  enrichClient,
  enrichConsultant,
  findClient,
  nextId,
  normalize,
  notFound,
  scoreMatch,
} from '../lib/db.mjs';

export const clientsRouter = Router();

function validateClient(body) {
  if (!body.name?.trim()) return 'Client name is required';
  if (!body.industry?.trim()) return 'Industry is required';
  if (!CLIENT_STATUSES.includes(body.status)) return `Status must be one of ${CLIENT_STATUSES.join(', ')}`;
  return null;
}

function validateRfp(body) {
  if (!body.title?.trim()) return 'RFP title is required';
  if (!Array.isArray(body.requiredSkills) || body.requiredSkills.length === 0) {
    return 'At least one required skill is needed';
  }
  if (!SENIORITIES.includes(body.seniority)) return `Seniority must be one of ${SENIORITIES.join(', ')}`;
  if (!Number.isFinite(body.dailyBudget) || body.dailyBudget < 100) return 'Daily budget must be at least 100';
  return null;
}

/** Account detail: staffing, open RFPs and the best available consultants for each RFP. */
function clientDetail(client) {
  const available = db.consultants.filter((c) => AVAILABLE_STATUSES.includes(c.status));
  return {
    ...enrichClient(client),
    consultants: db.consultants.filter((c) => c.clientId === client.id).map(enrichConsultant),
    rfps: client.rfps.map((rfp) => ({
      ...rfp,
      suggestedConsultants: available
        .map((consultant) => ({
          consultantId: consultant.id,
          fullName: consultant.fullName,
          status: consultant.status,
          ...scoreMatch(consultant, rfp),
        }))
        .filter((match) => match.matchScore >= 60)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3),
    })),
  };
}

clientsRouter.get('/', (req, res) => {
  const { search, status } = req.query;
  let clients = db.clients;
  if (status && status !== 'ALL') clients = clients.filter((c) => c.status === status);
  if (search) {
    const q = normalize(search);
    clients = clients.filter((c) => normalize(c.name).includes(q) || normalize(c.industry).includes(q));
  }
  res.json(clients.map(enrichClient));
});

clientsRouter.get('/:id', (req, res) => {
  const client = findClient(req.params.id);
  if (!client) return notFound(res, 'Client');
  res.json(clientDetail(client));
});

clientsRouter.post('/', (req, res) => {
  const error = validateClient(req.body);
  if (error) return badRequest(res, error);

  const client = {
    id: nextId('c'),
    name: req.body.name.trim(),
    industry: req.body.industry.trim(),
    status: req.body.status,
    city: req.body.city?.trim() ?? '',
    contactName: req.body.contactName?.trim() ?? '',
    contactEmail: req.body.contactEmail?.trim() ?? '',
    accountSince: new Date().toISOString().slice(0, 10),
    rfps: [],
  };
  db.clients.unshift(client);
  res.status(201).json(enrichClient(client));
});

clientsRouter.put('/:id', (req, res) => {
  const client = findClient(req.params.id);
  if (!client) return notFound(res, 'Client');

  const error = validateClient(req.body);
  if (error) return badRequest(res, error);

  Object.assign(client, {
    name: req.body.name.trim(),
    industry: req.body.industry.trim(),
    status: req.body.status,
    city: req.body.city?.trim() ?? client.city,
    contactName: req.body.contactName?.trim() ?? client.contactName,
    contactEmail: req.body.contactEmail?.trim() ?? client.contactEmail,
  });
  res.json(enrichClient(client));
});

clientsRouter.post('/:id/rfps', (req, res) => {
  const client = findClient(req.params.id);
  if (!client) return notFound(res, 'Client');

  const error = validateRfp(req.body);
  if (error) return badRequest(res, error);

  client.rfps.unshift({
    id: nextId('r'),
    title: req.body.title.trim(),
    requiredSkills: [...new Set(req.body.requiredSkills.map((s) => String(s).trim()).filter(Boolean))],
    seniority: req.body.seniority,
    dailyBudget: req.body.dailyBudget,
    startDate: req.body.startDate || new Date().toISOString().slice(0, 10),
    status: 'open',
  });
  res.status(201).json(clientDetail(client));
});
