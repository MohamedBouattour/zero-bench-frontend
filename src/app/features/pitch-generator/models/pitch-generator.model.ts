export type PitchTone = 'technical' | 'leadership' | 'cost_effective';

export interface PitchRequest {
  clientName: string;
  rfpTitle: string;
  consultantId: string;
  tone: PitchTone;
}

export interface PitchResponse {
  pitchText: string;
  wordCount: number;
  matchScore: number;
  keyStrengths: string[];
}

export interface PitchGeneratorState {
  currentRequest: PitchRequest | null;
  lastResponse: PitchResponse | null;
  isGenerating: boolean;
  error: string | null;
}
