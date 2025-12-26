import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';

// Registramos los Web Components de Swiper
register();

export interface TrustItem {
  id: string; // Útil para el tracking
  iconName: 'shield' | 'return' | 'truck' | 'tag' | 'headset' | 'radar' | 'medal';
  title: string;
  subtitle: string;
  colorClass: string;
}


@Component({
  selector: 'app-trust-badges',
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // <--- IMPORTANTE
  templateUrl: './trust-badges.html',
  styleUrl: './trust-badges.scss',
  encapsulation: ViewEncapsulation.None // Para estilizar el swiper desde fuera

})
export class TrustBadges {
  // SIGNAL: Array de datos reactivo
  items = signal<TrustItem[]>([
    {
      id: '1',
      iconName: 'shield',
      title: 'Pago Seguro',
      subtitle: 'SSL 256-bit',
      colorClass: 'shield'
    },
    {
      id: '2',
      iconName: 'return',
      title: 'Devolución',
      subtitle: '7 días gratis',
      colorClass: 'return'
    },
    {
      id: '3',
      iconName: 'truck',
      title: 'Envío Gratis',
      subtitle: 'Por compras > S/99',
      colorClass: 'shipping'
    },
    {
      id: '4',
      iconName: 'tag',
      title: 'Ofertas Flash',
      subtitle: 'Hasta -40% OFF',
      colorClass: 'offers'
    },
    {
      id: '5',
      iconName: 'headset',
      title: 'Soporte 24/7',
      subtitle: 'Atención real',
      colorClass: 'support'
    },
    {
      id: '6',
      iconName: 'radar',
      title: 'Tracking',
      subtitle: 'Rastreo en vivo',
      colorClass: 'tracking'
    },
    {
      id: '7',
      iconName: 'medal',
      title: 'Mejor Precio',
      subtitle: 'Garantizado',
      colorClass: 'price'
    }
  ]);

  // Configuración de Swiper (Breakpoints)
  breakpoints = {
    0: { slidesPerView: 2, spaceBetween: 15 },    // Móvil
    640: { slidesPerView: 2, spaceBetween: 20 },  // Tablet
    1024: { slidesPerView: 4, spaceBetween: 24 },   // Laptop
    1280: { slidesPerView: 6, spaceBetween: 24 }    // Pantalla Grande
  };

}
