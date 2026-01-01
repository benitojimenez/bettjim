import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay, withIncrementalHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
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
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
  ]
};
