export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // In milliseconds. 0 means sticky until dismissed manually.
  createdAt: number;
}

export interface ToastOptions {
  title?: string;
  duration?: number;
}
