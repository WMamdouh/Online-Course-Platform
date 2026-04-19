import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * authGuard – blocks unauthenticated users and redirects to /login
 */
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/login']);
};

/**
 * roleGuard – blocks users whose role is not in route data.roles
 * Usage: canActivate: [authGuard, roleGuard], data: { roles: ['admin'] }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const allowed: string[] = route.data['roles'] || [];
  if (auth.hasRole(...allowed)) return true;
  return router.createUrlTree(['/courses']);
};
