import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth} from '../services/auth'; // Ajusta la ruta a tu servicio

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  // Verificamos si YA está autenticado
  if (authService.isAuthenticated()) {
    // Si ya está logueado, lo pateamos al Home o a su Perfil
    console.log('Usuario ya logueado, redirigiendo...');
    router.navigate(['/account']); // O router.navigate(['/account/perfil']);
    // router.createUrlTree(['/account/profile']);
    return false; // Bloquea la entrada al Login
  }

  // Si no está logueado, lo dejamos pasar al Login
  return true; 

 
};
