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

  // if (isPlatformServer(platformId)) {

  //   return next(req);

  // }
  // ==========================================
  // 🛡️ EL FIREWALL ABSOLUTO PARA SSR
  // ==========================================
  if (isPlatformServer(platformId)) {
    
    // 1. Si la petición va dirigida a tu API real, la dejamos pasar.
    // (Asegúrate de que tus servicios frontend llamen a 'https://api.bettjim.com/...')
    if (req.url.includes('api.bettjim.com')) {
      
      // Bloqueo quirúrgico solo para rutas privadas de la API (para evitar el redirect 302)
      const rutasPrivadasApi = ['/perfil', '/cart', '/checkout', '/mis-ordenes'];
      const esRutaPrivada = rutasPrivadasApi.some(ruta => req.url.includes(ruta));
      
      if (esRutaPrivada) return EMPTY; 
      
      return next(req); // API Pública (Productos): Pasa sin problemas
    }

    // 2. 🔥 LA MAGIA: Si Angular intenta pedir archivos locales, la misma página actual,
    // o cualquier otra cosa que no sea la API, lo DESTRUIMOS en silencio.
    // Esto erradica por completo el error de SSRF que tienes en los logs.
    console.log(`🚫 Firewall SSR: Bloqueando petición innecesaria a -> ${req.url}`);
    return EMPTY; 
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