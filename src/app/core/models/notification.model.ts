export type NotificationType = 'bench_alert' | 'contract_ending' | 'ai_match' | 'placement';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  route: string;
  queryParams?: Record<string, string>;
}

export interface NotificationsState {
  notifications: AppNotification[];
  isLoading: boolean;
  error: string | null;
}
