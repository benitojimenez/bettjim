import { ChangeDetectionStrategy, Component, HostListener, Inject, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LayoutService } from '../../../services/Layout';
import { Products } from '../../../services/product';
import { Auth } from '../../../services/auth';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Cart } from '../../../services/cart';

@Component({
  selector: 'app-header-one',
  imports: [RouterLink, CommonModule],
  templateUrl: './header-one.html',
  styleUrl: './header-one.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderOne implements OnInit {
  layout = inject(LayoutService);
  ps = inject(Products);
  cartService = inject(Cart)
  auth = inject(Auth); // Inyectamos Auth Service
  // Método para actualizar la búsqueda
  // 👇 Inyectamos el Router para manipular la URL
  private router = inject(Router);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  ngOnInit() {
    // Solo iniciamos el timer en el navegador (no en el servidor)
    if (isPlatformBrowser(this.platformId)) {
      this.startAnnouncementLoop();
    }
  }

  ngOnDestroy() {
    // Limpiamos el timer al salir para no gastar memoria
    if (this.intervalId) clearInterval(this.intervalId);
  }

  startAnnouncementLoop() {
    this.intervalId = setInterval(() => {
      // 1. Guardamos el índice actual como "previo" (el que se va)
      this.prevAnnouncementIndex.set(this.currentAnnouncementIndex());

      // 2. Calculamos el nuevo índice (Loop infinito)
      const nextIndex = (this.currentAnnouncementIndex() + 1) % this.announcements().length;
      
      // 3. Actualizamos el actual
      this.currentAnnouncementIndex.set(nextIndex);
      
    }, 4000); // Cambia cada 4 segundos
  }
  // 1. Los mensajes que quieres mostrar
  announcements = signal([
    "📦 Envío Gratis a todo Perú por compras mayores a S/99",
    "✨ Tu estilo solo aqui ",
    "✨ Nueva Colección 'Glow' ya disponible - Ver Más",
    "🎁 Regalo sorpresa en tu primera compra"
  ]);

  // 2. Índices para controlar la animación
  currentAnnouncementIndex = signal(0);
  prevAnnouncementIndex = signal(-1); // Para saber cuál se está yendo

  private intervalId: any;



  onSearch(term: string) {
    // CAMBIO CLAVE: En lugar de [], ponemos ['/shop']
    this.router.navigate(['/shop'], { 
      
      // relativeTo: this.route,  <-- BORRA ESTO (Ya no es relativo, es absoluto a /shop)
      
      queryParams: { q: term || null }, // Asigna el término a ?q=
      
      queryParamsHandling: 'merge',     // Mantiene otros filtros si ya estabas en /shop (ej: ?cat=hombre&q=...)
      
      replaceUrl: true                  // Evita llenar el historial del navegador con cada letra
    });
  }

  // 1. Estado para el Buscador
  isSearchFocused = false;

  // 2. Estado para el Smart Header
  isHeaderVisible = signal(true);
  private lastScrollPosition = 0;

  // Detectar Scroll
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScroll = window.scrollY || document.documentElement.scrollTop;
    
    // Si bajamos más de 50px y estamos haciendo scroll hacia abajo -> OCULTAR
    if (currentScroll > 50 && currentScroll > this.lastScrollPosition) {
      this.isHeaderVisible.set(false);
    } else {
      // Si subimos -> MOSTRAR
      this.isHeaderVisible.set(true);
    }
    
    this.lastScrollPosition = currentScroll;
  }

  // Retraso para cerrar búsqueda (para que dé tiempo a hacer clic en sugerencias)
  closeSearchDelay() {
    setTimeout(() => {
      this.isSearchFocused = false;
    }, 200);
  }
}
