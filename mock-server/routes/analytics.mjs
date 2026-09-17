import { Router } from 'express';
import {
  AVAILABLE_STATUSES,
  daysBetween,
  db,
  enrichConsultant,
  hasSkill,
  normalize,
  openRfps,
  scoreMatch,
} from '../lib/db.mjs';

export const analyticsRouter = Router();

const RISK_PERIODS = ['month', 'quarter', 'year'];
const round1 = (value) => Math.round(value * 10) / 10;
const percent = (value, total) => (total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0);

/** Best bench consultant × open RFP pairing, used by the dashboard AI card. */
function bestRecommendation(workingDays) {
  const bench = db.consultants.filter((c) => c.status === 'on_bench');
  let best = null;

  for (const consultant of bench) {
    for (const rfp of openRfps()) {
      const match = scoreMatch(consultant, rfp);
      const isBetter =
        !best ||
        match.matchScore > best.matchScore ||
        (match.matchScore === best.matchScore && (consultant.daysOnBench ?? 0) > best.daysOnBench);
      if (isBetter) {
        best = {
          consultantId: consultant.id,
          consultantName: consultant.fullName,
          consultantTitle: consultant.title,
          daysOnBench: consultant.daysOnBench ?? 0,
          clientId: rfp.clientId,
          clientName: rfp.clientName,
          rfpId: rfp.id,
          rfpTitle: rfp.title,
          matchScore: match.matchScore,
          matchedSkills: match.matchedSkills,
          potentialLoss: consultant.tjm * workingDays,
        };
      }
    }
  }
  return best;
}

analyticsRouter.get('/risk/overview', (req, res) => {
  const period = RISK_PERIODS.includes(req.query.period) ? req.query.period : 'month';
  const config = db.riskConfig;
  const trends = config.periods[period];
  const today = new Date();

  const bench = db.consultants
    .filter((c) => c.status === 'on_bench')
    .sort((a, b) => (b.daysOnBench ?? 0) - (a.daysOnBench ?? 0));
  const endingSoon = db.consultants
    .filter((c) => c.status === 'ending_soon')
    .sort((a, b) => String(a.missionEndDate).localeCompare(String(b.missionEndDate)));

  const exposure = bench.reduce((sum, c) => sum + c.tjm, 0) * config.workingDaysPerMonth;
  const avgBenchDays = bench.length
    ? round1(bench.reduce((sum, c) => sum + (c.daysOnBench ?? 0), 0) / bench.length)
    : 0;
  const endingWithin30Days = endingSoon.filter(
    (c) => c.missionEndDate && daysBetween(today, new Date(c.missionEndDate)) <= 30,
  ).length;

  res.json({
    period,
    metrics: {
      financialExposureMonthly: exposure,
      exposureBudgetMonthly: config.exposureBudgetMonthly,
      // Not capped: exposure above budget must read as > 100%.
      exposureBudgetUsage: Math.round((exposure / config.exposureBudgetMonthly) * 100),
      financialExposureTrend: trends.financialExposureTrend,
      financialExposureTrendDirection: trends.financialExposureTrendDirection,
      onBenchCount: bench.length,
      endingSoonCount: endingWithin30Days,
      benchRatio: percent(bench.length, db.consultants.length),
      onBenchTrend: trends.onBenchTrend,
      onBenchTrendDirection: trends.onBenchTrendDirection,
      placementVelocityDays: trends.placementVelocityDays,
      placementVelocityTargetDays: config.placementVelocityTargetDays,
      placementVelocityProgress: percent(trends.placementVelocityDays, config.placementVelocityTargetDays),
      placementVelocityTrend: trends.placementVelocityTrend,
      placementVelocityTrendDirection: trends.placementVelocityTrendDirection,
      avgBenchDays,
      benchDaysTarget: config.benchDaysTarget,
      avgBenchDaysProgress: percent(avgBenchDays, config.benchDaysTarget),
      avgBenchDaysTrend: trends.avgBenchDaysTrend,
      avgBenchDaysTrendDirection: trends.avgBenchDaysTrendDirection,
    },
    highRiskConsultants: [...bench, ...endingSoon].map(enrichConsultant),
    recommendation: bestRecommendation(config.workingDaysPerMonth),
  });
});

analyticsRouter.get('/skills-gap', (_req, res) => {
  const rfps = openRfps();
  const catalog = [...db.skillsCatalog];

  // Demand-side skills missing from the catalog are tracked automatically.
  for (const rfp of rfps) {
    for (const skill of rfp.requiredSkills) {
      if (!catalog.some((entry) => normalize(entry.skillName) === normalize(skill))) {
        catalog.push({
          id: normalize(skill).replace(/[^a-z0-9]+/g, '-'),
          skillName: skill,
          category: 'Other',
          placementVelocityDays: 10,
          demandTrend: 'stable',
        });
      }
    }
  }

  const toRef = (c) => ({ id: c.id, fullName: c.fullName, status: c.status, seniority: c.seniority });

  const metrics = catalog.map((skill) => {
    const holders = db.consultants.filter((c) => hasSkill(c, skill.skillName));
    const bench = holders.filter((c) => c.status === 'on_bench');
    const endingSoon = holders.filter((c) => c.status === 'ending_soon');
    const onMission = holders.filter((c) => c.status === 'on_mission');
    const demand = rfps.filter((rfp) => rfp.requiredSkills.some((s) => normalize(s) === normalize(skill.skillName)));
    const gapScore = demand.length - (bench.length + endingSoon.length);

    const demandLevel =
      skill.demandTrend === 'declining' && demand.length === 0
        ? 'declining'
        : demand.length >= 2
          ? 'high'
          : demand.length === 1
            ? 'medium'
            : 'low';

    return {
      ...skill,
      demandLevel,
      benchConsultantsCount: bench.length,
      endingSoonCount: endingSoon.length,
      activeConsultantsCount: onMission.length,
      openRfpCount: demand.length,
      gapScore,
      consultants: [...bench, ...endingSoon, ...onMission].map(toRef),
      rfps: demand.map((rfp) => ({ id: rfp.id, title: rfp.title, clientId: rfp.clientId, clientName: rfp.clientName })),
    };
  });

  const available = db.consultants.filter((c) => AVAILABLE_STATUSES.includes(c.status));
  const requiredSlots = rfps.flatMap((rfp) => rfp.requiredSkills);
  const coveredSlots = requiredSlots.filter((skill) => available.some((c) => hasSkill(c, skill)));
  const staffableRfps = rfps.filter((rfp) => available.some((c) => scoreMatch(c, rfp).matchScore >= 80));

  // Upskilling: available consultants close to an open RFP (1–2 missing skills), without a full match elsewhere.
  const upskilling = available
    .filter((consultant) => !rfps.some((rfp) => scoreMatch(consultant, rfp).missingSkills.length === 0))
    .map((consultant) => {
      const candidates = rfps
        .map((rfp) => ({ rfp, match: scoreMatch(consultant, rfp) }))
        .filter(
          ({ rfp, match }) =>
            match.matchedSkills.length > 0 &&
            match.missingSkills.length <= 2 &&
            match.matchedSkills.length / rfp.requiredSkills.length >= 1 / 3,
        )
        .sort((a, b) => b.match.matchedSkills.length / b.rfp.requiredSkills.length - a.match.matchedSkills.length / a.rfp.requiredSkills.length);
      const best = candidates[0];
      if (!best) return null;
      return {
        consultantId: consultant.id,
        consultantName: consultant.fullName,
        consultantStatus: consultant.status,
        targetSkills: best.match.missingSkills,
        matchedSkills: best.match.matchedSkills,
        rfpId: best.rfp.id,
        rfpTitle: best.rfp.title,
        clientId: best.rfp.clientId,
        clientName: best.rfp.clientName,
        readiness: Math.round((best.match.matchedSkills.length / best.rfp.requiredSkills.length) * 100),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.readiness - a.readiness);

  res.json({
    summary: {
      marketAlignmentIndex: requiredSlots.length ? round1((coveredSlots.length / requiredSlots.length) * 100) : 100,
      openRfpCount: rfps.length,
      staffableRfpCount: staffableRfps.length,
      skillsTracked: metrics.length,
      criticalGapCount: metrics.filter((m) => m.gapScore > 0).length,
      availableConsultantsCount: available.length,
    },
    metrics,
    upskilling,
  });
});

analyticsRouter.get('/navigation/badges', (_req, res) => {
  res.json({
    placements: db.placements.filter((p) => p.stage === 'matched').length,
    consultantsOnBench: db.consultants.filter((c) => c.status === 'on_bench').length,
  });
});
