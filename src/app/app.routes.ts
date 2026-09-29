import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login').then((m) => m.Login),
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/customers/customer-list').then((m) => m.CustomerList),
      },
      {
        path: 'customers/new',
        loadComponent: () =>
          import('./features/customers/customer-form').then((m) => m.CustomerForm),
      },
      {
        path: 'customers/:id/edit',
        loadComponent: () =>
          import('./features/customers/customer-form').then((m) => m.CustomerForm),
      },
      {
        path: 'vessels',
        loadComponent: () => import('./features/vessels/vessel-list').then((m) => m.VesselList),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
