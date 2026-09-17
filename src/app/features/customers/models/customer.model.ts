import { Consultant, ConsultantSeniority, ConsultantStatus } from '../../consultants/models/consultant.model';

export type ClientStatus = 'active' | 'prospect' | 'paused';

export type RfpStatus = 'open' | 'staffed' | 'closed';

export const CLIENT_STATUS_OPTIONS: readonly { value: ClientStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'paused', label: 'Paused' },
];

export interface ClientAccount {
  id: string;
  name: string;
  industry: string;
  status: ClientStatus;
  city: string;
  contactName: string;
  contactEmail: string;
  /** ISO date (yyyy-MM-dd). */
  accountSince: string;
  /** Derived by the API from consultants currently staffed at the client. */
  activeConsultants: number;
  openRFPs: number;
  monthlyRevenue: number;
}

export interface RfpSuggestion {
  consultantId: string;
  fullName: string;
  status: ConsultantStatus;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface ClientRfp {
  id: string;
  title: string;
  requiredSkills: string[];
  seniority: ConsultantSeniority;
  dailyBudget: number;
  startDate: string;
  status: RfpStatus;
  suggestedConsultants: RfpSuggestion[];
}

export interface ClientDetail extends ClientAccount {
  consultants: Consultant[];
  rfps: ClientRfp[];
}

export type ClientPayload = Pick<ClientAccount, 'name' | 'industry' | 'status' | 'city' | 'contactName' | 'contactEmail'>;

export type RfpPayload = Pick<ClientRfp, 'title' | 'requiredSkills' | 'seniority' | 'dailyBudget' | 'startDate'>;

export type ClientStatusFilter = ClientStatus | 'ALL';

export interface ClientsState {
  clients: ClientAccount[];
  selectedClient: ClientDetail | null;
  searchQuery: string;
  filterStatus: ClientStatusFilter;
  isLoading: boolean;
  isDetailLoading: boolean;
  isSaving: boolean;
  error: string | null;
}
