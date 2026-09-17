import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvatarComponent } from '../../../core/widgets/avatar/avatar.component';
import { ModalComponent } from '../../../core/widgets/modal/modal.component';
import { StatusBadgeComponent } from '../../../core/widgets/status-badge/status-badge.component';
import { SkillDemandMetric, UpskillingSuggestion } from '../models/skills-gap.model';
import { DemandBadgeComponent } from './demand-badge.component';

@Component({
  selector: 'app-skill-detail-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AvatarComponent, ModalComponent, StatusBadgeComponent, DemandBadgeComponent],
  template: `
    @let skill = metric();
    <app-modal [open]="true" size="lg" icon="query_stats" [title]="skill.skillName" [subtitle]="skill.category + ' · avg. placement in ' + skill.placementVelocityDays + ' days'" (closed)="closed.emit()">
      <div class="space-y-6">
        <div class="flex flex-wrap items-center gap-2">
          <app-demand-badge [level]="skill.demandLevel" [trend]="skill.demandTrend" />
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
            [class]="skill.gapScore > 0 ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300' : skill.gapScore < 0 ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
          >
            <span class="material-symbols-outlined text-[14px]">{{ skill.gapScore > 0 ? 'priority_high' : skill.gapScore < 0 ? 'inventory_2' : 'balance' }}</span>
            {{ skill.gapScore > 0 ? 'Shortage of ' + skill.gapScore : skill.gapScore < 0 ? 'Surplus of ' + -skill.gapScore : 'Supply matches demand' }}
          </span>
        </div>

        <dl class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          @for (tile of tiles(); track tile.label) {
            <div class="p-3 rounded-xl bg-surface-container-low/70 dark:bg-slate-800/50">
              <dt class="text-[10px] font-bold uppercase tracking-wider text-outline dark:text-slate-400">{{ tile.label }}</dt>
              <dd class="text-xl font-bold text-on-surface dark:text-white mt-0.5 tabular-nums">{{ tile.value }}</dd>
            </div>
          }
        </dl>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section>
            <h3 class="text-[11px] font-bold uppercase tracking-wider text-outline dark:text-slate-400 mb-2">Consultants with {{ skill.skillName }}</h3>
            <ul class="divide-y divide-outline-variant/60 dark:divide-slate-800 rounded-xl border border-outline-variant dark:border-slate-800">
              @for (consultant of skill.consultants; track consultant.id) {
                <li class="flex items-center gap-2.5 p-2.5">
                  <app-avatar [name]="consultant.fullName" size="sm" />
                  <a routerLink="/consultants" [queryParams]="{ id: consultant.id }" class="flex-1 min-w-0 hover:underline">
                    <span class="block text-xs font-semibold text-on-surface dark:text-white truncate">{{ consultant.fullName }}</span>
                    <span class="block text-[10px] text-outline dark:text-slate-400">{{ consultant.seniority }}</span>
                  </a>
                  <app-status-badge [status]="consultant.status" />
                </li>
              } @empty {
                <li class="p-4 text-xs text-center text-outline dark:text-slate-400">Nobody in the talent pool holds this skill yet.</li>
              }
            </ul>
          </section>

          <section>
            <h3 class="text-[11px] font-bold uppercase tracking-wider text-outline dark:text-slate-400 mb-2">Open RFPs requiring it</h3>
            <ul class="divide-y divide-outline-variant/60 dark:divide-slate-800 rounded-xl border border-outline-variant dark:border-slate-800">
              @for (rfp of skill.rfps; track rfp.id) {
                <li class="flex items-center justify-between gap-2 p-2.5">
                  <a routerLink="/clients" [queryParams]="{ id: rfp.clientId }" class="min-w-0 hover:underline">
                    <span class="block text-xs font-semibold text-on-surface dark:text-white truncate">{{ rfp.title }}</span>
                    <span class="block text-[10px] text-outline dark:text-slate-400">{{ rfp.clientName }}</span>
                  </a>
                  <a
                    routerLink="/pitch-generator"
                    [queryParams]="{ clientId: rfp.clientId, rfpId: rfp.id, consultantId: bestAvailable()?.id }"
                    class="shrink-0 px-2 py-1 rounded-md text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                  >
                    Pitch
                  </a>
                </li>
              } @empty {
                <li class="p-4 text-xs text-center text-outline dark:text-slate-400">No open RFP asks for this skill.</li>
              }
            </ul>
          </section>
        </div>

        @if (relatedUpskilling().length) {
          <section>
            <h3 class="text-[11px] font-bold uppercase tracking-wider text-outline dark:text-slate-400 mb-2">Upskilling candidates</h3>
            <ul class="space-y-2">
              @for (suggestion of relatedUpskilling(); track suggestion.consultantId) {
                <li class="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 text-xs">
                  <span class="text-on-surface dark:text-slate-200">
                    <strong>{{ suggestion.consultantName }}</strong> already covers {{ suggestion.readiness }}% of
                    “{{ suggestion.rfpTitle }}” ({{ suggestion.clientName }})
                  </span>
                  <a routerLink="/consultants" [queryParams]="{ id: suggestion.consultantId }" class="font-semibold text-secondary-blue dark:text-blue-400 hover:underline">Profile</a>
                </li>
              }
            </ul>
          </section>
        }
      </div>

      <ng-container modal-footer>
        <a routerLink="/consultants" [queryParams]="{ q: skill.skillName }" class="btn-secondary">
          <span class="material-symbols-outlined text-[16px]">person_search</span>Search directory
        </a>
        <button type="button" (click)="closed.emit()" class="btn-primary">Close</button>
      </ng-container>
    </app-modal>
  `,
})
export class SkillDetailModalComponent {
  readonly metric = input.required<SkillDemandMetric>();
  readonly upskilling = input<readonly UpskillingSuggestion[]>([]);
  readonly closed = output<void>();

  protected readonly tiles = computed(() => {
    const m = this.metric();
    return [
      { label: 'On bench', value: m.benchConsultantsCount },
      { label: 'Ending soon', value: m.endingSoonCount },
      { label: 'On mission', value: m.activeConsultantsCount },
      { label: 'Open RFPs', value: m.openRfpCount },
    ];
  });

  /** First bench (then ending-soon) consultant, used to prefill pitches. */
  protected readonly bestAvailable = computed(
    () =>
      this.metric().consultants.find((c) => c.status === 'on_bench') ??
      this.metric().consultants.find((c) => c.status === 'ending_soon') ??
      null,
  );

  protected readonly relatedUpskilling = computed(() =>
    this.upskilling().filter((s) => s.targetSkills.some((skill) => skill.toLowerCase() === this.metric().skillName.toLowerCase())),
  );
}
