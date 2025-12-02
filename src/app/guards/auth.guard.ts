import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../core/services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ✅ FIX: Seedha token check karo (ye method already exist karta hai)
  const token = await authService.getToken();

  if (token) {
    return true; // Token hai matlab user logged in hai
  } else {
    router.navigate(['/login']);
    return false;
  }
};