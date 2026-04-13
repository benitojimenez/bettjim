import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Toast } from './shared/components/toast/toast';
import { HeaderOne } from "./shared/header/header-one/header-one";
import { Sidebar } from "./shared/components/layout/sidebar/sidebar";
import { FooterOne } from "./shared/footer/footer-one/footer-one";
import { CartSidebar } from "./shared/components/layout/cart-sidebar/cart-sidebar";
import { ProgressBar } from './shared/components/progress-bar/progress-bar';
import { CookieBanner } from './shared/components/cookie-banner/cookie-banner';
import { LuckyWheel } from './shared/components/lucky-wheel/lucky-wheel';
import { filter } from 'rxjs';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, HeaderOne, Sidebar, FooterOne, CartSidebar,ProgressBar, CookieBanner, LuckyWheel],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('bettjim');
  private router = inject(Router);

  // 🔥 1. Creamos la Signal (Por defecto asumimos que no es una ruta flash)
  isFlashRoute = signal<boolean>(false);
  constructor() {
    // 🔥 2. Escuchamos cada vez que la navegación termina con éxito
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      
      // Si la URL actual contiene '/flash/', la Signal cambia a TRUE
      // urlAfterRedirects nos asegura leer la URL final real.
      this.isFlashRoute.set(event.urlAfterRedirects.includes('/flash/'));
      
    });
  }

}
