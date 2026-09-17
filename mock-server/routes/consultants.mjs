import { Router } from 'express';
import {
  CONSULTANT_STATUSES,
  SENIORITIES,
  badRequest,
  db,
  enrichConsultant,
  findClient,
  findConsultant,
  nextId,
  normalize,
  notFound,
} from '../lib/db.mjs';

export const consultantsRouter = Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(body) {
  if (!body.fullName?.trim()) return 'Full name is required';
  if (!body.title?.trim()) return 'Job title is required';
  if (!body.email || !EMAIL_PATTERN.test(body.email)) return 'A valid email is required';
  if (!SENIORITIES.includes(body.seniority)) return `Seniority must be one of ${SENIORITIES.join(', ')}`;
  if (!CONSULTANT_STATUSES.includes(body.status)) return `Status must be one of ${CONSULTANT_STATUSES.join(', ')}`;
  if (!body.primarySkill?.trim()) return 'Primary skill is required';
  if (!Array.isArray(body.skills) || body.skills.length === 0) return 'At least one skill is required';
  if (!Number.isFinite(body.tjm) || body.tjm < 100 || body.tjm > 3000) return 'TJM must be between 100 and 3000';
  if (body.clientId && !findClient(body.clientId)) return 'Unknown client';
  if ((body.status === 'on_mission' || body.status === 'ending_soon') && !body.clientId) {
    return 'A client is required for consultants on mission';
  }
  return null;
}

/** Keep status-dependent fields coherent (a consultant on bench has no client, etc.). */
function sanitize(body, existing = {}) {
  const consultant = {
    ...existing,
    fullName: body.fullName.trim(),
    title: body.title.trim(),
    seniority: body.seniority,
    status: body.status,
    primarySkill: body.primarySkill.trim(),
    skills: [...new Set(body.skills.map((s) => String(s).trim()).filter(Boolean))],
    tjm: body.tjm,
    yearsOfExperience: Number(body.yearsOfExperience) || 0,
    email: body.email.trim(),
    phone: body.phone?.trim() ?? '',
    location: body.location?.trim() ?? '',
    languages: body.languages ?? existing.languages ?? [],
    certifications: body.certifications ?? existing.certifications ?? [],
    bio: body.bio?.trim() ?? existing.bio ?? '',
    missionHistory: existing.missionHistory ?? [],
  };

  if (consultant.status === 'on_bench' || consultant.status === 'prospect') {
    consultant.daysOnBench = consultant.status === 'on_bench' ? Number(body.daysOnBench) || 0 : undefined;
    delete consultant.clientId;
    delete consultant.missionEndDate;
  } else {
    consultant.clientId = body.clientId;
    consultant.missionEndDate = body.missionEndDate || undefined;
    delete consultant.daysOnBench;
  }
  return consultant;
}

consultantsRouter.get('/', (req, res) => {
  const { status, search, skill } = req.query;
  let consultants = db.consultants;

  if (status && status !== 'ALL') {
    consultants = consultants.filter((c) => c.status === status);
  }
  if (skill) {
    consultants = consultants.filter((c) => c.skills.some((s) => normalize(s) === normalize(skill)));
  }
  if (search) {
    const q = normalize(search);
    consultants = consultants.filter(
      (c) =>
        normalize(c.fullName).includes(q) ||
        normalize(c.primarySkill).includes(q) ||
        normalize(c.title).includes(q) ||
        c.skills.some((s) => normalize(s).includes(q)),
    );
  }

  res.json(consultants.map(enrichConsultant));
});

consultantsRouter.get('/:id', (req, res) => {
  const consultant = findConsultant(req.params.id);
  if (!consultant) return notFound(res, 'Consultant');
  res.json(enrichConsultant(consultant));
});

consultantsRouter.post('/', (req, res) => {
  const error = validate(req.body);
  if (error) return badRequest(res, error);

  const consultant = { id: nextId(), ...sanitize(req.body) };
  db.consultants.unshift(consultant);
  res.status(201).json(enrichConsultant(consultant));
});

consultantsRouter.put('/:id', (req, res) => {
  const index = db.consultants.findIndex((c) => c.id === req.params.id);
  if (index === -1) return notFound(res, 'Consultant');

  const error = validate(req.body);
  if (error) return badRequest(res, error);

  const updated = { ...sanitize(req.body, db.consultants[index]), id: req.params.id };
  db.consultants[index] = updated;
  res.json(enrichConsultant(updated));
});

consultantsRouter.delete('/:id', (req, res) => {
  const exists = db.consultants.some((c) => c.id === req.params.id);
  if (!exists) return notFound(res, 'Consultant');

  db.consultants = db.consultants.filter((c) => c.id !== req.params.id);
  db.placements = db.placements.filter((p) => p.consultantId !== req.params.id);
  res.status(204).end();
});
