import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/**
 * Wraps one input: label, control, hint and validation message.
 * Use this instead of writing <label> and <input> by hand.
 *
 * <app-form-field label="Vessel name" [control]="form.controls.vesselName">
 *   <input formControlName="vesselName" class="form-control" />
 * </app-form-field>
 *
 * The app runs zoneless, so this component listens to the control's own
 * events and keeps the state in a signal. Without that, the message would
 * not appear when the control is touched or its value changes.
 */
@Component({
  selector: 'app-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
})
export class FormField {
  readonly label = input.required<string>();
  readonly control = input.required<AbstractControl>();
  readonly hint = input<string>('');
  readonly required = input<boolean>(false);

  /** Bumped whenever the control changes, so the computeds below re-run. */
  private readonly version = signal(0);

  constructor() {
    effect((onCleanup) => {
      const control = this.control();
      const sub = control.events.subscribe(() => this.version.update((v) => v + 1));
      onCleanup(() => sub.unsubscribe());
    });
  }

  readonly showError = computed(() => {
    this.version();
    const control = this.control();
    return control.invalid && (control.touched || control.dirty);
  });

  /** Turns the first failing validator into a sentence people can act on. */
  readonly errorText = computed(() => {
    this.version();
    const errors = this.control().errors;
    if (!errors) return '';
    if (errors['required']) return `${this.label()} is required.`;
    if (errors['email']) return 'Enter a valid email address.';
    if (errors['minlength']) return `Use at least ${errors['minlength'].requiredLength} characters.`;
    if (errors['maxlength']) return `Use no more than ${errors['maxlength'].requiredLength} characters.`;
    if (errors['min']) return `Enter ${errors['min'].min} or more.`;
    if (errors['max']) return `Enter ${errors['max'].max} or less.`;
    if (errors['pattern']) return `${this.label()} is not in the right format.`;
    if (errors['server']) return errors['server'] as string;
    return 'Please check this field.';
  });
}
