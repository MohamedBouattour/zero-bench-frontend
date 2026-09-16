export interface NavItem {
  id: string;
  labelKey: string;
  defaultLabel: string;
  route: string;
  icon: string;
  badge?: string;
  badgeType?: 'danger' | 'warning' | 'info' | 'success';
}

export interface NavSection {
  titleKey: string;
  defaultTitle: string;
  items: NavItem[];
}
