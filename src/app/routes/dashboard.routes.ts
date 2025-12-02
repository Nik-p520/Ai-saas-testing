import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '../layouts/dashboard-layout/dashboard-layout';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      // 1. Agar koi '/dashboard' khole, to usse '/dashboard/home' par bhejo
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      
      // 2. Ab '/dashboard/home' route actually exist karta hai
      {
        path: 'home',
        loadComponent: () =>
          import('../pages/dashboard/home/home').then(m => m.DashboardComponent),
      },

      // ... Baaki routes same rahenge
      {
        path: 'tests',
        loadComponent: () =>
          import('../pages/dashboard/tests/tests').then(m => m.Tests),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('../pages/dashboard/history/history').then(m => m.History),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../pages/dashboard/settings/settings').then(m => m.Settings),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../pages/dashboard/profile/profile').then(m => m.ProfileComponent),
      },
      {
        path: 'result/:id',
        loadComponent: () =>
          import('../pages/dashboard/result/result').then(m => m.ResultPageComponent),
      },
    ],
  },
];