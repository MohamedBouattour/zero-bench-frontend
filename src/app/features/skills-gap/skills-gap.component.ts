import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FileExportService } from '../../core/services/file-export.service';
import { AvatarComponent } from '../../core/widgets/avatar/avatar.component';
import { ErrorStateComponent } from '../../core/widgets/error-state/error-state.component';
import { SkeletonComponent } from '../../core/widgets/skeleton/skeleton.component';
import { SkeletonRowsComponent } from '../../core/widgets/skeleton/skeleton-rows.component';
import { StatCardComponent } from '../../core/widgets/stat-card/stat-card.component';
import { CategoryCoverageChartComponent } from './components/category-coverage-chart.component';
import { DemandBadgeComponent } from './components/demand-badge.component';
import { DEMAND_STEPS, LEGENDS, SUPPLY_STEPS, gapClass, sequentialClass } from './components/heatmap-scale';
import { SkillDetailModalComponent } from './components/skill-detail-modal.component';
import { SkillDemandMetric, SkillsGapSort } from './models/skills-gap.model';
import { SkillsGapStore } from './stores/skills-gap.store';

const SORT_OPTIONS: readonly { value: SkillsGapSort; label: string }[] = [
  { value: 'gap', label: 'Largest shortage' },
  { value: 'demand', label: 'Most demanded' },
  { value: 'supply', label: 'Most available' },
  { value: 'velocity', label: 'Fastest placement' },
  { value: 'name', label: 'Name (A–Z)' },
];

interface HeatmapRow {
  metric: SkillDemandMetric;
  benchClass: string;
  endingClass: string;
  demandClass: string;
  gapClass: string;
  gapLabel: string;
}

@Component({
  selector: 'app-skills-gap',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    RouterLink,
    AvatarComponent,
    ErrorStateComponent,
    SkeletonComponent,
    SkeletonRowsComponent,
    StatCardComponent,
    CategoryCoverageChartComponent,
    DemandBadgeComponent,
    SkillDetailModalComponent,
  ],
  template: `
    <div class="space-y-6 pb-12">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-on-surface dark:text-white">Skills Gap & Demand Heatmap</h2>
          <p class="text-xs text-outline dark:text-slate-400 mt-1">
            Consultant competencies against open RFP demand — spot shortages before they cost placements and surpluses before they cost bench days.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" (click)="store.load()" [disabled]="store.isLoading()" class="btn-secondary" aria-label="Refresh analytics">
            <span class="material-symbols-outlined text-[16px]" [class.animate-spin]="store.isLoading()">refresh</span>
          </button>
          <button type="button" (click)="exportCsv()" [disabled]="store.metrics().length === 0" class="btn-primary">
            <span class="material-symbols-outlined text-[16px]">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      @if (store.error(); as error) {
        <app-error-state title="Skills analytics unavailable" [message]="error" (retry)="store.load()" />
      }

      <!-- KPIs -->
      @if (store.summary(); as summary) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <app-stat-card
            label="Market alignment"
            [value]="(summary.marketAlignmentIndex | number: '1.0-1') + '%'"
            icon="hub"
            [tone]="summary.marketAlignmentIndex >= 80 ? 'success' : 'warning'"
            subtext="RFP skill requirements covered"
            [progress]="summary.marketAlignmentIndex"
          />
          <app-stat-card
            label="Critical gaps"
            [value]="summary.criticalGapCount"
            unit="skills"
            icon="priority_high"
            tone="danger"
            subtext="demand exceeds available supply"
          />
          <app-stat-card
            label="Staffable RFPs"
            [value]="summary.staffableRfpCount"
            [unit]="'/ ' + summary.openRfpCount"
            icon="task_alt"
            tone="primary"
            subtext="with a ≥ 80% available match"
            [progress]="summary.openRfpCount ? (summary.staffableRfpCount / summary.openRfpCount) * 100 : 0"
          />
          <app-stat-card
            label="Available talent"
            [value]="summary.availableConsultantsCount"
            unit="consultants"
            icon="person_search"
            tone="indigo"
            [subtext]="summary.skillsTracked + ' skills tracked'"
          />
        </div>
      } @else if (store.isLoading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (i of [1, 2, 3, 4]; track i) {
            <app-skeleton variant="card" />
          }
        </div>
      }

      <!-- Insights -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        @for (insight of insights(); track insight.title) {
          <div class="p-5 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 shadow-sm">
            <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" [class]="insight.tone">
              <span class="material-symbols-outlined text-[18px]">{{ insight.icon }}</span>
              <span>{{ insight.title }}</span>
            </div>
            <div class="flex flex-wrap gap-1.5 mt-3">
              @for (skill of insight.skills; track skill.id) {
                <button
                  type="button"
                  (click)="openSkill(skill.id)"
                  class="px-2 py-1 rounded-md text-[11px] font-semibold bg-surface-container-low dark:bg-slate-800 text-on-surface dark:text-slate-200 hover:ring-2 hover:ring-secondary-blue/30 transition-shadow"
                >
                  {{ skill.skillName }}
                  <span class="text-outline dark:text-slate-400 font-medium">{{ insight.detail(skill) }}</span>
                </button>
              } @empty {
                <span class="text-xs text-outline dark:text-slate-400">{{ store.isLoading() ? 'Analysing…' : insight.empty }}</span>
              }
            </div>
            <p class="text-[11px] text-outline dark:text-slate-400 mt-3">{{ insight.hint }}</p>
          </div>
        }
      </div>

      <!-- Heatmap -->
      <section class="rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 shadow-sm">
        <div class="px-5 py-4 border-b border-outline-variant dark:border-slate-800 space-y-3">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h3 class="text-sm font-bold text-on-surface dark:text-white">Supply × demand heatmap</h3>
              <p class="text-xs text-outline dark:text-slate-400 mt-0.5">
                {{ store.filteredMetrics().length }} skills · click a row for talent and RFP details
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <div class="relative">
                <span class="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-outline" aria-hidden="true">search</span>
                <input
                  type="search"
                  placeholder="Filter skills…"
                  aria-label="Filter skills"
                  [value]="store.searchQuery()"
                  (input)="store.setSearchQuery($any($event.target).value)"
                  class="field-input pl-8 w-44!"
                />
              </div>
              <select class="field-input w-auto!" aria-label="Sort skills" [value]="store.sortBy()" (change)="store.setSort($any($event.target).value)">
                @for (option of sortOptions; track option.value) {
                  <option [value]="option.value">{{ option.label }}</option>
                }
              </select>
              <label class="inline-flex items-center gap-2 text-xs font-medium text-on-surface-variant dark:text-slate-300 cursor-pointer select-none">
                <input type="checkbox" class="accent-secondary-blue w-3.5 h-3.5" [checked]="store.hideInactive()" (change)="store.toggleHideInactive()" />
                Hide inactive
              </label>
            </div>
          </div>

          <div class="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
            @for (category of categoryChips(); track category.label) {
              @let active = store.selectedCategory() === category.value;
              <button
                type="button"
                (click)="store.setCategory(category.value)"
                class="px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors"
                [class]="active ? 'bg-secondary-blue border-secondary-blue text-white dark:bg-blue-600 dark:border-blue-600' : 'border-outline-variant dark:border-slate-700 text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-low dark:hover:bg-slate-800'"
                [attr.aria-pressed]="active"
              >
                {{ category.label }}
              </button>
            }
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-xs border-separate border-spacing-0.5 px-3 pt-2">
            <caption class="sr-only">Skills heatmap: available supply, demand and gap per skill</caption>
            <thead>
              <tr class="text-[10px] font-bold uppercase tracking-wider text-outline dark:text-slate-400">
                <th scope="col" class="text-left px-2 py-2 font-bold min-w-40">Skill</th>
                <th scope="col" class="px-2 py-2 w-24">On bench</th>
                <th scope="col" class="px-2 py-2 w-24">Ending soon</th>
                <th scope="col" class="px-2 py-2 w-24">Open RFPs</th>
                <th scope="col" class="px-2 py-2 w-24">Gap</th>
                <th scope="col" class="px-2 py-2 w-20">On mission</th>
                <th scope="col" class="px-2 py-2 w-24">Placement</th>
                <th scope="col" class="text-left px-2 py-2 min-w-32">Demand</th>
              </tr>
            </thead>
            @if (store.isLoading() && store.metrics().length === 0) {
              <tbody appSkeletonRows [rows]="8" [columns]="8"></tbody>
            } @else {
              <tbody>
                @for (row of rows(); track row.metric.id) {
                  @let m = row.metric;
                  <tr class="group cursor-pointer" (click)="openSkill(m.id)">
                    <th scope="row" class="text-left px-2 py-1.5 rounded-md group-hover:bg-surface-container-low dark:group-hover:bg-slate-800/60">
                      <button type="button" class="text-left focus:outline-none focus-visible:underline" (click)="$event.stopPropagation(); openSkill(m.id)">
                        <span class="block text-xs font-semibold text-on-surface dark:text-white">{{ m.skillName }}</span>
                        <span class="block text-[10px] font-medium text-outline dark:text-slate-500">{{ m.category }}</span>
                      </button>
                    </th>
                    <td class="viz-tip h-10 rounded-md text-center font-bold tabular-nums" [class]="row.benchClass" [attr.data-tip]="m.skillName + ': ' + m.benchConsultantsCount + ' on bench'">
                      {{ m.benchConsultantsCount }}
                    </td>
                    <td class="viz-tip h-10 rounded-md text-center font-bold tabular-nums" [class]="row.endingClass" [attr.data-tip]="m.skillName + ': ' + m.endingSoonCount + ' mission(s) ending soon'">
                      {{ m.endingSoonCount }}
                    </td>
                    <td class="viz-tip h-10 rounded-md text-center font-bold tabular-nums" [class]="row.demandClass" [attr.data-tip]="m.skillName + ': ' + m.openRfpCount + ' open RFP(s)'">
                      {{ m.openRfpCount }}
                    </td>
                    <td class="viz-tip h-10 rounded-md text-center font-bold tabular-nums" [class]="row.gapClass" [attr.data-tip]="m.skillName + ': ' + row.gapLabel">
                      {{ m.gapScore > 0 ? '+' + m.gapScore : m.gapScore }}
                    </td>
                    <td class="h-10 text-center tabular-nums text-on-surface-variant dark:text-slate-300">{{ m.activeConsultantsCount }}</td>
                    <td class="h-10 text-center tabular-nums text-on-surface-variant dark:text-slate-300">{{ m.placementVelocityDays }}d</td>
                    <td class="px-2 h-10"><app-demand-badge [level]="m.demandLevel" [trend]="m.demandTrend" /></td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="py-10 text-center text-outline dark:text-slate-400">No skill matches the current filters.</td>
                  </tr>
                }
              </tbody>
            }
          </table>
        </div>

        <!-- Legend -->
        <div class="px-5 py-3 border-t border-outline-variant dark:border-slate-800 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] text-on-surface-variant dark:text-slate-400">
          <div class="flex items-center gap-2">
            <span class="font-semibold">Available supply</span>
            <span class="flex gap-0.5" aria-hidden="true">
              @for (swatch of legends.supply; track $index) {
                <span class="w-4 h-3 rounded-sm" [class]="swatch"></span>
              }
            </span>
            <span>0 → {{ store.scale().supply }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-semibold">Open RFPs</span>
            <span class="flex gap-0.5" aria-hidden="true">
              @for (swatch of legends.demand; track $index) {
                <span class="w-4 h-3 rounded-sm" [class]="swatch"></span>
              }
            </span>
            <span>0 → {{ store.scale().demand }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-semibold">Gap</span>
            <span>surplus</span>
            <span class="flex gap-0.5" aria-hidden="true">
              @for (swatch of legends.gap; track $index) {
                <span class="w-4 h-3 rounded-sm" [class]="swatch"></span>
              }
            </span>
            <span>shortage</span>
          </div>
        </div>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <app-category-coverage-chart [data]="store.categoryCoverage()" (selectCategory)="store.setCategory($event)" />

        <!-- Upskilling -->
        <section class="p-5 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 shadow-sm">
          <h3 class="text-sm font-bold text-on-surface dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px] text-indigo-600 dark:text-indigo-400">school</span>
            Upskilling recommendations
          </h3>
          <p class="text-xs text-outline dark:text-slate-400 mt-0.5 mb-4">Available consultants one or two skills away from an open RFP</p>

          <ul class="space-y-3">
            @for (s of store.upskilling(); track s.consultantId) {
              <li class="p-3 rounded-xl border border-outline-variant/70 dark:border-slate-800">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <app-avatar [name]="s.consultantName" size="sm" />
                    <div class="min-w-0">
                      <a routerLink="/consultants" [queryParams]="{ id: s.consultantId }" class="block text-xs font-semibold text-on-surface dark:text-white hover:underline truncate">
                        {{ s.consultantName }}
                      </a>
                      <p class="text-[10px] text-outline dark:text-slate-400 truncate">for {{ s.rfpTitle }} · {{ s.clientName }}</p>
                    </div>
                  </div>
                  <a
                    routerLink="/pitch-generator"
                    [queryParams]="{ consultantId: s.consultantId, clientId: s.clientId, rfpId: s.rfpId }"
                    class="shrink-0 px-2 py-1 rounded-md text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                  >
                    Pitch
                  </a>
                </div>
                <div class="mt-2.5 flex items-center gap-2">
                  <div class="flex-1 h-1.5 rounded-full bg-surface-container-low dark:bg-slate-800 overflow-hidden" role="progressbar" [attr.aria-valuenow]="s.readiness" aria-valuemin="0" aria-valuemax="100" [attr.aria-label]="'Readiness ' + s.readiness + '%'">
                    <div class="h-full rounded-full bg-indigo-500" [style.width.%]="s.readiness"></div>
                  </div>
                  <span class="text-[10px] font-bold text-on-surface-variant dark:text-slate-300 tabular-nums">{{ s.readiness }}% ready</span>
                </div>
                <div class="mt-2 flex flex-wrap items-center gap-1 text-[10px]">
                  <span class="text-outline dark:text-slate-400">Learn:</span>
                  @for (skill of s.targetSkills; track skill) {
                    <span class="px-1.5 py-0.5 rounded font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">{{ skill }}</span>
                  }
                </div>
              </li>
            } @empty {
              <li class="py-8 text-center text-xs text-outline dark:text-slate-400">
                {{ store.isLoading() ? 'Analysing…' : 'No upskilling opportunity: available consultants either fully match an RFP or are too far from one.' }}
              </li>
            }
          </ul>
        </section>
      </div>
    </div>

    @if (selectedSkill(); as metric) {
      <app-skill-detail-modal [metric]="metric" [upskilling]="store.upskilling()" (closed)="openSkill(null)" />
    }
  `,
})
export class SkillsGapComponent implements OnInit {
  /** Query param `?skill=<id>` opens the skill detail modal (shareable). */
  readonly skill = input<string>();

  protected readonly store = inject(SkillsGapStore);
  private readonly fileExport = inject(FileExportService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly legends = LEGENDS;

  protected readonly selectedSkill = computed(() => {
    const id = this.skill();
    return id ? (this.store.entityMap()[id] ?? null) : null;
  });

  protected readonly categoryChips = computed(() => [
    { label: 'All categories', value: null },
    ...this.store.categories().map((category) => ({ label: category, value: category })),
  ]);

  protected readonly rows = computed<HeatmapRow[]>(() => {
    const scale = this.store.scale();
    return this.store.filteredMetrics().map((metric) => ({
      metric,
      benchClass: sequentialClass(metric.benchConsultantsCount, scale.supply, SUPPLY_STEPS),
      endingClass: sequentialClass(metric.endingSoonCount, scale.supply, SUPPLY_STEPS),
      demandClass: sequentialClass(metric.openRfpCount, scale.demand, DEMAND_STEPS),
      gapClass: gapClass(metric.gapScore, scale.gap),
      gapLabel:
        metric.gapScore > 0
          ? `shortage of ${metric.gapScore} consultant(s)`
          : metric.gapScore < 0
            ? `surplus of ${-metric.gapScore} available consultant(s)`
            : 'supply matches demand',
    }));
  });

  protected readonly insights = computed(() => [
    {
      title: 'High demand, low bench',
      icon: 'trending_up',
      tone: 'text-red-600 dark:text-red-400',
      skills: this.store.shortages().slice(0, 6),
      detail: (m: SkillDemandMetric) => `+${m.gapScore}`,
      empty: 'No shortage: every requested skill has available talent.',
      hint: 'Recruit or source freelancers for these skills first.',
    },
    {
      title: 'Idle bench skills',
      icon: 'inventory_2',
      tone: 'text-blue-600 dark:text-blue-400',
      skills: this.store.idleBenchSkills().slice(0, 6),
      detail: (m: SkillDemandMetric) => `${m.benchConsultantsCount} idle`,
      empty: 'Every bench skill is currently requested.',
      hint: 'No open RFP asks for these — upskill or prospect new accounts.',
    },
    {
      title: 'Rising demand',
      icon: 'rocket_launch',
      tone: 'text-indigo-600 dark:text-indigo-400',
      skills: this.store.risingDemand().slice(0, 6),
      detail: (m: SkillDemandMetric) => `${m.openRfpCount} RFP${m.openRfpCount > 1 ? 's' : ''}`,
      empty: 'No rising skill in open RFPs.',
      hint: 'Market momentum: prioritise certifications here.',
    },
  ]);

  ngOnInit(): void {
    void this.store.load();
  }

  protected openSkill(id: string | null): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: { skill: id }, queryParamsHandling: 'merge' });
  }

  protected exportCsv(): void {
    this.fileExport.downloadCsv(
      `skills-gap-${new Date().toISOString().slice(0, 10)}.csv`,
      this.store.filteredMetrics().map((m) => ({
        Skill: m.skillName,
        Category: m.category,
        'On bench': m.benchConsultantsCount,
        'Ending soon': m.endingSoonCount,
        'On mission': m.activeConsultantsCount,
        'Open RFPs': m.openRfpCount,
        Gap: m.gapScore,
        'Demand level': m.demandLevel,
        Trend: m.demandTrend,
        'Placement velocity (days)': m.placementVelocityDays,
      })),
    );
  }
}
