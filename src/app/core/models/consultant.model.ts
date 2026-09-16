export type ConsultantStatus = 'on_bench' | 'on_mission' | 'ending_soon' | 'prospect';

export interface Consultant {
  id: string;
  fullName: string;
  title: string;
  seniority: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Architect';
  status: ConsultantStatus;
  primarySkill: string;
  skills: string[];
  tjm: number; // Taux Journalier Moyen (€)
  daysOnBench?: number;
  missionEndDate?: string;
  clientName?: string;
  avatarUrl?: string;
}
