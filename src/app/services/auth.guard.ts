import { inject } from '@angular/core';
import { Router, UrlTree, CanActivateFn } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export const AuthGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const requiredRole = route.data?.['role'];
  if (requiredRole && !authService.hasRole(requiredRole)) {
    // Redirect based on user role
    if (authService.isAdmin()) {
      router.navigate(['/admin']);
      return false;
    } else if (authService.isSuperAdmin()) {
      router.navigate(['/superadmin']);
      return false;
    } else {
      router.navigate(['/login']);
      return false;
    }
  }

  return true;
};
