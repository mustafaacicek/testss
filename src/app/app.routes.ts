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
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
