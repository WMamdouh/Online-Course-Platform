import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * authInterceptor
 * ───────────────
 * Automatically attaches the Bearer access token to every HTTP request.
 * If a 401 is returned, it tries once to refresh the token, then retries.
 * If refresh also fails it forces logout.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.accessToken();

  // Clone the request and attach the token if we have one
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 and not an auth endpoint → try to refresh once
      if (error.status === 401 && !req.url.includes('/auth/')) {
        return authService.refreshToken().pipe(
          switchMap(response => {
            // Retry with the new token
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${response.accessToken}` }
            });
            return next(retryReq);
          }),
          catchError(refreshError => {
            // Refresh failed → logout and redirect to login
            authService.logout().subscribe();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
