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

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Escuchar el scroll de la ventana
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Verificamos SSR para que no rompa el servidor
    if (isPlatformBrowser(this.platformId)) {
      const scrollPosition = window.scrollY || this.document.documentElement.scrollTop || this.document.body.scrollTop || 0;
      
      // Mostrar si bajamos más de 400px
      if (scrollPosition > 400) {
        this.showScrollBtn = true;
      } else {
        this.showScrollBtn = false;
      }
    }
  }

  scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth' // Subida suave
      });
    }
  }

}
