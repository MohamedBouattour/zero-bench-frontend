import { Consultant } from './consultant.model';

export interface RiskMetrics {
  financialExposure: string;
  financialExposureMonthly: number;
  financialExposureTrend: string;
  financialExposureTrendDirection: 'up-bad' | 'up-good' | 'down-bad' | 'down-good';
  onBenchCount: number;
  onBenchSubtext: string;
  placementVelocity: string;
  placementVelocityTrend: string;
  placementVelocityTrendDirection: 'up-bad' | 'up-good' | 'down-bad' | 'down-good';
  avgBenchDays: string;
  avgBenchDaysTrend: string;
  avgBenchDaysTrendDirection: 'up-bad' | 'up-good' | 'down-bad' | 'down-good';
}

export interface RiskOverviewResponse {
  metrics: RiskMetrics;
  highRiskConsultants: Consultant[];
}
