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
  {
    path: 'superadmin/teams',
    loadComponent: () => import('./superadmin/team/team-list/team-list.component').then(m => m.TeamListComponent),
    canActivate: [AuthGuard],
    data: { role: 'SuperAdmin' }
  },
  {
    path: 'superadmin/teams/create',
    loadComponent: () => import('./superadmin/team/team-form/team-form.component').then(m => m.TeamFormComponent),
    canActivate: [AuthGuard],
    data: { role: 'SuperAdmin' }
  },
  {
    path: 'superadmin/teams/edit/:id',
    loadComponent: () => import('./superadmin/team/team-form/team-form.component').then(m => m.TeamFormComponent),
    canActivate: [AuthGuard],
    data: { role: 'SuperAdmin' }
  },
  {
    path: 'superadmin/teams/:id',
    loadComponent: () => import('./superadmin/team/team-detail/team-detail.component').then(m => m.TeamDetailComponent),
    canActivate: [AuthGuard],
    data: { role: 'SuperAdmin' }
  },
  {
    path: 'superadmin/admin-users',
    loadComponent: () => import('./superadmin/admin-user/admin-user-list/admin-user-list.component').then(m => m.AdminUserListComponent),
    canActivate: [AuthGuard],
    data: { role: 'SuperAdmin' }
  },
  {
    path: 'superadmin/admin-users/create',
    loadComponent: () => import('./superadmin/admin-user/admin-user-form/admin-user-form.component').then(m => m.AdminUserFormComponent),
    canActivate: [AuthGuard],
    data: { role: 'SuperAdmin' }
  },
  {
    path: 'superadmin/admin-users/edit/:id',
    loadComponent: () => import('./superadmin/admin-user/admin-user-form/admin-user-form.component').then(m => m.AdminUserFormComponent),
    canActivate: [AuthGuard],
    data: { role: 'SuperAdmin' }
  },
  {
    path: 'superadmin/admin-users/:id',
    loadComponent: () => import('./superadmin/admin-user/admin-user-detail/admin-user-detail.component').then(m => m.AdminUserDetailComponent),
    canActivate: [AuthGuard],
    data: { role: 'SuperAdmin' }
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
