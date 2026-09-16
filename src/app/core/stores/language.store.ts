import { Injectable, inject, PLATFORM_ID, signal, computed, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SupportedLanguage, LanguageOption, Translations } from '../models/language.model';

const DICTIONARY: Record<SupportedLanguage, Translations> = {
  en: {
    appName: 'BenchZero',
    appSubtitle: 'ESN Management',
    searchPlaceholder: 'Search consultants, skills, missions...',
    addConsultant: 'Add Consultant',
    nav: {
      coreIntelligence: 'Core Intelligence',
      administration: 'Administration',
      dashboard: 'Dashboard (Bench Risk)',
      skillsGap: 'Skills Heatmap',
      placements: 'Placement Pipeline',
      pitchGenerator: 'AI Pitch Generator',
      consultants: 'Consultants Directory',
      clients: 'Clients & Missions',
      designSystem: 'Design Tokens & UI',
      settings: 'Settings & Config',
    },
    statuses: {
      onBench: 'On Bench',
      onMission: 'On Mission',
      endingSoon: 'Ending Soon',
      prospect: 'Prospect',
    },
    actions: {
      exportReport: 'Export Report',
      filter: 'Filter',
      compactView: 'Compact',
      comfortableView: 'Comfortable',
      search: 'Search',
      close: 'Close',
    },
    stats: {
      financialExposure: 'Financial Exposure',
      onBenchCount: 'Consultants on Bench',
      placementVelocity: 'Placement Velocity',
      avgBenchDays: 'Avg. Inter-contrat Days',
    },
  },
  fr: {
    appName: 'BenchZero',
    appSubtitle: 'Gestion ESN',
    searchPlaceholder: 'Rechercher consultants, compétences, missions...',
    addConsultant: 'Ajouter Consultant',
    nav: {
      coreIntelligence: 'Intelligence Métier',
      administration: 'Administration',
      dashboard: 'Tableau de Bord (Risque)',
      skillsGap: 'Matrice Compétences',
      placements: 'Pipeline Placements',
      pitchGenerator: 'Générateur Pitch IA',
      consultants: 'Annuaire Consultants',
      clients: 'Clients & Missions',
      designSystem: 'Design System & UI',
      settings: 'Paramètres & Config',
    },
    statuses: {
      onBench: 'En Inter-contrat',
      onMission: 'En Mission',
      endingSoon: 'Fin Imminente',
      prospect: 'Prospect',
    },
    actions: {
      exportReport: 'Exporter Rapport',
      filter: 'Filtrer',
      compactView: 'Compact',
      comfortableView: 'Confortable',
      search: 'Recherche',
      close: 'Fermer',
    },
    stats: {
      financialExposure: 'Exposition Financière',
      onBenchCount: 'Consultants en Inter-contrat',
      placementVelocity: 'Vélocité de Placement',
      avgBenchDays: 'Jours Moyens Inter-contrat',
    },
  },
};

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

@Injectable({
  providedIn: 'root',
})
export class LanguageStore {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly STORAGE_KEY = 'zero_bench_lang';

  readonly currentLang = signal<SupportedLanguage>(this.getInitialLang());
  readonly translations = computed(() => DICTIONARY[this.currentLang()]);
  readonly languages = signal<LanguageOption[]>(AVAILABLE_LANGUAGES);

  constructor() {
    effect(() => {
      const lang = this.currentLang();
      if (this.isBrowser) {
        localStorage.setItem(this.STORAGE_KEY, lang);
        document.documentElement.lang = lang;
      }
    });
  }

  setLanguage(lang: SupportedLanguage): void {
    this.currentLang.set(lang);
  }

  private getInitialLang(): SupportedLanguage {
    if (!this.isBrowser) {
      return 'en';
    }

    const saved = localStorage.getItem(this.STORAGE_KEY) as SupportedLanguage | null;
    if (saved === 'en' || saved === 'fr') {
      return saved;
    }

    const browserLang = navigator.language.toLowerCase();
    return browserLang.startsWith('fr') ? 'fr' : 'en';
  }
}
