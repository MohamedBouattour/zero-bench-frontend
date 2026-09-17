import { Router } from 'express';
import { badRequest, db, findClient, findConsultant, findRfp, scoreMatch } from '../lib/db.mjs';

export const pitchRouter = Router();

const TONES = ['technical', 'leadership', 'cost_effective'];
const LANGUAGES = ['en', 'fr'];
const GENERATION_DELAY_MS = 900;

const formatDate = (iso, language) =>
  new Date(iso).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const joinList = (items, language) => {
  if (items.length <= 1) return items.join('');
  const last = items[items.length - 1];
  return `${items.slice(0, -1).join(', ')} ${language === 'fr' ? 'et' : 'and'} ${last}`;
};

function availability(consultant, language) {
  const fr = language === 'fr';
  if (consultant.status === 'on_bench') return fr ? 'disponible immédiatement' : 'available immediately';
  if (!consultant.missionEndDate) return fr ? 'disponible prochainement' : 'available shortly';
  const date = formatDate(consultant.missionEndDate, language);
  if (consultant.status === 'ending_soon') return fr ? `disponible à partir du ${date}` : `available from ${date}`;
  return fr ? `actuellement en mission jusqu'au ${date}` : `currently on assignment until ${date}`;
}

function composePitch({ consultant, client, rfp, rfpTitle, tone, language, match }) {
  const fr = language === 'fr';
  const firstName = consultant.fullName.split(' ')[0];
  const contactFirstName = client.contactName?.split(' ')[0];
  const skills = joinList((match.matchedSkills.length ? match.matchedSkills : consultant.skills.slice(0, 3)), language);
  const lastMission = consultant.missionHistory?.[0];
  const withinBudget = rfp?.dailyBudget && consultant.tjm <= rfp.dailyBudget;
  const sender = db.session;

  const paragraphs = [];
  paragraphs.push(fr ? `Bonjour ${contactFirstName ?? ''},`.replace(' ,', ',') : `Hello ${contactFirstName ?? ''},`.replace(' ,', ','));
  paragraphs.push(
    fr
      ? `Suite à votre besoin de ${rfpTitle} chez ${client.name}, je vous propose ${consultant.fullName}, ${consultant.title}, ${availability(consultant, language)}.`
      : `Following your request for a ${rfpTitle} at ${client.name}, I would like to introduce ${consultant.fullName}, ${consultant.title}, ${availability(consultant, language)}.`,
  );

  const missionClause = lastMission
    ? fr
      ? ` Dernière mission : ${lastMission.role} chez ${lastMission.clientName}.`
      : ` Most recently, ${firstName} worked as ${lastMission.role} at ${lastMission.clientName}.`
    : '';

  if (tone === 'technical') {
    paragraphs.push(
      fr
        ? `Avec ${consultant.yearsOfExperience} ans d'expérience et une expertise concrète sur ${skills}, ${firstName} maîtrise les enjeux techniques de ce poste.${missionClause}`
        : `With ${consultant.yearsOfExperience} years of experience and hands-on expertise in ${skills}, ${firstName} is fully equipped for the technical challenges of this role.${missionClause}`,
    );
  } else if (tone === 'leadership') {
    paragraphs.push(
      fr
        ? `${firstName} apporte ${consultant.yearsOfExperience} ans d'expérience sur un profil ${consultant.seniority}, avec l'habitude d'aligner produit, ingénierie et métiers pour sécuriser la delivery.${missionClause}`
        : `${firstName} brings ${consultant.yearsOfExperience} years of delivery experience as a ${consultant.seniority} profile, used to aligning product, engineering and business stakeholders to keep delivery on track.${missionClause}`,
    );
  } else {
    paragraphs.push(
      fr
        ? `Avec un TJM de ${consultant.tjm} €${withinBudget ? ` (dans votre budget de ${rfp.dailyBudget} €)` : ''}, ${firstName} peut démarrer sous quelques jours sur ${skills}, sans coût de montée en compétence.`
        : `At a daily rate of €${consultant.tjm}${withinBudget ? ` (within your €${rfp.dailyBudget} budget)` : ''}, ${firstName} can be onboarded within days and be productive on ${skills} immediately, with no ramp-up cost.`,
    );
  }

  if (consultant.certifications?.length) {
    paragraphs.push(
      fr
        ? `Certifications : ${consultant.certifications.join(', ')}.`
        : `${firstName} also holds the following certifications: ${consultant.certifications.join(', ')}.`,
    );
  }
  if (match.missingSkills.length) {
    paragraphs.push(
      fr
        ? `${firstName} monte actuellement en compétence sur ${joinList(match.missingSkills, language)}, dans la continuité de sa stack actuelle.`
        : `${firstName} is currently ramping up on ${joinList(match.missingSkills, language)}, a natural extension of the current stack.`,
    );
  }

  paragraphs.push(
    fr
      ? 'Seriez-vous disponible pour un échange de 20 minutes cette semaine ?'
      : 'Would you be available for a 20-minute call this week to discuss this profile?',
  );
  paragraphs.push(`${fr ? 'Bien cordialement' : 'Best regards'},\n${sender.fullName}\n${sender.role} – BenchZero`);

  const keyStrengths = fr
    ? [
        `${consultant.yearsOfExperience} ans d'expérience (${consultant.seniority})`,
        rfp ? `${match.matchedSkills.length}/${rfp.requiredSkills.length} compétences requises couvertes` : `Stack principale : ${consultant.primarySkill}`,
        availability(consultant, language).replace(/^./, (c) => c.toUpperCase()),
        `TJM ${consultant.tjm} €`,
      ]
    : [
        `${consultant.yearsOfExperience} years of experience (${consultant.seniority})`,
        rfp ? `${match.matchedSkills.length}/${rfp.requiredSkills.length} required skills covered` : `Core stack: ${consultant.primarySkill}`,
        availability(consultant, language).replace(/^./, (c) => c.toUpperCase()),
        `Daily rate €${consultant.tjm}`,
      ];

  const pitchText = paragraphs.join('\n\n');
  return {
    subject: fr
      ? `Proposition de profil – ${consultant.fullName} pour ${rfpTitle}`
      : `Profile proposal – ${consultant.fullName} for ${rfpTitle}`,
    pitchText,
    wordCount: pitchText.split(/\s+/).filter(Boolean).length,
    keyStrengths,
  };
}

pitchRouter.post('/generate', (req, res) => {
  const { consultantId, clientId, rfpId, tone, language } = req.body;
  const consultant = findConsultant(consultantId);
  const client = findClient(clientId);

  if (!consultant) return badRequest(res, 'Unknown consultant');
  if (!client) return badRequest(res, 'Unknown client');
  if (!TONES.includes(tone)) return badRequest(res, `Tone must be one of ${TONES.join(', ')}`);
  if (!LANGUAGES.includes(language)) return badRequest(res, `Language must be one of ${LANGUAGES.join(', ')}`);

  const rfp = rfpId ? findRfp(rfpId)?.rfp : undefined;
  if (rfpId && !rfp) return badRequest(res, 'Unknown RFP');
  const rfpTitle = req.body.rfpTitle?.trim() || rfp?.title;
  if (!rfpTitle) return badRequest(res, 'An RFP or a mandate title is required');

  const match = rfp
    ? scoreMatch(consultant, rfp)
    : { matchScore: 70, matchedSkills: [], missingSkills: [] };

  const pitch = composePitch({ consultant, client, rfp, rfpTitle, tone, language, match });

  setTimeout(() => {
    res.json({
      ...pitch,
      matchScore: match.matchScore,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
      recipientEmail: client.contactEmail ?? '',
      generatedAt: new Date().toISOString(),
    });
  }, GENERATION_DELAY_MS);
});
