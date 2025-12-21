import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { LayoutService } from '../../../../services/Layout';
import { Products } from '../../../../services/product';
import { Auth } from '../../../../services/auth';
import { environment } from '../../../../../environments/environment';
import { RouterLink } from "@angular/router";
import { Cart } from '../../../../services/cart';

@Component({
  selector: 'app-cart-sidebar',
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './cart-sidebar.html',
  styleUrl: './cart-sidebar.scss',
})
export class CartSidebar {
  layout = inject(LayoutService);
  URL_IMG: string = environment.API_URL + 'product_imagen/';
  authService = inject(Auth); // 👈 2. INYECCIÓN REAL
  cartService = inject(Cart)

  isAuthenticated() {
    // Puedes inyectar AuthService si quieres ocultar el botón sync
    return false; 
  }
}
