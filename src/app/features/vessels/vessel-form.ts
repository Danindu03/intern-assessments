import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { COUNTRIES } from '../../core/data/countries';
import { VesselPayload, VESSEL_TYPES, VesselType } from '../../core/models/vessel.model';
import { VesselService } from '../../core/services/vessel';
import { ToastService } from '../../core/services/toast';
import { FormField } from '../../shared/form-field/form-field';
import { FormSelect } from '../../shared/form-select/form-select';
import { PageHeader } from '../../shared/page-header/page-header';

@Component({
  selector: 'app-vessel-form',
  imports: [ReactiveFormsModule, FormField, FormSelect, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vessel-form.html',
})
export class VesselForm {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(VesselService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly id = input<string>('');

  protected readonly vesselTypes = VESSEL_TYPES;
  protected readonly countries = COUNTRIES;
  protected readonly currentYear = new Date().getFullYear();

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly isEdit = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    vesselName: ['', [Validators.required, Validators.maxLength(120)]],
    imoNumber: ['', [Validators.required, Validators.pattern(/^\d{7}$/)]],
    vesselType: ['' as VesselType | '', [Validators.required]],
    flagCountry: ['', [Validators.required]],
    grossTonnage: [null as number | null, [Validators.required, Validators.min(1)]],
    yearBuilt: [
      null as number | null,
      [
        Validators.required,
        Validators.min(1900),
        Validators.max(this.currentYear),
      ],
    ],
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
      next: (vessel) => {
        this.form.patchValue({
          vesselName: vessel.vesselName,
          imoNumber: vessel.imoNumber,
          vesselType: vessel.vesselType,
          flagCountry: vessel.flagCountry,
          grossTonnage: vessel.grossTonnage,
          yearBuilt: vessel.yearBuilt,
        });

        this.loading.set(false);
      },

      error: () => {
        this.loadError.set('We could not find that vessel.');
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

    const payload: VesselPayload = {
      vesselName: raw.vesselName.trim(),
      imoNumber: raw.imoNumber.trim(),
      vesselType: raw.vesselType as VesselType,
      flagCountry: raw.flagCountry,
      grossTonnage: Number(raw.grossTonnage),
      yearBuilt: Number(raw.yearBuilt),
    };

    const request = this.isEdit()
      ? this.service.update(Number(this.id()), payload)
      : this.service.create(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);

        this.toast.success(
          this.isEdit() ? 'Vessel updated.' : 'Vessel created.',
        );

        void this.router.navigate(['/vessels']);
      },

      error: (err: Error) => {
        this.saving.set(false);

        if (err.message.includes('IMO')) {
          this.form.controls.imoNumber.setErrors({
            server: err.message,
          });

          this.form.controls.imoNumber.markAsTouched();
        } else {
          this.toast.error(err.message);
        }
      },
    });
  }

  protected cancel(): void {
    void this.router.navigate(['/vessels']);
  }
}