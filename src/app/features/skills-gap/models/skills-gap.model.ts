import { ConsultantSeniority, ConsultantStatus } from '../../consultants/models/consultant.model';

export type SkillDemandLevel = 'high' | 'medium' | 'low' | 'declining';

export type SkillDemandTrend = 'rising' | 'stable' | 'declining';

export interface SkillConsultantRef {
  id: string;
  fullName: string;
  status: ConsultantStatus;
  seniority: ConsultantSeniority;
}

export interface SkillRfpRef {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
}

export interface SkillDemandMetric {
  id: string;
  skillName: string;
  category: string;
  demandLevel: SkillDemandLevel;
  demandTrend: SkillDemandTrend;
  /** Average days to place a consultant with this skill. */
  placementVelocityDays: number;
  benchConsultantsCount: number;
  endingSoonCount: number;
  /** Consultants holding the skill who are currently on mission. */
  activeConsultantsCount: number;
  openRfpCount: number;
  /** Open RFPs minus available consultants (bench + ending soon): > 0 shortage, < 0 surplus. */
  gapScore: number;
  consultants: SkillConsultantRef[];
  rfps: SkillRfpRef[];
}

export interface SkillsGapSummary {
  /** Share of open-RFP skill requirements covered by at least one available consultant (%). */
  marketAlignmentIndex: number;
  openRfpCount: number;
  /** Open RFPs with an available consultant matching ≥ 80%. */
  staffableRfpCount: number;
  skillsTracked: number;
  criticalGapCount: number;
  availableConsultantsCount: number;
}

export interface UpskillingSuggestion {
  consultantId: string;
  consultantName: string;
  consultantStatus: ConsultantStatus;
  targetSkills: string[];
  matchedSkills: string[];
  rfpId: string;
  rfpTitle: string;
  clientId: string;
  clientName: string;
  /** Share of the RFP's required skills already held (%). */
  readiness: number;
}

export interface SkillsGapResponse {
  summary: SkillsGapSummary;
  metrics: SkillDemandMetric[];
  upskilling: UpskillingSuggestion[];
}

export type SkillsGapSort = 'gap' | 'demand' | 'supply' | 'velocity' | 'name';

export interface CategoryCoverage {
  category: string;
  /** Available consultants × skills in the category. */
  supply: number;
  /** Open RFP requirements in the category. */
  demand: number;
}

export interface SkillsGapState {
  metrics: SkillDemandMetric[];
  summary: SkillsGapSummary | null;
  upskilling: UpskillingSuggestion[];
  selectedCategory: string | null;
  searchQuery: string;
  sortBy: SkillsGapSort;
  /** Hide skills with neither demand nor available supply. */
  hideInactive: boolean;
  isLoading: boolean;
  error: string | null;
}
