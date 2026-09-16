import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBadgeComponent } from '../../core/widgets/status-badge/status-badge.component';
import { StatCardComponent } from '../../core/widgets/stat-card/stat-card.component';
import { AiSparkleCardComponent } from '../../core/widgets/ai-sparkle-card/ai-sparkle-card.component';
import { DataTableContainerComponent } from '../../core/widgets/data-table/data-table-container.component';

@Component({
  selector: 'app-design-system',
  standalone: true,
  imports: [
    CommonModule,
    StatusBadgeComponent,
    StatCardComponent,
    AiSparkleCardComponent,
    DataTableContainerComponent,
  ],
  template: `
    <div class="space-y-8 pb-16">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-on-surface dark:text-white">
          Stitch Design Tokens & UI Component Showcase
        </h2>
        <p class="text-xs text-outline dark:text-slate-400 mt-1">
          Reference system conforming 100% to Stitch Project 15147121731840790718 token specifications.
        </p>
      </div>

      <!-- Colors Section -->
      <section class="space-y-3">
        <h3 class="text-sm font-bold uppercase tracking-wider text-outline dark:text-slate-400">
          1. Color Palette & Tonal Layers
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          <div class="p-3 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 space-y-1">
            <div class="h-10 rounded-lg bg-surface-bright border border-outline-variant"></div>
            <span class="text-xs font-bold block text-on-surface dark:text-white">Surface Base</span>
            <span class="text-[10px] text-outline block">#F8F9FF / #0B1120</span>
          </div>

          <div class="p-3 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 space-y-1">
            <div class="h-10 rounded-lg bg-[#0f172a]"></div>
            <span class="text-xs font-bold block text-on-surface dark:text-white">Primary Slate</span>
            <span class="text-[10px] text-outline block">#0F172A</span>
          </div>

          <div class="p-3 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 space-y-1">
            <div class="h-10 rounded-lg bg-secondary-blue"></div>
            <span class="text-xs font-bold block text-on-surface dark:text-white">Electric Blue</span>
            <span class="text-[10px] text-outline block">#0058BE</span>
          </div>

          <div class="p-3 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 space-y-1">
            <div class="h-10 rounded-lg bg-indigo-600"></div>
            <span class="text-xs font-bold block text-on-surface dark:text-white">AI Intelligence</span>
            <span class="text-[10px] text-outline block">#6366F1</span>
          </div>

          <div class="p-3 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 space-y-1">
            <div class="h-10 rounded-lg bg-emerald-500"></div>
            <span class="text-xs font-bold block text-on-surface dark:text-white">On Mission</span>
            <span class="text-[10px] text-outline block">#10B981</span>
          </div>

          <div class="p-3 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 space-y-1">
            <div class="h-10 rounded-lg bg-red-500"></div>
            <span class="text-xs font-bold block text-on-surface dark:text-white">On Bench</span>
            <span class="text-[10px] text-outline block">#EF4444</span>
          </div>
        </div>
      </section>

      <!-- Status Badges Section -->
      <section class="space-y-3">
        <h3 class="text-sm font-bold uppercase tracking-wider text-outline dark:text-slate-400">
          2. Semantic Status Badges
        </h3>
        <div class="flex flex-wrap gap-3 p-4 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900">
          <app-status-badge status="on_bench"></app-status-badge>
          <app-status-badge status="on_mission"></app-status-badge>
          <app-status-badge status="ending_soon"></app-status-badge>
          <app-status-badge status="prospect"></app-status-badge>
        </div>
      </section>

      <!-- KPI Stat Cards Section -->
      <section class="space-y-3">
        <h3 class="text-sm font-bold uppercase tracking-wider text-outline dark:text-slate-400">
          3. KPI Stat Cards
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <app-stat-card
            label="Exposure Metric"
            value="€32,400"
            unit="/ mo"
            icon="payments"
            tone="danger"
            trend="+5.2%"
            trendDirection="up-bad"
            [progress]="70"
          ></app-stat-card>
          <app-stat-card
            label="Team Capacity"
            value="94.2%"
            icon="group"
            tone="success"
            trend="+1.8%"
            trendDirection="up-good"
            [progress]="94"
          ></app-stat-card>
          <app-stat-card
            label="Mandates Closing"
            value="7"
            unit="deals"
            icon="done_all"
            tone="primary"
            [progress]="50"
          ></app-stat-card>
          <app-stat-card
            label="AI Matches"
            value="19"
            unit="proposals"
            icon="auto_awesome"
            tone="indigo"
            trend="+8"
            trendDirection="up-good"
            [progress]="85"
          ></app-stat-card>
        </div>
      </section>

      <!-- Buttons Section -->
      <section class="space-y-3">
        <h3 class="text-sm font-bold uppercase tracking-wider text-outline dark:text-slate-400">
          4. Button Variants & Micro-interactions
        </h3>
        <div class="flex flex-wrap gap-3 p-4 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 items-center">
          <button class="px-4 py-2 bg-secondary-blue text-white rounded-xl text-xs font-semibold shadow-xs hover:opacity-90 transition-opacity">
            Primary Action
          </button>
          <button class="px-4 py-2 border border-outline-variant dark:border-slate-700 rounded-xl text-xs font-semibold hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors">
            Outlined Secondary
          </button>
          <button class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:bg-indigo-700 transition-colors">
            <span class="material-symbols-outlined text-[16px]">auto_awesome</span>
            <span>AI Action</span>
          </button>
          <button class="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors">
            Urgent Action
          </button>
        </div>
      </section>

      <!-- Glassmorphic AI Showcase -->
      <section class="space-y-3">
        <h3 class="text-sm font-bold uppercase tracking-wider text-outline dark:text-slate-400">
          5. Glassmorphism Proactive Layer
        </h3>
        <app-ai-sparkle-card
          title="Component Showcase Glassmorphic Card"
          description="Features 12px backdrop blur, subtle indigo inner glow, and rounded elevation per BenchZero specifications."
          [matchScore]="98"
          actionLabel="Execute Action"
        ></app-ai-sparkle-card>
      </section>

      <!-- Data Table Container Showcase -->
      <section class="space-y-3">
        <h3 class="text-sm font-bold uppercase tracking-wider text-outline dark:text-slate-400">
          6. High-Density Data Table
        </h3>
        <app-data-table-container
          title="Sample Data Density View"
          subtitle="Zebra-striped, supporting Compact vs Comfortable row height"
        >
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-outline-variant dark:border-slate-800 bg-surface-container-low/50 dark:bg-slate-800/40 text-outline dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th class="px-5 py-3">Token Name</th>
                <th class="px-5 py-3">Value</th>
                <th class="px-5 py-3">Category</th>
                <th class="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/60 dark:divide-slate-800/60">
              <tr class="hover:bg-surface-container-low/40 dark:hover:bg-slate-800/30">
                <td class="px-5 py-3.5 font-medium text-on-surface dark:text-white">--color-secondary-blue</td>
                <td class="px-5 py-3.5 font-mono text-outline">#0058BE</td>
                <td class="px-5 py-3.5">Action Brand</td>
                <td class="px-5 py-3.5 text-right"><app-status-badge status="on_mission" customLabel="Active"></app-status-badge></td>
              </tr>
              <tr class="hover:bg-surface-container-low/40 dark:hover:bg-slate-800/30">
                <td class="px-5 py-3.5 font-medium text-on-surface dark:text-white">--color-tertiary-indigo</td>
                <td class="px-5 py-3.5 font-mono text-outline">#6366F1</td>
                <td class="px-5 py-3.5">AI Intelligence</td>
                <td class="px-5 py-3.5 text-right"><app-status-badge status="prospect" customLabel="Ready"></app-status-badge></td>
              </tr>
            </tbody>
          </table>
        </app-data-table-container>
      </section>
    </div>
  `,
})
export class DesignSystemComponent {}
