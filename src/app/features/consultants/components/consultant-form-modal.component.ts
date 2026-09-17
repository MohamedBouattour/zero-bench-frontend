import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ModalComponent } from '../../../core/widgets/modal/modal.component';
import { ClientAccount } from '../../customers/models/customer.model';
import {
  CONSULTANT_SENIORITIES,
  CONSULTANT_STATUS_OPTIONS,
  Consultant,
  ConsultantPayload,
  ConsultantSeniority,
  ConsultantStatus,
} from '../models/consultant.model';

const STAFFED_STATUSES: readonly ConsultantStatus[] = ['on_mission', 'ending_soon'];

const splitList = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

/** A consultant on mission must be attached to a client account. */
function clientRequiredWhenStaffed(group: AbstractControl): ValidationErrors | null {
  const status = group.get('status')?.value as ConsultantStatus;
  const clientId = group.get('clientId')?.value as string;
  return STAFFED_STATUSES.includes(status) && !clientId ? { clientRequired: true } : null;
}

@Component({
  selector: 'app-consultant-form-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ModalComponent],
  template: `
    <app-modal
      [open]="true"
      size="lg"
      [icon]="consultant() ? 'edit' : 'person_add'"
      [title]="consultant() ? 'Edit ' + consultant()!.fullName : 'Add consultant'"
      subtitle="Profile, availability and commercial terms used across matching and pitches."
      [dismissible]="!isSaving()"
      (closed)="closed.emit()"
    >
      <form id="consultant-form" [formGroup]="form" (ngSubmit)="submit()" class="space-y-6" novalidate>
        <!-- Identity -->
        <fieldset class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <legend class="sr-only">Identity</legend>
          <label class="block">
            <span class="field-label">Full name *</span>
            <input formControlName="fullName" autocomplete="off" autofocus class="field-input" [class.field-invalid]="invalid('fullName')" />
            @if (invalid('fullName')) {
              <span class="field-error">Full name is required.</span>
            }
          </label>
          <label class="block">
            <span class="field-label">Job title *</span>
            <input formControlName="title" class="field-input" [class.field-invalid]="invalid('title')" placeholder="e.g. Senior Java Developer" />
            @if (invalid('title')) {
              <span class="field-error">Job title is required.</span>
            }
          </label>
          <label class="block">
            <span class="field-label">Email *</span>
            <input formControlName="email" type="email" class="field-input" [class.field-invalid]="invalid('email')" />
            @if (invalid('email')) {
              <span class="field-error">A valid email is required.</span>
            }
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="block">
              <span class="field-label">Phone</span>
              <input formControlName="phone" type="tel" class="field-input" />
            </label>
            <label class="block">
              <span class="field-label">Location</span>
              <input formControlName="location" class="field-input" />
            </label>
          </div>
        </fieldset>

        <!-- Expertise -->
        <fieldset class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-outline-variant/60 dark:border-slate-800">
          <legend class="sr-only">Expertise</legend>
          <label class="block">
            <span class="field-label">Seniority</span>
            <select formControlName="seniority" class="field-input">
              @for (level of seniorities; track level) {
                <option [value]="level">{{ level }}</option>
              }
            </select>
          </label>
          <label class="block">
            <span class="field-label">Years of experience</span>
            <input formControlName="yearsOfExperience" type="number" min="0" max="50" class="field-input" />
          </label>
          <label class="block">
            <span class="field-label">Primary skill *</span>
            <input formControlName="primarySkill" class="field-input" [class.field-invalid]="invalid('primarySkill')" placeholder="e.g. Angular & NestJS" />
            @if (invalid('primarySkill')) {
              <span class="field-error">Primary skill is required.</span>
            }
          </label>

          <div class="sm:col-span-3">
            <label class="field-label" for="skill-draft">Skills * <span class="font-normal normal-case text-outline">(press Enter to add)</span></label>
            <div
              class="field-input flex flex-wrap items-center gap-1.5 min-h-10 py-1.5!"
              [class.field-invalid]="invalid('skills')"
            >
              @for (skill of skills(); track skill) {
                <span class="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-secondary-blue dark:bg-blue-950/50 dark:text-blue-300">
                  {{ skill }}
                  <button type="button" (click)="removeSkill(skill)" class="rounded hover:bg-blue-100 dark:hover:bg-blue-900" [attr.aria-label]="'Remove ' + skill">
                    <span class="material-symbols-outlined text-[14px] block">close</span>
                  </button>
                </span>
              }
              <input
                id="skill-draft"
                [value]="skillDraft()"
                (input)="skillDraft.set($any($event.target).value)"
                (keydown)="onSkillKeydown($event)"
                (blur)="addSkill()"
                class="flex-1 min-w-24 bg-transparent text-xs focus:outline-none"
                placeholder="TypeScript, Kubernetes…"
              />
            </div>
            @if (invalid('skills')) {
              <span class="field-error">Add at least one skill.</span>
            }
          </div>
        </fieldset>

        <!-- Availability & commercial -->
        <fieldset class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-outline-variant/60 dark:border-slate-800">
          <legend class="sr-only">Availability</legend>
          <label class="block">
            <span class="field-label">Status</span>
            <select formControlName="status" class="field-input">
              @for (option of statusOptions; track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
          </label>
          <label class="block">
            <span class="field-label">Daily rate (TJM, €) *</span>
            <input formControlName="tjm" type="number" min="100" max="3000" step="10" class="field-input" [class.field-invalid]="invalid('tjm')" />
            @if (invalid('tjm')) {
              <span class="field-error">Between €100 and €3,000.</span>
            }
          </label>

          @if (status() === 'on_bench') {
            <label class="block">
              <span class="field-label">Days on bench</span>
              <input formControlName="daysOnBench" type="number" min="0" class="field-input" />
            </label>
          }

          @if (isStaffed()) {
            <label class="block">
              <span class="field-label">Client *</span>
              <select formControlName="clientId" class="field-input" [class.field-invalid]="clientError()">
                <option value="">Select a client…</option>
                @for (client of clients(); track client.id) {
                  <option [value]="client.id">{{ client.name }}</option>
                }
              </select>
              @if (clientError()) {
                <span class="field-error">Select the client of the mission.</span>
              }
            </label>
            <label class="block">
              <span class="field-label">Mission end date</span>
              <input formControlName="missionEndDate" type="date" class="field-input" />
            </label>
          }
        </fieldset>

        <!-- Profile -->
        <fieldset class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-outline-variant/60 dark:border-slate-800">
          <legend class="sr-only">Profile</legend>
          <label class="block">
            <span class="field-label">Languages <span class="font-normal normal-case text-outline">(comma separated)</span></span>
            <input formControlName="languages" class="field-input" placeholder="French, English" />
          </label>
          <label class="block">
            <span class="field-label">Certifications <span class="font-normal normal-case text-outline">(comma separated)</span></span>
            <input formControlName="certifications" class="field-input" placeholder="CKA, AWS SAA" />
          </label>
          <label class="block sm:col-span-2">
            <span class="field-label">Short bio</span>
            <textarea formControlName="bio" rows="3" maxlength="500" class="field-input resize-y"></textarea>
          </label>
        </fieldset>
      </form>

      <ng-container modal-footer>
        <button type="button" (click)="closed.emit()" [disabled]="isSaving()" class="btn-secondary">Cancel</button>
        <button type="submit" form="consultant-form" [disabled]="isSaving()" class="btn-primary">
          @if (isSaving()) {
            <span class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>Saving…
          } @else {
            <span class="material-symbols-outlined text-[16px]">check</span>{{ consultant() ? 'Save changes' : 'Create consultant' }}
          }
        </button>
      </ng-container>
    </app-modal>
  `,
})
export class ConsultantFormModalComponent implements OnInit {
  /** `null` creates a new consultant. */
  readonly consultant = input<Consultant | null>(null);
  readonly clients = input<readonly ClientAccount[]>([]);
  readonly isSaving = input<boolean>(false);

  readonly save = output<ConsultantPayload>();
  readonly closed = output<void>();

  protected readonly seniorities = CONSULTANT_SENIORITIES;
  protected readonly statusOptions = CONSULTANT_STATUS_OPTIONS;
  protected readonly skillDraft = signal('');

  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group(
    {
      fullName: ['', [Validators.required, Validators.maxLength(80)]],
      title: ['', [Validators.required, Validators.maxLength(120)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      location: [''],
      seniority: this.fb.control<ConsultantSeniority>('Mid'),
      yearsOfExperience: [0, [Validators.min(0), Validators.max(50)]],
      primarySkill: ['', Validators.required],
      skills: this.fb.control<string[]>([], Validators.required),
      status: this.fb.control<ConsultantStatus>('on_bench'),
      tjm: [500, [Validators.required, Validators.min(100), Validators.max(3000)]],
      daysOnBench: [0, Validators.min(0)],
      clientId: [''],
      missionEndDate: [''],
      languages: [''],
      certifications: [''],
      bio: ['', Validators.maxLength(500)],
    },
    { validators: clientRequiredWhenStaffed },
  );

  protected readonly status = toSignal(this.form.controls.status.valueChanges, {
    initialValue: this.form.controls.status.value,
  });
  protected readonly skills = toSignal(this.form.controls.skills.valueChanges, {
    initialValue: this.form.controls.skills.value,
  });
  protected readonly isStaffed = computed(() => STAFFED_STATUSES.includes(this.status()));

  ngOnInit(): void {
    const c = this.consultant();
    if (!c) return;
    this.form.reset({
      fullName: c.fullName,
      title: c.title,
      email: c.email,
      phone: c.phone,
      location: c.location,
      seniority: c.seniority,
      yearsOfExperience: c.yearsOfExperience,
      primarySkill: c.primarySkill,
      skills: c.skills,
      status: c.status,
      tjm: c.tjm,
      daysOnBench: c.daysOnBench ?? 0,
      clientId: c.clientId ?? '',
      missionEndDate: c.missionEndDate ?? '',
      languages: c.languages.join(', '),
      certifications: c.certifications.join(', '),
      bio: c.bio,
    });
  }

  protected invalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && control.touched;
  }

  protected clientError(): boolean {
    return this.form.hasError('clientRequired') && this.form.controls.clientId.touched;
  }

  protected addSkill(event?: Event): void {
    event?.preventDefault();
    const skill = this.skillDraft().trim().replace(/,$/, '');
    if (!skill) return;
    const current = this.form.controls.skills.value;
    if (!current.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      this.form.controls.skills.setValue([...current, skill]);
    }
    this.form.controls.skills.markAsTouched();
    this.skillDraft.set('');
  }

  protected removeSkill(skill: string): void {
    this.form.controls.skills.setValue(this.form.controls.skills.value.filter((s) => s !== skill));
    this.form.controls.skills.markAsTouched();
  }

  protected onSkillKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      this.addSkill(event);
    } else if (event.key === 'Backspace' && !this.skillDraft()) {
      const current = this.form.controls.skills.value;
      if (current.length) this.removeSkill(current[current.length - 1]);
    }
  }

  protected submit(): void {
    this.addSkill();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const staffed = STAFFED_STATUSES.includes(value.status);
    this.save.emit({
      fullName: value.fullName.trim(),
      title: value.title.trim(),
      email: value.email.trim(),
      phone: value.phone.trim(),
      location: value.location.trim(),
      seniority: value.seniority,
      yearsOfExperience: value.yearsOfExperience,
      primarySkill: value.primarySkill.trim(),
      skills: value.skills,
      status: value.status,
      tjm: value.tjm,
      daysOnBench: value.status === 'on_bench' ? value.daysOnBench : undefined,
      clientId: staffed ? value.clientId : undefined,
      missionEndDate: staffed && value.missionEndDate ? value.missionEndDate : undefined,
      languages: splitList(value.languages),
      certifications: splitList(value.certifications),
      bio: value.bio.trim(),
    });
  }
}
