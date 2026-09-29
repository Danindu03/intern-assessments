import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { SEED_CUSTOMERS } from '../../core/data/seed-customers';
import { SEED_VESSELS } from '../../core/data/seed-vessels';
import { PageHeader } from '../../shared/page-header/page-header';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly auth = inject(Auth);
  protected readonly user = this.auth.user;

  protected readonly stats = signal([
    {
      label: 'Customers',
      value: SEED_CUSTOMERS.length,
      active: SEED_CUSTOMERS.filter((c) => c.isActive).length,
      icon: 'ri-group-line',
      route: '/customers',
    },
    {
      label: 'Vessels',
      value: SEED_VESSELS.length,
      active: SEED_VESSELS.filter((v) => v.isActive).length,
      icon: 'ri-ship-line',
      route: '/vessels',
    },
  ]);
}
