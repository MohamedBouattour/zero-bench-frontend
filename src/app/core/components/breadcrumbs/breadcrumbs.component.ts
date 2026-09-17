import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { BreadcrumbItem } from '../../models/breadcrumb.model';
import { NavLabelKey } from '../../models/navigation.model';
import { LanguageStore } from '../../stores/language.store';

const SEGMENT_LABELS: Record<string, NavLabelKey> = {
  dashboard: 'dashboard',
  'skills-gap': 'skillsGap',
  placements: 'placements',
  'pitch-generator': 'pitchGenerator',
  consultants: 'consultants',
  clients: 'clients',
  'design-system': 'designSystem',
};

@Component({
  selector: 'app-breadcrumbs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <nav class="flex items-center gap-1.5 text-xs text-outline dark:text-slate-400 py-3" aria-label="Breadcrumb">
      <a routerLink="/" class="flex items-center hover:text-on-surface dark:hover:text-white transition-colors" aria-label="Home">
        <span class="material-symbols-outlined text-[16px]">home</span>
      </a>
      @for (crumb of crumbs(); track crumb.url; let last = $last) {
        <span class="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
        @if (last) {
          <span class="font-semibold text-on-surface dark:text-white" aria-current="page">
            {{ crumb.label }}
          </span>
        } @else {
          <a [routerLink]="crumb.url" class="hover:text-on-surface dark:hover:text-white transition-colors">
            {{ crumb.label }}
          </a>
        }
      }
    </nav>
  `,
})
export class BreadcrumbsComponent {
  private readonly router = inject(Router);
  private readonly t = inject(LanguageStore).translations;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly crumbs = computed<BreadcrumbItem[]>(() => {
    const segments = this.url().split(/[?#]/)[0].split('/').filter(Boolean);
    const nav = this.t().nav;

    if (segments.length === 0) {
      return [{ label: nav.dashboard, url: '/dashboard' }];
    }

    return segments.map((segment, index) => {
      const key = SEGMENT_LABELS[segment];
      return {
        label: key ? nav[key] : segment.replace(/-/g, ' '),
        url: `/${segments.slice(0, index + 1).join('/')}`,
      };
    });
  });
}
