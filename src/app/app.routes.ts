import { Routes } from '@angular/router';
import { LayoutComponent } from './core/components/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/bench-risk/bench-risk.component').then((m) => m.BenchRiskComponent),
        title: 'BenchZero | Risk Dashboard',
      },
      {
        path: 'skills-gap',
        loadComponent: () =>
          import('./features/skills-gap/skills-gap.component').then((m) => m.SkillsGapComponent),
        title: 'BenchZero | Skills Gap Heatmap',
      },
      {
        path: 'placements',
        loadComponent: () =>
          import('./features/placements/placements.component').then((m) => m.PlacementsComponent),
        title: 'BenchZero | Placement Pipeline',
      },
      {
        path: 'pitch-generator',
        loadComponent: () =>
          import('./features/pitch-generator/pitch-generator.component').then((m) => m.PitchGeneratorComponent),
        title: 'BenchZero | AI Pitch Generator',
      },
      {
        path: 'consultants',
        loadComponent: () =>
          import('./features/consultants/consultants.component').then((m) => m.ConsultantsComponent),
        title: 'BenchZero | Consultants Directory',
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./features/customers/customers.component').then((m) => m.CustomersComponent),
        title: 'BenchZero | Clients & Missions',
      },
      {
        path: 'design-system',
        loadComponent: () =>
          import('./features/design-system/design-system.component').then((m) => m.DesignSystemComponent),
        title: 'BenchZero | Design Tokens & Showcase',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
