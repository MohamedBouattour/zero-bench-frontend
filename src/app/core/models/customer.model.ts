export interface ClientAccount {
  id: string;
  name: string;
  industry: string;
  activeConsultants: number;
  openRFPs: number;
  monthlyRevenue: number;
  status: 'active' | 'prospect' | 'paused';
}
