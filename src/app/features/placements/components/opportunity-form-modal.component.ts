import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../core/widgets/modal/modal.component';
import { Consultant } from '../../consultants/models/consultant.model';
import { ClientAccount } from '../../customers/models/customer.model';
import { ClientsStore } from '../../customers/stores/clients.store';
import { PLACEMENT_STAGES, PLACEMENT_STAGE_LABELS, PlacementPayload, PlacementStage } from '../models/placement.model';

export interface OpportunityPrefill {
  consultantId?: string;
  clientId?: string;
  rfpId?: string;
}

@Component({
  selector: 'app-opportunity-form-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ModalComponent],
  template: `
    <app-modal
      [open]="true"
      icon="add_task"
      title="New opportunity"
      subtitle="Match an available consultant with a client mandate."
      [dismissible]="!isSaving()"
      (closed)="closed.emit()"
    >
      <form id="opportunity-form" [formGroup]="form" (ngSubmit)="submit()" class="space-y-4" novalidate>
        <label class="block">
          <span class="field-label">Consultant *</span>
          <select formControlName="consultantId" class="field-input" [class.field-invalid]="invalid('consultantId')" autofocus>
            <option value="">Select a consultant…</option>
            @if (availableConsultants().length) {
              <optgroup label="Available (bench / ending soon)">
                @for (c of availableConsultants(); track c.id) {
                  <option [value]="c.id">{{ c.fullName }} – {{ c.title }}</option>
                }
              </optgroup>
            }
            @if (otherConsultants().length) {
              <optgroup label="On mission">
                @for (c of otherConsultants(); track c.id) {
                  <option [value]="c.id">{{ c.fullName }} – {{ c.title }}</option>
                }
              </optgroup>
            }
          </select>
          @if (invalid('consultantId')) {
            <span class="field-error">Select a consultant.</span>
          }
        </label>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label class="block">
            <span class="field-label">Client *</span>
            <select formControlName="clientId" class="field-input" [class.field-invalid]="invalid('clientId')">
              <option value="">Select a client…</option>
              @for (client of clients(); track client.id) {
                <option [value]="client.id">{{ client.name }}</option>
              }
            </select>
            @if (invalid('clientId')) {
              <span class="field-error">Select a client.</span>
            }
          </label>

          <label class="block">
            <span class="field-label">RFP</span>
            <select formControlName="rfpId" class="field-input" [attr.disabled]="!clientId() || clientsStore.isDetailLoading() ? '' : null">
              <option value="">{{ clientsStore.isDetailLoading() ? 'Loading RFPs…' : 'No specific RFP' }}</option>
              @for (rfp of openRfps(); track rfp.id) {
                <option [value]="rfp.id">{{ rfp.title }}</option>
              }
            </select>
          </label>
        </div>

        @if (selectedRfp(); as rfp) {
          <div class="p-3 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-[11px] space-y-1.5">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="font-semibold text-indigo-700 dark:text-indigo-300">Required skills</span>
              @if (suggestedScore(); as score) {
                <span class="px-1.5 py-0.5 rounded font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-200">{{ score }}% AI match</span>
              }
            </div>
            <div class="flex flex-wrap gap-1">
              @for (skill of rfp.requiredSkills; track skill) {
                <span class="px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-900/70 text-on-surface-variant dark:text-slate-300">{{ skill }}</span>
              }
            </div>
            <p class="text-outline dark:text-slate-400">{{ rfp.seniority }} · budget €{{ rfp.dailyBudget }}/day · starts {{ rfp.startDate }}</p>
          </div>
        }

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label class="block">
            <span class="field-label">Role title *</span>
            <input formControlName="roleTitle" class="field-input" [class.field-invalid]="invalid('roleTitle')" placeholder="e.g. Lead Angular Developer" />
            @if (invalid('roleTitle')) {
              <span class="field-error">Role title is required.</span>
            }
          </label>
          <label class="block">
            <span class="field-label">Initial stage</span>
            <select formControlName="stage" class="field-input">
              @for (stage of stages; track stage) {
                <option [value]="stage">{{ stageLabels[stage] }}</option>
              }
            </select>
          </label>
        </div>

        <label class="block">
          <span class="field-label">Note</span>
          <textarea formControlName="note" rows="3" maxlength="300" class="field-input resize-y" placeholder="Next step, contact, interview date…"></textarea>
        </label>
      </form>

      <ng-container modal-footer>
        <button type="button" (click)="closed.emit()" [disabled]="isSaving()" class="btn-secondary">Cancel</button>
        <button type="submit" form="opportunity-form" [disabled]="isSaving()" class="btn-primary">
          @if (isSaving()) {
            <span class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>Creating…
          } @else {
            <span class="material-symbols-outlined text-[16px]">add</span>Create opportunity
          }
        </button>
      </ng-container>
    </app-modal>
  `,
})
export class OpportunityFormModalComponent implements OnInit {
  readonly consultants = input<readonly Consultant[]>([]);
  readonly clients = input<readonly ClientAccount[]>([]);
  readonly prefill = input<OpportunityPrefill>({});
  readonly isSaving = input<boolean>(false);

  readonly save = output<PlacementPayload>();
  readonly closed = output<void>();

  protected readonly clientsStore = inject(ClientsStore);
  protected readonly stages = PLACEMENT_STAGES;
  protected readonly stageLabels = PLACEMENT_STAGE_LABELS;

  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    consultantId: ['', Validators.required],
    clientId: ['', Validators.required],
    rfpId: [''],
    roleTitle: ['', [Validators.required, Validators.maxLength(120)]],
    stage: this.fb.control<PlacementStage>('matched'),
    note: [''],
  });

  protected readonly clientId = toSignal(this.form.controls.clientId.valueChanges, { initialValue: '' });
  private readonly rfpId = toSignal(this.form.controls.rfpId.valueChanges, { initialValue: '' });
  private readonly consultantId = toSignal(this.form.controls.consultantId.valueChanges, { initialValue: '' });

  protected readonly availableConsultants = computed(() =>
    this.consultants().filter((c) => c.status === 'on_bench' || c.status === 'ending_soon'),
  );
  protected readonly otherConsultants = computed(() =>
    this.consultants().filter((c) => c.status !== 'on_bench' && c.status !== 'ending_soon'),
  );

  protected readonly openRfps = computed(() => {
    const detail = this.clientsStore.selectedClient();
    return detail && detail.id === this.clientId() ? detail.rfps.filter((r) => r.status === 'open') : [];
  });

  protected readonly selectedRfp = computed(() => this.openRfps().find((r) => r.id === this.rfpId()) ?? null);

  protected readonly suggestedScore = computed(
    () => this.selectedRfp()?.suggestedConsultants.find((s) => s.consultantId === this.consultantId())?.matchScore ?? null,
  );

  /** RFP to select once the prefilled client's RFPs are loaded. */
  private pendingRfpId: string | null = null;

  constructor() {
    this.form.controls.clientId.valueChanges.pipe(takeUntilDestroyed()).subscribe(async (clientId) => {
      this.form.controls.rfpId.setValue('');
      if (!clientId) return;
      const detail = await this.clientsStore.loadDetail(clientId);
      const rfpId = this.pendingRfpId;
      this.pendingRfpId = null;
      if (rfpId && detail?.id === this.form.controls.clientId.value && detail.rfps.some((r) => r.id === rfpId)) {
        this.form.controls.rfpId.setValue(rfpId);
      }
    });

    // Selecting an RFP pre-fills the role title.
    this.form.controls.rfpId.valueChanges.pipe(takeUntilDestroyed()).subscribe((rfpId) => {
      const rfp = this.openRfps().find((r) => r.id === rfpId);
      if (rfp) this.form.controls.roleTitle.setValue(rfp.title);
    });
  }

  ngOnInit(): void {
    const { consultantId, clientId, rfpId } = this.prefill();
    if (consultantId) this.form.controls.consultantId.setValue(consultantId);
    if (clientId) {
      this.pendingRfpId = rfpId ?? null;
      this.form.controls.clientId.setValue(clientId);
    }
  }

  protected invalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && control.touched;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.save.emit({
      consultantId: value.consultantId,
      clientId: value.clientId,
      rfpId: value.rfpId || undefined,
      roleTitle: value.roleTitle.trim(),
      stage: value.stage,
      note: value.note.trim(),
      matchScore: this.suggestedScore() ?? undefined,
    });
  }
}
