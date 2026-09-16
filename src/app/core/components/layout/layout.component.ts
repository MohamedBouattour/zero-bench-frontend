import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';
import { LoadingBarComponent } from '../../widgets/loading-bar/loading-bar.component';
import { ToastContainerComponent } from '../../widgets/toast/toast-container.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    BreadcrumbsComponent,
    LoadingBarComponent,
    ToastContainerComponent,
  ],
  template: `
    <div class="min-h-screen flex bg-surface-bright dark:bg-slate-950 text-on-surface dark:text-slate-100 antialiased relative">
      <!-- Global Top Loading Indicator (driven by LoadingService via HttpInterceptor) -->
      <app-loading-bar></app-loading-bar>

      <!-- Sidebar Navigation -->
      <app-sidebar></app-sidebar>

      <!-- Main Content Area -->
      <div class="flex-1 md:ml-60 flex flex-col min-h-screen w-full relative">
        <!-- Top Navbar -->
        <app-header></app-header>

        <!-- Main Workspace Container -->
        <main class="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">
          <app-breadcrumbs></app-breadcrumbs>
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Global Toast Notifications Overlay -->
      <app-toast-container></app-toast-container>
    </div>
  `,
})
export class LayoutComponent {}
