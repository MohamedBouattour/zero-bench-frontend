import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NavigationBadges } from '../models/navigation.model';
import { WorkspaceApiService } from '../services/workspace-api.service';
import { injectIsBrowser } from '../utils/platform.util';

@Injectable({
  providedIn: 'root',
})
export class NavigationStore {
  private readonly api = inject(WorkspaceApiService);
  private readonly isBrowser = injectIsBrowser();

  readonly isSidebarOpen = signal<boolean>(true);
  readonly isMobileDrawerOpen = signal<boolean>(false);
  readonly badges = signal<NavigationBadges>({ placements: 0, consultantsOnBench: 0 });

  toggleSidebar(): void {
    this.isSidebarOpen.update((open) => !open);
  }

  toggleMobileDrawer(): void {
    this.isMobileDrawerOpen.update((open) => !open);
  }

  closeMobileDrawer(): void {
    this.isMobileDrawerOpen.set(false);
  }

  openMobileDrawer(): void {
    this.isMobileDrawerOpen.set(true);
  }

  /** Refreshes sidebar counters; called on startup and after mutations that affect them. */
  async loadBadges(): Promise<void> {
    if (!this.isBrowser) return;
    try {
      this.badges.set(await firstValueFrom(this.api.getNavigationBadges()));
    } catch {
      // Badges are decorative: keep the previous counters on failure.
    }
  }
}
