export type PlacementStage = 'matched' | 'pitch_sent' | 'interviewing' | 'signed';

export interface PlacementOpportunity {
  id: string;
  stage: PlacementStage;
  candidateName: string;
  candidateRole: string;
  clientName: string;
  matchScore?: number;
  statusLabel: string;
}

export interface PlacementsState {
  opportunities: PlacementOpportunity[];
  isLoading: boolean;
  error: string | null;
}
