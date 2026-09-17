import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loadingService.isLoading()) {
      <div
        class="fixed top-0 left-0 right-0 h-1 z-50 overflow-hidden bg-slate-200/60 dark:bg-slate-800/60 pointer-events-none"
        role="progressbar"
        aria-label="Application loading"
        aria-busy="true"
      >
        <div
          class="h-full w-full bg-gradient-to-r from-secondary-blue via-indigo-500 to-secondary-blue animate-pulse"
        ></div>
      </div>
    }
  `,
})
export class LoadingBarComponent {
  protected readonly loadingService = inject(LoadingService);
}
