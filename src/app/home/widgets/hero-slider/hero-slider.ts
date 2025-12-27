import { Component, ElementRef, Inject, PLATFORM_ID, ViewChild, ViewEncapsulation, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit, signal, ChangeDetectionStrategy, resource, computed, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { AdsService } from '../../../services/ads';
@Component({
  selector: 'app-hero-slider',
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './hero-slider.html',
  styleUrl: './hero-slider.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroSlider implements AfterViewInit {

  ads = inject(AdsService);
  @ViewChild('heroSwiper') swiperRef!: ElementRef;
  
  // Señal para controlar la barra de progreso (0 a 100%)
  progressWidth = signal(0);
  urlImage = signal(environment.API_URL+'image_ads/');

    // {
    //   id: 1,
    //   type: 'video', // 🔥 NUEVO: Soporte de Video
    //   src: 'https://cdn.coverr.co/videos/coverr-fashion-photoshoot-4658/1080p.mp4', // Video de moda libre de derechos
    //   poster: 'https://images.unsplash.com/photo-1483985988355-763728e1935b', // Imagen de carga mientras baja el video
    //   subtitle: 'CINEMATIC EXPERIENCE',
    //   title: 'Fashion Week 2025',
    //   desc: 'Vive la moda en movimiento. Nuevas texturas, nuevos colores.',
    //   btnText: 'Ver Video',
    //   link: '/shop/new'
    // },
  slides = [

    {
      id: 1,
      type: 'image', // 🔥 NUEVO: Soporte de Video
      src: 'https://api.bettjim.com/api/image_ads/9ULxsiJ-AEh9BwLGZIYRMVvB.webp', // Video de moda libre de derechos
      subtitle: 'BETTJIM STORE',
      title: 'La mejor tienda en línea de moda',
      desc: 'Descubre las últimas tendencias y estilos exclusivos.',
      btnText: 'Explorar Colección',
      link: '/shop'
    },
    {
      id: 2,
      type: 'image',
      src: 'https://api.bettjim.com/api/image_ads/b2GW_MmyhsDx6hLm5Btal6u5.webp',
      subtitle: 'BIENVENIDO A YAPE',
      title: 'Paga Fácil y Rápido',
      desc: 'Usa Yape para todas tus compras en línea en Bettjim.',
      btnText: 'Comprar Ahora',
      link: '/shop/'
    },
    {
      id: 3,
      type: 'image',
      src: 'https://api.bettjim.com/api/image_ads/IqQyvjmhISBxacWqbRpwMG1_.webp',
      subtitle: 'TECNOLOGÍA AVANZADA',
      title: 'Compra Facil con Descuentos',
      desc: 'Diseños innovadores y tecnología de punta.',
      btnText: 'Ver Ofertas',
      link: '/shop/'
    }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const { register } = await import('swiper/element/bundle');
      register();

      const swiperEl = this.swiperRef.nativeElement as any;

      const params = {
        slidesPerView: 1,
        loop: true,
        speed: 1000,
        effect: 'fade', // Efecto elegante
        autoplay: {
          delay: 6000, // 6 segundos por slide
          disableOnInteraction: false
        },
        pagination: { clickable: true, el: '.hero-pagination' },
        navigation: { nextEl: '.hero-next', prevEl: '.hero-prev' },
        
        // 🔥 EVENTO PRO: Sincronizar barra de progreso
        on: {
          autoplayTimeLeft: (s: any, time: number, progress: number) => {
            // progress va de 1 a 0. Lo convertimos a porcentaje (0% a 100%)
            this.progressWidth.set((1 - progress) * 100);
          }
        }
      };

      Object.assign(swiperEl, params);
      
      if (typeof swiperEl.initialize === 'function') {
        swiperEl.initialize();
      }
    }
  }
}
