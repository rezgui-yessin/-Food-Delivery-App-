import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models';

export const roleGuard = (allowedRoles: Role[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.currentUser();
    if (user && allowedRoles.includes(user.role)) {
      return true;
    }
    return router.createUrlTree(['/unauthorized']);
  };
};
