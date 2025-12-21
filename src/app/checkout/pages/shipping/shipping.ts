import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CheckoutService } from '../../../services/checkout';
import { Products } from '../../../services/product';
interface ShippingMethod {
  id: string;
  name: string;
  eta: string; // Estimated Time of Arrival
  price: number;
}
@Component({
  selector: 'app-shipping',
  imports: [CommonModule, CurrencyPipe, FormsModule, RouterLink],
  templateUrl: './shipping.html',
  styleUrl: './shipping.scss',
})
export default class Shipping {

  private router = inject(Router);
  private checkoutService = inject(CheckoutService);
  private productService = inject(Products);

  // Signals directos del servicio
  progress = this.checkoutService.shippingProgress;
  methods = this.checkoutService.availableShippingMethods;
  // Usamos computed() para que si el estado cambia, esto se actualice solo.

  contactEmail = this.checkoutService.email; // Signal directa

  shippingAddressLine = computed(() => {
    const addr = this.checkoutService.shippingAddress();
    if (!addr) return 'Dirección no definida';
    // Formato: "Av. Larco 123, Miraflores, Lima"
    return `${addr.address}, ${addr.city}, ${addr.department}`;
  });


  // Estado de la selección actual
  selectedMethodId = signal<string>('standard');

  // ==========================================
  // 3. CICLO DE VIDA
  // ==========================================
  ngOnInit() {
    // HYDRATION: Recuperar selección previa si el usuario regresa
    const savedMethod = this.checkoutService.shippingMethodId();
    if (savedMethod) {
      this.selectedMethodId.set(savedMethod);
    }
  }

  // ==========================================
  // 4. ACCIONES
  // ==========================================
  submit() {
    const methodId = this.selectedMethodId();

    // Guardar en el servicio (y por ende en sessionStorage)
    this.checkoutService.setShippingMethod(methodId);

    // console.log('✅ Método de envío guardado:', methodId);

    // Navegar al siguiente paso
    this.router.navigate(['/checkout/payment']);
  }
}
