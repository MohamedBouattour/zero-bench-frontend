import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AvatarComponent } from '../../../core/widgets/avatar/avatar.component';
import { WORKING_DAYS_PER_MONTH } from '../../consultants/models/consultant.model';
import { PLACEMENT_STAGE_LABELS, PlacementOpportunity, PlacementStage } from '../models/placement.model';

const FLOW: readonly PlacementStage[] = ['matched', 'pitch_sent', 'interviewing', 'signed'];
const DAY_MS = 86_400_000;

@Component({
  selector: 'app-placement-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, AvatarComponent],
  host: { class: 'block' },
  template: `
    @let o = opportunity();
    <article
      class="group p-3 rounded-lg border bg-surface-container-lowest dark:bg-slate-800/60 text-xs space-y-2 shadow-xs transition-all cursor-grab active:cursor-grabbing hover:shadow-md hover:border-secondary-blue/40 dark:hover:border-blue-500/40"
      [class]="dragging() ? 'opacity-40 border-dashed border-secondary-blue dark:border-blue-500' : 'border-outline-variant/70 dark:border-slate-700/70'"
    >
      <div class="flex items-start gap-2">
        <app-avatar [name]="o.consultantName" size="xs" />
        <div class="flex-1 min-w-0">
          <button
            type="button"
            (click)="open.emit(o)"
            class="block w-full text-left font-bold text-on-surface dark:text-white truncate hover:text-secondary-blue dark:hover:text-blue-400 focus:outline-none focus-visible:underline"
            [attr.aria-label]="'Open opportunity ' + o.consultantName + ' at ' + o.clientName"
          >
            {{ o.consultantName }}
          </button>
          <p class="text-[11px] text-outline dark:text-slate-400 truncate">{{ o.roleTitle }}</p>
        </div>
        @if (o.matchScore !== undefined) {
          <span class="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold" [class]="scoreClass()">{{ o.matchScore }}%</span>
        }
      </div>

      <div class="flex items-center gap-1.5 text-[11px] text-on-surface-variant dark:text-slate-300">
        <span class="material-symbols-outlined text-[14px] text-outline" aria-hidden="true">domain</span>
        <span class="truncate">{{ o.clientName }}</span>
      </div>

      @if (o.note) {
        <p class="text-[11px] leading-snug text-outline dark:text-slate-400 line-clamp-2">{{ o.note }}</p>
      }

      <div class="flex items-center justify-between pt-1.5 border-t border-outline-variant/50 dark:border-slate-700/60">
        <span class="text-[10px] text-outline dark:text-slate-500" [title]="'Monthly value ' + (o.tjm * workingDays | currency: 'EUR' : 'symbol' : '1.0-0')">
          {{ daysInStage() === 0 ? 'Today' : daysInStage() + 'd in stage' }} · {{ o.tjm | currency: 'EUR' : 'symbol' : '1.0-0' }}/d
        </span>
        <div class="flex items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity">
          @if (o.stage === 'lost') {
            <button type="button" (click)="move.emit('matched')" class="px-1.5 py-0.5 rounded text-[10px] font-semibold text-secondary-blue dark:text-blue-400 hover:bg-surface-container-low dark:hover:bg-slate-700">
              Reopen
            </button>
          } @else {
            @if (previousStage(); as prev) {
              <button
                type="button"
                (click)="move.emit(prev)"
                class="p-0.5 rounded text-outline hover:text-on-surface hover:bg-surface-container-low dark:hover:bg-slate-700 dark:hover:text-white"
                [attr.aria-label]="'Move back to ' + labels[prev]"
                [title]="'Move back to ' + labels[prev]"
              >
                <span class="material-symbols-outlined text-[16px] block">chevron_left</span>
              </button>
            }
            @if (nextStage(); as next) {
              <button
                type="button"
                (click)="move.emit(next)"
                class="p-0.5 rounded text-outline hover:text-on-surface hover:bg-surface-container-low dark:hover:bg-slate-700 dark:hover:text-white"
                [attr.aria-label]="'Advance to ' + labels[next]"
                [title]="'Advance to ' + labels[next]"
              >
                <span class="material-symbols-outlined text-[16px] block">chevron_right</span>
              </button>
            }
          }
        </div>
      </div>
    </article>
  `,
})
export class PlacementCardComponent {
  readonly opportunity = input.required<PlacementOpportunity>();
  readonly dragging = input<boolean>(false);

  readonly open = output<PlacementOpportunity>();
  readonly move = output<PlacementStage>();

  protected readonly labels = PLACEMENT_STAGE_LABELS;
  protected readonly workingDays = WORKING_DAYS_PER_MONTH;

  protected readonly previousStage = computed(() => FLOW[FLOW.indexOf(this.opportunity().stage) - 1] ?? null);
  protected readonly nextStage = computed(() => {
    const index = FLOW.indexOf(this.opportunity().stage);
    return index >= 0 ? (FLOW[index + 1] ?? null) : null;
  });

  protected readonly daysInStage = computed(() => {
    const { history, updatedAt } = this.opportunity();
    const since = history.at(-1)?.at ?? updatedAt;
    return Math.max(0, Math.floor((Date.now() - new Date(since).getTime()) / DAY_MS));
  });

  protected readonly scoreClass = computed(() => {
    const score = this.opportunity().matchScore ?? 0;
    if (score >= 85) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300';
    if (score >= 70) return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300';
    return 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300';
  });
}
