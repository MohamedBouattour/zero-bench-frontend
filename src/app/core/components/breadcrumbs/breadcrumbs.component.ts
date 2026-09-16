import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { BreadcrumbItem } from '../../models/breadcrumb.model';

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="flex items-center gap-1.5 text-xs text-outline dark:text-slate-400 py-3" aria-label="Breadcrumb">
      <a routerLink="/" class="flex items-center hover:text-on-surface dark:hover:text-white transition-colors">
        <span class="material-symbols-outlined text-[16px]">home</span>
      </a>
      @for (crumb of crumbs(); track crumb.url; let last = $last) {
        <span class="material-symbols-outlined text-[14px]">chevron_right</span>
        @if (last) {
          <span class="font-semibold text-on-surface dark:text-white capitalize">
            {{ crumb.label }}
          </span>
        } @else {
          <a [routerLink]="crumb.url" class="hover:text-on-surface dark:hover:text-white transition-colors capitalize">
            {{ crumb.label }}
          </a>
        }
      }
    </nav>
  `,
})
export class BreadcrumbsComponent {
  private readonly router = inject(Router);
  readonly crumbs = signal<BreadcrumbItem[]>([]);

  constructor() {
    this.updateCrumbs(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateCrumbs(event.urlAfterRedirects);
      });
  }

  private updateCrumbs(url: string): void {
    const cleanUrl = url.split('?')[0];
    const segments = cleanUrl.split('/').filter((s) => s.length > 0);
    
    if (segments.length === 0) {
      this.crumbs.set([{ label: 'Dashboard', url: '/dashboard' }]);
      return;
    }

    const breadcrumbs: BreadcrumbItem[] = [];
    let currentPath = '';

    for (const segment of segments) {
      currentPath += `/${segment}`;
      const formattedLabel = segment.replace(/-/g, ' ');
      breadcrumbs.push({
        label: formattedLabel,
        url: currentPath,
      });
    }

    this.crumbs.set(breadcrumbs);
  }
}
