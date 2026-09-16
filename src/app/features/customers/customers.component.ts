import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableContainerComponent } from '../../core/widgets/data-table/data-table-container.component';
import { ClientsStore } from './stores/clients.store';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, DataTableContainerComponent],
  template: `
    <div class="space-y-6 pb-12">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-on-surface dark:text-white">
            Clients & Mission Accounts
          </h2>
          <p class="text-xs text-outline dark:text-slate-400 mt-1">
            Enterprise client accounts, active staffing contracts, and open RFP positions.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-secondary-blue text-white hover:opacity-90 transition-opacity shadow-xs"
        >
          <span class="material-symbols-outlined text-[16px]">business</span>
          <span>Add Client</span>
        </button>
      </div>

      <!-- Clients Table powered by NgRx SignalStore -->
      <app-data-table-container
        title="Key Accounts Directory"
        subtitle="Synchronized live from external mock/production API"
      >
        @if (store.isLoading() && store.clients().length === 0) {
          <div class="p-8 text-center text-xs text-outline animate-pulse">
            Loading client accounts from API...
          </div>
        } @else {
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-outline-variant dark:border-slate-800 bg-surface-container-low/50 dark:bg-slate-800/40 text-outline dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th class="px-5 py-3">Client Name</th>
                <th class="px-5 py-3">Industry</th>
                <th class="px-5 py-3">Active Staff</th>
                <th class="px-5 py-3">Open RFPs</th>
                <th class="px-5 py-3">Monthly Billing</th>
                <th class="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/60 dark:divide-slate-800/60">
              @for (client of store.clients(); track client.id) {
                <tr class="hover:bg-surface-container-low/40 dark:hover:bg-slate-800/30 transition-colors">
                  <td class="px-5 py-3.5 font-bold text-on-surface dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px] text-secondary-blue">domain</span>
                    <span>{{ client.name }}</span>
                  </td>
                  <td class="px-5 py-3.5 text-on-surface-variant dark:text-slate-300">{{ client.industry }}</td>
                  <td class="px-5 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                    {{ client.activeConsultants }} consultants
                  </td>
                  <td class="px-5 py-3.5 font-semibold text-indigo-600 dark:text-indigo-400">
                    {{ client.openRFPs }} open
                  </td>
                  <td class="px-5 py-3.5 font-bold text-on-surface dark:text-white">
                    €{{ client.monthlyRevenue.toLocaleString() }}
                  </td>
                  <td class="px-5 py-3.5 text-right">
                    <button type="button" class="px-2.5 py-1 rounded bg-surface-container-low dark:bg-slate-800 text-xs font-semibold text-secondary-blue hover:bg-secondary-blue hover:text-white transition-colors">
                      Manage Missions
                    </button>
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
export class CustomersComponent implements OnInit {
  readonly store = inject(ClientsStore);

  ngOnInit(): void {
    this.store.loadClients();
  }
}
