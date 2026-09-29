import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CUSTOMER_TYPES, CustomerPayload, CustomerType } from '../../core/models/customer.model';
import { COUNTRIES } from '../../core/data/countries';
import { CustomerService } from '../../core/services/customer';
import { ToastService } from '../../core/services/toast';
import { FormField } from '../../shared/form-field/form-field';
import { FormSelect } from '../../shared/form-select/form-select';
import { PageHeader } from '../../shared/page-header/page-header';

/**
 * Reference form screen: one component for both create and edit.
 * The id comes from the route (withComponentInputBinding is on in app.config).
 */
@Component({
  selector: 'app-customer-form',
  imports: [ReactiveFormsModule, FormField, FormSelect, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './customer-form.html',
})
export class CustomerForm {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CustomerService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  /** Route parameter. Empty when creating. */
  readonly id = input<string>('');

  protected readonly customerTypes = CUSTOMER_TYPES;
  protected readonly countries = COUNTRIES;

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly isEdit = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    customerCode: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{3}-\d{4}$/)]],
    customerName: ['', [Validators.required, Validators.maxLength(120)]],
    customerType: ['' as CustomerType | '', [Validators.required]],
    country: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    creditLimit: [null as number | null, [Validators.min(0)]],
  });

  constructor() {
    queueMicrotask(() => this.init());
  }

  private init(): void {
    const id = Number(this.id());
    if (!id) return;

    this.isEdit.set(true);
    this.loading.set(true);
    this.service.getById(id).subscribe({
      next: (customer) => {
        this.form.patchValue({
          customerCode: customer.customerCode,
          customerName: customer.customerName,
          customerType: customer.customerType,
          country: customer.country,
          email: customer.email,
          phone: customer.phone ?? '',
          creditLimit: customer.creditLimit,
        });
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('We could not find that customer.');
        this.loading.set(false);
      },
    });
  }

  protected save(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);

    const raw = this.form.getRawValue();
    const payload: CustomerPayload = {
      customerCode: raw.customerCode.trim().toUpperCase(),
      customerName: raw.customerName.trim(),
      customerType: raw.customerType as CustomerType,
      country: raw.country,
      email: raw.email.trim(),
      phone: raw.phone.trim() || null,
      creditLimit: raw.creditLimit,
    };

    const request = this.isEdit()
      ? this.service.update(Number(this.id()), payload)
      : this.service.create(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(this.isEdit() ? 'Customer updated.' : 'Customer created.');
        void this.router.navigate(['/customers']);
      },
      error: (err: Error) => {
        this.saving.set(false);
        // Server-side problems are shown on the field they belong to.
        if (err.message.includes('customer code')) {
          this.form.controls.customerCode.setErrors({ server: err.message });
          this.form.controls.customerCode.markAsTouched();
        } else {
          this.toast.error(err.message);
        }
      },
    });
  }

  protected cancel(): void {
    void this.router.navigate(['/customers']);
  }
}
