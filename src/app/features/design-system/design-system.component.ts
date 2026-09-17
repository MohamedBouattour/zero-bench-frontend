import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { StatusBadgeComponent } from '../../core/widgets/status-badge/status-badge.component';
import { StatCardComponent } from '../../core/widgets/stat-card/stat-card.component';
import { AiSparkleCardComponent } from '../../core/widgets/ai-sparkle-card/ai-sparkle-card.component';
import { AvatarComponent } from '../../core/widgets/avatar/avatar.component';
import { DataTableContainerComponent } from '../../core/widgets/data-table/data-table-container.component';
import { ErrorStateComponent } from '../../core/widgets/error-state/error-state.component';
import { ModalComponent } from '../../core/widgets/modal/modal.component';
import { SkeletonComponent } from '../../core/widgets/skeleton/skeleton.component';
import { ToastService } from '../../core/services/toast.service';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-design-system',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    StatusBadgeComponent,
    StatCardComponent,
    AiSparkleCardComponent,
    AvatarComponent,
    DataTableContainerComponent,
    ErrorStateComponent,
    ModalComponent,
    SkeletonComponent,
  ],
  template: `
    <div class="space-y-8 pb-16">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-on-surface dark:text-white">
          Stitch Design Tokens & UI Component Showcase
        </h2>
        <p class="text-xs text-outline dark:text-slate-400 mt-1">
          Reference system conforming 100% to Stitch Project 15147121731840790718 token specifications.
        </p>
      </div>

      <!-- Colors Section -->
      <section class="space-y-3">
        <h3 class="text-sm font-bold uppercase tracking-wider text-outline dark:text-slate-400">
          1. Color Palette & Tonal Layers
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          <div class="p-3 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 space-y-1">
            <div class="h-10 rounded-lg bg-surface-bright border border-outline-variant"></div>
            <span class="text-xs font-bold block text-on-surface dark:text-white">Surface Base</span>
            <span class="text-[10px] text-outline block">#F8F9FF / #0B1120</span>
          </div>

          <div class="p-3 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 space-y-1">
            <div class="h-10 rounded-lg bg-[#0f172a]"></div>
            <span class="text-xs font-bold block text-on-surface dark:text-white">Primary Slate</span>
            <span class="text-[10px] text-outline block">#0F172A</span>
          </div>

          <div class="p-3 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 space-y-1">
            <div class="h-10 rounded-lg bg-secondary-blue"></div>
            <span class="text-xs font-bold block text-on-surface dark:text-white">Electric Blue</span>
            <span class="text-[10px] text-outline block">#0058BE</span>
          </div>

          <div class="p-3 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 space-y-1">
            <div class="h-10 rounded-lg bg-indigo-600"></div>
            <span class="text-xs font-bold block text-on-surface dark:text-white">AI Intelligence</span>
            <span class="text-[10px] text-outline block">#6366F1</span>
          </div>

          <div class="p-3 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 space-y-1">
            <div class="h-10 rounded-lg bg-emerald-500"></div>
            <span class="text-xs font-bold block text-on-surface dark:text-white">On Mission</span>
            <span class="text-[10px] text-outline block">#10B981</span>
          </div>

          <div class="p-3 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 space-y-1">
            <div class="h-10 rounded-lg bg-red-500"></div>
            <span class="text-xs font-bold block text-on-surface dark:text-white">On Bench</span>
            <span class="text-[10px] text-outline block">#EF4444</span>
          </div>
        </div>
      </section>

      <!-- Status Badges Section -->
      <section class="space-y-3">
        <h3 class="text-sm font-bold uppercase tracking-wider text-outline dark:text-slate-400">
          2. Semantic Status Badges
        </h3>
        <div class="flex flex-wrap gap-3 p-4 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900">
          <app-status-badge status="on_bench" />
          <app-status-badge status="on_mission" />
          <app-status-badge status="ending_soon" />
          <app-status-badge status="prospect" />
        </div>
      </section>

      <!-- KPI Stat Cards Section -->
      <section class="space-y-3">
        <h3 class="text-sm font-bold uppercase tracking-wider text-outline dark:text-slate-400">
          3. KPI Stat Cards
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <app-stat-card
            label="Exposure Metric"
            value="€32,400"
            unit="/ mo"
            icon="payments"
            tone="danger"
            trend="+5.2%"
            trendDirection="up-bad"
            [progress]="70"
           />
          <app-stat-card
            label="Team Capacity"
            value="94.2%"
            icon="group"
            tone="success"
            trend="+1.8%"
            trendDirection="up-good"
            [progress]="94"
           />
          <app-stat-card
            label="Mandates Closing"
            value="7"
            unit="deals"
            icon="done_all"
            tone="primary"
            [progress]="50"
           />
          <app-stat-card
            label="AI Matches"
            value="19"
            unit="proposals"
            icon="auto_awesome"
            tone="indigo"
            trend="+8"
            trendDirection="up-good"
            [progress]="85"
           />
        </div>
      </section>

      <!-- Buttons Section -->
      <section class="space-y-3">
        <h3 class="text-sm font-bold uppercase tracking-wider text-outline dark:text-slate-400">
          4. Button Variants & Micro-interactions
        </h3>
        <div class="flex flex-wrap gap-3 p-4 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 items-center">
          <button type="button" class="px-4 py-2 bg-secondary-blue text-white rounded-xl text-xs font-semibold shadow-xs hover:opacity-90 transition-opacity">
            Primary Action
          </button>
          <button type="button" class="px-4 py-2 border border-outline-variant dark:border-slate-700 rounded-xl text-xs font-semibold hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors">
            Outlined Secondary
          </button>
          <button type="button" class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:bg-indigo-700 transition-colors">
            <span class="material-symbols-outlined text-[16px]">auto_awesome</span>
            <span>AI Action</span>
          </button>
          <button type="button" class="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors">
            Urgent Action
          </button>
        </div>
      </section>

      <!-- Glassmorphic AI Showcase -->
      <section class="space-y-3">
        <h3 class="text-sm font-bold uppercase tracking-wider text-outline dark:text-slate-400">
          5. Glassmorphism Proactive Layer
        </h3>
        <app-ai-sparkle-card
          title="Component Showcase Glassmorphic Card"
          description="Features 12px backdrop blur, subtle indigo inner glow, and rounded elevation per BenchZero specifications."
          [matchScore]="98"
          actionLabel="Execute Action"
         />
      </section>

      <!-- Data Table Container Showcase -->
      <section class="space-y-3">
        <h3 class="text-sm font-bold uppercase tracking-wider text-outline dark:text-slate-400">
          6. High-Density Data Table
        </h3>
        <app-data-table-container
          title="Sample Data Density View"
          subtitle="Zebra-striped, supporting Compact vs Comfortable row height"
        >
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-outline-variant dark:border-slate-800 bg-surface-container-low/50 dark:bg-slate-800/40 text-outline dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th class="px-5 py-3">Token Name</th>
                <th class="px-5 py-3">Value</th>
                <th class="px-5 py-3">Category</th>
                <th class="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/60 dark:divide-slate-800/60">
              <tr class="hover:bg-surface-container-low/40 dark:hover:bg-slate-800/30">
                <td class="px-5 py-3.5 font-medium text-on-surface dark:text-white">--color-secondary-blue</td>
                <td class="px-5 py-3.5 font-mono text-outline">#0058BE</td>
                <td class="px-5 py-3.5">Action Brand</td>
                <td class="px-5 py-3.5 text-right"><app-status-badge status="on_mission" customLabel="Active" /></td>
              </tr>
              <tr class="hover:bg-surface-container-low/40 dark:hover:bg-slate-800/30">
                <td class="px-5 py-3.5 font-medium text-on-surface dark:text-white">--color-tertiary-indigo</td>
                <td class="px-5 py-3.5 font-mono text-outline">#6366F1</td>
                <td class="px-5 py-3.5">AI Intelligence</td>
                <td class="px-5 py-3.5 text-right"><app-status-badge status="prospect" customLabel="Ready" /></td>
              </tr>
            </tbody>
          </table>
        </app-data-table-container>
      </section>

      <!-- Toast Notification System Showcase -->
      <section class="space-y-3">
        <h3 class="text-sm font-bold uppercase tracking-wider text-outline dark:text-slate-400">
          7. Toast Notification System
        </h3>
        <div class="p-4 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 space-y-3">
          <p class="text-xs text-outline dark:text-slate-400">
            Click any button below to trigger real-time reactive toast notifications with auto-dismissal and Stitch semantic colors.
          </p>
          <div class="flex flex-wrap gap-2.5">
            <button
              type="button"
              (click)="triggerSuccessToast()"
              class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span class="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Trigger Success Toast</span>
            </button>

            <button
              type="button"
              (click)="triggerErrorToast()"
              class="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span class="material-symbols-outlined text-[16px]">error</span>
              <span>Trigger Error Toast</span>
            </button>

            <button
              type="button"
              (click)="triggerWarningToast()"
              class="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span class="material-symbols-outlined text-[16px]">warning</span>
              <span>Trigger Warning Toast</span>
            </button>

            <button
              type="button"
              (click)="triggerInfoToast()"
              class="px-3.5 py-2 bg-secondary-blue hover:opacity-90 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-opacity shadow-xs"
            >
              <span class="material-symbols-outlined text-[16px]">info</span>
              <span>Trigger Info Toast</span>
            </button>

            <button
              type="button"
              (click)="simulateHttpLoading()"
              class="px-3.5 py-2 border border-secondary-blue text-secondary-blue dark:text-blue-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-secondary-blue/10 transition-colors"
            >
              <span class="material-symbols-outlined text-[16px]">hourglass_top</span>
              <span>Simulate HTTP Loading</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Skeleton & Loading Placeholders Showcase -->
      <section class="space-y-3">
        <h3 class="text-sm font-bold uppercase tracking-wider text-outline dark:text-slate-400">
          8. Atomic Skeleton Placeholders
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Text and Circle Variants -->
          <div class="p-5 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 space-y-4">
            <span class="text-xs font-bold text-on-surface dark:text-white block">Text & Avatar Placeholders</span>
            <div class="flex items-center gap-3">
              <app-skeleton variant="circle" />
              <div class="flex-1 space-y-2">
                <app-skeleton variant="text" width="60%" />
                <app-skeleton variant="text" width="40%" />
              </div>
            </div>
            <div class="pt-2 space-y-2">
              <app-skeleton variant="text" [count]="3" />
            </div>
          </div>

          <!-- Card Variant -->
          <div>
            <span class="text-xs font-bold text-on-surface dark:text-white block mb-2">Card Placeholder</span>
            <app-skeleton variant="card" />
          </div>
        </div>
      </section>

      <!-- Overlays & Feedback -->
      <section class="space-y-3">
        <h3 class="text-sm font-bold uppercase tracking-wider text-outline dark:text-slate-400">
          9. Modal, Avatars & Error States
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-5 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 space-y-4">
            <span class="text-xs font-bold text-on-surface dark:text-white block">Native &lt;dialog&gt; modal & avatars</span>
            <div class="flex items-center gap-2">
              <app-avatar name="Alexandre Martin" size="xs" />
              <app-avatar name="Camille Leroy" size="sm" />
              <app-avatar name="Thomas Bernard" size="md" />
              <app-avatar name="Inès Dupont" size="lg" />
            </div>
            <button type="button" (click)="demoModalOpen.set(true)" class="btn-primary">
              <span class="material-symbols-outlined text-[16px]">open_in_new</span>
              Open demo modal
            </button>
          </div>
          <app-error-state
            title="Consultants could not be loaded"
            message="Unable to reach the server. Check the mock server on port 3001."
            (retry)="triggerInfoToast()"
          />
        </div>
      </section>
    </div>

    <app-modal
      [open]="demoModalOpen()"
      icon="palette"
      title="Demo modal"
      subtitle="Focus trap, Escape, backdrop click and scroll lock come from the native dialog element."
      (closed)="demoModalOpen.set(false)"
    >
      <p class="text-xs leading-relaxed text-on-surface-variant dark:text-slate-300">
        Modals are controlled components: the parent owns <code>open</code> and reacts to <code>closed</code>.
        Toasts render in the top layer too, so they stay visible above an open dialog.
      </p>
      <ng-container modal-footer>
        <button type="button" (click)="triggerSuccessToast()" class="btn-secondary">Toast above modal</button>
        <button type="button" (click)="demoModalOpen.set(false)" class="btn-primary">Got it</button>
      </ng-container>
    </app-modal>
  `,
})
export class DesignSystemComponent {
  protected readonly demoModalOpen = signal(false);

  private readonly toastService = inject(ToastService);
  private readonly loadingService = inject(LoadingService);

  triggerSuccessToast(): void {
    this.toastService.success('Consultant assignment confirmed with BNP Paribas for 6 months.', {
      title: 'Mandate Staffed',
    });
  }

  triggerErrorToast(): void {
    this.toastService.error('Failed to sync TJM rate with accounting service.', {
      title: 'Synchronization Error',
    });
  }

  triggerWarningToast(): void {
    this.toastService.warning('Consultant contract for Camille Leroy will expire in 14 days.', {
      title: 'Contract Ending Soon',
    });
  }

  triggerInfoToast(): void {
    this.toastService.info('AI Matching algorithm has processed 14 new candidates for RFP Staffing.', {
      title: 'Intelligence Pipeline',
    });
  }

  simulateHttpLoading(): void {
    this.loadingService.show();
    this.toastService.info('HTTP Request simulated. Top loading indicator activated.', {
      title: 'HTTP Call Active',
      duration: 2000,
    });
    setTimeout(() => {
      this.loadingService.hide();
      this.toastService.success('HTTP Request completed. Loading bar dismissed.', {
        title: 'Response Received',
      });
    }, 2000);
  }
}
