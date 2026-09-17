import { Translations } from './language.model';

export type NavLabelKey = Exclude<keyof Translations['nav'], 'coreIntelligence' | 'administration'>;

export interface NavigationBadges {
  placements: number;
  consultantsOnBench: number;
}

export interface NavItem {
  id: NavLabelKey;
  route: string;
  icon: string;
  badgeKey?: keyof NavigationBadges;
  badgeType?: 'danger' | 'warning' | 'info' | 'success';
}

export interface NavSection {
  titleKey: 'coreIntelligence' | 'administration';
  items: NavItem[];
}
