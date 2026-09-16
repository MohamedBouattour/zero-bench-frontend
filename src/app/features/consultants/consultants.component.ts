import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBadgeComponent } from '../../core/widgets/status-badge/status-badge.component';
import { DataTableContainerComponent } from '../../core/widgets/data-table/data-table-container.component';
import { ConsultantsStore } from './stores/consultants.store';
import { ConsultantStatus } from './models/consultant.model';

@Component({
  selector: 'app-consultants',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, DataTableContainerComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Domain Header -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-on-surface dark:text-white">
            Consultants Directory
          </h2>
          <p class="text-xs text-outline dark:text-slate-400 mt-1">
            Comprehensive directory of technical talent, current assignments, and bench availability.
          </p>
        </div>

        <button
          type="button"
          (click)="onAddConsultant()"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-secondary-blue text-white hover:opacity-90 transition-opacity shadow-xs"
        >
          <span class="material-symbols-outlined text-[16px]">person_add</span>
          <span>Add Consultant</span>
        </button>
      </div>

      <!-- Filter Controls Bar with NgRx SignalStore bindings -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            (click)="store.setFilterStatus('ALL')"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
            [class.bg-secondary-blue]="store.filterStatus() === 'ALL'"
            [class.text-white]="store.filterStatus() === 'ALL'"
            [class.border-secondary-blue]="store.filterStatus() === 'ALL'"
            [class.bg-surface-container-lowest]="store.filterStatus() !== 'ALL'"
            [class.dark:bg-slate-900]="store.filterStatus() !== 'ALL'"
            [class.border-outline-variant]="store.filterStatus() !== 'ALL'"
            [class.dark:border-slate-800]="store.filterStatus() !== 'ALL'"
          >
            All ({{ store.totalCount() }})
          </button>
          <button
            type="button"
            (click)="store.setFilterStatus('on_bench')"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
            [class.bg-red-600]="store.filterStatus() === 'on_bench'"
            [class.text-white]="store.filterStatus() === 'on_bench'"
            [class.border-red-600]="store.filterStatus() === 'on_bench'"
            [class.bg-surface-container-lowest]="store.filterStatus() !== 'on_bench'"
            [class.dark:bg-slate-900]="store.filterStatus() !== 'on_bench'"
            [class.border-outline-variant]="store.filterStatus() !== 'on_bench'"
            [class.dark:border-slate-800]="store.filterStatus() !== 'on_bench'"
          >
            On Bench ({{ store.benchCount() }})
          </button>
          <button
            type="button"
            (click)="store.setFilterStatus('ending_soon')"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
            [class.bg-amber-600]="store.filterStatus() === 'ending_soon'"
            [class.text-white]="store.filterStatus() === 'ending_soon'"
            [class.border-amber-600]="store.filterStatus() === 'ending_soon'"
            [class.bg-surface-container-lowest]="store.filterStatus() !== 'ending_soon'"
            [class.dark:bg-slate-900]="store.filterStatus() !== 'ending_soon'"
            [class.border-outline-variant]="store.filterStatus() !== 'ending_soon'"
            [class.dark:border-slate-800]="store.filterStatus() !== 'ending_soon'"
          >
            Ending Soon ({{ store.endingSoonCount() }})
          </button>
          <button
            type="button"
            (click)="store.setFilterStatus('on_mission')"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
            [class.bg-emerald-600]="store.filterStatus() === 'on_mission'"
            [class.text-white]="store.filterStatus() === 'on_mission'"
            [class.border-emerald-600]="store.filterStatus() === 'on_mission'"
            [class.bg-surface-container-lowest]="store.filterStatus() !== 'on_mission'"
            [class.dark:bg-slate-900]="store.filterStatus() !== 'on_mission'"
            [class.border-outline-variant]="store.filterStatus() !== 'on_mission'"
            [class.dark:border-slate-800]="store.filterStatus() !== 'on_mission'"
          >
            On Mission ({{ store.onMissionCount() }})
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative w-full sm:w-64">
          <span class="material-symbols-outlined absolute left-3 top-2 text-[18px] text-outline">search</span>
          <input
            type="text"
            placeholder="Search skills, names..."
            (input)="onSearchInput($event)"
            class="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 text-on-surface dark:text-white placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary-blue/40"
          />
        </div>
      </div>

      <!-- Consultants Table Container -->
      <app-data-table-container
        title="Consultant Roster"
        subtitle="Live synchronization with backend API via NgRx SignalStore"
      >
        @if (store.isLoading() && store.consultants().length === 0) {
          <div class="p-8 text-center text-xs text-outline animate-pulse">
            Loading consultants from API...
          </div>
        } @else {
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-outline-variant dark:border-slate-800 bg-surface-container-low/50 dark:bg-slate-800/40 text-outline dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th class="px-5 py-3">Consultant</th>
                <th class="px-5 py-3">Seniority</th>
                <th class="px-5 py-3">Status</th>
                <th class="px-5 py-3">Key Skills</th>
                <th class="px-5 py-3">TJM (€/day)</th>
                <th class="px-5 py-3">Assignment / Bench</th>
                <th class="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/60 dark:divide-slate-800/60">
              @for (c of store.filteredConsultants(); track c.id) {
                <tr class="hover:bg-surface-container-low/40 dark:hover:bg-slate-800/30 transition-colors">
                  <td class="px-5 py-3 font-medium text-on-surface dark:text-white">
                    <span class="block font-semibold">{{ c.fullName }}</span>
                    <span class="block text-[10px] text-outline dark:text-slate-400">{{ c.title }}</span>
                  </td>
                  <td class="px-5 py-3 font-medium text-on-surface-variant dark:text-slate-300">
                    {{ c.seniority }}
                  </td>
                  <td class="px-5 py-3">
                    <app-status-badge [status]="c.status"></app-status-badge>
                  </td>
                  <td class="px-5 py-3">
                    <div class="flex flex-wrap gap-1 max-w-xs">
                      @for (s of c.skills; track s) {
                        <span class="px-1.5 py-0.5 rounded text-[10px] bg-surface-container-low dark:bg-slate-800 text-outline dark:text-slate-300 font-medium">
                          {{ s }}
                        </span>
                      }
                    </div>
                  </td>
                  <td class="px-5 py-3 font-bold text-on-surface dark:text-white">
                    €{{ c.tjm }}
                  </td>
                  <td class="px-5 py-3 text-on-surface-variant dark:text-slate-300">
                    @if (c.status === 'on_bench') {
                      <span class="text-red-600 dark:text-red-400 font-bold">{{ c.daysOnBench }} days bench</span>
                    } @else if (c.status === 'ending_soon') {
                      <span>Ends {{ c.missionEndDate }}</span>
                    } @else {
                      <span>{{ c.clientName }}</span>
                    }
                  </td>
                  <td class="px-5 py-3 text-right space-x-1">
                    <button type="button" class="p-1 rounded hover:bg-surface-container-low text-outline hover:text-on-surface" title="View details">
                      <span class="material-symbols-outlined text-[16px]">visibility</span>
                    </button>
                    <button type="button" class="p-1 rounded hover:bg-surface-container-low text-outline hover:text-on-surface" title="Edit">
                      <span class="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-5 py-8 text-center text-outline dark:text-slate-400">
                    No consultants found matching the current criteria.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </app-data-table-container>
    </div>
  `,
})
export class ConsultantsComponent implements OnInit {
  readonly store = inject(ConsultantsStore);

  ngOnInit(): void {
    this.store.loadAll();
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.store.setSearchQuery(input.value);
  }

  onAddConsultant(): void {
    alert('Trigger Add Consultant dialog');
  }
}
