import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NavigationStore {
  readonly isSidebarOpen = signal<boolean>(true);
  readonly isMobileDrawerOpen = signal<boolean>(false);

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
}
