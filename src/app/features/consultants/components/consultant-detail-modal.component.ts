import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvatarComponent } from '../../../core/widgets/avatar/avatar.component';
import { ModalComponent } from '../../../core/widgets/modal/modal.component';
import { StatusBadgeComponent } from '../../../core/widgets/status-badge/status-badge.component';
import { Consultant, WORKING_DAYS_PER_MONTH } from '../models/consultant.model';

@Component({
  selector: 'app-consultant-detail-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, RouterLink, AvatarComponent, ModalComponent, StatusBadgeComponent],
  template: `
    @let c = consultant();
    <app-modal [open]="true" size="lg" [title]="c.fullName" [subtitle]="c.title" (closed)="closed.emit()">
      <div class="space-y-6">
        <!-- Identity -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          <app-avatar [name]="c.fullName" size="lg" />
          <div class="flex-1 min-w-0 space-y-1.5">
            <div class="flex flex-wrap items-center gap-2">
              <app-status-badge [status]="c.status" />
              <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container-low dark:bg-slate-800 text-on-surface-variant dark:text-slate-300">
                {{ c.seniority }}
              </span>
              @if (c.location) {
                <span class="inline-flex items-center gap-1 text-xs text-outline dark:text-slate-400">
                  <span class="material-symbols-outlined text-[14px]">location_on</span>{{ c.location }}
                </span>
              }
            </div>
            @if (c.bio) {
              <p class="text-xs leading-relaxed text-on-surface-variant dark:text-slate-300">{{ c.bio }}</p>
            }
          </div>
        </div>

        <!-- Key figures -->
        <dl class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="p-3 rounded-xl bg-surface-container-low/70 dark:bg-slate-800/50">
            <dt class="text-[10px] font-bold uppercase tracking-wider text-outline dark:text-slate-400">Daily rate</dt>
            <dd class="text-lg font-bold text-on-surface dark:text-white mt-0.5">{{ c.tjm | currency: 'EUR' : 'symbol' : '1.0-0' }}</dd>
          </div>
          <div class="p-3 rounded-xl bg-surface-container-low/70 dark:bg-slate-800/50">
            <dt class="text-[10px] font-bold uppercase tracking-wider text-outline dark:text-slate-400">Experience</dt>
            <dd class="text-lg font-bold text-on-surface dark:text-white mt-0.5">{{ c.yearsOfExperience }} yrs</dd>
          </div>
          <div class="p-3 rounded-xl bg-surface-container-low/70 dark:bg-slate-800/50">
            <dt class="text-[10px] font-bold uppercase tracking-wider text-outline dark:text-slate-400">Availability</dt>
            <dd class="text-sm font-bold mt-1" [class]="availabilityTone()">{{ availabilityLabel() }}</dd>
          </div>
          <div class="p-3 rounded-xl" [class]="c.status === 'on_bench' ? 'bg-red-50 dark:bg-red-950/30' : 'bg-emerald-50 dark:bg-emerald-950/30'">
            <dt class="text-[10px] font-bold uppercase tracking-wider" [class]="c.status === 'on_bench' ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'">
              {{ c.status === 'on_bench' ? 'Bench cost / month' : 'Billing / month' }}
            </dt>
            <dd class="text-lg font-bold text-on-surface dark:text-white mt-0.5">
              {{ monthlyValue() | currency: 'EUR' : 'symbol' : '1.0-0' }}
            </dd>
          </div>
        </dl>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Skills & credentials -->
          <section class="space-y-4">
            <div>
              <h3 class="text-[11px] font-bold uppercase tracking-wider text-outline dark:text-slate-400 mb-2">Skills</h3>
              <div class="flex flex-wrap gap-1.5">
                <span class="px-2 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-secondary-blue dark:bg-blue-950/50 dark:text-blue-300">
                  {{ c.primarySkill }}
                </span>
                @for (skill of c.skills; track skill) {
                  <span class="px-2 py-1 rounded-md text-[11px] font-medium bg-surface-container-low dark:bg-slate-800 text-on-surface-variant dark:text-slate-300">
                    {{ skill }}
                  </span>
                }
              </div>
            </div>

            @if (c.certifications.length) {
              <div>
                <h3 class="text-[11px] font-bold uppercase tracking-wider text-outline dark:text-slate-400 mb-2">Certifications</h3>
                <ul class="space-y-1">
                  @for (cert of c.certifications; track cert) {
                    <li class="flex items-center gap-2 text-xs text-on-surface dark:text-slate-200">
                      <span class="material-symbols-outlined text-[16px] text-indigo-500">verified</span>{{ cert }}
                    </li>
                  }
                </ul>
              </div>
            }

            @if (c.languages.length) {
              <div>
                <h3 class="text-[11px] font-bold uppercase tracking-wider text-outline dark:text-slate-400 mb-2">Languages</h3>
                <p class="text-xs text-on-surface dark:text-slate-200">{{ c.languages.join(' · ') }}</p>
              </div>
            }

            <div>
              <h3 class="text-[11px] font-bold uppercase tracking-wider text-outline dark:text-slate-400 mb-2">Contact</h3>
              <ul class="space-y-1.5 text-xs">
                <li>
                  <a [href]="'mailto:' + c.email" class="inline-flex items-center gap-2 text-secondary-blue dark:text-blue-400 hover:underline">
                    <span class="material-symbols-outlined text-[16px]">mail</span>{{ c.email }}
                  </a>
                </li>
                @if (c.phone) {
                  <li>
                    <a [href]="'tel:' + c.phone.replaceAll(' ', '')" class="inline-flex items-center gap-2 text-on-surface dark:text-slate-200 hover:underline">
                      <span class="material-symbols-outlined text-[16px] text-outline">call</span>{{ c.phone }}
                    </a>
                  </li>
                }
              </ul>
            </div>
          </section>

          <!-- Mission history -->
          <section>
            <h3 class="text-[11px] font-bold uppercase tracking-wider text-outline dark:text-slate-400 mb-3">Mission history</h3>
            @if (c.clientName && c.status !== 'on_bench') {
              <div class="mb-3 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20">
                <p class="text-xs font-bold text-on-surface dark:text-white">Current: {{ c.clientName }}</p>
                @if (c.missionEndDate) {
                  <p class="text-[11px] text-outline dark:text-slate-400 mt-0.5">Until {{ c.missionEndDate | date: 'mediumDate' }}</p>
                }
              </div>
            }
            <ol class="relative border-l border-outline-variant dark:border-slate-700 ml-1.5 space-y-4">
              @for (mission of c.missionHistory; track mission.startDate) {
                <li class="pl-4 relative">
                  <span class="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-secondary-blue dark:bg-blue-400 ring-4 ring-surface-container-lowest dark:ring-slate-900"></span>
                  <p class="text-xs font-semibold text-on-surface dark:text-white">{{ mission.role }}</p>
                  <p class="text-[11px] text-on-surface-variant dark:text-slate-300">{{ mission.clientName }}</p>
                  <p class="text-[10px] text-outline dark:text-slate-500 mt-0.5">
                    {{ mission.startDate | date: 'MMM y' }} – {{ mission.endDate | date: 'MMM y' }}
                  </p>
                </li>
              } @empty {
                <li class="pl-4 text-xs text-outline dark:text-slate-400">No mission recorded yet.</li>
              }
            </ol>
          </section>
        </div>
      </div>

      <div modal-footer class="flex flex-wrap items-center justify-between gap-2 w-full">
        <div>
          @if (allowDelete()) {
            @if (confirmingDelete()) {
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold text-red-600 dark:text-red-400">Delete this consultant?</span>
                <button type="button" (click)="confirmingDelete.set(false)" class="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-outline hover:bg-surface-container-low dark:hover:bg-slate-800">
                  Cancel
                </button>
                <button
                  type="button"
                  (click)="remove.emit(c)"
                  [disabled]="isSaving()"
                  class="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {{ isSaving() ? 'Deleting…' : 'Confirm delete' }}
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
          }
        </div>
        <div class="flex flex-wrap items-center gap-2">
          @if (c.status === 'on_bench' || c.status === 'ending_soon') {
            <a
              routerLink="/pitch-generator"
              [queryParams]="{ consultantId: c.id }"
              class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
            >
              <span class="material-symbols-outlined text-[16px]">auto_awesome</span>Generate pitch
            </a>
          }
          <button
            type="button"
            (click)="edit.emit(c)"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-secondary-blue dark:bg-blue-600 text-white hover:opacity-90"
          >
            <span class="material-symbols-outlined text-[16px]">edit</span>Edit profile
          </button>
        </div>
      </div>
    </app-modal>
  `,
})
export class ConsultantDetailModalComponent {
  readonly consultant = input.required<Consultant>();
  readonly isSaving = input<boolean>(false);
  readonly allowDelete = input<boolean>(true);

  readonly closed = output<void>();
  readonly edit = output<Consultant>();
  readonly remove = output<Consultant>();

  protected readonly confirmingDelete = signal(false);

  protected readonly monthlyValue = computed(() => this.consultant().tjm * WORKING_DAYS_PER_MONTH);

  protected readonly availabilityLabel = computed(() => {
    const c = this.consultant();
    switch (c.status) {
      case 'on_bench':
        return `Now · ${c.daysOnBench ?? 0} days on bench`;
      case 'ending_soon':
        return c.missionEndDate ? `From ${new Date(c.missionEndDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : 'Soon';
      case 'on_mission':
        return 'On assignment';
      default:
        return 'Pre-hire';
    }
  });

  protected readonly availabilityTone = computed(() => {
    switch (this.consultant().status) {
      case 'on_bench':
        return 'text-red-600 dark:text-red-400';
      case 'ending_soon':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-emerald-600 dark:text-emerald-400';
    }
  });
}
