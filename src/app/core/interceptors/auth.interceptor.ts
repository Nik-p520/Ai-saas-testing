import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

   // 1. Get Token (Async)
  return from(authService.getToken()).pipe(
    switchMap(token => {
      // 2. Log to Browser Console (To prove it's running)
      console.log("🔑 Interceptor Token Check:", token ? "Token Found" : "No Token");

      if (token) {
        // 3. Clone and Attach
        const cloned = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
        return next(cloned);
      }
      return next(req);
    })
  );
};