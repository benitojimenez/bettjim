import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
const platformId = inject(PLATFORM_ID); // 🔥 Inyectamos el detector de plataforma

  // ==========================================
  // 🛡️ MODO SERVIDOR (SSR)
  // ==========================================
  if (!isPlatformBrowser(platformId)) {
    // Si estamos en Node.js, simplemente retornamos 'false'.
    // No hacemos redirecciones (evita el error SSRF).
    // El servidor enviará el cascarón vacío y no gastará recursos.
    return false;
  }

  // ==========================================
  // 💻 MODO NAVEGADOR (Cliente real)
  // ==========================================
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  } else {
    return true;
  }


};
