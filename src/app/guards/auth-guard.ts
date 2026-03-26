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
    // 🔥 EL CAMBIO ESTÁ AQUÍ: Devolvemos TRUE.
    // Dejamos que el servidor dibuje la página para que el Router no se bloquee.
    // (Como las peticiones privadas ya están bloqueadas por tu Interceptor con 'EMPTY', no hay peligro).
    return true; 
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
