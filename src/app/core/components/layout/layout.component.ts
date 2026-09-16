import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent, BreadcrumbsComponent],
  template: `
    <div class="min-h-screen flex bg-surface-bright dark:bg-slate-950 text-on-surface dark:text-slate-100 antialiased">
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
    </div>
  `,
})
export class LayoutComponent {}
