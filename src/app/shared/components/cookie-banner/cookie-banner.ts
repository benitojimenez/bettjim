import { Component, signal, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-cookie-banner',
  imports: [RouterModule,CommonModule],
  templateUrl: './cookie-banner.html',
  styleUrl: './cookie-banner.scss',
})
export class CookieBanner implements OnInit {
  isVisible = signal(false);
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    // Solo ejecutar en el navegador (no en SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.checkConsent();
    }
  }

  checkConsent() {
    const consent = localStorage.getItem('cookieConsent');
    
    // Si NO existe registro de consentimiento, mostramos el banner
    if (!consent) {
      // Pequeño delay para no abrumar al usuario apenas entra
      setTimeout(() => {
        this.isVisible.set(true);
      }, 1500);
    }
  }

  accept() {
    this.isVisible.set(false);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cookieConsent', 'accepted');
      // AQUÍ: Activarías tus scripts de Google Analytics / Pixel
      this.initializeAnalytics(); 
    }
  }

  decline() {
    this.isVisible.set(false);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cookieConsent', 'declined');
      // No activamos nada
    }
  }

  // Ejemplo de método para encender rastreadores
  private initializeAnalytics() {
    console.log('Cookies aceptadas. Iniciando Analytics 🚀');
    // window.gtag('config', 'TU-ID-GA');
  }
}
