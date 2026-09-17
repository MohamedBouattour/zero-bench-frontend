import { ChangeDetectionStrategy, Component, OnInit, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../core/widgets/modal/modal.component';
import { CLIENT_STATUS_OPTIONS, ClientAccount, ClientPayload, ClientStatus } from '../models/customer.model';

@Component({
  selector: 'app-client-form-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ModalComponent],
  template: `
    <app-modal
      [open]="true"
      [icon]="client() ? 'edit' : 'add_business'"
      [title]="client() ? 'Edit ' + client()!.name : 'Add client account'"
      subtitle="Account details and main decision-maker."
      [dismissible]="!isSaving()"
      (closed)="closed.emit()"
    >
      <form id="client-form" [formGroup]="form" (ngSubmit)="submit()" class="grid grid-cols-1 sm:grid-cols-2 gap-4" novalidate>
        <label class="block sm:col-span-2">
          <span class="field-label">Company name *</span>
          <input formControlName="name" class="field-input" [class.field-invalid]="invalid('name')" autofocus />
          @if (invalid('name')) {
            <span class="field-error">Company name is required.</span>
          }
        </label>
        <label class="block">
          <span class="field-label">Industry *</span>
          <input formControlName="industry" class="field-input" [class.field-invalid]="invalid('industry')" placeholder="e.g. Retail Banking" />
          @if (invalid('industry')) {
            <span class="field-error">Industry is required.</span>
          }
        </label>
        <label class="block">
          <span class="field-label">Status</span>
          <select formControlName="status" class="field-input">
            @for (option of statusOptions; track option.value) {
              <option [value]="option.value">{{ option.label }}</option>
            }
          </select>
        </label>
        <label class="block">
          <span class="field-label">City</span>
          <input formControlName="city" class="field-input" />
        </label>
        <label class="block">
          <span class="field-label">Contact name</span>
          <input formControlName="contactName" class="field-input" />
        </label>
        <label class="block sm:col-span-2">
          <span class="field-label">Contact email</span>
          <input formControlName="contactEmail" type="email" class="field-input" [class.field-invalid]="invalid('contactEmail')" />
          @if (invalid('contactEmail')) {
            <span class="field-error">Enter a valid email address.</span>
          }
        </label>
      </form>

      <ng-container modal-footer>
        <button type="button" (click)="closed.emit()" [disabled]="isSaving()" class="btn-secondary">Cancel</button>
        <button type="submit" form="client-form" [disabled]="isSaving()" class="btn-primary">
          {{ isSaving() ? 'Saving…' : client() ? 'Save changes' : 'Create client' }}
        </button>
      </ng-container>
    </app-modal>
  `,
})
export class ClientFormModalComponent implements OnInit {
  readonly client = input<ClientAccount | null>(null);
  readonly isSaving = input<boolean>(false);

  readonly save = output<ClientPayload>();
  readonly closed = output<void>();

  protected readonly statusOptions = CLIENT_STATUS_OPTIONS;
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    industry: ['', Validators.required],
    status: this.fb.control<ClientStatus>('prospect'),
    city: [''],
    contactName: [''],
    contactEmail: ['', Validators.email],
  });

  ngOnInit(): void {
    const client = this.client();
    if (client) {
      const { name, industry, status, city, contactName, contactEmail } = client;
      this.form.reset({ name, industry, status, city, contactName, contactEmail });
    }
  }

  protected invalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && control.touched;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.save.emit({
      name: value.name.trim(),
      industry: value.industry.trim(),
      status: value.status,
      city: value.city.trim(),
      contactName: value.contactName.trim(),
      contactEmail: value.contactEmail.trim(),
    });
  }
}
