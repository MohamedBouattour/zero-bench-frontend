import { ConsultantStatus } from '../../consultants/models/consultant.model';

export type PlacementStage = 'matched' | 'pitch_sent' | 'interviewing' | 'signed' | 'lost';

/** Ordered pipeline stages (left → right on the board). */
export const PLACEMENT_STAGES: readonly PlacementStage[] = ['matched', 'pitch_sent', 'interviewing', 'signed', 'lost'];

export const PLACEMENT_STAGE_LABELS: Record<PlacementStage, string> = {
  matched: 'Matched',
  pitch_sent: 'Pitch Sent',
  interviewing: 'Interviewing',
  signed: 'Signed / Won',
  lost: 'Lost',
};

export interface PlacementStageEvent {
  stage: PlacementStage;
  at: string;
}

export interface PlacementOpportunity {
  id: string;
  stage: PlacementStage;
  consultantId: string;
  consultantName: string;
  consultantTitle: string;
  consultantStatus: ConsultantStatus;
  /** Consultant daily rate (EUR), used for pipeline value. */
  tjm: number;
  clientId: string;
  clientName: string;
  rfpId?: string;
  rfpTitle?: string;
  roleTitle: string;
  matchScore?: number;
  note: string;
  createdAt: string;
  updatedAt: string;
  history: PlacementStageEvent[];
}

export interface PlacementPayload {
  consultantId: string;
  clientId: string;
  rfpId?: string;
  roleTitle: string;
  stage: PlacementStage;
  note: string;
  matchScore?: number;
}

export type PlacementUpdate = Partial<Pick<PlacementOpportunity, 'stage' | 'note' | 'matchScore' | 'roleTitle'>>;

export interface PipelineStats {
  activeCount: number;
  signedCount: number;
  lostCount: number;
  /** Signed ÷ (signed + lost), in percent. */
  winRate: number;
  /** Monthly billing if every active opportunity is won (EUR). */
  pipelineMonthlyValue: number;
  averageMatchScore: number;
}

export interface PlacementsState {
  opportunities: PlacementOpportunity[];
  searchQuery: string;
  clientFilter: string;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}
