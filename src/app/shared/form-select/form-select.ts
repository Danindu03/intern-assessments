import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * A select that works with Reactive Forms and keeps the same look as
 * app-form-field. Pass a list of strings, or objects plus the keys to read.
 *
 * <app-form-select formControlName="vesselType" [options]="types" />
 */
@Component({
  selector: 'app-form-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-select.html',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FormSelect), multi: true },
  ],
})
export class FormSelect implements ControlValueAccessor {
  readonly options = input.required<readonly (string | number)[]>();
  readonly placeholder = input<string>('Select...');
  readonly ariaLabel = input<string>('');

  protected readonly value = signal<string | number | null>(null);
  protected readonly disabled = signal(false);
  protected readonly selected = computed(() => this.value() ?? '');

  private onChange: (value: string | number | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | number | null): void { this.value.set(value); }
  registerOnChange(fn: (value: string | number | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }

  protected pick(event: Event): void {
    const raw = (event.target as HTMLSelectElement).value;
    const next = raw === '' ? null : raw;
    this.value.set(next);
    this.onChange(next);
  }

  protected touch(): void {
    this.onTouched();
  }
}
