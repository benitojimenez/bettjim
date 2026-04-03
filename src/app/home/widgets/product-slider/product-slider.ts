import { afterNextRender, Component, effect, ElementRef, Inject, input, PLATFORM_ID, ViewChild, ViewEncapsulation } from '@angular/core';
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
  
  // 1. Capturamos el Swiper y los nuevos controles
  @ViewChild('swiperRef') swiperRef!: ElementRef;
  @ViewChild('prevBtn') prevBtn?: ElementRef;
  @ViewChild('nextBtn') nextBtn?: ElementRef;
  @ViewChild('paginationEl') paginationEl?: ElementRef;

  private isInitialized = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    afterNextRender(async () => {
      if (this.products().length > 0 && !this.isInitialized) {
        await this.initSwiper();
      }
    });
  }

  async initSwiper() {
    try {
      const { register } = await import('swiper/element/bundle');
      register();

      await customElements.whenDefined('swiper-container');

      const swiperEl = this.swiperRef?.nativeElement;
      if (!swiperEl) return;

      // 2. Configuración usando nativeElement en lugar de clases CSS
      const params = {
        slidesPerView: 2,
        spaceBetween: 15,
        loop: true,
        speed: 800,
        navigation: { 
          // Pasamos el elemento HTML directo
          nextEl: this.nextBtn?.nativeElement, 
          prevEl: this.prevBtn?.nativeElement 
        },
        pagination: { 
          // Pasamos el elemento HTML directo
          el: this.paginationEl?.nativeElement, 
          clickable: true 
        },
        autoplay: { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true },
        breakpoints: {
          640: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 4, spaceBetween: 30 },
          1400: { slidesPerView: 6, spaceBetween: 30 }
        },
      };

      Object.assign(swiperEl, params);
      swiperEl.initialize();
      
      this.isInitialized = true;

    } catch (error) {
      console.error('Bettjim: Error iniciando Swiper del Carrusel', error);
    }
  }
}
