import { ChangeDetectionStrategy, Component, TemplateRef, computed, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export interface ColumnDef<T> {
  /** Header text. */
  header: string;
  /** How to read the cell value from a row. */
  value: (row: T) => string | number | null;
  /** Optional extra class, for example 'text-end' for numbers. */
  align?: 'start' | 'end';
  /** Hide this column on narrow screens. */
  hideOnMobile?: boolean;
}

/**
 * The table used on every list screen: header, rows, empty state and paging.
 * Row actions are passed in with the "actions" content slot.
 */
@Component({
  selector: 'app-data-table',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable<T> {
  readonly columns = input.required<ColumnDef<T>[]>();
  readonly rows = input.required<readonly T[]>();
  readonly loading = input<boolean>(false);
  readonly error = input<string | null>(null);
  readonly emptyMessage = input<string>('Nothing to show yet.');
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly totalCount = input.required<number>();

  /** Template rendered in the actions cell. Receives the row as $implicit. */
  readonly rowActions = input<TemplateRef<{ $implicit: T }> | null>(null);

  readonly pageChange = output<number>();
  readonly retry = output<void>();

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize())));
  readonly firstRow = computed(() => (this.totalCount() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1));
  readonly lastRow = computed(() => Math.min(this.page() * this.pageSize(), this.totalCount()));
  readonly skeletonRows = computed(() => Array.from({ length: 5 }, (_, i) => i));

  protected go(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.page()) {
      this.pageChange.emit(page);
    }
  }
}
