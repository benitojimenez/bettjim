import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { catchError, EMPTY, switchMap, throwError } from 'rxjs';
import { Auth } from '../services/auth'; // Asegúrate de que el nombre coincida con tu archivo

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  
  // 1. INYECCIONES
  const platformId = inject(PLATFORM_ID);
  const authService = inject(Auth);

  // 2. SSR CHECK: Si estamos en el servidor, no hacemos nada.
  // El servidor no tiene localStorage ni tokens de usuario.
 // ==========================================
  // 🔥 2. SSR CHECK & ESCUDO ANTI-REDIRECCIONES
  // ==========================================
  if (isPlatformServer(platformId)) {
    
    // ⚠️ ATENCIÓN AQUÍ: Pon las palabras clave de las rutas de TU BACKEND 
    // que devuelven error si no tienen token.
    const rutasPrivadas = ['/account', '/cart', '/checkout', '/orders', '/payment'];
    
    const esRutaPrivada = rutasPrivadas.some(ruta => req.url.includes(ruta));

    if (esRutaPrivada) {
      console.log(`🛡️ SSR: Petición privada a ${req.url} bloqueada. Previniendo SSRF.`);
      // Retornamos EMPTY: La petición muere aquí en paz, no sale a internet.
      return EMPTY; 
    }

    // Si es pública (ej. /list_products), que pase normal para hacer el SEO
    return next(req);
  }

  // 3. OBTENER TOKEN (Desde la Signal)
  const token = authService.accessToken();

  // 4. CLONAR REQUEST
  // Usamos 'let' porque vamos a modificarla si hay token
  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
      // NOTA: No seteamos 'Content-Type': 'application/json' aquí.
      // Angular lo hace automático. Si lo fuerzas, rompes la subida de archivos (FormData).
    });
  }

  // 5. MANEJAR RESPUESTA Y ERRORES
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // Si el error es 401 (Unauthorized) o 403 (Forbidden)
      if (error.status === 401 || error.status === 403) {
        
        // Intentamos refrescar el token
        return authService.refreshToken().pipe(
          switchMap((newToken) => {
            // ✅ ÉXITO: El token se refrescó.
            // El servicio ya actualizó la Signal y el LocalStorage.
            
            // Reintentamos la petición original con el nuevo token
            const newRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            
            return next(newRequest);
          }),
          
          // ❌ ERROR: El refresh token también expiró o es inválido.
          catchError((refreshError) => {
            // El servicio (authService) ya debería hacer logout en su método refreshToken,
            // pero por seguridad propagamos el error.
            return throwError(() => refreshError);
          })
        );
      }

      // Si es otro error (500, 404, etc), lo dejamos pasar tal cual
      return throwError(() => error);
    })
  );
};