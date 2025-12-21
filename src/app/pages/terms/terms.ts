import { Component, signal, AfterViewInit, OnDestroy, ElementRef, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
@Component({
  selector: 'app-terms',
  imports: [CommonModule],
  templateUrl: './terms.html',
  styleUrl: './terms.scss',
})
export default class Terms implements AfterViewInit, OnDestroy {
  // Lista de secciones para el menú
  sections = [
    { id: 'intro', title: '1. Introducción' },
    { id: 'shipping', title: '2. Envíos' },
    { id: 'payments', title: '3. Pagos' },
    { id: 'returns', title: '4. Devoluciones' },
    { id: 'privacy', title: '5. Privacidad' }
  ];

  activeSection = signal('intro');
  private observer: IntersectionObserver | null = null;
  private el = inject(ElementRef);

 // 1. INYECTAR EL ID DE LA PLATAFORMA
  private platformId = inject(PLATFORM_ID); 

  ngAfterViewInit() {
    // 2. 🔥 CONDICIÓN DE SEGURIDAD (SOLO NAVEGADOR) 🔥
    if (isPlatformBrowser(this.platformId)) {
      
      // Aquí dentro es seguro usar window, document, IntersectionObserver, etc.
      const options = { root: null, rootMargin: '-20% 0px -60% 0px', threshold: 0 };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) this.activeSection.set(entry.target.id);
        });
      }, options);

      this.sections.forEach(sec => {
        const el = document.getElementById(sec.id);
        if (el) this.observer?.observe(el);
      });
      
    }
  }

  ngOnDestroy() {
    // También es buena práctica proteger el destroy, aunque el '?' en observer? lo maneja
    this.observer?.disconnect();
  }

  scrollTo(id: string) {
    // También protegemos esto por si acaso se llama muy rápido
    if (isPlatformBrowser(this.platformId)) {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.activeSection.set(id);
      }
    }
  }
}
