import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Only redirect if not already on the login or register page
        if (!req.url.includes('/api/auth/login') && !req.url.includes('/api/auth/register')) {
          toastService.warning('Session Expired', 'Please sign in to continue.');
          authService.logout();
        }
      } else if (error.status === 403) {
        toastService.error('Access Denied', 'You do not have permission to perform this action.');
      } else if (error.status === 409) {
        // Conflict is often handled specifically by CartService or caller,
        // but notify with warning if not silenced
        console.warn('Resource conflict (409):', error.error?.message || error.message);
      } else if (error.status === 0) {
        toastService.error('Connection Failed', 'Cannot connect to backend API server at localhost:8081.');
      } else if (error.status >= 500) {
        const errorMsg = error.error?.message || 'An unexpected server error occurred.';
        toastService.error('Server Error', errorMsg);
      }

      return throwError(() => error);
    })
  );
};

