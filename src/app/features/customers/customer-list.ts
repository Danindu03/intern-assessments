import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Customer, CUSTOMER_TYPES } from '../../core/models/customer.model';
import { ListQuery, StatusFilter } from '../../core/models/common';
import { CustomerService } from '../../core/services/customer';
import { ToastService } from '../../core/services/toast';
import { ColumnDef, DataTable } from '../../shared/data-table/data-table';
import { PageHeader } from '../../shared/page-header/page-header';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

/**
 * Reference list screen. The vessel list should work the same way:
 * search, filters, paging, row actions and the three states below.
 */
@Component({
  selector: 'app-customer-list',
  imports: [FormsModule, RouterLink, DataTable, PageHeader, ConfirmDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.scss',
})
export class CustomerList {
  private readonly service = inject(CustomerService);
  private readonly toast = inject(ToastService);

  protected readonly customerTypes = CUSTOMER_TYPES;

  protected readonly rows = signal<Customer[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly search = signal('');
  protected readonly typeFilter = signal<string>('');
  protected readonly statusFilter = signal<StatusFilter>('all');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;

  protected readonly pendingDeactivate = signal<Customer | null>(null);
  protected readonly deactivating = signal(false);

  private searchTimer?: ReturnType<typeof setTimeout>;

  protected readonly columns: ColumnDef<Customer>[] = [
    { header: 'Code', value: (row) => row.customerCode },
    { header: 'Customer', value: (row) => row.customerName },
    { header: 'Type', value: (row) => row.customerType, hideOnMobile: true },
    { header: 'Country', value: (row) => row.country, hideOnMobile: true },
    { header: 'Email', value: (row) => row.email, hideOnMobile: true },
    {
      header: 'Credit limit',
      value: (row) => (row.creditLimit === null ? '—' : row.creditLimit.toLocaleString('en-US')),
      align: 'end',
      hideOnMobile: true,
    },
    {
      header: 'Status',
      value: (row) => (row.isActive ? 'Active' : 'Inactive'),
      statusBadge: true,
    },
  ];

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    const query: ListQuery = {
      search: this.search(),
      status: this.statusFilter(),
      page: this.page(),
      pageSize: this.pageSize,
    };

    this.service.list(query).subscribe({
      next: (result) => {
        // The type filter is applied here to keep the sample service simple.
        const filtered = this.typeFilter()
          ? result.items.filter((c) => c.customerType === this.typeFilter())
          : result.items;
        this.rows.set(filtered);
        this.totalCount.set(result.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('We could not load customers. Please try again.');
        this.loading.set(false);
      },
    });
  }

  /** Waits until typing stops before calling the service. */
  protected onSearchInput(value: string): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.search.set(value);
      this.page.set(1);
      this.load();
    }, 300);
  }

  protected onFilterChange(): void {
    this.page.set(1);
    this.load();
  }

  protected clearFilters(): void {
    clearTimeout(this.searchTimer);
      this.search.set('');
      this.typeFilter.set('');
      this.statusFilter.set('all');
      this.page.set(1);
      this.load();
  }

  protected onPageChange(page: number): void {
    this.page.set(page);
    this.load();
  }

  protected askDeactivate(row: Customer): void {
    this.pendingDeactivate.set(row);
  }

  protected confirmDeactivate(): void {
    const target = this.pendingDeactivate();
    if (!target) return;

    this.deactivating.set(true);
    this.service.setActive(target.customerId, false).subscribe({
      next: () => {
        this.deactivating.set(false);
        this.pendingDeactivate.set(null);
        this.toast.success(`${target.customerName} is now inactive.`);
        this.load();
      },
      error: () => {
        this.deactivating.set(false);
        this.toast.error('We could not update that customer.');
      },
    });
  }

  protected reactivate(row: Customer): void {
    this.service.setActive(row.customerId, true).subscribe({
      next: () => {
        this.toast.success(`${row.customerName} is active again.`);
        this.load();
      },
      error: () => this.toast.error('We could not update that customer.'),
    });
  }
}
