import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models';
import { ToastService } from '../services/toast.service';

export const roleGuard = (allowedRoles: Role[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const toastService = inject(ToastService);

    const user = authService.currentUser();
    if (user && allowedRoles.includes(user.role)) {
      return true;
    }

    toastService.error('Unauthorized', 'You do not have the required role to view this page.');
    return router.createUrlTree(['/']);
  };
};

