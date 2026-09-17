import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  input,
  output,
  viewChild,
} from '@angular/core';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

let nextModalId = 0;

/**
 * Accessible modal built on the native `<dialog>` element (focus trap, top layer, inert background).
 * Controlled component: the parent owns `open` and reacts to `closed` (Escape, backdrop, close button).
 */
@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog
      #dialog
      class="modal-dialog m-auto w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] p-0 overflow-hidden rounded-2xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 text-on-surface dark:text-slate-100 shadow-2xl open:flex flex-col backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm"
      [class]="sizeClass()"
      [attr.aria-labelledby]="titleId"
      (cancel)="onCancel($event)"
      (pointerdown)="pointerDownOnBackdrop = $event.target === $event.currentTarget"
      (click)="onDialogClick($event)"
    >
      @if (open()) {
        <header
          class="flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 pb-4 border-b border-outline-variant/70 dark:border-slate-800"
        >
          <div class="flex items-start gap-3 min-w-0">
            @if (icon()) {
              <div
                class="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center bg-blue-50 text-secondary-blue dark:bg-blue-950/50 dark:text-blue-400"
              >
                <span class="material-symbols-outlined text-[20px]">{{ icon() }}</span>
              </div>
            }
            <div class="min-w-0">
              <h2 [id]="titleId" class="text-base font-bold tracking-tight text-on-surface dark:text-white">
                {{ title() }}
              </h2>
              @if (subtitle()) {
                <p class="text-xs text-outline dark:text-slate-400 mt-0.5">{{ subtitle() }}</p>
              }
            </div>
          </div>
          @if (dismissible()) {
            <button
              type="button"
              (click)="closed.emit()"
              class="p-1.5 -mr-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-low dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              aria-label="Close dialog"
            >
              <span class="material-symbols-outlined text-[20px] block">close</span>
            </button>
          }
        </header>

        <div class="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-5">
          <ng-content />
        </div>

        <footer
          class="empty:hidden px-5 sm:px-6 py-3.5 border-t border-outline-variant/70 dark:border-slate-800 bg-surface-bright/60 dark:bg-slate-900/60 flex flex-wrap items-center justify-end gap-2"
        ><ng-content select="[modal-footer]" /></footer>
      }
    </dialog>
  `,
})
export class ModalComponent {
  readonly open = input<boolean>(false);
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly icon = input<string>();
  readonly size = input<ModalSize>('md');
  readonly dismissible = input<boolean>(true);

  readonly closed = output<void>();

  protected readonly titleId = `app-modal-title-${nextModalId++}`;
  protected pointerDownOnBackdrop = false;

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly sizeClass = computed(() => {
    switch (this.size()) {
      case 'sm':
        return 'max-w-md';
      case 'lg':
        return 'max-w-3xl';
      case 'xl':
        return 'max-w-5xl';
      default:
        return 'max-w-xl';
    }
  });

  constructor() {
    // Runs in the browser only, after the content has been rendered.
    afterRenderEffect(() => {
      const dialog = this.dialogRef().nativeElement;
      if (this.open() && !dialog.open) {
        dialog.showModal();
      } else if (!this.open() && dialog.open) {
        dialog.close();
      }
    });
  }

  protected onCancel(event: Event): void {
    // Escape: let the parent decide by updating `open`.
    event.preventDefault();
    if (this.dismissible()) this.closed.emit();
  }

  protected onDialogClick(event: MouseEvent): void {
    const clickedBackdrop = event.target === event.currentTarget && this.pointerDownOnBackdrop;
    if (clickedBackdrop && this.dismissible()) this.closed.emit();
  }
}
