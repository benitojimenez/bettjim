import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from "@auth0/angular-jwt";
import { map, Observable, throwError, catchError, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

// Interfaz para decodificar tu token (Ajusta según tu backend)
interface DecodedToken {
  sub: string;
  name: string;
  lastName: string;
  image: string;
  email: string;
  role: string;
  iat: string;
  exp: string;
  _id?: string; // Si el ID viene dentro del token
}

@Injectable({
  providedIn: 'root'
})
export class Auth { // Cambiado nombre a Auth por convención

  // Inyecciones
  private _platformId = inject(PLATFORM_ID);
  private _router = inject(Router);
  private _http = inject(HttpClient);
  private _jwtHelper = new JwtHelperService();

  // ================================================================
  // 1. ESTADO REACTIVO (SIGNALS)
  // ================================================================

  // Señal privada para guardar el token actual (o null)
  private _accessToken = signal<string | null>(null);

  // Señal computada: ¿Está autenticado? (Se actualiza sola si _accessToken cambia)
  public isAuthenticated = computed(() => {
    const token = this._accessToken();
    if (!token) return false;
    return !this._jwtHelper.isTokenExpired(token);
  });

  // Señal computada: Obtener datos del usuario desde el token (opcional)
  public currentUser = computed(() => {
    const token = this._accessToken();
    if (!token) return null;
    return this._jwtHelper.decodeToken(token) as DecodedToken;
  });

  constructor() {
    // Al iniciar el servicio, intentamos recuperar el token del Storage
    this.hydrateState();

  }
  // ================================================================
  // 2. INICIALIZACIÓN (MÉTODO LLAMADO POR ANGULAR ANTES DE LAS RUTAS)
  // ================================================================

  /**
   * [CRÍTICO] Carga el estado inicial (token) desde el navegador.
   * Este método debe ejecutarse y terminar antes de que se activen los Guards.
   */
  // public initializeAuth(): void {
  //   if (isPlatformBrowser(this._platformId)) {
  //     const token = localStorage.getItem('token');
  //     if (token && !this._jwtHelper.isTokenExpired(token)) {
  //       this._accessToken.set(token);
  //     } else {
  //       // Si hay token pero expiró o es inválido, limpia.
  //       if (token) this.clearStorage();
  //     }
  //   }
  // }

  // ================================================================
  // 2. MÉTODOS PÚBLICOS
  // ================================================================

  /**
   * Refresca el token usando el refresh token guardado
   */
  refreshToken(): Observable<string> {
    const refreshToken = this.getStorageItem('refreshToken');

    if (!refreshToken) {
      this.logOut();
      return throwError(() => new Error('No hay token de refresco'));
    }

    return this._http
      .post<{ refreshToken: string, accessToken?: string }>(`${environment.API_URL}refresh`, { refreshToken })
      .pipe(
        map(response => response.refreshToken || response.accessToken || ''), // Ajusta según qué devuelva tu API
        tap((newToken) => {
          this.saveToken(newToken);
          console.log('Token refrescado');
        }),
        catchError(error => {
          this.logOut();
          return throwError(() => new Error('Error al refrescar token'));
        })
      );
  }

  /**
   * Cierra sesión limpiando estado y redirigiendo
   */
  logOut() {
    this.clearStorage();      // 1. Limpiar LocalStorage
    this._accessToken.set(null); // 2. Limpiar Señal (UI reacciona al instante)
    this._router.navigate(['/auth/login']); // 3. Redirigir
    // NOTA: Evita window.location.reload() en Angular, rompe la experiencia SPA.
  }

  /**
   * Obtiene el ID.
   * MEJORA: Es mejor sacarlo del token decodificado (Signal) que del localStorage directo
   */
  public getId(): string | undefined {
    // Opción A: Sacarlo del token (Más seguro y rápido)
    const user = this.currentUser();
    if (user && user._id) return user._id;

    // Opción B: Tu método original (localStorage)
    return undefined;
  }
  public getLastName(): string | undefined {
    // Opción A: Sacarlo del token (Más seguro y rápido)
    const user = this.currentUser();
    if (user && user.lastName) return user.lastName;

    // Opción B: Tu método original (localStorage)
    return undefined;
  }

  /**
   * Método manual para guardar token (úsalo en tu Login)
   */
  public loginSuccess(token: string, refreshToken: string, userId: string) {
    this.saveToken(token);
    this.setStorageItem('refreshToken', refreshToken);
    this.setStorageItem('_id', userId);
    this._router.navigate(['/']); // O al dashboard
  }

  // ================================================================
  // 3. HELPERS PRIVADOS (SSR SAFE)
  // ================================================================

  /**
   * Carga el estado inicial desde el navegador
   */
  private hydrateState() {
    if (isPlatformBrowser(this._platformId)) {
      const token = localStorage.getItem('token');
      if (token && !this._jwtHelper.isTokenExpired(token)) {
        this._accessToken.set(token);
      } else {
        // Si hay token pero expiró, intentamos limpiar
        if (token) this.logOut();
      }
    }
  }

  private saveToken(token: string) {
    this.setStorageItem('token', token);
    this._accessToken.set(token); // ¡Esto actualiza toda la app!
  }

  // Wrappers seguros para LocalStorage
  private getStorageItem(key: string): string | null {
    if (isPlatformBrowser(this._platformId)) {
      return localStorage.getItem(key);
    }
    return null;
  }

  private setStorageItem(key: string, value: string): void {
    if (isPlatformBrowser(this._platformId)) {
      localStorage.setItem(key, value);
    }
  }

  private clearStorage(): void {
    if (isPlatformBrowser(this._platformId)) {
      localStorage.clear();
    }
  }
  // ✅ AGREGA ESTO: Exponemos la señal como solo lectura
  public accessToken = this._accessToken.asReadonly();
}