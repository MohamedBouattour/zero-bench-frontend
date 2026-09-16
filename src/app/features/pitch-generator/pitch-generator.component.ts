import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pitch-generator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 pb-12">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-on-surface dark:text-white">
            AI Pitch & Proposal Generator
          </h2>
          <p class="text-xs text-outline dark:text-slate-400 mt-1">
            Instantly formulate tailored client pitches aligning consultant profiles with RFP requirements.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Input Form Card -->
        <div class="p-6 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 shadow-sm space-y-4">
          <h3 class="text-sm font-bold text-on-surface dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-secondary-blue text-[18px]">edit_note</span>
            <span>RFP & Candidate Parameters</span>
          </h3>

          <div>
            <label class="block text-xs font-semibold text-outline dark:text-slate-400 mb-1">Target Client / Mandate</label>
            <input
              type="text"
              value="BNP Paribas - Lead Architect Cloud & Angular"
              class="w-full px-3 py-2 text-xs rounded-lg border border-outline-variant dark:border-slate-700 bg-surface-bright dark:bg-slate-800 text-on-surface dark:text-white focus:ring-2 focus:ring-secondary-blue/40"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-outline dark:text-slate-400 mb-1">Consultant on Bench</label>
            <select
              class="w-full px-3 py-2 text-xs rounded-lg border border-outline-variant dark:border-slate-700 bg-surface-bright dark:bg-slate-800 text-on-surface dark:text-white focus:ring-2 focus:ring-secondary-blue/40"
            >
              <option>Alexandre Martin (Senior Angular / Cloud, 22 days on bench, TJM €750)</option>
              <option>Thomas Bernard (DevOps & K8s, 14 days on bench, TJM €720)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-outline dark:text-slate-400 mb-1">Tone & Focus</label>
            <div class="flex gap-2">
              <span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-secondary-blue text-white cursor-pointer">Technical Rigor</span>
              <span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-surface-container-low dark:bg-slate-800 text-outline cursor-pointer">Leadership & Agility</span>
              <span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-surface-container-low dark:bg-slate-800 text-outline cursor-pointer">Cost & Velocity</span>
            </div>
          </div>

          <button
            type="button"
            (click)="generatePitch()"
            class="w-full py-2.5 rounded-xl bg-gradient-to-r from-secondary-blue to-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-2 hover:opacity-95 shadow-sm shadow-indigo-500/20"
          >
            <span class="material-symbols-outlined text-[16px]">auto_awesome</span>
            <span>Generate Tailored Pitch</span>
          </button>
        </div>

        <!-- Preview Card -->
        <div class="p-6 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/40 via-white dark:from-slate-900 dark:via-slate-900 to-indigo-950/20 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-900/40">
              <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">sparkles</span>
                AI Generated Pitch Preview
              </span>
              <span class="text-[11px] text-outline dark:text-slate-400">Word Count: 184</span>
            </div>

            <div class="mt-4 text-xs leading-relaxed text-on-surface dark:text-slate-200 space-y-3 font-sans">
              <p>
                <strong>Bonjour Céline,</strong>
              </p>
              <p>
                Suite à votre besoin de <em>Lead Architect Cloud & Angular</em> pour la refonte du portail bancaire, je vous propose en disponibilité immédiate <strong>Alexandre Martin</strong>.
              </p>
              <p>
                Fort de 9 années d'expérience en architecture micro-frontends et environnements sécurisés (certifié AWS Solutions Architect), Alexandre a notamment dirigé la migration vers Angular zoneless et l'optimisation des flux transactionnels pour un grand compte assurantiel.
              </p>
              <p>
                Il dispose de toutes les clés pour garantir la robustesse technique et accélérer la mise en production de votre nouveau socle. Seriez-vous disponible pour un échange rapide de 20 minutes cette semaine ?
              </p>
            </div>
          </div>

          <div class="pt-4 border-t border-indigo-100 dark:border-indigo-900/40 flex items-center justify-end gap-2">
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg border border-outline-variant dark:border-slate-700 text-xs font-semibold hover:bg-surface-container-low dark:hover:bg-slate-800"
            >
              Copy to Clipboard
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-xs"
            >
              Send via Email / CRM
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PitchGeneratorComponent {
  generatePitch(): void {
    // Scaffold action
  }
}
