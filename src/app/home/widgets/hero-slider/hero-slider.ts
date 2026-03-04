import { Component, ElementRef, Inject, PLATFORM_ID, ViewEncapsulation, CUSTOM_ELEMENTS_SCHEMA, signal, ChangeDetectionStrategy, inject, viewChild, effect, untracked } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { AdsService } from '../../../services/ads';

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './hero-slider.html',
  styleUrl: './hero-slider.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroSlider {

  ads = inject(AdsService);
  swiperRef = viewChild<ElementRef>('heroSwiper');
  
  progressWidth = signal(0);
  urlImage = signal(environment.API_URL + 'image_ads/');

  // 1. Arrancamos SIEMPRE cargando (Skeleton visible)
  isLoading = signal(true);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    
    // EFECTO 1: Controlar el retardo de carga (Stabilizer)
    effect(() => {
      const data = this.ads.cleanAds();
      console.log('Ads para el slider:', data); // Debug: Ver qué datos llegan al efecto

      // Si llegaron los datos y no están vacíos
      if (data && data.length > 0) {
        
        // 🔥 TRUCO DEL RETRASO: Esperamos 100ms antes de quitar el skeleton
        // Esto evita el pantallazo blanco mientras Angular renderiza el Swiper
        setTimeout(() => {
          this.isLoading.set(false); 
        }, 100); // <- Tiempo de estabilización
      }
    });


    // EFECTO 2: Inicializar Swiper (Solo cuando isLoading sea FALSE)
    effect(async () => {
      // Dependencias
      const loading = this.isLoading();
      const swiperEl = this.swiperRef()?.nativeElement;

      // Solo iniciamos si YA terminamos de cargar (pasaron los 100ms) y el elemento existe
      if (!loading && swiperEl && isPlatformBrowser(this.platformId)) {
        
        const { register } = await import('swiper/element/bundle');
        register();

        const params = {
          slidesPerView: 1,
          loop: true,
          speed: 1000,
          effect: 'fade',
          autoplay: { delay: 6000, disableOnInteraction: false },
          pagination: { clickable: true, el: '.hero-pagination' },
          navigation: { nextEl: '.hero-next', prevEl: '.hero-prev' },
          on: {
            autoplayTimeLeft: (s: any, time: number, progress: number) => {
              untracked(() => this.progressWidth.set((1 - progress) * 100));
            }
          }
        };

        Object.assign(swiperEl, params);
        
        if (typeof swiperEl.initialize === 'function') {
          swiperEl.initialize();
        }
      }
    });
  }
}