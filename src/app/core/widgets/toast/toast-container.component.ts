import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  inject,
  viewChild,
} from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from './toast.component';

@Component({
  selector: 'app-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToastComponent],
  template: `
    <!-- Rendered as a manual popover so toasts stay visible above open modal <dialog>s (top layer). -->
    <div
      #stack
      popover="manual"
      class="fixed inset-auto bottom-5 right-5 m-0 p-0 border-0 bg-transparent overflow-visible flex-col gap-2.5 max-w-sm w-[calc(100%-2.5rem)] pointer-events-none [&:popover-open]:flex"
      aria-live="polite"
      aria-atomic="false"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <app-toast [toast]="toast" (dismiss)="toastService.dismiss($event)" />
      }
    </div>
  `,
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);
  private readonly stack = viewChild.required<ElementRef<HTMLElement>>('stack');

  constructor() {
    afterRenderEffect(() => {
      const element = this.stack().nativeElement;
      const hasToasts = this.toastService.toasts().length > 0;
      if (typeof element.showPopover !== 'function') return;

      if (element.matches(':popover-open')) element.hidePopover();
      // Re-opening moves the stack to the top of the top layer, above any dialog opened meanwhile.
      if (hasToasts) element.showPopover();
    });
  }
}
