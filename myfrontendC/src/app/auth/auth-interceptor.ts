import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, switchMap, throwError, of } from 'rxjs';
export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();
  if (token) {
    // Clonamos la petición y le inyectamos el token en la cabecera automáticamente
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {



      if (req.url.includes('/login') || req.url.includes('/logout') || req.url.includes('/refresh')) {
        return throwError(() => err);
      }


      if (err.status === 401) {
        return auth.refreshToken().pipe(
          switchMap((res) => {
            const newToken = res.access_token;
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            });
            return next(retryReq);
          }),
          catchError((refreshErr) => {


            return auth.logout().pipe(
              catchError(() => of(null)),
              switchMap(() => throwError(() => refreshErr)),
            );
          }),
        );
      }
      return throwError(() => err);
    }),
  );
};
