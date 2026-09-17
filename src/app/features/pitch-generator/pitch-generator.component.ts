import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FileExportService } from '../../core/services/file-export.service';
import { ToastService } from '../../core/services/toast.service';
import { LanguageStore } from '../../core/stores/language.store';
import { AvatarComponent } from '../../core/widgets/avatar/avatar.component';
import { SkeletonComponent } from '../../core/widgets/skeleton/skeleton.component';
import { StatusBadgeComponent } from '../../core/widgets/status-badge/status-badge.component';
import { ConsultantsStore } from '../consultants/stores/consultants.store';
import { ClientsStore } from '../customers/stores/clients.store';
import { PlacementsStore } from '../placements/stores/placements.store';
import { PITCH_TONE_OPTIONS, PitchLanguage, PitchRequest, PitchTone } from './models/pitch-generator.model';
import { PitchGeneratorStore } from './stores/pitch-generator.store';

const sameRequest = (a: PitchRequest | null, b: PitchRequest | null): boolean =>
  !!a && !!b && (Object.keys(b) as (keyof PitchRequest)[]).every((key) => (a[key] ?? '') === (b[key] ?? ''));

@Component({
  selector: 'app-pitch-generator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, ReactiveFormsModule, RouterLink, AvatarComponent, SkeletonComponent, StatusBadgeComponent],
  template: `
    <div class="space-y-6 pb-12">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-on-surface dark:text-white">AI Pitch & Proposal Generator</h2>
          <p class="text-xs text-outline dark:text-slate-400 mt-1">
            Instantly formulate tailored client pitches aligning consultant profiles with RFP requirements.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <!-- Parameters -->
        <div class="space-y-4">
          <form
            [formGroup]="form"
            (ngSubmit)="generate()"
            class="p-6 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 shadow-sm space-y-4"
            novalidate
          >
            <h3 class="text-sm font-bold text-on-surface dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-secondary-blue dark:text-blue-400 text-[18px]">edit_note</span>
              <span>RFP & Candidate Parameters</span>
            </h3>

            <label class="block">
              <span class="field-label">Consultant *</span>
              <select formControlName="consultantId" class="field-input">
                <option value="">{{ consultantsStore.isLoading() ? 'Loading consultants…' : 'Select a consultant…' }}</option>
                @if (consultantsStore.availableConsultants().length) {
                  <optgroup label="Available now / soon">
                    @for (c of consultantsStore.availableConsultants(); track c.id) {
                      <option [value]="c.id">
                        {{ c.fullName }} – {{ c.primarySkill }} ({{ c.status === 'on_bench' ? (c.daysOnBench ?? 0) + 'd bench' : 'ends ' + (c.missionEndDate | date: 'd MMM') }}, €{{ c.tjm }})
                      </option>
                    }
                  </optgroup>
                }
                @if (otherConsultants().length) {
                  <optgroup label="Currently on mission">
                    @for (c of otherConsultants(); track c.id) {
                      <option [value]="c.id">{{ c.fullName }} – {{ c.primarySkill }}</option>
                    }
                  </optgroup>
                }
              </select>
            </label>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label class="block">
                <span class="field-label">Client *</span>
                <select formControlName="clientId" class="field-input">
                  <option value="">Select a client…</option>
                  @for (client of clientsStore.clients(); track client.id) {
                    <option [value]="client.id">{{ client.name }}</option>
                  }
                </select>
              </label>
              <label class="block">
                <span class="field-label">RFP</span>
                <select formControlName="rfpId" class="field-input" [attr.disabled]="!formValue().clientId || store.isLoadingRfps() ? '' : null">
                  <option value="">{{ store.isLoadingRfps() ? 'Loading RFPs…' : 'Custom mandate' }}</option>
                  @for (rfp of store.rfps(); track rfp.id) {
                    <option [value]="rfp.id">{{ rfp.title }}</option>
                  }
                </select>
              </label>
            </div>

            @if (!formValue().rfpId) {
              <label class="block">
                <span class="field-label">Mandate title *</span>
                <input formControlName="mandateTitle" class="field-input" placeholder="e.g. Lead Architect Cloud & Angular" />
              </label>
            }

            <div>
              <span class="field-label">Tone & Focus</span>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Tone">
                @for (tone of tones; track tone.value) {
                  @let active = formValue().tone === tone.value;
                  <button
                    type="button"
                    role="radio"
                    [attr.aria-checked]="active"
                    (click)="form.controls.tone.setValue(tone.value)"
                    class="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold border transition-colors"
                    [class]="active ? 'bg-secondary-blue border-secondary-blue text-white dark:bg-blue-600 dark:border-blue-600' : 'bg-surface-container-low dark:bg-slate-800 border-transparent text-on-surface-variant dark:text-slate-300 hover:border-outline-variant dark:hover:border-slate-600'"
                  >
                    <span class="material-symbols-outlined text-[16px]">{{ tone.icon }}</span>
                    {{ tone.label }}
                  </button>
                }
              </div>
            </div>

            <div class="flex items-center justify-between gap-3">
              <span class="field-label mb-0!">Language</span>
              <div class="flex items-center p-0.5 rounded-lg border border-outline-variant dark:border-slate-700 bg-surface-container-low dark:bg-slate-800 text-xs">
                @for (lang of languages; track lang.value) {
                  @let active = formValue().language === lang.value;
                  <button
                    type="button"
                    (click)="form.controls.language.setValue(lang.value)"
                    class="px-3 py-1 rounded-md font-semibold transition-colors"
                    [class]="active ? 'bg-surface-container-lowest dark:bg-slate-700 text-on-surface dark:text-white shadow-xs' : 'text-outline dark:text-slate-400'"
                    [attr.aria-pressed]="active"
                  >
                    {{ lang.label }}
                  </button>
                }
              </div>
            </div>

            <button
              type="submit"
              [disabled]="!canGenerate() || store.isGenerating()"
              class="w-full py-2.5 rounded-xl bg-gradient-to-r from-secondary-blue to-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-2 hover:opacity-95 shadow-sm shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="material-symbols-outlined text-[16px]" [class.animate-spin]="store.isGenerating()">
                {{ store.isGenerating() ? 'progress_activity' : 'auto_awesome' }}
              </span>
              <span>{{ store.isGenerating() ? 'Generating…' : store.lastResponse() ? 'Regenerate Pitch' : 'Generate Tailored Pitch' }}</span>
            </button>
          </form>

          <!-- Match preview -->
          @if (selectedConsultant(); as c) {
            <div class="p-5 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 space-y-3">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  <app-avatar [name]="c.fullName" size="md" />
                  <div class="min-w-0">
                    <a routerLink="/consultants" [queryParams]="{ id: c.id }" class="block text-sm font-bold text-on-surface dark:text-white hover:underline truncate">
                      {{ c.fullName }}
                    </a>
                    <p class="text-[11px] text-outline dark:text-slate-400 truncate">{{ c.title }} · {{ c.yearsOfExperience }} yrs · €{{ c.tjm }}/d</p>
                  </div>
                </div>
                <app-status-badge [status]="c.status" />
              </div>

              @if (selectedRfp(); as rfp) {
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-[11px] font-semibold text-on-surface-variant dark:text-slate-300">Skill coverage for “{{ rfp.title }}”</span>
                    <span class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">{{ coverage().matched.length }}/{{ rfp.requiredSkills.length }}</span>
                  </div>
                  <div class="flex flex-wrap gap-1">
                    @for (skill of coverage().matched; track skill) {
                      <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <span class="material-symbols-outlined text-[12px]">check</span>{{ skill }}
                      </span>
                    }
                    @for (skill of coverage().missing; track skill) {
                      <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                        <span class="material-symbols-outlined text-[12px]">close</span>{{ skill }}
                      </span>
                    }
                  </div>
                  <p class="text-[10px] text-outline dark:text-slate-500 mt-1.5">
                    {{ rfp.seniority }} · budget €{{ rfp.dailyBudget }}/day
                    @if (c.tjm > rfp.dailyBudget) {
                      <span class="text-amber-600 dark:text-amber-400 font-semibold">· TJM €{{ c.tjm - rfp.dailyBudget }} above budget</span>
                    }
                  </p>
                </div>
              } @else {
                <div class="flex flex-wrap gap-1">
                  @for (skill of c.skills; track skill) {
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-container-low dark:bg-slate-800 text-on-surface-variant dark:text-slate-300">{{ skill }}</span>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Preview -->
        <div
          class="p-6 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/40 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 shadow-sm flex flex-col min-h-[28rem]"
          aria-live="polite"
        >
          <div class="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-900/40">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">auto_awesome</span>
              AI Generated Pitch Preview
            </span>
            @if (store.lastResponse(); as response) {
              <span class="flex items-center gap-2 text-[11px] text-outline dark:text-slate-400">
                <span class="px-1.5 py-0.5 rounded font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">{{ response.matchScore }}% match</span>
                {{ wordCount() }} words
              </span>
            }
          </div>

          @if (store.isGenerating()) {
            <div class="mt-5 space-y-4 flex-1">
              <app-skeleton variant="text" width="70%" />
              <app-skeleton variant="text" [count]="4" />
              <app-skeleton variant="text" [count]="3" />
              <app-skeleton variant="text" width="45%" />
            </div>
          } @else if (store.lastResponse(); as response) {
            <div class="mt-4 flex-1 flex flex-col gap-3">
              @if (isStale()) {
                <p class="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                  <span class="material-symbols-outlined text-[14px]">update</span>
                  Parameters changed since this pitch was generated — regenerate to refresh it.
                </p>
              }
              <div class="flex flex-wrap gap-1.5">
                @for (strength of response.keyStrengths; track strength) {
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/80 dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    {{ strength }}
                  </span>
                }
              </div>
              <label class="block">
                <span class="field-label">Subject</span>
                <input class="field-input font-semibold" [value]="subject()" (input)="subject.set($any($event.target).value)" />
              </label>
              <label class="flex-1 flex flex-col">
                <span class="field-label">Message <span class="font-normal normal-case">(editable)</span></span>
                <textarea
                  class="field-input flex-1 min-h-72 leading-relaxed font-sans resize-y"
                  [value]="body()"
                  (input)="body.set($any($event.target).value)"
                ></textarea>
              </label>
              <p class="text-[10px] text-outline dark:text-slate-500">Generated {{ response.generatedAt | date: 'medium' }}</p>
            </div>

            <div class="pt-4 mt-3 border-t border-indigo-100 dark:border-indigo-900/40 flex flex-wrap items-center justify-end gap-2">
              <button type="button" (click)="copy()" class="btn-secondary">
                <span class="material-symbols-outlined text-[16px]">{{ copied() ? 'check' : 'content_copy' }}</span>
                {{ copied() ? 'Copied' : 'Copy to Clipboard' }}
              </button>
              <button type="button" (click)="saveToPipeline()" [disabled]="savedToPipeline() || placementsStore.isSaving()" class="btn-secondary">
                <span class="material-symbols-outlined text-[16px]">{{ savedToPipeline() ? 'task_alt' : 'view_kanban' }}</span>
                {{ savedToPipeline() ? 'In pipeline' : 'Save to Pipeline' }}
              </button>
              <a [href]="mailtoHref()" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-xs">
                <span class="material-symbols-outlined text-[16px]">send</span>
                Send via Email
              </a>
            </div>
          } @else {
            <div class="flex-1 flex flex-col items-center justify-center text-center px-6 py-10">
              <span class="material-symbols-outlined text-5xl text-indigo-300 dark:text-indigo-800">draft</span>
              <p class="text-sm font-semibold text-on-surface dark:text-white mt-3">No pitch generated yet</p>
              <p class="text-xs text-outline dark:text-slate-400 mt-1 max-w-xs">
                Pick a consultant, a client and an RFP, then generate a tailored proposal in English or French.
              </p>
              @if (store.error(); as error) {
                <p class="mt-4 text-xs font-medium text-red-600 dark:text-red-400" role="alert">{{ error }}</p>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class PitchGeneratorComponent implements OnInit {
  /** Query params used by deep links from the dashboard, clients, skills gap and pipeline. */
  readonly consultantId = input<string>();
  readonly clientId = input<string>();
  readonly rfpId = input<string>();

  protected readonly store = inject(PitchGeneratorStore);
  protected readonly consultantsStore = inject(ConsultantsStore);
  protected readonly clientsStore = inject(ClientsStore);
  protected readonly placementsStore = inject(PlacementsStore);
  private readonly toast = inject(ToastService);
  private readonly fileExport = inject(FileExportService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly tones = PITCH_TONE_OPTIONS;
  protected readonly languages: readonly { value: PitchLanguage; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
  ];

  protected readonly form = this.fb.group({
    consultantId: [''],
    clientId: [''],
    rfpId: [''],
    mandateTitle: [''],
    tone: this.fb.control<PitchTone>('technical'),
    language: this.fb.control<PitchLanguage>(inject(LanguageStore).currentLang()),
  });

  protected readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  protected readonly copied = signal(false);
  protected readonly subject = linkedSignal(() => this.store.lastResponse()?.subject ?? '');
  protected readonly body = linkedSignal(() => this.store.lastResponse()?.pitchText ?? '');
  protected readonly wordCount = computed(() => this.body().split(/\s+/).filter(Boolean).length);

  /** RFP to select once the RFPs of the prefilled client are loaded. */
  private pendingRfpId: string | null = null;
  /** Request already saved to the pipeline (prevents duplicates). */
  private readonly savedRequest = signal<PitchRequest | null>(null);

  protected readonly otherConsultants = computed(() =>
    this.consultantsStore.consultants().filter((c) => c.status === 'on_mission' || c.status === 'prospect'),
  );

  protected readonly selectedConsultant = computed(() => {
    const id = this.formValue().consultantId;
    return id ? (this.consultantsStore.entityMap()[id] ?? null) : null;
  });

  protected readonly selectedRfp = computed(() => this.store.rfps().find((r) => r.id === this.formValue().rfpId) ?? null);

  protected readonly coverage = computed(() => {
    const consultant = this.selectedConsultant();
    const rfp = this.selectedRfp();
    if (!consultant || !rfp) return { matched: [] as string[], missing: [] as string[] };
    const owned = new Set(consultant.skills.map((s) => s.toLowerCase()));
    return {
      matched: rfp.requiredSkills.filter((s) => owned.has(s.toLowerCase())),
      missing: rfp.requiredSkills.filter((s) => !owned.has(s.toLowerCase())),
    };
  });

  private readonly currentRequest = computed<PitchRequest | null>(() => {
    const value = this.formValue();
    const rfp = this.selectedRfp();
    const title = rfp?.title ?? value.mandateTitle?.trim();
    if (!value.consultantId || !value.clientId || !title) return null;
    return {
      consultantId: value.consultantId,
      clientId: value.clientId,
      rfpId: rfp?.id,
      rfpTitle: rfp ? undefined : title,
      tone: value.tone ?? 'technical',
      language: value.language ?? 'en',
    };
  });

  protected readonly canGenerate = computed(() => this.currentRequest() !== null);
  protected readonly isStale = computed(() => !!this.store.lastRequest() && !sameRequest(this.store.lastRequest(), this.currentRequest()));
  protected readonly savedToPipeline = computed(() => sameRequest(this.savedRequest(), this.store.lastRequest()));

  protected readonly mailtoHref = computed(() => {
    const email = this.store.lastResponse()?.recipientEmail ?? '';
    return `mailto:${email}?subject=${encodeURIComponent(this.subject())}&body=${encodeURIComponent(this.body())}`;
  });

  constructor() {
    this.form.controls.clientId.valueChanges.pipe(takeUntilDestroyed()).subscribe(async (clientId) => {
      this.form.controls.rfpId.setValue('');
      await this.store.loadRfps(clientId || null);
      const rfpId = this.pendingRfpId;
      this.pendingRfpId = null;
      if (rfpId && this.form.controls.clientId.value === clientId && this.store.rfps().some((r) => r.id === rfpId)) {
        this.form.controls.rfpId.setValue(rfpId);
      }
    });

    // Deep links (?consultantId=&clientId=&rfpId=) also apply while already on the page.
    effect(() => {
      const consultantId = this.consultantId();
      const clientId = this.clientId();
      const rfpId = this.rfpId();
      untracked(() => this.applyPrefill(consultantId, clientId, rfpId));
    });
  }

  ngOnInit(): void {
    void this.consultantsStore.loadAll();
    void this.clientsStore.loadClients();
    // A fresh visit starts from a blank preview.
    this.store.reset();
  }

  protected async generate(): Promise<void> {
    const request = this.currentRequest();
    if (!request) return;
    const response = await this.store.generate(request);
    if (!response) {
      this.toast.error(this.store.error() ?? 'Pitch generation failed', { title: 'Generation failed' });
    }
  }

  protected async copy(): Promise<void> {
    const ok = await this.fileExport.copyToClipboard(`${this.subject()}\n\n${this.body()}`);
    if (ok) {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } else {
      this.toast.warning('Clipboard access was denied by the browser.', { title: 'Copy failed' });
    }
  }

  protected async saveToPipeline(): Promise<void> {
    const request = this.store.lastRequest();
    const response = this.store.lastResponse();
    if (!request || !response) return;
    try {
      const created = await this.placementsStore.create({
        consultantId: request.consultantId,
        clientId: request.clientId,
        rfpId: request.rfpId,
        roleTitle: request.rfpTitle ?? this.selectedRfp()?.title ?? response.subject,
        stage: 'pitch_sent',
        matchScore: response.matchScore,
        note: `AI pitch (${request.tone.replace('_', ' ')}, ${request.language.toUpperCase()}) sent ${new Date().toLocaleDateString('en-GB')}.`,
      });
      this.savedRequest.set(request);
      this.toast.success(`${created.consultantName} → ${created.clientName} added as “Pitch Sent”.`, { title: 'Saved to pipeline' });
    } catch (err: unknown) {
      this.toast.error((err as Error).message, { title: 'Not saved' });
    }
  }

  private applyPrefill(consultantId?: string, clientId?: string, rfpId?: string): void {
    if (consultantId) this.form.controls.consultantId.setValue(consultantId);
    if (clientId) {
      this.pendingRfpId = rfpId ?? null;
      // Always emits, so the RFP list (cached per client) is resolved and the pending RFP selected.
      this.form.controls.clientId.setValue(clientId);
    }
  }
}
