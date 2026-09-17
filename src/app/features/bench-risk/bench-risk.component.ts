import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FileExportService } from '../../core/services/file-export.service';
import { LanguageStore } from '../../core/stores/language.store';
import { AiSparkleCardComponent } from '../../core/widgets/ai-sparkle-card/ai-sparkle-card.component';
import { AvatarComponent } from '../../core/widgets/avatar/avatar.component';
import { DataTableContainerComponent } from '../../core/widgets/data-table/data-table-container.component';
import { ErrorStateComponent } from '../../core/widgets/error-state/error-state.component';
import { SkeletonComponent } from '../../core/widgets/skeleton/skeleton.component';
import { SkeletonRowsComponent } from '../../core/widgets/skeleton/skeleton-rows.component';
import { StatCardComponent } from '../../core/widgets/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../core/widgets/status-badge/status-badge.component';
import { ConsultantDetailModalComponent } from '../consultants/components/consultant-detail-modal.component';
import { Consultant, WORKING_DAYS_PER_MONTH } from '../consultants/models/consultant.model';
import { RISK_PERIOD_OPTIONS } from './models/bench-risk.model';
import { BenchRiskStore } from './stores/bench-risk.store';


@Component({
  selector: 'app-bench-risk',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    RouterLink,
    AiSparkleCardComponent,
    AvatarComponent,
    DataTableContainerComponent,
    ErrorStateComponent,
    SkeletonComponent,
    SkeletonRowsComponent,
    StatCardComponent,
    StatusBadgeComponent,
    ConsultantDetailModalComponent,
  ],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Domain Header -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-on-surface dark:text-white">Bench Risk Overview</h2>
          <p class="text-xs text-outline dark:text-slate-400 mt-1">
            Real-time monitoring of inter-contrat periods, consultant availability, and daily cost exposure.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <div
            class="flex items-center p-0.5 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 text-xs"
            role="group"
            aria-label="Trend period"
          >
            @for (option of periods; track option.value) {
              @let active = riskStore.period() === option.value;
              <button
                type="button"
                (click)="riskStore.setPeriod(option.value)"
                class="px-3 py-1.5 rounded-lg font-semibold transition-colors"
                [class]="active ? 'bg-secondary-blue dark:bg-blue-600 text-white shadow-xs' : 'text-outline dark:text-slate-400 hover:text-on-surface dark:hover:text-white'"
                [attr.aria-pressed]="active"
              >
                {{ option.label }}
              </button>
            }
          </div>
          <button type="button" (click)="exportReport()" [disabled]="!riskStore.metrics()" class="btn-primary">
            <span class="material-symbols-outlined text-[16px]">download</span>
            <span>{{ t().actions.exportReport }}</span>
          </button>
        </div>
      </div>

      @if (riskStore.error(); as error) {
        <app-error-state title="Risk overview unavailable" [message]="error" (retry)="riskStore.loadOverview()" />
      }

      <!-- KPI Metrics Grid -->
      @if (riskStore.metrics(); as metrics) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" [class.opacity-60]="riskStore.isLoading()">
          <app-stat-card
            [label]="t().stats.financialExposure"
            [value]="(metrics.financialExposureMonthly | currency: 'EUR' : 'symbol' : '1.0-0') ?? ''"
            unit="/ mo"
            icon="payments"
            tone="danger"
            [trend]="metrics.financialExposureTrend"
            [trendDirection]="metrics.financialExposureTrendDirection"
            [subtext]="metrics.exposureBudgetUsage + '% of ' + (metrics.exposureBudgetMonthly | currency: 'EUR' : 'symbol' : '1.0-0') + ' budget'"
            [progress]="metrics.exposureBudgetUsage > 100 ? 100 : metrics.exposureBudgetUsage"
          />
          <app-stat-card
            [label]="t().stats.onBenchCount"
            [value]="metrics.onBenchCount"
            unit="consultants"
            icon="person_alert"
            tone="danger"
            [trend]="metrics.onBenchTrend"
            [trendDirection]="metrics.onBenchTrendDirection"
            [subtext]="metrics.endingSoonCount + ' missions ending ≤ 30 days'"
            [progress]="metrics.benchRatio"
          />
          <app-stat-card
            [label]="t().stats.placementVelocity"
            [value]="(metrics.placementVelocityDays | number: '1.1-1') ?? ''"
            unit="days avg"
            icon="speed"
            tone="success"
            [trend]="metrics.placementVelocityTrend"
            [trendDirection]="metrics.placementVelocityTrendDirection"
            [subtext]="'target < ' + metrics.placementVelocityTargetDays + ' days'"
            [progress]="metrics.placementVelocityProgress"
          />
          <app-stat-card
            [label]="t().stats.avgBenchDays"
            [value]="(metrics.avgBenchDays | number: '1.1-1') ?? ''"
            unit="days"
            icon="hourglass_empty"
            tone="warning"
            [trend]="metrics.avgBenchDaysTrend"
            [trendDirection]="metrics.avgBenchDaysTrendDirection"
            [subtext]="'target < ' + metrics.benchDaysTarget + ' days'"
            [progress]="metrics.avgBenchDaysProgress"
          />
        </div>
      } @else if (riskStore.isLoading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (i of [1, 2, 3, 4]; track i) {
            <app-skeleton variant="card" />
          }
        </div>
      }

      <!-- AI Proactive Recommendation Layer -->
      @if (riskStore.recommendation(); as rec) {
        <app-ai-sparkle-card
          title="High-Value Placement Opportunity Detected"
          [description]="rec.consultantName + ' (' + rec.consultantTitle + ', ' + rec.daysOnBench + ' days on bench) matches ' + rec.matchScore + '% with ' + rec.clientName + '’s open “' + rec.rfpTitle + '” RFP. Staffing now avoids ' + (rec.potentialLoss | currency: 'EUR' : 'symbol' : '1.0-0') + ' of monthly inter-contrat cost.'"
          [matchScore]="rec.matchScore"
          actionLabel="Review & Generate Pitch"
          secondaryActionLabel="Add to pipeline"
          (actionClicked)="generatePitch(rec.consultantId, rec.clientId, rec.rfpId)"
          (secondaryActionClicked)="addToPipeline(rec.consultantId, rec.clientId, rec.rfpId)"
        >
          <div class="flex flex-wrap gap-1 mt-2">
            @for (skill of rec.matchedSkills; track skill) {
              <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100/70 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                {{ skill }}
              </span>
            }
          </div>
        </app-ai-sparkle-card>
      }

      <!-- Risk Table -->
      <app-data-table-container
        title="Active Inter-contrat & Ending Missions"
        subtitle="Bench consultants sorted by bench duration, then missions ending soonest"
      >
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="border-b border-outline-variant dark:border-slate-800 bg-surface-container-low/50 dark:bg-slate-800/40 text-outline dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th class="px-5 py-3">Consultant</th>
              <th class="px-5 py-3">Primary Tech</th>
              <th class="px-5 py-3">Seniority</th>
              <th class="px-5 py-3">Status</th>
              <th class="px-5 py-3">TJM</th>
              <th class="px-5 py-3">Bench Days / End Date</th>
              <th class="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          @if (riskStore.isLoading() && riskStore.highRiskConsultants().length === 0) {
            <tbody appSkeletonRows [rows]="4" [columns]="7"></tbody>
          } @else {
            <tbody class="divide-y divide-outline-variant/60 dark:divide-slate-800/60">
              @for (c of riskStore.highRiskConsultants(); track c.id) {
                <tr class="hover:bg-surface-container-low/40 dark:hover:bg-slate-800/30 transition-colors cursor-pointer" (click)="selectedId.set(c.id)">
                  <td class="px-5 py-3.5">
                    <div class="flex items-center gap-2.5">
                      <app-avatar [name]="c.fullName" size="sm" />
                      <div>
                        <button
                          type="button"
                          (click)="$event.stopPropagation(); selectedId.set(c.id)"
                          class="block font-semibold text-on-surface dark:text-white hover:text-secondary-blue dark:hover:text-blue-400 text-left"
                        >
                          {{ c.fullName }}
                        </button>
                        <span class="block text-[10px] text-outline dark:text-slate-400">{{ c.title }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-3.5">
                    <span class="inline-flex items-center px-2 py-0.5 rounded bg-surface-container-low dark:bg-slate-800 text-on-surface-variant dark:text-slate-300 font-medium">
                      {{ c.primarySkill }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5 text-on-surface-variant dark:text-slate-300 font-medium">{{ c.seniority }}</td>
                  <td class="px-5 py-3.5"><app-status-badge [status]="c.status" /></td>
                  <td class="px-5 py-3.5 font-semibold text-on-surface dark:text-white whitespace-nowrap">
                    {{ c.tjm | currency: 'EUR' : 'symbol' : '1.0-0' }}/d
                  </td>
                  <td class="px-5 py-3.5 text-on-surface-variant dark:text-slate-300 whitespace-nowrap">
                    @if (c.status === 'on_bench') {
                      <span class="font-bold text-red-600 dark:text-red-400">{{ c.daysOnBench ?? 0 }} days</span>
                      <span class="block text-[10px] text-outline">
                        {{ c.tjm * workingDays | currency: 'EUR' : 'symbol' : '1.0-0' }}/mo exposure
                      </span>
                    } @else {
                      <span>Ends {{ c.missionEndDate | date: 'd MMM y' }}</span>
                      <span class="block text-[10px] text-outline">{{ c.clientName }}</span>
                    }
                  </td>
                  <td class="px-5 py-3.5 text-right" (click)="$event.stopPropagation()">
                    <a
                      routerLink="/pitch-generator"
                      [queryParams]="{ consultantId: c.id }"
                      class="inline-block px-2.5 py-1 text-xs font-semibold rounded-lg bg-surface-container-low dark:bg-slate-800 text-secondary-blue dark:text-blue-400 hover:bg-secondary-blue hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors"
                    >
                      Match RFPs
                    </a>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-5 py-10 text-center text-outline dark:text-slate-400">
                    <span class="material-symbols-outlined text-3xl block mb-1 text-emerald-500">celebration</span>
                    No consultant on bench and no mission ending soon.
                  </td>
                </tr>
              }
            </tbody>
          }
        </table>

        <div footer class="flex items-center justify-between w-full">
          <span>Showing {{ riskStore.highRiskConsultants().length }} at-risk profiles</span>
          <a routerLink="/consultants" class="font-semibold text-secondary-blue dark:text-blue-400 hover:underline">
            View full directory &rarr;
          </a>
        </div>
      </app-data-table-container>
    </div>

    @if (selectedConsultant(); as consultant) {
      <app-consultant-detail-modal
        [consultant]="consultant"
        [allowDelete]="false"
        (edit)="editConsultant($event)"
        (closed)="selectedId.set(null)"
      />
    }
  `,
})
export class BenchRiskComponent implements OnInit {
  protected readonly riskStore = inject(BenchRiskStore);
  protected readonly t = inject(LanguageStore).translations;
  private readonly fileExport = inject(FileExportService);
  private readonly router = inject(Router);

  protected readonly periods = RISK_PERIOD_OPTIONS;
  protected readonly workingDays = WORKING_DAYS_PER_MONTH;
  protected readonly selectedId = signal<string | null>(null);

  protected readonly selectedConsultant = computed(() => {
    const id = this.selectedId();
    return id ? (this.riskStore.consultantMap().get(id) ?? null) : null;
  });

  ngOnInit(): void {
    void this.riskStore.loadOverview();
  }

  protected generatePitch(consultantId: string, clientId: string, rfpId: string): void {
    void this.router.navigate(['/pitch-generator'], { queryParams: { consultantId, clientId, rfpId } });
  }

  protected addToPipeline(consultantId: string, clientId: string, rfpId: string): void {
    void this.router.navigate(['/placements'], { queryParams: { mode: 'new', consultantId, clientId, rfpId } });
  }

  protected editConsultant(consultant: Consultant): void {
    void this.router.navigate(['/consultants'], { queryParams: { id: consultant.id, mode: 'edit' } });
  }

  protected exportReport(): void {
    const metrics = this.riskStore.metrics();
    if (!metrics) return;
    this.fileExport.downloadCsv(
      `bench-risk-${this.riskStore.period()}-${new Date().toISOString().slice(0, 10)}.csv`,
      this.riskStore.highRiskConsultants().map((c) => ({
        Consultant: c.fullName,
        Title: c.title,
        Seniority: c.seniority,
        Status: c.status,
        'Primary skill': c.primarySkill,
        'TJM (EUR)': c.tjm,
        'Days on bench': c.daysOnBench,
        'Monthly exposure (EUR)': c.status === 'on_bench' ? c.tjm * WORKING_DAYS_PER_MONTH : 0,
        'Mission end': c.missionEndDate,
        Client: c.clientName,
      })),
    );
  }
}
