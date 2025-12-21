import { Component, ElementRef, Inject, PLATFORM_ID, ViewChild, ViewEncapsulation, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

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
  @ViewChild('heroSwiper') swiperRef!: ElementRef;
  
  // Señal para controlar la barra de progreso (0 a 100%)
  progressWidth = signal(0);

  slides = [
    {
      id: 1,
      type: 'video', // 🔥 NUEVO: Soporte de Video
      src: 'https://cdn.coverr.co/videos/coverr-fashion-photoshoot-4658/1080p.mp4', // Video de moda libre de derechos
      poster: 'https://images.unsplash.com/photo-1483985988355-763728e1935b', // Imagen de carga mientras baja el video
      subtitle: 'CINEMATIC EXPERIENCE',
      title: 'Fashion Week 2025',
      desc: 'Vive la moda en movimiento. Nuevas texturas, nuevos colores.',
      btnText: 'Ver Video',
      link: '/shop/new'
    },
    {
      id: 2,
      type: 'image',
      src: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2073&auto=format&fit=crop',
      subtitle: 'SUMMER VIBES',
      title: 'Vestidos de Verano',
      desc: 'Frescura y elegancia para los días de sol.',
      btnText: 'Comprar Ahora',
      link: '/shop/summer'
    },
    {
      id: 3,
      type: 'image',
      src: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=2001&auto=format&fit=crop',
      subtitle: 'TECH PREMIERE',
      title: 'Sonido Inmersivo',
      desc: 'Auriculares con cancelación de ruido de última generación.',
      btnText: 'Ver Gadgets',
      link: '/shop/tech'
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
