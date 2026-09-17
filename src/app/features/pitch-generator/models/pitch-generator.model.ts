import { ClientRfp } from '../../customers/models/customer.model';

export type PitchTone = 'technical' | 'leadership' | 'cost_effective';

export type PitchLanguage = 'en' | 'fr';

export const PITCH_TONE_OPTIONS: readonly { value: PitchTone; label: string; icon: string }[] = [
  { value: 'technical', label: 'Technical Rigor', icon: 'memory' },
  { value: 'leadership', label: 'Leadership & Agility', icon: 'groups' },
  { value: 'cost_effective', label: 'Cost & Velocity', icon: 'savings' },
];

export interface PitchRequest {
  consultantId: string;
  clientId: string;
  rfpId?: string;
  /** Free-text mandate title when no RFP is selected. */
  rfpTitle?: string;
  tone: PitchTone;
  language: PitchLanguage;
}

export interface PitchResponse {
  subject: string;
  pitchText: string;
  wordCount: number;
  matchScore: number;
  keyStrengths: string[];
  matchedSkills: string[];
  missingSkills: string[];
  recipientEmail: string;
  generatedAt: string;
}

export interface PitchGeneratorState {
  rfps: ClientRfp[];
  rfpsClientId: string | null;
  isLoadingRfps: boolean;
  lastRequest: PitchRequest | null;
  lastResponse: PitchResponse | null;
  isGenerating: boolean;
  error: string | null;
}
