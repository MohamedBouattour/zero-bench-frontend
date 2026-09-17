import { Consultant } from '../../consultants/models/consultant.model';

export type TrendDirection = 'up-bad' | 'up-good' | 'down-bad' | 'down-good';

export type RiskPeriod = 'month' | 'quarter' | 'year';

export const RISK_PERIOD_OPTIONS: readonly { value: RiskPeriod; label: string }[] = [
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
];

/** Computed live by the API from the consultant roster; trends are period-specific. */
export interface RiskMetrics {
  financialExposureMonthly: number;
  exposureBudgetMonthly: number;
  exposureBudgetUsage: number;
  financialExposureTrend: string;
  financialExposureTrendDirection: TrendDirection;
  onBenchCount: number;
  endingSoonCount: number;
  benchRatio: number;
  onBenchTrend: string;
  onBenchTrendDirection: TrendDirection;
  placementVelocityDays: number;
  placementVelocityTargetDays: number;
  placementVelocityProgress: number;
  placementVelocityTrend: string;
  placementVelocityTrendDirection: TrendDirection;
  avgBenchDays: number;
  benchDaysTarget: number;
  avgBenchDaysProgress: number;
  avgBenchDaysTrend: string;
  avgBenchDaysTrendDirection: TrendDirection;
}

/** Best bench consultant × open RFP pairing. */
export interface AiRecommendation {
  consultantId: string;
  consultantName: string;
  consultantTitle: string;
  daysOnBench: number;
  clientId: string;
  clientName: string;
  rfpId: string;
  rfpTitle: string;
  matchScore: number;
  matchedSkills: string[];
  /** Bench cost avoided over a month if staffed now (EUR). */
  potentialLoss: number;
}

export interface RiskOverviewResponse {
  period: RiskPeriod;
  metrics: RiskMetrics;
  highRiskConsultants: Consultant[];
  recommendation: AiRecommendation | null;
}

export interface BenchRiskState {
  period: RiskPeriod;
  metrics: RiskMetrics | null;
  highRiskConsultants: Consultant[];
  recommendation: AiRecommendation | null;
  isLoading: boolean;
  error: string | null;
}
