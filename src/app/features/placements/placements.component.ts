import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlacementsStore } from './stores/placements.store';

@Component({
  selector: 'app-placements',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 pb-12">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-on-surface dark:text-white">
            Placement Pipeline
          </h2>
          <p class="text-xs text-outline dark:text-slate-400 mt-1">
            Track consultant opportunities through matching, pitch dispatch, client interviews, and contract closing.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-secondary-blue text-white hover:opacity-90 transition-opacity shadow-xs"
        >
          <span class="material-symbols-outlined text-[16px]">add</span>
          <span>New Opportunity</span>
        </button>
      </div>

      <!-- Kanban Pipeline Columns fed by NgRx SignalStore -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Stage 1: Matched -->
        <div class="p-4 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 flex flex-col gap-3">
          <div class="flex items-center justify-between pb-2 border-b border-outline-variant/60 dark:border-slate-800/60">
            <span class="text-xs font-bold uppercase tracking-wider text-outline dark:text-slate-400">
              1. Matched ({{ store.matchedList().length }})
            </span>
            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
          </div>
          @for (item of store.matchedList(); track item.id) {
            <div class="p-3 rounded-lg border border-outline-variant/60 dark:border-slate-800 bg-surface-bright dark:bg-slate-800/50 text-xs space-y-1">
              <span class="font-bold block text-on-surface dark:text-white">{{ item.candidateName }} &rarr; {{ item.clientName }}</span>
              <span class="text-[11px] text-outline dark:text-slate-400 block">{{ item.candidateRole }}</span>
              <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {{ item.statusLabel }}
              </span>
            </div>
          } @empty {
            <span class="text-xs text-outline italic p-2">No matched candidates</span>
          }
        </div>

        <!-- Stage 2: Pitch Sent -->
        <div class="p-4 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 flex flex-col gap-3">
          <div class="flex items-center justify-between pb-2 border-b border-outline-variant/60 dark:border-slate-800/60">
            <span class="text-xs font-bold uppercase tracking-wider text-outline dark:text-slate-400">
              2. Pitch Sent ({{ store.pitchSentList().length }})
            </span>
            <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
          </div>
          @for (item of store.pitchSentList(); track item.id) {
            <div class="p-3 rounded-lg border border-outline-variant/60 dark:border-slate-800 bg-surface-bright dark:bg-slate-800/50 text-xs space-y-1">
              <span class="font-bold block text-on-surface dark:text-white">{{ item.candidateName }} &rarr; {{ item.clientName }}</span>
              <span class="text-[11px] text-outline dark:text-slate-400 block">{{ item.candidateRole }}</span>
              <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                {{ item.statusLabel }}
              </span>
            </div>
          } @empty {
            <span class="text-xs text-outline italic p-2">No pitches pending</span>
          }
        </div>

        <!-- Stage 3: Interviewing -->
        <div class="p-4 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 flex flex-col gap-3">
          <div class="flex items-center justify-between pb-2 border-b border-outline-variant/60 dark:border-slate-800/60">
            <span class="text-xs font-bold uppercase tracking-wider text-outline dark:text-slate-400">
              3. Interviewing ({{ store.interviewingList().length }})
            </span>
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          @for (item of store.interviewingList(); track item.id) {
            <div class="p-3 rounded-lg border border-outline-variant/60 dark:border-slate-800 bg-surface-bright dark:bg-slate-800/50 text-xs space-y-1">
              <span class="font-bold block text-on-surface dark:text-white">{{ item.candidateName }} &rarr; {{ item.clientName }}</span>
              <span class="text-[11px] text-outline dark:text-slate-400 block">{{ item.candidateRole }}</span>
              <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {{ item.statusLabel }}
              </span>
            </div>
          } @empty {
            <span class="text-xs text-outline italic p-2">No active interviews</span>
          }
        </div>

        <!-- Stage 4: Signed -->
        <div class="p-4 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 flex flex-col gap-3">
          <div class="flex items-center justify-between pb-2 border-b border-outline-variant/60 dark:border-slate-800/60">
            <span class="text-xs font-bold uppercase tracking-wider text-outline dark:text-slate-400">
              4. Signed / Won ({{ store.signedList().length }})
            </span>
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          @for (item of store.signedList(); track item.id) {
            <div class="p-3 rounded-lg border border-outline-variant/60 dark:border-slate-800 bg-surface-bright dark:bg-slate-800/50 text-xs space-y-1">
              <span class="font-bold block text-on-surface dark:text-white">{{ item.candidateName }} &rarr; {{ item.clientName }}</span>
              <span class="text-[11px] text-outline dark:text-slate-400 block">{{ item.candidateRole }}</span>
              <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {{ item.statusLabel }}
              </span>
            </div>
          } @empty {
            <span class="text-xs text-outline italic p-2">No won placements</span>
          }
        </div>
      </div>
    </div>
  `,
})
export class PlacementsComponent implements OnInit {
  readonly store = inject(PlacementsStore);

  ngOnInit(): void {
    this.store.loadOpportunities();
  }
}
