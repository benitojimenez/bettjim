import { afterNextRender, Component, effect, ElementRef, Inject, input, PLATFORM_ID, viewChild, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { ProductTwo } from '../../../shared/components/product/product-two/product-two';
import { Product } from '../../../shared/classes/product';

// Importamos Swiper y sus módulos necesarios
// O para Angular v17+ Standalone moderno, usamos Custom Elements:
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

// Registramos Swiper (necesario para componentes standalone modernos)


@Component({
  selector: 'app-product-slider',
  imports: [ProductTwo,CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Necesario para usar <swiper-container>
  templateUrl: './product-slider.html',
  styleUrl: './product-slider.scss',
  encapsulation: ViewEncapsulation.None // Importante para estilizar los puntitos/flechas de Swiper
  
})
export class ProductSlider {
  title = input.required<string>();
  products = input.required<any[]>();
  
  // 🔥 Usamos viewChild (Signals) en lugar del viejo @ViewChild para mejor reactividad
  swiperRef = viewChild<ElementRef>('swiperRef');
  prevBtn = viewChild<ElementRef>('prevBtn');
  nextBtn = viewChild<ElementRef>('nextBtn');
  paginationEl = viewChild<ElementRef>('paginationEl');

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    
    // EFECTO: Reacciona automáticamente cuando hay productos y el HTML está listo
    effect(async () => {
      const prods = this.products();
      const swiperEl = this.swiperRef()?.nativeElement;

      // Si hay productos, el elemento swiper existe y estamos en el navegador
      if (prods && prods.length > 0 && swiperEl && isPlatformBrowser(this.platformId)) {
        
        const { register } = await import('swiper/element/bundle');
        register();

        // 🔥 EL FIX MÁGICO: Damos 50ms para que el @for dibuje todos los <swiper-slide> 
        // antes de que Swiper calcule los anchos. Esto arregla el bug al regresar de otra ruta.
        setTimeout(() => {
          const params = {
            slidesPerView: 2,
            spaceBetween: 15,
            loop: true,
            speed: 800,
            navigation: { 
              nextEl: this.nextBtn()?.nativeElement, 
              prevEl: this.prevBtn()?.nativeElement 
            },
            pagination: { 
              el: this.paginationEl()?.nativeElement, 
              clickable: true 
            },
            autoplay: { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true },
            breakpoints: {
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 4, spaceBetween: 30 },
              1400: { slidesPerView: 6, spaceBetween: 30 }
            },
          };

          // Inyectamos parámetros e inicializamos
          Object.assign(swiperEl, params);
          if (typeof swiperEl.initialize === 'function') {
            swiperEl.initialize();
          }
        }, 50); 
      }
    });
  }
}
