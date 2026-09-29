import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeader } from '../../shared/page-header/page-header';
import { EmptyState } from '../../shared/empty-state/empty-state';

/**
 * TODO (intern task): build the vessel register here.
 *
 * Use features/customers/customer-list.ts as your reference. It already shows
 * the pattern for search, filters, paging, row actions, the confirm dialog
 * and the loading, empty and error states.
 *
 * VesselService (core/services/vessel.ts) is ready and has the same methods
 * as CustomerService, so you should not need to touch it.
 *
 * Columns we expect: vessel name, IMO, type, flag, gross tonnage, year built,
 * status and the row actions.
 */
@Component({
  selector: 'app-vessel-list',
  imports: [PageHeader, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vessel-list.html',
})
export class VesselList {}
