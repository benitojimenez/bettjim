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
  productService = inject(Products);
  cartService = inject(Cart)
  auth = inject(Auth); // Inyectamos Auth Service
  // Método para actualizar la búsqueda
  // 👇 Inyectamos el Router para manipular la URL
  private router = inject(Router);

  // Signal local para el input del header
  headerSearchTerm = this.productService.search; // Directamente vinculada a la señal global de búsqueda del servicio de productos

  // Para detectar en qué página estamos (si es necesario para lógica específica)
  private route = inject(ActivatedRoute);

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
  clearHeaderSearch() {
    this.headerSearchTerm.set('');
    // Opcional: Si quieres que al darle a la X estando en /shop se limpie la tienda automáticamente
    // this.productService.search.set('');
    // this.router.navigate(['/shop']);
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
    if (!term) return; // Opcional: Evitar búsquedas vacías desde el header

    // 1. Actualizamos el estado global al instante
    this.productService.search.set(term);
    this.productService.page.set(1); // Siempre que buscamos, volvemos a la pag 1

    // 2. Navegamos a la tienda. 
    // - Si estás en el /home, te lleva al /shop.
    // - Si YA estás en el /shop, solo inyecta el parámetro en la URL sin recargar la página.
    this.router.navigate(['/shop'], { 
      queryParams: { 
        search: term,
        page: null // Limpiamos la página de la URL para que arranque limpio
      },
      queryParamsHandling: 'merge' // Respeta si el usuario ya tenía un filtro de color o precio en la URL
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
