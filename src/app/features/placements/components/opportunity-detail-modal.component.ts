import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvatarComponent } from '../../../core/widgets/avatar/avatar.component';
import { ModalComponent } from '../../../core/widgets/modal/modal.component';
import { StatusBadgeComponent } from '../../../core/widgets/status-badge/status-badge.component';
import {
  PLACEMENT_STAGES,
  PLACEMENT_STAGE_LABELS,
  PlacementOpportunity,
  PlacementStage,
  PlacementUpdate,
} from '../models/placement.model';

@Component({
  selector: 'app-opportunity-detail-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, RouterLink, AvatarComponent, ModalComponent, StatusBadgeComponent],
  template: `
    @let o = opportunity();
    <app-modal
      [open]="true"
      icon="work"
      [title]="o.roleTitle"
      [subtitle]="o.clientName + (o.rfpTitle && o.rfpTitle !== o.roleTitle ? ' · RFP: ' + o.rfpTitle : '')"
      [dismissible]="!isSaving()"
      (closed)="closed.emit()"
    >
      <div class="space-y-5">
        <!-- Consultant -->
        <div class="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-low/70 dark:bg-slate-800/50">
          <div class="flex items-center gap-3 min-w-0">
            <app-avatar [name]="o.consultantName" size="md" />
            <div class="min-w-0">
              <p class="text-sm font-bold text-on-surface dark:text-white truncate">{{ o.consultantName }}</p>
              <p class="text-[11px] text-outline dark:text-slate-400 truncate">{{ o.consultantTitle }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <app-status-badge [status]="o.consultantStatus" />
            <span class="text-xs font-bold text-on-surface dark:text-white">{{ o.tjm | currency: 'EUR' : 'symbol' : '1.0-0' }}/d</span>
          </div>
        </div>

        <!-- Stage selector -->
        <div>
          <span class="field-label">Stage</span>
          <div class="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Pipeline stage">
            @for (stage of stages; track stage) {
              @let active = draftStage() === stage;
              <button
                type="button"
                role="radio"
                [attr.aria-checked]="active"
                (click)="draftStage.set(stage)"
                class="chip-toggle"
                [class]="active ? (stage === 'lost' ? 'bg-slate-600 border-slate-600 text-white' : 'bg-secondary-blue border-secondary-blue text-white dark:bg-blue-600 dark:border-blue-600') : 'border-outline-variant dark:border-slate-700 text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-low dark:hover:bg-slate-800'"
              >
                {{ stageLabels[stage] }}
              </button>
            }
          </div>
          @if (draftStage() === 'signed' && o.stage !== 'signed') {
            <p class="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">info</span>
              Signing sets {{ o.consultantName }} on mission at {{ o.clientName }} for 6 months.
            </p>
          }
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label class="block sm:col-span-2">
            <span class="field-label">Role title</span>
            <input class="field-input" [value]="draftTitle()" (input)="draftTitle.set($any($event.target).value)" />
          </label>
          <label class="block">
            <span class="field-label">Match score (%)</span>
            <input
              class="field-input"
              type="number"
              min="0"
              max="100"
              [value]="draftScore() ?? ''"
              (input)="setScore($any($event.target).value)"
            />
          </label>
          <label class="block sm:col-span-3">
            <span class="field-label">Note</span>
            <textarea class="field-input resize-y" rows="3" maxlength="300" [value]="draftNote()" (input)="draftNote.set($any($event.target).value)"></textarea>
          </label>
        </div>

        <!-- History -->
        <div>
          <span class="field-label">Stage history</span>
          <ol class="flex flex-wrap items-center gap-y-2 text-[11px]">
            @for (event of o.history; track event.at; let last = $last) {
              <li class="flex items-center">
                <span class="px-2 py-1 rounded-md bg-surface-container-low dark:bg-slate-800 text-on-surface dark:text-slate-200">
                  <span class="font-semibold">{{ stageLabels[event.stage] }}</span>
                  <span class="text-outline dark:text-slate-400"> · {{ event.at | date: 'd MMM' }}</span>
                </span>
                @if (!last) {
                  <span class="material-symbols-outlined text-[14px] text-outline mx-1" aria-hidden="true">arrow_forward</span>
                }
              </li>
            }
          </ol>
          <p class="text-[10px] text-outline dark:text-slate-500 mt-2">Created {{ o.createdAt | date: 'medium' }}</p>
        </div>

        <div class="flex flex-wrap gap-2 pt-1">
          <a routerLink="/consultants" [queryParams]="{ id: o.consultantId }" class="btn-secondary">
            <span class="material-symbols-outlined text-[16px]">badge</span>Consultant profile
          </a>
          <a routerLink="/clients" [queryParams]="{ id: o.clientId }" class="btn-secondary">
            <span class="material-symbols-outlined text-[16px]">domain</span>Client account
          </a>
          <a
            routerLink="/pitch-generator"
            [queryParams]="{ consultantId: o.consultantId, clientId: o.clientId, rfpId: o.rfpId }"
            class="btn-secondary text-indigo-700! dark:text-indigo-300!"
          >
            <span class="material-symbols-outlined text-[16px]">auto_awesome</span>Generate pitch
          </a>
        </div>
      </div>

      <div modal-footer class="flex flex-wrap items-center justify-between gap-2 w-full">
        <div>
          @if (confirmingDelete()) {
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-red-600 dark:text-red-400">Delete opportunity?</span>
              <button type="button" (click)="confirmingDelete.set(false)" class="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-outline hover:bg-surface-container-low dark:hover:bg-slate-800">Cancel</button>
              <button type="button" (click)="remove.emit(o)" [disabled]="isSaving()" class="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60">
                Confirm
              </button>
            </div>
          } @else {
            <button
              type="button"
              (click)="confirmingDelete.set(true)"
              class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <span class="material-symbols-outlined text-[16px]">delete</span>Delete
            </button>
          }
        </div>
        <div class="flex items-center gap-2">
          <button type="button" (click)="closed.emit()" [disabled]="isSaving()" class="btn-secondary">Cancel</button>
          <button type="button" (click)="submit()" [disabled]="isSaving() || !hasChanges() || !draftTitle().trim()" class="btn-primary">
            {{ isSaving() ? 'Saving…' : 'Save changes' }}
          </button>
        </div>
      </div>
    </app-modal>
  `,
})
export class OpportunityDetailModalComponent implements OnInit {
  readonly opportunity = input.required<PlacementOpportunity>();
  readonly isSaving = input<boolean>(false);

  readonly save = output<PlacementUpdate>();
  readonly remove = output<PlacementOpportunity>();
  readonly closed = output<void>();

  protected readonly stages = PLACEMENT_STAGES;
  protected readonly stageLabels = PLACEMENT_STAGE_LABELS;
  protected readonly confirmingDelete = signal(false);

  protected readonly draftStage = signal<PlacementStage>('matched');
  protected readonly draftTitle = signal('');
  protected readonly draftNote = signal('');
  protected readonly draftScore = signal<number | undefined>(undefined);

  protected readonly changes = computed<PlacementUpdate>(() => {
    const o = this.opportunity();
    const changes: PlacementUpdate = {};
    if (this.draftStage() !== o.stage) changes.stage = this.draftStage();
    if (this.draftTitle().trim() !== o.roleTitle) changes.roleTitle = this.draftTitle().trim();
    if (this.draftNote().trim() !== o.note) changes.note = this.draftNote().trim();
    if (this.draftScore() !== o.matchScore && this.draftScore() !== undefined) changes.matchScore = this.draftScore();
    return changes;
  });

  protected readonly hasChanges = computed(() => Object.keys(this.changes()).length > 0);

  ngOnInit(): void {
    const o = this.opportunity();
    this.draftStage.set(o.stage);
    this.draftTitle.set(o.roleTitle);
    this.draftNote.set(o.note);
    this.draftScore.set(o.matchScore);
  }

  protected setScore(raw: string): void {
    const value = Number(raw);
    this.draftScore.set(raw === '' || Number.isNaN(value) ? undefined : Math.min(100, Math.max(0, Math.round(value))));
  }

  protected submit(): void {
    if (this.hasChanges()) this.save.emit(this.changes());
  }
}
