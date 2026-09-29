import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast';

/** Sits once in the shell and shows whatever ToastService pushes. */
@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class ToastHost {
  private readonly service = inject(ToastService);
  protected readonly toasts = this.service.toasts;

  protected dismiss(id: number): void {
    this.service.dismiss(id);
  }

  protected icon(kind: string): string {
    if (kind === 'success') return 'ri-checkbox-circle-line';
    if (kind === 'error') return 'ri-error-warning-line';
    return 'ri-information-line';
  }
}
