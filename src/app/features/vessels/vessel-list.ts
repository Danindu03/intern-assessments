import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Vessel, VESSEL_TYPES } from '../../core/models/vessel.model';
import { ListQuery, StatusFilter } from '../../core/models/common';
import { VesselService } from '../../core/services/vessel';
import { ToastService } from '../../core/services/toast';
import { ColumnDef, DataTable } from '../../shared/data-table/data-table';
import { PageHeader } from '../../shared/page-header/page-header';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-vessel-list',
  imports: [FormsModule, RouterLink, DataTable, PageHeader, ConfirmDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vessel-list.html',
  styleUrl: './vessel-list.scss',
})
export class VesselList {
  private readonly service = inject(VesselService);
  private readonly toast = inject(ToastService);

  protected readonly vesselTypes = VESSEL_TYPES;

  protected readonly rows = signal<Vessel[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly search = signal('');
  protected readonly typeFilter = signal<string>('');
  protected readonly statusFilter = signal<StatusFilter>('all');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;

  protected readonly pendingDeactivate = signal<Vessel | null>(null);
  protected readonly deactivating = signal(false);

  private searchTimer?: ReturnType<typeof setTimeout>;

  protected readonly columns: ColumnDef<Vessel>[] = [
    { header: 'Vessel name', value: (row) => row.vesselName },
    { header: 'IMO', value: (row) => row.imoNumber },
    { header: 'Type', value: (row) => row.vesselType, hideOnMobile: true },
    { header: 'Flag', value: (row) => row.flagCountry, hideOnMobile: true },
    {
      header: 'Gross tonnage',
      value: (row) =>
        row.grossTonnage.toLocaleString('en-US', {
          maximumFractionDigits: 2,
        }),
      align: 'end',
      hideOnMobile: true,
    },
    {
      header: 'Year built',
      value: (row) => row.yearBuilt,
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
        const filtered = this.typeFilter()
          ? result.items.filter(
              (v) => v.vesselType === this.typeFilter(),
            )
          : result.items;

        this.rows.set(filtered);
        this.totalCount.set(result.totalCount);
        this.loading.set(false);
      },

      error: () => {
        this.error.set(
          'We could not load vessels. Please try again.',
        );
        this.loading.set(false);
      },
    });
  }

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

  protected askDeactivate(row: Vessel): void {
    this.pendingDeactivate.set(row);
  }

  protected confirmDeactivate(): void {
    const target = this.pendingDeactivate();

    if (!target) return;

    this.deactivating.set(true);

    this.service.setActive(target.vesselId, false).subscribe({
      next: () => {
        this.deactivating.set(false);
        this.pendingDeactivate.set(null);

        this.toast.success(
          `${target.vesselName} is now inactive.`,
        );

        this.load();
      },

      error: () => {
        this.deactivating.set(false);

        this.toast.error(
          'We could not update that vessel.',
        );
      },
    });
  }

  protected reactivate(row: Vessel): void {
    this.service.setActive(row.vesselId, true).subscribe({
      next: () => {
        this.toast.success(
          `${row.vesselName} is active again.`,
        );

        this.load();
      },

      error: () =>
        this.toast.error(
          'We could not update that vessel.',
        ),
    });
  }
}