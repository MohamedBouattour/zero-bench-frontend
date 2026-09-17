import { Router } from 'express';
import {
  PLACEMENT_STAGES,
  addMonths,
  badRequest,
  db,
  enrichPlacement,
  findClient,
  findConsultant,
  findRfp,
  nextId,
  notFound,
  scoreMatch,
} from '../lib/db.mjs';

export const placementsRouter = Router();

/**
 * Signing a placement is a business event: the consultant leaves the bench,
 * goes on mission at the client, and the RFP is marked as staffed.
 */
function applySignedSideEffects(placement) {
  const consultant = findConsultant(placement.consultantId);
  if (consultant) {
    consultant.status = 'on_mission';
    consultant.clientId = placement.clientId;
    consultant.missionEndDate = addMonths(new Date(), 6);
    delete consultant.daysOnBench;
  }
  if (placement.rfpId) {
    const match = findRfp(placement.rfpId);
    if (match) match.rfp.status = 'staffed';
  }
}

placementsRouter.get('/', (_req, res) => {
  res.json(db.placements.map(enrichPlacement));
});

placementsRouter.post('/', (req, res) => {
  const { consultantId, clientId, rfpId, roleTitle, note, stage = 'matched' } = req.body;
  const consultant = findConsultant(consultantId);
  if (!consultant) return badRequest(res, 'Unknown consultant');
  if (!findClient(clientId)) return badRequest(res, 'Unknown client');
  if (!PLACEMENT_STAGES.includes(stage)) return badRequest(res, 'Invalid stage');

  const rfpMatch = rfpId ? findRfp(rfpId) : null;
  if (rfpId && (!rfpMatch || rfpMatch.client.id !== clientId)) {
    return badRequest(res, 'RFP does not belong to this client');
  }
  const title = roleTitle?.trim() || rfpMatch?.rfp.title;
  if (!title) return badRequest(res, 'Role title is required');

  const now = new Date().toISOString();
  const placement = {
    id: nextId('p'),
    stage,
    consultantId,
    clientId,
    rfpId: rfpId || undefined,
    roleTitle: title,
    matchScore: Number.isFinite(req.body.matchScore)
      ? req.body.matchScore
      : rfpMatch
        ? scoreMatch(consultant, rfpMatch.rfp).matchScore
        : undefined,
    note: note?.trim() ?? '',
    createdAt: now,
    updatedAt: now,
    history: [{ stage, at: now }],
  };
  db.placements.unshift(placement);
  if (stage === 'signed') applySignedSideEffects(placement);

  res.status(201).json(enrichPlacement(placement));
});

placementsRouter.patch('/:id', (req, res) => {
  const placement = db.placements.find((p) => p.id === req.params.id);
  if (!placement) return notFound(res, 'Placement');

  const { stage, note, matchScore, roleTitle } = req.body;
  if (stage !== undefined && !PLACEMENT_STAGES.includes(stage)) return badRequest(res, 'Invalid stage');
  if (matchScore !== undefined && (!Number.isFinite(matchScore) || matchScore < 0 || matchScore > 100)) {
    return badRequest(res, 'Match score must be between 0 and 100');
  }

  const now = new Date().toISOString();
  if (stage && stage !== placement.stage) {
    placement.stage = stage;
    placement.history = [...(placement.history ?? []), { stage, at: now }];
    if (stage === 'signed') applySignedSideEffects(placement);
  }
  if (note !== undefined) placement.note = String(note).trim();
  if (matchScore !== undefined) placement.matchScore = matchScore;
  if (roleTitle?.trim()) placement.roleTitle = roleTitle.trim();
  placement.updatedAt = now;

  res.json(enrichPlacement(placement));
});

placementsRouter.delete('/:id', (req, res) => {
  const exists = db.placements.some((p) => p.id === req.params.id);
  if (!exists) return notFound(res, 'Placement');
  db.placements = db.placements.filter((p) => p.id !== req.params.id);
  res.status(204).end();
});
