import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LanguageStore } from '../../core/stores/language.store';
import { BenchRiskStore } from './stores/bench-risk.store';
import { StatCardComponent } from '../../core/widgets/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../core/widgets/status-badge/status-badge.component';
import { AiSparkleCardComponent } from '../../core/widgets/ai-sparkle-card/ai-sparkle-card.component';
import { DataTableContainerComponent } from '../../core/widgets/data-table/data-table-container.component';

@Component({
  selector: 'app-bench-risk',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    StatCardComponent,
    StatusBadgeComponent,
    AiSparkleCardComponent,
    DataTableContainerComponent,
  ],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Domain Header -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-on-surface dark:text-white">
            Bench Risk Overview
          </h2>
          <p class="text-xs text-outline dark:text-slate-400 mt-1">
            Real-time monitoring of inter-contrat periods, consultant availability, and daily cost exposure.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 text-on-surface dark:text-slate-200 hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <span class="material-symbols-outlined text-[16px]">calendar_today</span>
            <span>Current Quarter</span>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-secondary-blue dark:bg-blue-600 text-white hover:opacity-90 transition-opacity shadow-xs shadow-secondary-blue/20"
          >
            <span class="material-symbols-outlined text-[16px]">download</span>
            <span>{{ t().actions.exportReport }}</span>
          </button>
        </div>
      </div>

      <!-- Loading skeleton -->
      @if (riskStore.isLoading() && !riskStore.metrics()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="h-32 rounded-xl bg-surface-container-low dark:bg-slate-800"></div>
          }
        </div>
      } @else if (riskStore.metrics(); as metrics) {
        <!-- KPI Metrics Grid from NgRx SignalStore -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <app-stat-card
            [label]="t().stats.financialExposure"
            [value]="metrics.financialExposure"
            unit="/ mo"
            icon="payments"
            tone="danger"
            [trend]="metrics.financialExposureTrend"
            [trendDirection]="metrics.financialExposureTrendDirection"
            subtext="vs last month"
            [progress]="65"
          ></app-stat-card>

          <app-stat-card
            [label]="t().stats.onBenchCount"
            [value]="metrics.onBenchCount"
            unit="consultants"
            icon="person_alert"
            tone="danger"
            trend="+2"
            trendDirection="up-bad"
            [subtext]="metrics.onBenchSubtext"
            [progress]="40"
          ></app-stat-card>

          <app-stat-card
            [label]="t().stats.placementVelocity"
            [value]="metrics.placementVelocity"
            unit="days avg"
            icon="speed"
            tone="success"
            [trend]="metrics.placementVelocityTrend"
            [trendDirection]="metrics.placementVelocityTrendDirection"
            subtext="time to match"
            [progress]="82"
          ></app-stat-card>

          <app-stat-card
            [label]="t().stats.avgBenchDays"
            [value]="metrics.avgBenchDays"
            unit="days"
            icon="hourglass_empty"
            tone="warning"
            [trend]="metrics.avgBenchDaysTrend"
            [trendDirection]="metrics.avgBenchDaysTrendDirection"
            subtext="target: <15 days"
            [progress]="55"
          ></app-stat-card>
        </div>
      }

      <!-- AI Proactive Recommendation Layer -->
      <app-ai-sparkle-card
        title="High-Value Placement Opportunity Detected"
        description="Alexandre Martin (Senior Angular/Fullstack, 22 days on bench) matches 96% with BNP Paribas' open 'Digital Portal Lead' RFP. Submitting an AI tailored pitch within 24h could prevent €14,000 inter-contrat loss."
        [matchScore]="96"
        actionLabel="Review & Generate Pitch"
      ></app-ai-sparkle-card>

      <!-- Risk Table Widget populated via NgRx SignalStore -->
      <app-data-table-container
        title="Active Inter-contrat & Ending Missions"
        subtitle="Live synchronization with backend risk matrix"
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
          <tbody class="divide-y divide-outline-variant/60 dark:divide-slate-800/60">
            @for (c of riskStore.highRiskConsultants(); track c.id) {
              <tr class="hover:bg-surface-container-low/40 dark:hover:bg-slate-800/30 transition-colors">
                <td class="px-5 py-3.5 font-medium text-on-surface dark:text-white flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-700 dark:text-slate-300">
                    {{ c.fullName.slice(0, 2).toUpperCase() }}
                  </div>
                  <div>
                    <span class="block font-semibold">{{ c.fullName }}</span>
                    <span class="block text-[10px] text-outline dark:text-slate-400">{{ c.title }}</span>
                  </div>
                </td>
                <td class="px-5 py-3.5">
                  <span class="inline-flex items-center px-2 py-0.5 rounded bg-surface-container-low dark:bg-slate-800 text-on-surface-variant dark:text-slate-300 font-medium">
                    {{ c.primarySkill }}
                  </span>
                </td>
                <td class="px-5 py-3.5 text-on-surface-variant dark:text-slate-300 font-medium">
                  {{ c.seniority }}
                </td>
                <td class="px-5 py-3.5">
                  <app-status-badge [status]="c.status"></app-status-badge>
                </td>
                <td class="px-5 py-3.5 font-semibold text-on-surface dark:text-white">
                  €{{ c.tjm }}/d
                </td>
                <td class="px-5 py-3.5 text-on-surface-variant dark:text-slate-300">
                  @if (c.status === 'on_bench') {
                    <span class="font-bold text-red-600 dark:text-red-400">{{ c.daysOnBench }} days</span>
                  } @else {
                    <span>Ends: {{ c.missionEndDate }}</span>
                  }
                </td>
                <td class="px-5 py-3.5 text-right">
                  <button
                    type="button"
                    class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-surface-container-low dark:bg-slate-800 text-secondary-blue dark:text-blue-400 hover:bg-secondary-blue hover:text-white transition-colors"
                  >
                    Match RFPs
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <div footer class="flex items-center justify-between w-full">
          <span>Showing {{ riskStore.highRiskConsultants().length }} high-risk profiles</span>
          <a routerLink="/consultants" class="font-semibold text-secondary-blue dark:text-blue-400 hover:underline">
            View full directory &rarr;
          </a>
        </div>
      </app-data-table-container>
    </div>
  `,
})
export class BenchRiskComponent implements OnInit {
  private readonly langStore = inject(LanguageStore);
  readonly riskStore = inject(BenchRiskStore);

  readonly t = this.langStore.translations;

  ngOnInit(): void {
    this.riskStore.loadOverview();
  }
}
