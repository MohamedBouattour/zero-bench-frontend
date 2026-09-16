import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skills-gap',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 pb-12">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-on-surface dark:text-white">
            Skills Gap & Demand Heatmap
          </h2>
          <p class="text-xs text-outline dark:text-slate-400 mt-1">
            Analyze consultant competencies against incoming RFP market demand to prevent bench risks.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-5 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 shadow-sm">
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <span class="material-symbols-outlined text-[18px]">trending_up</span>
            <span>High Demand, Low Bench</span>
          </div>
          <p class="text-sm font-semibold mt-2 text-on-surface dark:text-white">Angular 21 / Signals, Rust, Cloud Security</p>
          <p class="text-xs text-outline dark:text-slate-400 mt-1">Placement rate > 92% within 5 days.</p>
        </div>

        <div class="p-5 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 shadow-sm">
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <span class="material-symbols-outlined text-[18px]">warning</span>
            <span>Transition / Upskilling Needed</span>
          </div>
          <p class="text-sm font-semibold mt-2 text-on-surface dark:text-white">Legacy Java Spring, PHP Symfony</p>
          <p class="text-xs text-outline dark:text-slate-400 mt-1">Recommending micro-certifications.</p>
        </div>

        <div class="p-5 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 shadow-sm">
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <span class="material-symbols-outlined text-[18px]">hub</span>
            <span>Market Alignment Index</span>
          </div>
          <p class="text-sm font-semibold mt-2 text-on-surface dark:text-white">78.4% Global Match</p>
          <p class="text-xs text-outline dark:text-slate-400 mt-1">Calculated over 42 active client mandates.</p>
        </div>
      </div>

      <div class="p-8 rounded-xl border border-dashed border-outline-variant dark:border-slate-800 text-center bg-surface-container-lowest/40 dark:bg-slate-900/40">
        <span class="material-symbols-outlined text-4xl text-secondary-blue/70">query_stats</span>
        <h3 class="text-base font-bold text-on-surface dark:text-white mt-2">Skills Gap Matrix Canvas</h3>
        <p class="text-xs text-outline dark:text-slate-400 max-w-md mx-auto mt-1">
          Interactive heatmap visualization domain module scaffolded according to DDD boundaries. Ready for consultant skill matrix ingestion.
        </p>
      </div>
    </div>
  `,
})
export class SkillsGapComponent {}
