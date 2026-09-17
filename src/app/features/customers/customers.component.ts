import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';
import { DataTableContainerComponent } from '../../core/widgets/data-table/data-table-container.component';
import { ErrorStateComponent } from '../../core/widgets/error-state/error-state.component';
import { SkeletonRowsComponent } from '../../core/widgets/skeleton/skeleton-rows.component';
import { StatCardComponent } from '../../core/widgets/stat-card/stat-card.component';
import { ClientDetailModalComponent } from './components/client-detail-modal.component';
import { ClientFormModalComponent } from './components/client-form-modal.component';
import { ClientStatusChipComponent } from './components/client-status-chip.component';
import { ClientAccount, ClientPayload, ClientStatusFilter, RfpPayload } from './models/customer.model';
import { ClientsStore } from './stores/clients.store';

const STATUS_FILTERS: readonly { value: ClientStatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'prospect', label: 'Prospects' },
  { value: 'paused', label: 'Paused' },
];

@Component({
  selector: 'app-customers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    DataTableContainerComponent,
    ErrorStateComponent,
    SkeletonRowsComponent,
    StatCardComponent,
    ClientDetailModalComponent,
    ClientFormModalComponent,
    ClientStatusChipComponent,
  ],
  template: `
    <div class="space-y-6 pb-12">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-on-surface dark:text-white">Clients & Mission Accounts</h2>
          <p class="text-xs text-outline dark:text-slate-400 mt-1">
            Enterprise client accounts, active staffing contracts, and open RFP positions.
          </p>
        </div>

        <button type="button" (click)="navigate({ mode: 'new', id: null })" class="btn-primary">
          <span class="material-symbols-outlined text-[16px]">add_business</span>
          <span>Add Client</span>
        </button>
      </div>

      @if (store.error(); as error) {
        <app-error-state title="Clients could not be loaded" [message]="error" (retry)="store.loadClients()" />
      }

      @let totals = store.totals();
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stat-card label="Active accounts" [value]="totals.activeAccounts" [unit]="'/ ' + store.clients().length" icon="domain" tone="primary" />
        <app-stat-card label="Consultants staffed" [value]="totals.staffedConsultants" icon="groups" tone="success" subtext="on mission or ending soon" />
        <app-stat-card
          label="Monthly billing"
          [value]="(totals.monthlyRevenue | currency: 'EUR' : 'symbol' : '1.0-0') ?? ''"
          icon="euro"
          tone="indigo"
          subtext="TJM × 20 working days"
        />
        <app-stat-card label="Open RFPs" [value]="totals.openRfps" icon="assignment" tone="warning" subtext="staffing opportunities" />
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          @for (filter of statusFilters; track filter.value) {
            @let active = store.filterStatus() === filter.value;
            <button
              type="button"
              (click)="store.setFilterStatus(filter.value)"
              class="chip-toggle"
              [class]="active ? 'bg-secondary-blue border-secondary-blue text-white dark:bg-blue-600 dark:border-blue-600' : 'bg-surface-container-lowest dark:bg-slate-900 border-outline-variant dark:border-slate-800 text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-low dark:hover:bg-slate-800'"
              [attr.aria-pressed]="active"
            >
              {{ filter.label }}
            </button>
          }
        </div>
        <div class="relative w-full sm:w-64">
          <span class="material-symbols-outlined absolute left-3 top-2 text-[18px] text-outline" aria-hidden="true">search</span>
          <input
            type="search"
            placeholder="Search accounts, industries…"
            aria-label="Search clients"
            [value]="store.searchQuery()"
            (input)="store.setSearchQuery($any($event.target).value)"
            class="field-input pl-9"
          />
        </div>
      </div>

      <app-data-table-container title="Key Accounts Directory" subtitle="Staffing and billing are computed live from consultant assignments">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="border-b border-outline-variant dark:border-slate-800 bg-surface-container-low/50 dark:bg-slate-800/40 text-outline dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th class="px-5 py-3">Client Name</th>
              <th class="px-5 py-3">Industry</th>
              <th class="px-5 py-3">Status</th>
              <th class="px-5 py-3">Active Staff</th>
              <th class="px-5 py-3">Open RFPs</th>
              <th class="px-5 py-3">Monthly Billing</th>
              <th class="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          @if (store.isLoading() && store.clients().length === 0) {
            <tbody appSkeletonRows [rows]="5" [columns]="7"></tbody>
          } @else {
            <tbody class="divide-y divide-outline-variant/60 dark:divide-slate-800/60">
              @for (client of store.filteredClients(); track client.id) {
                <tr class="hover:bg-surface-container-low/40 dark:hover:bg-slate-800/30 transition-colors cursor-pointer" (click)="navigate({ id: client.id, mode: null })">
                  <td class="px-5 py-3.5">
                    <div class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-[18px] text-secondary-blue dark:text-blue-400" aria-hidden="true">domain</span>
                      <div>
                        <span class="block font-bold text-on-surface dark:text-white">{{ client.name }}</span>
                        @if (client.city) {
                          <span class="block text-[10px] text-outline dark:text-slate-400">{{ client.city }}</span>
                        }
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-3.5 text-on-surface-variant dark:text-slate-300">{{ client.industry }}</td>
                  <td class="px-5 py-3.5"><app-client-status-chip [status]="client.status" /></td>
                  <td class="px-5 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {{ client.activeConsultants }} consultant{{ client.activeConsultants === 1 ? '' : 's' }}
                  </td>
                  <td class="px-5 py-3.5 font-semibold text-indigo-600 dark:text-indigo-400">{{ client.openRFPs }} open</td>
                  <td class="px-5 py-3.5 font-bold text-on-surface dark:text-white">
                    {{ client.monthlyRevenue | currency: 'EUR' : 'symbol' : '1.0-0' }}
                  </td>
                  <td class="px-5 py-3.5 text-right whitespace-nowrap" (click)="$event.stopPropagation()">
                    <button
                      type="button"
                      (click)="navigate({ id: client.id, mode: null })"
                      class="px-2.5 py-1 rounded bg-surface-container-low dark:bg-slate-800 text-xs font-semibold text-secondary-blue dark:text-blue-400 hover:bg-secondary-blue hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors"
                    >
                      Manage Missions
                    </button>
                    <button
                      type="button"
                      (click)="navigate({ id: client.id, mode: 'edit' })"
                      class="ml-1 p-1 rounded text-outline hover:text-on-surface dark:hover:text-white hover:bg-surface-container-low dark:hover:bg-slate-800 align-middle"
                      [attr.aria-label]="'Edit ' + client.name"
                    >
                      <span class="material-symbols-outlined text-[16px] block">edit</span>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-5 py-10 text-center text-outline dark:text-slate-400">No client account matches the current filters.</td>
                </tr>
              }
            </tbody>
          }
        </table>
      </app-data-table-container>
    </div>

    @if (mode() === 'new') {
      <app-client-form-modal [isSaving]="store.isSaving()" (save)="create($event)" (closed)="closeModals()" />
    } @else if (mode() === 'edit' && editedClient()) {
      <app-client-form-modal [client]="editedClient()" [isSaving]="store.isSaving()" (save)="update($event)" (closed)="closeModals()" />
    } @else if (id()) {
      <app-client-detail-modal
        [client]="detail()"
        [isSaving]="store.isSaving()"
        (edit)="navigate({ id: $event.id, mode: 'edit' })"
        (addRfp)="addRfp($event)"
        (closed)="closeModals()"
      />
    }
  `,
})
export class CustomersComponent implements OnInit {
  /** Query params: `?id=` opens the account, `?mode=new|edit` the account form. */
  readonly id = input<string>();
  readonly mode = input<'new' | 'edit'>();

  protected readonly store = inject(ClientsStore);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly detailModal = viewChild(ClientDetailModalComponent);

  protected readonly statusFilters = STATUS_FILTERS;

  /** Only expose the store's detail when it belongs to the account in the URL. */
  protected readonly detail = computed(() => {
    const selected = this.store.selectedClient();
    return selected && selected.id === this.id() ? selected : null;
  });

  protected readonly editedClient = computed<ClientAccount | null>(() => {
    const id = this.id();
    return id ? (this.store.entityMap()[id] ?? null) : null;
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id && this.mode() !== 'edit') untracked(() => void this.store.loadDetail(id));
    });
  }

  ngOnInit(): void {
    void this.store.loadClients();
  }

  protected navigate(queryParams: { id: string | null; mode: 'new' | 'edit' | null }): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
  }

  protected closeModals(): void {
    this.navigate({ id: null, mode: null });
  }

  protected async create(payload: ClientPayload): Promise<void> {
    try {
      const created = await this.store.create(payload);
      this.toast.success(`${created.name} has been added.`, { title: 'Client created' });
      this.navigate({ id: created.id, mode: null });
    } catch (err: unknown) {
      this.toast.error((err as Error).message, { title: 'Save failed' });
    }
  }

  protected async update(payload: ClientPayload): Promise<void> {
    const id = this.id();
    if (!id) return;
    try {
      const updated = await this.store.update(id, payload);
      this.toast.success(`${updated.name} has been updated.`, { title: 'Client saved' });
      this.navigate({ id, mode: null });
    } catch (err: unknown) {
      this.toast.error((err as Error).message, { title: 'Save failed' });
    }
  }

  protected async addRfp(payload: RfpPayload): Promise<void> {
    const id = this.id();
    if (!id) return;
    try {
      await this.store.addRfp(id, payload);
      this.detailModal()?.resetRfpForm();
      this.toast.success(`“${payload.title}” is now open for staffing.`, { title: 'RFP added' });
    } catch (err: unknown) {
      this.toast.error((err as Error).message, { title: 'RFP not saved' });
    }
  }
}
