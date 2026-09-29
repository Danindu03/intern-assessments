import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Used when a page or panel has nothing to show. */
@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
})
export class EmptyState {
  readonly icon = input<string>('ri-inbox-line');
  readonly title = input.required<string>();
  readonly message = input<string>('');
}
