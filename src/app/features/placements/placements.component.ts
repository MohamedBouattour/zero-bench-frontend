import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';
import { ErrorStateComponent } from '../../core/widgets/error-state/error-state.component';
import { SkeletonComponent } from '../../core/widgets/skeleton/skeleton.component';
import { StatCardComponent } from '../../core/widgets/stat-card/stat-card.component';
import { WORKING_DAYS_PER_MONTH } from '../consultants/models/consultant.model';
import { ConsultantsStore } from '../consultants/stores/consultants.store';
import { ClientsStore } from '../customers/stores/clients.store';
import { OpportunityDetailModalComponent } from './components/opportunity-detail-modal.component';
import { OpportunityFormModalComponent, OpportunityPrefill } from './components/opportunity-form-modal.component';
import { PlacementCardComponent } from './components/placement-card.component';
import {
  PLACEMENT_STAGES,
  PLACEMENT_STAGE_LABELS,
  PlacementOpportunity,
  PlacementPayload,
  PlacementStage,
  PlacementUpdate,
} from './models/placement.model';
import { PlacementsStore } from './stores/placements.store';

const DRAG_MIME = 'application/x-benchzero-placement';

const COLUMN_STYLES: Record<PlacementStage, { dot: string; hint: string }> = {
  matched: { dot: 'bg-blue-500', hint: 'AI or manual match, pitch not sent yet' },
  pitch_sent: { dot: 'bg-indigo-500', hint: 'Profile sent, awaiting client feedback' },
  interviewing: { dot: 'bg-amber-500', hint: 'Client interviews in progress' },
  signed: { dot: 'bg-emerald-500', hint: 'Contract signed, consultant on mission' },
  lost: { dot: 'bg-slate-400', hint: 'Declined or withdrawn' },
};

@Component({
  selector: 'app-placements',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    ErrorStateComponent,
    SkeletonComponent,
    StatCardComponent,
    PlacementCardComponent,
    OpportunityDetailModalComponent,
    OpportunityFormModalComponent,
  ],
  template: `
    <div class="space-y-6 pb-12">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-on-surface dark:text-white">Placement Pipeline</h2>
          <p class="text-xs text-outline dark:text-slate-400 mt-1">
            Drag opportunities across stages: matching, pitch dispatch, client interviews, and contract closing.
          </p>
        </div>

        <button type="button" (click)="openCreate()" class="btn-primary">
          <span class="material-symbols-outlined text-[16px]">add</span>
          <span>New Opportunity</span>
        </button>
      </div>

      @if (store.error(); as error) {
        <app-error-state title="Pipeline could not be loaded" [message]="error" (retry)="store.loadOpportunities()" />
      }

      <!-- Pipeline KPIs -->
      @let stats = store.stats();
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stat-card label="Active opportunities" [value]="stats.activeCount" icon="view_kanban" tone="primary" subtext="matched → interviewing" />
        <app-stat-card
          label="Pipeline value"
          [value]="(stats.pipelineMonthlyValue | currency: 'EUR' : 'symbol' : '1.0-0') ?? ''"
          unit="/ mo"
          icon="euro"
          tone="indigo"
          subtext="if every active deal closes"
        />
        <app-stat-card
          label="Win rate"
          [value]="stats.winRate + '%'"
          icon="emoji_events"
          tone="success"
          [subtext]="stats.signedCount + ' signed · ' + stats.lostCount + ' lost'"
          [progress]="stats.winRate"
        />
        <app-stat-card
          label="Avg. match score"
          [value]="stats.averageMatchScore ? stats.averageMatchScore + '%' : '–'"
          icon="auto_awesome"
          tone="warning"
          subtext="active opportunities"
          [progress]="stats.averageMatchScore"
        />
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="relative w-full sm:w-72">
          <span class="material-symbols-outlined absolute left-3 top-2 text-[18px] text-outline" aria-hidden="true">search</span>
          <input
            type="search"
            placeholder="Search consultant, client, role…"
            aria-label="Search opportunities"
            [value]="store.searchQuery()"
            (input)="store.setSearchQuery($any($event.target).value)"
            class="field-input pl-9"
          />
        </div>
        <div class="flex items-center gap-2">
          <label for="client-filter" class="text-xs font-semibold text-outline dark:text-slate-400">Client</label>
          <select id="client-filter" class="field-input w-auto! min-w-48" [value]="store.clientFilter()" (change)="store.setClientFilter($any($event.target).value)">
            <option value="ALL">All clients</option>
            @for (client of store.clientOptions(); track client.id) {
              <option [value]="client.id">{{ client.name }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Kanban Board -->
      <div class="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto pb-2">
        <div class="grid grid-flow-col auto-cols-[minmax(13rem,1fr)] gap-3 min-w-max lg:min-w-0">
          @for (stage of stages; track stage) {
            @let cards = store.byStage()[stage];
            @let isTarget = dragOverStage() === stage && draggedStage() !== stage;
            <section
              class="flex flex-col rounded-xl border transition-colors min-h-[24rem]"
              [class]="isTarget
                ? 'border-secondary-blue dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/20 ring-2 ring-secondary-blue/20'
                : stage === 'lost'
                  ? 'border-dashed border-outline-variant dark:border-slate-800 bg-surface-container-lowest/50 dark:bg-slate-900/40'
                  : 'border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900'"
              [attr.aria-label]="labels[stage] + ' column, ' + cards.length + ' opportunities'"
              (dragover)="onDragOver($event, stage)"
              (dragleave)="onDragLeave($event, stage)"
              (drop)="onDrop($event, stage)"
            >
              <header class="px-3 pt-3 pb-2 border-b border-outline-variant/60 dark:border-slate-800/60">
                <div class="flex items-center justify-between gap-2">
                  <span class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-slate-300">
                    <span class="w-2 h-2 rounded-full" [class]="columnStyles[stage].dot"></span>
                    {{ labels[stage] }}
                  </span>
                  <span class="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-surface-container-low dark:bg-slate-800 text-outline dark:text-slate-400">
                    {{ cards.length }}
                  </span>
                </div>
                <p class="text-[10px] text-outline dark:text-slate-500 mt-1">
                  {{ columnValue()[stage] | currency: 'EUR' : 'symbol' : '1.0-0' }}/mo · {{ columnStyles[stage].hint }}
                </p>
              </header>

              <div class="flex-1 p-2.5 space-y-2.5">
                @if (store.isLoading() && store.opportunities().length === 0) {
                  <app-skeleton variant="rect" height="6rem" [count]="2" />
                } @else {
                  @for (item of cards; track item.id) {
                    <app-placement-card
                      draggable="true"
                      [opportunity]="item"
                      [dragging]="draggingId() === item.id"
                      (dragstart)="onDragStart($event, item)"
                      (dragend)="onDragEnd()"
                      (open)="openDetail($event.id)"
                      (move)="move(item, $event)"
                    />
                  } @empty {
                    <div
                      class="h-24 flex items-center justify-center rounded-lg border-2 border-dashed text-[11px] text-center px-2 transition-colors"
                      [class]="isTarget ? 'border-secondary-blue/60 text-secondary-blue dark:text-blue-400' : 'border-outline-variant/60 dark:border-slate-800 text-outline dark:text-slate-500'"
                    >
                      {{ draggingId() ? 'Drop here' : 'No opportunities' }}
                    </div>
                  }
                }
              </div>
            </section>
          }
        </div>
      </div>
    </div>

    @if (selectedOpportunity(); as opportunity) {
      <app-opportunity-detail-modal
        [opportunity]="opportunity"
        [isSaving]="store.isSaving()"
        (save)="update(opportunity, $event)"
        (remove)="remove($event)"
        (closed)="closeModals()"
      />
    } @else if (mode() === 'new') {
      <app-opportunity-form-modal
        [consultants]="consultantsStore.consultants()"
        [clients]="clientsStore.clients()"
        [prefill]="prefill()"
        [isSaving]="store.isSaving()"
        (save)="create($event)"
        (closed)="closeModals()"
      />
    }
  `,
})
export class PlacementsComponent implements OnInit {
  /** Query params: `?id=` opens an opportunity, `?mode=new` (+ optional prefill ids) the creation form. */
  readonly id = input<string>();
  readonly mode = input<'new'>();
  readonly consultantId = input<string>();
  readonly clientId = input<string>();
  readonly rfpId = input<string>();

  protected readonly store = inject(PlacementsStore);
  protected readonly consultantsStore = inject(ConsultantsStore);
  protected readonly clientsStore = inject(ClientsStore);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly stages = PLACEMENT_STAGES;
  protected readonly labels = PLACEMENT_STAGE_LABELS;
  protected readonly columnStyles = COLUMN_STYLES;

  protected readonly draggingId = signal<string | null>(null);
  protected readonly dragOverStage = signal<PlacementStage | null>(null);

  protected readonly draggedStage = computed(() => {
    const id = this.draggingId();
    return id ? (this.store.entityMap()[id]?.stage ?? null) : null;
  });

  protected readonly columnValue = computed(() => {
    const byStage = this.store.byStage();
    return Object.fromEntries(
      PLACEMENT_STAGES.map((stage) => [stage, byStage[stage].reduce((sum, o) => sum + o.tjm * WORKING_DAYS_PER_MONTH, 0)]),
    ) as Record<PlacementStage, number>;
  });

  protected readonly selectedOpportunity = computed(() => {
    const id = this.id();
    return id ? (this.store.entityMap()[id] ?? null) : null;
  });

  protected readonly prefill = computed<OpportunityPrefill>(() => ({
    consultantId: this.consultantId(),
    clientId: this.clientId(),
    rfpId: this.rfpId(),
  }));

  ngOnInit(): void {
    void this.store.loadOpportunities();
    void this.consultantsStore.loadAll();
    void this.clientsStore.loadClients();
  }

  // --- Drag & drop (native HTML5) ---------------------------------------------------------

  protected onDragStart(event: DragEvent, item: PlacementOpportunity): void {
    if (!event.dataTransfer) return;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData(DRAG_MIME, item.id);
    event.dataTransfer.setData('text/plain', `${item.consultantName} → ${item.clientName}`);
    this.draggingId.set(item.id);
  }

  protected onDragOver(event: DragEvent, stage: PlacementStage): void {
    if (!event.dataTransfer?.types.includes(DRAG_MIME)) return;
    event.preventDefault(); // allows dropping
    event.dataTransfer.dropEffect = 'move';
    this.dragOverStage.set(stage);
  }

  protected onDragLeave(event: DragEvent, stage: PlacementStage): void {
    const column = event.currentTarget as HTMLElement;
    if (!column.contains(event.relatedTarget as Node | null) && this.dragOverStage() === stage) {
      this.dragOverStage.set(null);
    }
  }

  protected onDrop(event: DragEvent, stage: PlacementStage): void {
    event.preventDefault();
    const id = event.dataTransfer?.getData(DRAG_MIME) || this.draggingId();
    this.onDragEnd();
    const item = id ? this.store.entityMap()[id] : undefined;
    if (item) void this.move(item, stage);
  }

  protected onDragEnd(): void {
    this.draggingId.set(null);
    this.dragOverStage.set(null);
  }

  // --- Mutations -----------------------------------------------------------------------------

  protected async move(item: PlacementOpportunity, stage: PlacementStage): Promise<void> {
    if (item.stage === stage) return;
    try {
      await this.store.moveToStage(item.id, stage);
      if (stage === 'signed') {
        this.toast.success(`${item.consultantName} is now on mission at ${item.clientName}.`, { title: 'Placement signed 🎉' });
      } else {
        this.toast.info(`${item.consultantName} moved to ${this.labels[stage]}.`, { title: 'Pipeline updated', duration: 2500 });
      }
    } catch (err: unknown) {
      this.toast.error((err as Error).message, { title: 'Move failed' });
    }
  }

  protected async create(payload: PlacementPayload): Promise<void> {
    try {
      const created = await this.store.create(payload);
      this.toast.success(`${created.consultantName} → ${created.clientName} added to ${this.labels[created.stage]}.`, {
        title: 'Opportunity created',
      });
      this.closeModals();
    } catch (err: unknown) {
      this.toast.error((err as Error).message, { title: 'Creation failed' });
    }
  }

  protected async update(opportunity: PlacementOpportunity, changes: PlacementUpdate): Promise<void> {
    try {
      await this.store.update(opportunity.id, changes);
      this.toast.success('Opportunity updated.', { title: 'Saved' });
      this.closeModals();
    } catch (err: unknown) {
      this.toast.error((err as Error).message, { title: 'Save failed' });
    }
  }

  protected async remove(opportunity: PlacementOpportunity): Promise<void> {
    try {
      await this.store.remove(opportunity.id);
      this.toast.success(`${opportunity.consultantName} → ${opportunity.clientName} removed.`, { title: 'Opportunity deleted' });
      this.closeModals();
    } catch (err: unknown) {
      this.toast.error((err as Error).message, { title: 'Delete failed' });
    }
  }

  protected openCreate(): void {
    this.navigate({ mode: 'new', id: null });
  }

  protected openDetail(id: string): void {
    this.navigate({ id, mode: null });
  }

  protected closeModals(): void {
    this.navigate({ id: null, mode: null, consultantId: null, clientId: null, rfpId: null });
  }

  private navigate(queryParams: Record<string, string | null>): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
  }
}
