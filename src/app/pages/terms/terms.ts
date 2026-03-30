import { Component, signal, AfterViewInit, OnDestroy, ElementRef, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-terms',
  imports: [CommonModule, FormsModule],
  templateUrl: './terms.html',
  styleUrl: './terms.scss',
})
export default class Terms implements AfterViewInit, OnDestroy {
  // Lista de secciones para el menú
  searchTerm: string = '';
  activeSectionId: string = 'intro';

  // Array de secciones. Agregamos 'keywords' para hacer la búsqueda más inteligente
  sections = [
  { id: 'intro', title: '1. Introducción', keywords: 'bienvenido condiciones cuenta registro modificar' },
  { id: 'shipping', title: '2. Envíos y Entregas', keywords: 'envío entrega lima provincias olva shalom tiempo' },
  { id: 'pricing', title: '3. Precios y Facturación', keywords: 'precios igv boleta factura comprobante soles' },
  { id: 'payments', title: '4. Métodos de Pago', keywords: 'pagos tarjeta visa mastercard yape plin ssl' },
  { id: 'stock', title: '5. Disponibilidad', keywords: 'stock agotado reembolso alternativo inventario' },
  { id: 'returns', title: '6. Cambios y Devoluciones', keywords: 'cambio devolucion reembolso garantia liquidacion' },
  { id: 'privacy', title: '7. Privacidad de Datos', keywords: 'privacidad datos informacion seguridad terceros' }
];

  // Función que decide si ocultar o mostrar una sección
  isVisible(sectionId: string): boolean {
    if (!this.searchTerm.trim()) return true; // Si no hay búsqueda, muestra todo
    
    const term = this.searchTerm.toLowerCase().trim();
    const section = this.sections.find(s => s.id === sectionId);
    
    if (!section) return false;

    // Busca coincidencias en el título o en las palabras clave
    return section.title.toLowerCase().includes(term) || section.keywords.toLowerCase().includes(term);
  }

  // Verifica si hay al menos un resultado para mostrar mensaje de "No encontrado"
  get hasResults(): boolean {
    return this.sections.some(s => this.isVisible(s.id));
  }


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
