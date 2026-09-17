import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FileExportService } from '../../core/services/file-export.service';
import { ToastService } from '../../core/services/toast.service';
import { AvatarComponent } from '../../core/widgets/avatar/avatar.component';
import { DataTableContainerComponent } from '../../core/widgets/data-table/data-table-container.component';
import { ErrorStateComponent } from '../../core/widgets/error-state/error-state.component';
import { SkeletonRowsComponent } from '../../core/widgets/skeleton/skeleton-rows.component';
import { StatusBadgeComponent } from '../../core/widgets/status-badge/status-badge.component';
import { ClientsStore } from '../customers/stores/clients.store';
import { ConsultantDetailModalComponent } from './components/consultant-detail-modal.component';
import { ConsultantFormModalComponent } from './components/consultant-form-modal.component';
import {
  Consultant,
  ConsultantPayload,
  ConsultantSortField,
  ConsultantStatusFilter,
} from './models/consultant.model';
import { ConsultantsStore } from './stores/consultants.store';

type FilterChip = { value: ConsultantStatusFilter; label: string; active: string };

const FILTER_CHIPS: readonly FilterChip[] = [
  { value: 'ALL', label: 'All', active: 'bg-secondary-blue border-secondary-blue text-white' },
  { value: 'on_bench', label: 'On Bench', active: 'bg-red-600 border-red-600 text-white' },
  { value: 'ending_soon', label: 'Ending Soon', active: 'bg-amber-600 border-amber-600 text-white' },
  { value: 'on_mission', label: 'On Mission', active: 'bg-emerald-600 border-emerald-600 text-white' },
  { value: 'prospect', label: 'Prospect', active: 'bg-blue-600 border-blue-600 text-white' },
];

const CHIP_IDLE =
  'bg-surface-container-lowest dark:bg-slate-900 border-outline-variant dark:border-slate-800 text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-low dark:hover:bg-slate-800';

const COLUMNS: readonly { label: string; sortField?: ConsultantSortField; align?: 'right' }[] = [
  { label: 'Consultant', sortField: 'fullName' },
  { label: 'Seniority', sortField: 'seniority' },
  { label: 'Status' },
  { label: 'Key Skills' },
  { label: 'TJM', sortField: 'tjm' },
  { label: 'Assignment / Bench', sortField: 'availability' },
  { label: 'Actions', align: 'right' },
];

@Component({
  selector: 'app-consultants',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    DatePipe,
    AvatarComponent,
    DataTableContainerComponent,
    ErrorStateComponent,
    SkeletonRowsComponent,
    StatusBadgeComponent,
    ConsultantDetailModalComponent,
    ConsultantFormModalComponent,
  ],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Domain Header -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-on-surface dark:text-white">Consultants Directory</h2>
          <p class="text-xs text-outline dark:text-slate-400 mt-1">
            Comprehensive directory of technical talent, current assignments, and bench availability.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button type="button" (click)="exportCsv()" [disabled]="store.filteredConsultants().length === 0" class="btn-secondary">
            <span class="material-symbols-outlined text-[16px]">download</span>
            <span>Export CSV</span>
          </button>
          <button type="button" (click)="openCreate()" class="btn-primary">
            <span class="material-symbols-outlined text-[16px]">person_add</span>
            <span>Add Consultant</span>
          </button>
        </div>
      </div>

      @if (store.error(); as error) {
        <app-error-state title="Consultants could not be loaded" [message]="error" (retry)="store.loadAll()" />
      }

      <!-- Filter Controls Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by status">
          @for (chip of visibleChips(); track chip.value) {
            @let active = store.filterStatus() === chip.value;
            <button
              type="button"
              (click)="store.setFilterStatus(chip.value)"
              class="chip-toggle"
              [class]="active ? chip.active : chipIdle"
              [attr.aria-pressed]="active"
            >
              {{ chip.label }} ({{ counts()[chip.value] }})
            </button>
          }
        </div>

        <div class="relative w-full sm:w-64">
          <span class="material-symbols-outlined absolute left-3 top-2 text-[18px] text-outline" aria-hidden="true">search</span>
          <input
            type="search"
            placeholder="Search skills, names..."
            aria-label="Search consultants"
            [value]="store.searchQuery()"
            (input)="store.setSearchQuery($any($event.target).value)"
            class="field-input pl-9"
          />
        </div>
      </div>

      <!-- Consultants Table -->
      <app-data-table-container title="Consultant Roster" subtitle="Click a consultant to open the full profile">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr
              class="border-b border-outline-variant dark:border-slate-800 bg-surface-container-low/50 dark:bg-slate-800/40 text-outline dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]"
            >
              @for (column of columns; track column.label) {
                <th
                  class="px-5 py-3 whitespace-nowrap"
                  [class.text-right]="column.align === 'right'"
                  [attr.aria-sort]="ariaSort(column.sortField)"
                >
                  @if (column.sortField; as field) {
                    <button
                      type="button"
                      (click)="store.toggleSort(field)"
                      class="inline-flex items-center gap-1 uppercase tracking-wider hover:text-on-surface dark:hover:text-white"
                    >
                      {{ column.label }}
                      <span class="material-symbols-outlined text-[14px]" [class.opacity-30]="store.sort().field !== field">
                        {{ store.sort().field === field && store.sort().direction === 'desc' ? 'arrow_downward' : 'arrow_upward' }}
                      </span>
                    </button>
                  } @else {
                    {{ column.label }}
                  }
                </th>
              }
            </tr>
          </thead>
          @if (store.isLoading() && store.consultants().length === 0) {
            <tbody appSkeletonRows [rows]="6" [columns]="7"></tbody>
          } @else {
            <tbody class="divide-y divide-outline-variant/60 dark:divide-slate-800/60">
              @for (c of store.filteredConsultants(); track c.id) {
                <tr
                  class="hover:bg-surface-container-low/40 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                  (click)="openDetail(c.id)"
                >
                  <td class="px-5 py-3">
                    <div class="flex items-center gap-2.5">
                      <app-avatar [name]="c.fullName" size="sm" />
                      <div class="min-w-0">
                        <button
                          type="button"
                          (click)="$event.stopPropagation(); openDetail(c.id)"
                          class="block font-semibold text-on-surface dark:text-white hover:text-secondary-blue dark:hover:text-blue-400 text-left"
                        >
                          {{ c.fullName }}
                        </button>
                        <span class="block text-[10px] text-outline dark:text-slate-400 truncate">{{ c.title }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-3 font-medium text-on-surface-variant dark:text-slate-300">{{ c.seniority }}</td>
                  <td class="px-5 py-3"><app-status-badge [status]="c.status" /></td>
                  <td class="px-5 py-3">
                    <div class="flex flex-wrap gap-1 max-w-xs">
                      @for (s of c.skills.slice(0, 4); track s) {
                        <span class="px-1.5 py-0.5 rounded text-[10px] bg-surface-container-low dark:bg-slate-800 text-outline dark:text-slate-300 font-medium">
                          {{ s }}
                        </span>
                      }
                      @if (c.skills.length > 4) {
                        <span class="px-1.5 py-0.5 text-[10px] text-outline">+{{ c.skills.length - 4 }}</span>
                      }
                    </div>
                  </td>
                  <td class="px-5 py-3 font-bold text-on-surface dark:text-white whitespace-nowrap">
                    {{ c.tjm | currency: 'EUR' : 'symbol' : '1.0-0' }}
                  </td>
                  <td class="px-5 py-3 text-on-surface-variant dark:text-slate-300 whitespace-nowrap">
                    @switch (c.status) {
                      @case ('on_bench') {
                        <span class="text-red-600 dark:text-red-400 font-bold">{{ c.daysOnBench ?? 0 }} days bench</span>
                      }
                      @case ('ending_soon') {
                        <span class="text-amber-700 dark:text-amber-400 font-semibold">Ends {{ c.missionEndDate | date: 'd MMM y' }}</span>
                        <span class="block text-[10px] text-outline">{{ c.clientName }}</span>
                      }
                      @case ('on_mission') {
                        <span>{{ c.clientName }}</span>
                        @if (c.missionEndDate) {
                          <span class="block text-[10px] text-outline">until {{ c.missionEndDate | date: 'MMM y' }}</span>
                        }
                      }
                      @default {
                        <span class="text-outline">Pre-hire</span>
                      }
                    }
                  </td>
                  <td class="px-5 py-3 text-right whitespace-nowrap" (click)="$event.stopPropagation()">
                    <button
                      type="button"
                      (click)="openDetail(c.id)"
                      class="p-1 rounded hover:bg-surface-container-low dark:hover:bg-slate-800 text-outline hover:text-on-surface dark:hover:text-white"
                      [attr.aria-label]="'View ' + c.fullName"
                      title="View profile"
                    >
                      <span class="material-symbols-outlined text-[16px] block">visibility</span>
                    </button>
                    <button
                      type="button"
                      (click)="openEdit(c.id)"
                      class="p-1 rounded hover:bg-surface-container-low dark:hover:bg-slate-800 text-outline hover:text-on-surface dark:hover:text-white"
                      [attr.aria-label]="'Edit ' + c.fullName"
                      title="Edit"
                    >
                      <span class="material-symbols-outlined text-[16px] block">edit</span>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-5 py-10 text-center text-outline dark:text-slate-400">
                    <span class="material-symbols-outlined text-3xl block mb-1">person_search</span>
                    No consultants found matching the current criteria.
                  </td>
                </tr>
              }
            </tbody>
          }
        </table>

        <div footer class="flex items-center justify-between w-full">
          <span>Showing {{ store.filteredConsultants().length }} of {{ store.totalCount() }} consultants</span>
        </div>
      </app-data-table-container>
    </div>

    @if (selectedConsultant(); as consultant) {
      @if (mode() === 'edit') {
        <app-consultant-form-modal
          [consultant]="consultant"
          [clients]="clientsStore.clients()"
          [isSaving]="store.isSaving()"
          (save)="save($event, consultant)"
          (closed)="closeModals()"
        />
      } @else {
        <app-consultant-detail-modal
          [consultant]="consultant"
          [isSaving]="store.isSaving()"
          (edit)="openEdit($event.id)"
          (remove)="remove($event)"
          (closed)="closeModals()"
        />
      }
    } @else if (mode() === 'new') {
      <app-consultant-form-modal
        [clients]="clientsStore.clients()"
        [isSaving]="store.isSaving()"
        (save)="save($event, null)"
        (closed)="closeModals()"
      />
    }
  `,
})
export class ConsultantsComponent implements OnInit {
  /** Query params (bound by `withComponentInputBinding`): `?id=` opens a profile, `?mode=new|edit` the form. */
  readonly id = input<string>();
  readonly mode = input<'new' | 'edit'>();
  readonly q = input<string>();

  protected readonly store = inject(ConsultantsStore);
  protected readonly clientsStore = inject(ClientsStore);
  private readonly toast = inject(ToastService);
  private readonly fileExport = inject(FileExportService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly columns = COLUMNS;
  protected readonly chipIdle = CHIP_IDLE;

  protected readonly counts = computed<Record<ConsultantStatusFilter, number>>(() => ({
    ALL: this.store.totalCount(),
    on_bench: this.store.benchCount(),
    ending_soon: this.store.endingSoonCount(),
    on_mission: this.store.onMissionCount(),
    prospect: this.store.prospectCount(),
  }));

  protected readonly visibleChips = computed(() =>
    FILTER_CHIPS.filter((chip) => chip.value !== 'prospect' || this.store.prospectCount() > 0),
  );

  protected readonly selectedConsultant = computed<Consultant | null>(() => {
    const id = this.id();
    return id ? (this.store.entityMap()[id] ?? null) : null;
  });

  constructor() {
    // Header search deep-links here with ?q=
    effect(() => {
      const q = this.q();
      if (q !== undefined) untracked(() => this.store.setSearchQuery(q));
    });
  }

  ngOnInit(): void {
    void this.store.loadAll();
    void this.clientsStore.loadClients();
  }

  protected ariaSort(field?: ConsultantSortField): 'ascending' | 'descending' | null {
    if (!field || this.store.sort().field !== field) return null;
    return this.store.sort().direction === 'asc' ? 'ascending' : 'descending';
  }

  protected openDetail(id: string): void {
    this.setModalParams({ id, mode: null });
  }

  protected openEdit(id: string): void {
    this.setModalParams({ id, mode: 'edit' });
  }

  protected openCreate(): void {
    this.setModalParams({ id: null, mode: 'new' });
  }

  protected closeModals(): void {
    this.setModalParams({ id: null, mode: null });
  }

  protected async save(payload: ConsultantPayload, existing: Consultant | null): Promise<void> {
    try {
      if (existing) {
        const updated = await this.store.update(existing.id, payload);
        this.toast.success(`${updated.fullName}'s profile has been updated.`, { title: 'Profile saved' });
        this.openDetail(updated.id);
      } else {
        const created = await this.store.create(payload);
        this.toast.success(`${created.fullName} has been added to the directory.`, { title: 'Consultant created' });
        this.openDetail(created.id);
      }
    } catch (err: unknown) {
      this.toast.error((err as Error).message, { title: 'Save failed' });
    }
  }

  protected async remove(consultant: Consultant): Promise<void> {
    try {
      await this.store.remove(consultant.id);
      this.toast.success(`${consultant.fullName} has been removed.`, { title: 'Consultant deleted' });
      this.closeModals();
    } catch (err: unknown) {
      this.toast.error((err as Error).message, { title: 'Delete failed' });
    }
  }

  protected exportCsv(): void {
    this.fileExport.downloadCsv(
      `consultants-${new Date().toISOString().slice(0, 10)}.csv`,
      this.store.filteredConsultants().map((c) => ({
        Name: c.fullName,
        Title: c.title,
        Seniority: c.seniority,
        Status: c.status,
        'Primary skill': c.primarySkill,
        Skills: c.skills.join(' | '),
        'TJM (EUR)': c.tjm,
        'Days on bench': c.daysOnBench,
        Client: c.clientName,
        'Mission end': c.missionEndDate,
        Email: c.email,
        Location: c.location,
      })),
    );
  }

  private setModalParams(queryParams: { id: string | null; mode: 'new' | 'edit' | null }): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
  }
}
