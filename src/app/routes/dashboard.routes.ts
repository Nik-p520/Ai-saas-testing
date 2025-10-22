import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '../layouts/dashboard-layout/dashboard-layout';


export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../pages/dashboard/home/home').then(m => m.DashboardComponent),
      },
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
        path: 'result', // <-- Add this for your result page
        loadComponent: () =>
          import('../pages/dashboard/result/result').then(m => m.ResultPageComponent),
      },
    ],
  },
];

