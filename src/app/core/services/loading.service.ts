import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly activeRequestsState = signal<number>(0);

  /**
   * Number of currently pending HTTP requests
   */
  readonly activeRequests = this.activeRequestsState.asReadonly();

  /**
   * Computed flag indicating whether any HTTP request is in progress
   */
  readonly isLoading = computed(() => this.activeRequestsState() > 0);

  /**
   * Increment active request counter
   */
  show(): void {
    this.activeRequestsState.update((count) => count + 1);
  }

  /**
   * Decrement active request counter safely without going below 0
   */
  hide(): void {
    this.activeRequestsState.update((count) => Math.max(0, count - 1));
  }

  /**
   * Force reset loading state to zero
   */
  reset(): void {
    this.activeRequestsState.set(0);
  }
}
