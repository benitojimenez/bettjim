import { Component, effect, ElementRef, Inject, input, PLATFORM_ID, ViewChild, ViewEncapsulation } from '@angular/core';
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
  products = input.required<Product[]>();
  // 🔒 EL CANDADO: Evita que se inicialice múltiples veces
  private isInitialized = false;
  @ViewChild('swiperRef') swiperRef!: ElementRef;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    
   effect(async () => {
      const items = this.products();

      // CONDICIONES ESTRICTAS:
      // 1. Hay productos
      // 2. Es navegador (no servidor)
      // 3. 🔒 NO se ha inicializado antes (!this.isInitialized)
      if (items.length > 0 && isPlatformBrowser(this.platformId) && !this.isInitialized) {
        
        // Esperamos un momento a que el HTML exista
        await new Promise(resolve => setTimeout(resolve, 0));
        this.initSwiper();
      }
    });
  }

async initSwiper() {
    // Doble chequeo de seguridad
    if (this.isInitialized) return;

    try {
      // 1. Cargar Swiper
      const { register } = await import('swiper/element/bundle');
      register();

      // 2. Esperar a que el navegador reconozca la etiqueta
      await customElements.whenDefined('swiper-container');

      const swiperEl = this.swiperRef.nativeElement as any;

      // 3. Configuración
      const params = {
        slidesPerView: 2,
        spaceBetween: 15,
        loop: true,
        speed: 800,
        navigation: { nextEl: '.custom-next', prevEl: '.custom-prev' },
        pagination: { el: '.custom-pagination', clickable: true },
        autoplay: { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true },
        breakpoints: {
          640: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 4, spaceBetween: 30 },
          1400: { slidesPerView: 6, spaceBetween: 30 }
        },
      };

      // 4. Asignar parámetros
      Object.assign(swiperEl, params);

      // 5. INTENTO DE INICIALIZACIÓN SEGURO
      // Preguntamos: "¿Ya tienes el método initialize?"
      if (typeof swiperEl.initialize === 'function') {
        swiperEl.initialize();
        this.isInitialized = true; // 🔒 CERRAMOS EL CANDADO
        // console.log('✅ Swiper arrancó a la primera');
      } else {
        // Plan B: Reintentar un par de veces por si acaso (Polling suave)
        this.waitForSwiper(swiperEl);
      }

    } catch (error) {
      // console.error('Error al cargar Swiper:', error);
    }
  }

  // Función auxiliar para esperar si el navegador es lento
  waitForSwiper(swiperEl: any, attempts = 0) {
    if (attempts > 10) return; // Rendirse después de 500ms (evita bucles infinitos)

    if (typeof swiperEl.initialize === 'function') {
      swiperEl.initialize();
      this.isInitialized = true; // 🔒 CERRAMOS EL CANDADO
      // console.log('✅ Swiper arrancó tras espera');
    } else {
      setTimeout(() => this.waitForSwiper(swiperEl, attempts + 1), 50);
    }
  }

  
}
