export type SkillDemandLevel = 'high' | 'medium' | 'low' | 'declining';

export interface SkillDemandMetric {
  id: string;
  skillName: string;
  category: string;
  demandLevel: SkillDemandLevel;
  activeConsultantsCount: number;
  openRfpCount: number;
  placementVelocityDays: number;
}

export interface SkillsGapState {
  metrics: SkillDemandMetric[];
  selectedCategory: string | null;
  isLoading: boolean;
  error: string | null;
}
