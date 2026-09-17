import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AvatarComponent } from '../../../core/widgets/avatar/avatar.component';
import { ModalComponent } from '../../../core/widgets/modal/modal.component';
import { SkeletonComponent } from '../../../core/widgets/skeleton/skeleton.component';
import { StatusBadgeComponent } from '../../../core/widgets/status-badge/status-badge.component';
import { CONSULTANT_SENIORITIES, ConsultantSeniority } from '../../consultants/models/consultant.model';
import { ClientDetail, RfpPayload } from '../models/customer.model';
import { ClientStatusChipComponent } from './client-status-chip.component';

@Component({
  selector: 'app-client-detail-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    AvatarComponent,
    ModalComponent,
    SkeletonComponent,
    StatusBadgeComponent,
    ClientStatusChipComponent,
  ],
  template: `
    <app-modal
      [open]="true"
      size="xl"
      icon="domain"
      [title]="client()?.name ?? 'Loading account…'"
      [subtitle]="client() ? client()!.industry + (client()!.city ? ' · ' + client()!.city : '') : ''"
      (closed)="closed.emit()"
    >
      @if (client(); as c) {
        <div class="space-y-6">
          <!-- Account summary -->
          <div class="flex flex-col lg:flex-row gap-4">
            <div class="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="p-3 rounded-xl bg-surface-container-low/70 dark:bg-slate-800/50">
                <p class="text-[10px] font-bold uppercase tracking-wider text-outline dark:text-slate-400">Status</p>
                <div class="mt-1.5"><app-client-status-chip [status]="c.status" /></div>
              </div>
              <div class="p-3 rounded-xl bg-surface-container-low/70 dark:bg-slate-800/50">
                <p class="text-[10px] font-bold uppercase tracking-wider text-outline dark:text-slate-400">Staffed</p>
                <p class="text-lg font-bold text-emerald-600 dark:text-emerald-400">{{ c.activeConsultants }}</p>
              </div>
              <div class="p-3 rounded-xl bg-surface-container-low/70 dark:bg-slate-800/50">
                <p class="text-[10px] font-bold uppercase tracking-wider text-outline dark:text-slate-400">Open RFPs</p>
                <p class="text-lg font-bold text-indigo-600 dark:text-indigo-400">{{ c.openRFPs }}</p>
              </div>
              <div class="p-3 rounded-xl bg-surface-container-low/70 dark:bg-slate-800/50">
                <p class="text-[10px] font-bold uppercase tracking-wider text-outline dark:text-slate-400">Billing / mo</p>
                <p class="text-lg font-bold text-on-surface dark:text-white">{{ c.monthlyRevenue | currency: 'EUR' : 'symbol' : '1.0-0' }}</p>
              </div>
            </div>
            <div class="lg:w-64 p-3 rounded-xl border border-outline-variant dark:border-slate-800 text-xs space-y-1">
              <p class="text-[10px] font-bold uppercase tracking-wider text-outline dark:text-slate-400">Decision-maker</p>
              <p class="font-semibold text-on-surface dark:text-white">{{ c.contactName || '—' }}</p>
              @if (c.contactEmail) {
                <a [href]="'mailto:' + c.contactEmail" class="block truncate text-secondary-blue dark:text-blue-400 hover:underline">{{ c.contactEmail }}</a>
              }
              <p class="text-[10px] text-outline dark:text-slate-500">Client since {{ c.accountSince | date: 'MMM y' }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <!-- Staffing -->
            <section class="lg:col-span-2">
              <h3 class="text-[11px] font-bold uppercase tracking-wider text-outline dark:text-slate-400 mb-2">Consultants on this account</h3>
              <ul class="divide-y divide-outline-variant/60 dark:divide-slate-800 rounded-xl border border-outline-variant dark:border-slate-800">
                @for (consultant of c.consultants; track consultant.id) {
                  <li>
                    <a
                      routerLink="/consultants"
                      [queryParams]="{ id: consultant.id }"
                      class="flex items-center gap-2.5 p-2.5 hover:bg-surface-container-low/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <app-avatar [name]="consultant.fullName" size="sm" />
                      <div class="flex-1 min-w-0">
                        <p class="text-xs font-semibold text-on-surface dark:text-white truncate">{{ consultant.fullName }}</p>
                        <p class="text-[10px] text-outline dark:text-slate-400 truncate">
                          {{ consultant.title }}
                          @if (consultant.missionEndDate) {
                            · until {{ consultant.missionEndDate | date: 'd MMM y' }}
                          }
                        </p>
                      </div>
                      <app-status-badge [status]="consultant.status" />
                    </a>
                  </li>
                } @empty {
                  <li class="p-4 text-center text-xs text-outline dark:text-slate-400">No consultant staffed yet.</li>
                }
              </ul>
            </section>

            <!-- RFPs -->
            <section class="lg:col-span-3 space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="text-[11px] font-bold uppercase tracking-wider text-outline dark:text-slate-400">Requests for proposal</h3>
                @if (!showRfpForm()) {
                  <button type="button" (click)="showRfpForm.set(true)" class="text-xs font-semibold text-secondary-blue dark:text-blue-400 hover:underline inline-flex items-center gap-1">
                    <span class="material-symbols-outlined text-[16px]">add</span>New RFP
                  </button>
                }
              </div>

              @if (showRfpForm()) {
                <form [formGroup]="rfpForm" (ngSubmit)="submitRfp()" class="p-3 rounded-xl border border-secondary-blue/30 bg-blue-50/40 dark:bg-blue-950/10 grid grid-cols-1 sm:grid-cols-2 gap-3" novalidate>
                  <label class="block sm:col-span-2">
                    <span class="field-label">Title *</span>
                    <input formControlName="title" class="field-input" autofocus placeholder="e.g. Senior Data Engineer" />
                  </label>
                  <label class="block sm:col-span-2">
                    <span class="field-label">Required skills * <span class="font-normal normal-case">(comma separated)</span></span>
                    <input formControlName="requiredSkills" class="field-input" placeholder="Python, Airflow, GCP" />
                  </label>
                  <label class="block">
                    <span class="field-label">Seniority</span>
                    <select formControlName="seniority" class="field-input">
                      @for (level of seniorities; track level) {
                        <option [value]="level">{{ level }}</option>
                      }
                    </select>
                  </label>
                  <div class="grid grid-cols-2 gap-3">
                    <label class="block">
                      <span class="field-label">Budget €/d *</span>
                      <input formControlName="dailyBudget" type="number" min="100" step="10" class="field-input" />
                    </label>
                    <label class="block">
                      <span class="field-label">Start</span>
                      <input formControlName="startDate" type="date" class="field-input" />
                    </label>
                  </div>
                  @if (rfpForm.invalid && rfpForm.touched) {
                    <p class="field-error sm:col-span-2">Title, at least one skill and a budget ≥ €100 are required.</p>
                  }
                  <div class="sm:col-span-2 flex justify-end gap-2">
                    <button type="button" (click)="cancelRfp()" class="btn-secondary">Cancel</button>
                    <button type="submit" [disabled]="isSaving()" class="btn-primary">{{ isSaving() ? 'Adding…' : 'Add RFP' }}</button>
                  </div>
                </form>
              }

              @for (rfp of c.rfps; track rfp.id) {
                <article class="p-3 rounded-xl border border-outline-variant dark:border-slate-800 space-y-2">
                  <div class="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p class="text-sm font-semibold text-on-surface dark:text-white">{{ rfp.title }}</p>
                      <p class="text-[11px] text-outline dark:text-slate-400">
                        {{ rfp.seniority }} · {{ rfp.dailyBudget | currency: 'EUR' : 'symbol' : '1.0-0' }}/day · starts {{ rfp.startDate | date: 'd MMM y' }}
                      </p>
                    </div>
                    <span
                      class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                      [class]="rfp.status === 'open' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'"
                    >
                      {{ rfp.status }}
                    </span>
                  </div>
                  <div class="flex flex-wrap gap-1">
                    @for (skill of rfp.requiredSkills; track skill) {
                      <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-container-low dark:bg-slate-800 text-on-surface-variant dark:text-slate-300">{{ skill }}</span>
                    }
                  </div>
                  @if (rfp.status === 'open') {
                    <div class="pt-2 border-t border-outline-variant/60 dark:border-slate-800">
                      <p class="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1.5 flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">auto_awesome</span>Suggested consultants
                      </p>
                      @for (match of rfp.suggestedConsultants; track match.consultantId) {
                        <div class="flex flex-wrap items-center justify-between gap-2 py-1">
                          <div class="flex items-center gap-2 min-w-0">
                            <app-avatar [name]="match.fullName" size="xs" />
                            <span class="text-xs font-medium text-on-surface dark:text-slate-200 truncate">{{ match.fullName }}</span>
                            <span class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{{ match.matchScore }}%</span>
                            @if (match.missingSkills.length) {
                              <span class="text-[10px] text-outline">missing {{ match.missingSkills.join(', ') }}</span>
                            }
                          </div>
                          <div class="flex items-center gap-1">
                            <a
                              routerLink="/pitch-generator"
                              [queryParams]="{ consultantId: match.consultantId, clientId: c.id, rfpId: rfp.id }"
                              class="px-2 py-1 rounded-md text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                            >
                              Pitch
                            </a>
                            <a
                              routerLink="/placements"
                              [queryParams]="{ mode: 'new', consultantId: match.consultantId, clientId: c.id, rfpId: rfp.id }"
                              class="px-2 py-1 rounded-md text-[11px] font-semibold text-secondary-blue dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                            >
                              Add to pipeline
                            </a>
                          </div>
                        </div>
                      } @empty {
                        <p class="text-[11px] text-outline dark:text-slate-400">No available consultant above 60% match — consider recruiting or upskilling.</p>
                      }
                    </div>
                  }
                </article>
              } @empty {
                @if (!showRfpForm()) {
                  <p class="p-4 rounded-xl border border-dashed border-outline-variant dark:border-slate-800 text-center text-xs text-outline dark:text-slate-400">
                    No RFP recorded for this account.
                  </p>
                }
              }
            </section>
          </div>
        </div>
      } @else {
        <div class="space-y-4">
          <app-skeleton variant="rect" height="5rem" />
          <app-skeleton variant="text" [count]="6" />
        </div>
      }

      <ng-container modal-footer>
        <button type="button" (click)="closed.emit()" class="btn-secondary">Close</button>
        @if (client(); as c) {
          <button type="button" (click)="edit.emit(c)" class="btn-primary">
            <span class="material-symbols-outlined text-[16px]">edit</span>Edit account
          </button>
        }
      </ng-container>
    </app-modal>
  `,
})
export class ClientDetailModalComponent {
  /** `null` while the account detail is loading. */
  readonly client = input<ClientDetail | null>(null);
  readonly isSaving = input<boolean>(false);

  readonly closed = output<void>();
  readonly edit = output<ClientDetail>();
  readonly addRfp = output<RfpPayload>();

  protected readonly seniorities = CONSULTANT_SENIORITIES;
  protected readonly showRfpForm = signal(false);

  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly rfpForm = this.fb.group({
    title: ['', Validators.required],
    requiredSkills: ['', Validators.required],
    seniority: this.fb.control<ConsultantSeniority>('Senior'),
    dailyBudget: [650, [Validators.required, Validators.min(100)]],
    startDate: [''],
  });

  protected submitRfp(): void {
    if (this.rfpForm.invalid) {
      this.rfpForm.markAllAsTouched();
      return;
    }
    const value = this.rfpForm.getRawValue();
    this.addRfp.emit({
      title: value.title.trim(),
      requiredSkills: value.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
      seniority: value.seniority,
      dailyBudget: value.dailyBudget,
      startDate: value.startDate,
    });
  }

  /** Called by the parent once the RFP has been saved. */
  resetRfpForm(): void {
    this.cancelRfp();
  }

  protected cancelRfp(): void {
    this.rfpForm.reset();
    this.showRfpForm.set(false);
  }
}
