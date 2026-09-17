export type SupportedLanguage = 'en' | 'fr';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  flag: string;
}

export interface Translations {
  appName: string;
  appSubtitle: string;
  searchPlaceholder: string;
  addConsultant: string;
  nav: {
    coreIntelligence: string;
    administration: string;
    dashboard: string;
    skillsGap: string;
    placements: string;
    pitchGenerator: string;
    consultants: string;
    clients: string;
    designSystem: string;
    settings: string;
  };
  statuses: {
    onBench: string;
    onMission: string;
    endingSoon: string;
    prospect: string;
  };
  actions: {
    exportReport: string;
    filter: string;
    compactView: string;
    comfortableView: string;
    search: string;
    close: string;
  };
  header: {
    notifications: string;
    markAllRead: string;
    noNotifications: string;
    searchShortcut: string;
  };
  stats: {
    financialExposure: string;
    onBenchCount: string;
    placementVelocity: string;
    avgBenchDays: string;
  };
}
