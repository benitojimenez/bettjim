import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay, withIncrementalHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { isDevMode } from '@angular/core';


// 1. IMPORTAR LIBRERÍAS DE IDIOMA
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

// 2. REGISTRAR EL IDIOMA
registerLocaleData(localeEs, 'es');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes,
      withComponentInputBinding(),
      // 🔥 AGREGA ESTO AQUÍ 🔥
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled', // 'enabled' = Top en nueva ruta, memoria en botón atrás
        anchorScrolling: 'enabled',           // Permite usar fragmentos (#seccion)
      })
    ),
    
    // 3. DEFINIR ESPAÑOL COMO IDIOMA POR DEFECTO
    // { provide: LOCALE_ID, useValue: 'es' },
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
  ]
};
