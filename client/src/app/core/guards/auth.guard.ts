import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  if (authService.isAuthenticated()) {
    return true;
  }

  toastService.info('Authentication Required', 'Please sign in to access this page.');
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

