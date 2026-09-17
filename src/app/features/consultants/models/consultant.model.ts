export type ConsultantStatus = 'on_bench' | 'on_mission' | 'ending_soon' | 'prospect';

/** Billable days per month used for bench cost, billing and pipeline value (TJM × days). */
export const WORKING_DAYS_PER_MONTH = 20;

export type ConsultantSeniority = 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Architect';

export const CONSULTANT_SENIORITIES: readonly ConsultantSeniority[] = ['Junior', 'Mid', 'Senior', 'Lead', 'Architect'];

export const CONSULTANT_STATUS_OPTIONS: readonly { value: ConsultantStatus; label: string }[] = [
  { value: 'on_bench', label: 'On Bench' },
  { value: 'ending_soon', label: 'Ending Soon' },
  { value: 'on_mission', label: 'On Mission' },
  { value: 'prospect', label: 'Prospect' },
];

export interface MissionRecord {
  clientName: string;
  role: string;
  startDate: string;
  endDate: string;
}

export interface Consultant {
  id: string;
  fullName: string;
  title: string;
  seniority: ConsultantSeniority;
  status: ConsultantStatus;
  primarySkill: string;
  skills: string[];
  /** Daily rate (Taux Journalier Moyen) in EUR. */
  tjm: number;
  yearsOfExperience: number;
  email: string;
  phone: string;
  location: string;
  languages: string[];
  certifications: string[];
  bio: string;
  missionHistory: MissionRecord[];
  daysOnBench?: number;
  /** ISO date (yyyy-MM-dd). */
  missionEndDate?: string;
  clientId?: string;
  /** Resolved by the API from `clientId`. */
  clientName?: string;
}

/** Create / update payload: server-owned fields are excluded. */
export type ConsultantPayload = Omit<Consultant, 'id' | 'clientName' | 'missionHistory'>;

export type ConsultantStatusFilter = ConsultantStatus | 'ALL';

export type ConsultantSortField = 'fullName' | 'seniority' | 'tjm' | 'availability';

export interface ConsultantSort {
  field: ConsultantSortField;
  direction: 'asc' | 'desc';
}

export interface ConsultantsState {
  consultants: Consultant[];
  filterStatus: ConsultantStatusFilter;
  searchQuery: string;
  sort: ConsultantSort;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}
