import { ChangeDetectionStrategy, Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common'; // Importante
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-footer-one',
  imports: [RouterLink],
  templateUrl: './footer-one.html',
  styleUrl: './footer-one.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterOne {

 showScrollBtn = false;
  dateYear: number = new Date().getFullYear();
  
  // Variable para controlar si los acordeones nacen abiertos o cerrados
  // Por defecto lo dejamos en true para que el SEO del servidor lea los enlaces
  isDesktop: boolean = true; 

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Solo revisamos el tamaño si estamos en el navegador
    this.checkScreenSize();
  }

  // --- ESCUCHAS DE EVENTOS (SCROLL Y RESIZE) ---

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      const scrollPosition = window.scrollY || this.document.documentElement.scrollTop || this.document.body.scrollTop || 0;
      
      // Mostrar si bajamos más de 400px (Lógica simplificada)
      this.showScrollBtn = scrollPosition > 400;
    }
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.checkScreenSize();
  }

  // --- MÉTODOS DE ACCIÓN ---

  scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth' // Subida suave
      });
    }
  }

  private checkScreenSize() {
    // ¡AQUÍ ESTÁ LA MAGIA SSR!
    // Protegemos el uso de 'window.innerWidth' para que el servidor Node.js no colapse
    if (isPlatformBrowser(this.platformId)) {
      this.isDesktop = window.innerWidth > 991;
    }
  }

}
