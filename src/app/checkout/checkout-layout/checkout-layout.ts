import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OrderSummary } from "../witgets/order-summary/order-summary";


@Component({
  selector: 'app-checkout-layout',
  imports: [RouterOutlet, CommonModule, OrderSummary],
  templateUrl: './checkout-layout.html',
  styleUrl: './checkout-layout.scss',
})
export class CheckoutLayout {
  // Controla si el resumen está abierto en móvil
 mobileSummaryOpen = signal(false);

  toggleSummary() {
    this.mobileSummaryOpen.update(v => !v);
  }
}
