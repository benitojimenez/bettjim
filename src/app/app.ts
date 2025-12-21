import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from './shared/components/toast/toast';
import { HeaderOne } from "./shared/header/header-one/header-one";
import { Sidebar } from "./shared/components/layout/sidebar/sidebar";
import { FooterOne } from "./shared/footer/footer-one/footer-one";
import { CartSidebar } from "./shared/components/layout/cart-sidebar/cart-sidebar";
import { ProgressBar } from './shared/components/progress-bar/progress-bar';
import { CookieBanner } from './shared/components/cookie-banner/cookie-banner';
import { LuckyWheel } from './shared/components/lucky-wheel/lucky-wheel';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, HeaderOne, Sidebar, FooterOne, CartSidebar,ProgressBar, CookieBanner,LuckyWheel],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('bettjim');
}
