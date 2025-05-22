import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [AuthGuard],
    data: { role: 'Admin' }
  },
  { 
    path: 'superadmin', 
    loadComponent: () => import('./superadmin/dashboard/superadmin-dashboard.component').then(m => m.SuperAdminDashboardComponent),
    canActivate: [AuthGuard],
    data: { role: 'SuperAdmin' }
  },
  {
    path: 'superadmin/countries',
    loadComponent: () => import('./superadmin/country/country-list/country-list.component').then(m => m.CountryListComponent),
    canActivate: [AuthGuard],
    data: { role: 'SuperAdmin' }
  },
  {
    path: 'superadmin/countries/create',
    loadComponent: () => import('./superadmin/country/country-form/country-form.component').then(m => m.CountryFormComponent),
    canActivate: [AuthGuard],
    data: { role: 'SuperAdmin' }
  },
  {
    path: 'superadmin/countries/edit/:id',
    loadComponent: () => import('./superadmin/country/country-form/country-form.component').then(m => m.CountryFormComponent),
    canActivate: [AuthGuard],
    data: { role: 'SuperAdmin' }
  },
  {
    path: 'superadmin/countries/:id',
    loadComponent: () => import('./superadmin/country/country-detail/country-detail.component').then(m => m.CountryDetailComponent),
    canActivate: [AuthGuard],
    data: { role: 'SuperAdmin' }
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
