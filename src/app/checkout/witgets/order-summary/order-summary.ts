import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { CheckoutService } from '../../../services/checkout';
import { Cart } from '../../../services/cart';
@Component({
  selector: 'app-order-summary',
  imports: [CommonModule],
  templateUrl: './order-summary.html',
  styleUrl: './order-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderSummary {
  // Datos simulados (en producción vendrían de tu CartService)
  cartService = inject(Cart);
  checkoutService = inject(CheckoutService);

  URL_IMG: string = environment.API_URL + 'product_imagen/';

  // 1. SUBTOTAL (Simulado - Esto vendría de tu CartService)
  // IMPORTANTE: Este valor debe ser el mismo que usas en ShippingComponent

  // 2. LEER MÉTODO SELECCIONADO DEL SERVICIO
  selectedMethodId = this.checkoutService.shippingMethodId; 

  // 3. CALCULAR COSTO DE ENVÍO (Lógica Centralizada)
  shippingCost = computed(() => {
    const method = this.selectedMethodId();
    const total = this.cartService.cartTotal();
    
    // Regla de Negocio: Gratis si es mayor a 99
    const isFree = total >= 99.00;

    if (method === 'express') {
      return 25.00; // Express siempre cobra
    }
    
    if (method === 'standard') {
      // Si es gratis retorna 0, sino 10
      return isFree ? 0 : 10.00; 
    }

    // Si no ha seleccionado nada o está en el paso 1 (Info)
    return null; 
  });

  // 4. TOTAL FINAL
  total = computed(() => {
    // Si shippingCost es null (paso 1), asumimos 0 para la suma visual o esperamos
    const shipping = this.shippingCost() || 0;
    return this.cartService.cartTotal() + shipping; 
    // - this.discount() si tuvieras cupones
  });

  // Totales
  discount = signal(0);



  // Lógica del cupón
  couponCode = signal('');
  isApplyingCoupon = signal(false);

  applyCoupon(code: string) {
    if (!code) return;
    this.isApplyingCoupon.set(true);

    // Simulación de API
    setTimeout(() => {
      this.isApplyingCoupon.set(false);
      alert(`Cupón ${code} validado (simulación)`);
    }, 1500);
  }
}
