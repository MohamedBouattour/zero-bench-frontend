export interface UserProfile {
  id: string;
  fullName: string;
  role: string;
  email: string;
}

export interface SessionState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}
