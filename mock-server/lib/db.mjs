import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');

const readSeed = (filename) => JSON.parse(readFileSync(join(DATA_DIR, filename), 'utf-8'));

/**
 * In-memory datastore cloned from the JSON seeds.
 * Mutations never touch the seed files, so restarting the mock server (or POST /api/__reset)
 * always returns to a clean, reproducible dataset.
 */
export const db = {};

export function resetDb() {
  db.consultants = readSeed('consultants.json');
  db.clients = readSeed('clients.json');
  db.placements = readSeed('placements.json');
  db.notifications = readSeed('notifications.json');
  db.session = readSeed('session.json');
  db.riskConfig = readSeed('risk-overview.json');
  db.skillsCatalog = readSeed('skills-catalog.json');
}

resetDb();

export const CONSULTANT_STATUSES = ['on_bench', 'on_mission', 'ending_soon', 'prospect'];
export const SENIORITIES = ['Junior', 'Mid', 'Senior', 'Lead', 'Architect'];
export const CLIENT_STATUSES = ['active', 'prospect', 'paused'];
export const PLACEMENT_STAGES = ['matched', 'pitch_sent', 'interviewing', 'signed', 'lost'];
export const AVAILABLE_STATUSES = ['on_bench', 'ending_soon'];
export const BILLABLE_STATUSES = ['on_mission', 'ending_soon'];
export const WORKING_DAYS_PER_MONTH = 20;

export const nextId = (prefix = '') => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const normalize = (value) => String(value ?? '').trim().toLowerCase();

export const hasSkill = (consultant, skillName) =>
  consultant.skills.some((skill) => normalize(skill) === normalize(skillName));

export const findConsultant = (id) => db.consultants.find((c) => c.id === id);
export const findClient = (id) => db.clients.find((c) => c.id === id);

export function findRfp(rfpId) {
  for (const client of db.clients) {
    const rfp = client.rfps.find((r) => r.id === rfpId);
    if (rfp) return { client, rfp };
  }
  return null;
}

export function openRfps() {
  return db.clients
    .filter((client) => client.status !== 'paused')
    .flatMap((client) =>
      client.rfps
        .filter((rfp) => rfp.status === 'open')
        .map((rfp) => ({ ...rfp, clientId: client.id, clientName: client.name })),
    );
}

export function enrichConsultant(consultant) {
  const client = consultant.clientId ? findClient(consultant.clientId) : undefined;
  return { ...consultant, clientName: client?.name };
}

export function enrichClient(client) {
  const staffed = db.consultants.filter(
    (c) => c.clientId === client.id && BILLABLE_STATUSES.includes(c.status),
  );
  return {
    id: client.id,
    name: client.name,
    industry: client.industry,
    status: client.status,
    city: client.city,
    contactName: client.contactName,
    contactEmail: client.contactEmail,
    accountSince: client.accountSince,
    activeConsultants: staffed.length,
    openRFPs: client.rfps.filter((r) => r.status === 'open').length,
    monthlyRevenue: staffed.reduce((sum, c) => sum + c.tjm * WORKING_DAYS_PER_MONTH, 0),
  };
}

const SENIORITY_RANK = { Junior: 1, Mid: 2, Senior: 3, Lead: 4, Architect: 5 };

/**
 * Deterministic "AI" match score between a consultant and an RFP:
 * skill coverage drives the score, seniority and budget fit adjust it.
 */
export function scoreMatch(consultant, rfp) {
  const required = rfp.requiredSkills ?? [];
  const matchedSkills = required.filter((skill) => hasSkill(consultant, skill));
  const missingSkills = required.filter((skill) => !hasSkill(consultant, skill));
  const coverage = required.length ? matchedSkills.length / required.length : 0.5;

  let score = 40 + 55 * coverage;
  const seniorityGap = (SENIORITY_RANK[rfp.seniority] ?? 0) - (SENIORITY_RANK[consultant.seniority] ?? 0);
  score += seniorityGap > 0 ? -10 * seniorityGap : 1;
  if (rfp.dailyBudget && consultant.tjm > rfp.dailyBudget) {
    score -= Math.round((consultant.tjm - rfp.dailyBudget) / 20);
  }

  return {
    matchScore: Math.max(0, Math.min(99, Math.round(score))),
    matchedSkills,
    missingSkills,
  };
}

export function enrichPlacement(placement) {
  const consultant = findConsultant(placement.consultantId);
  const client = findClient(placement.clientId);
  const rfp = placement.rfpId ? findRfp(placement.rfpId)?.rfp : undefined;
  return {
    ...placement,
    consultantName: consultant?.fullName ?? 'Unknown consultant',
    consultantTitle: consultant?.title ?? '',
    consultantStatus: consultant?.status ?? 'prospect',
    tjm: consultant?.tjm ?? 0,
    clientName: client?.name ?? 'Unknown client',
    rfpTitle: rfp?.title,
  };
}

export const daysBetween = (from, to) => Math.round((to.getTime() - from.getTime()) / 86_400_000);

export function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result.toISOString().slice(0, 10);
}

export const badRequest = (res, error) => res.status(400).json({ error });
export const notFound = (res, entity) => res.status(404).json({ error: `${entity} not found` });
