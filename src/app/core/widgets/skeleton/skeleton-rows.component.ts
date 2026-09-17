import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const COLUMN_WIDTHS = ['65%', '45%', '55%', '75%', '40%', '50%'];

/**
 * Table loading placeholder. The host is a real `<tbody>`: a custom element inside a table would be
 * moved out of it by the HTML parser, breaking hydration of server-rendered pages (NG0500).
 *
 * Usage: `<tbody appSkeletonRows [rows]="6" [columns]="7"></tbody>`
 */
@Component({
  selector: 'tbody[appSkeletonRows]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    @for (row of rowsArray(); track $index) {
      <tr class="border-b border-outline-variant/40 dark:border-slate-800/40 animate-pulse">
        @for (col of columnsArray(); track $index) {
          <td class="px-5 py-4">
            <div class="h-3.5 rounded bg-slate-200/80 dark:bg-slate-800/80" [style.width]="widths[$index % widths.length]"></div>
          </td>
        }
      </tr>
    }
  `,
})
export class SkeletonRowsComponent {
  readonly rows = input<number>(5);
  readonly columns = input<number>(6);

  protected readonly widths = COLUMN_WIDTHS;
  protected readonly rowsArray = computed(() => Array.from({ length: Math.max(1, this.rows()) }));
  protected readonly columnsArray = computed(() => Array.from({ length: Math.max(1, this.columns()) }));
}
