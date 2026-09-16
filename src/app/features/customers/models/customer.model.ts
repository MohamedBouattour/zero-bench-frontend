export interface ClientAccount {
  id: string;
  name: string;
  industry: string;
  activeConsultants: number;
  openRFPs: number;
  monthlyRevenue: number;
  status: 'active' | 'prospect' | 'paused';
}

export interface ClientsState {
  clients: ClientAccount[];
  isLoading: boolean;
  error: string | null;
}
