import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-order-detail',
  imports: [CommonModule],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
})
export default class OrderDetail {

  private route = inject(ActivatedRoute);

  orderId = this.route.snapshot.paramMap.get('id');

  // Simulación de datos (Esto vendría de tu API)
  order = signal({
    id: this.orderId || 'ORD-8821',
    date: new Date(),
    status: 'shipped', // processing, shipped, delivered, cancelled
    trackingNumber: 'TRK-9988776655',
    paymentMethod: 'Visa terminada en 4242',
    shippingAddress: {
      name: 'BettJim User',
      street: 'Av. Larco 123, Dpto 401',
      city: 'Miraflores, Lima',
      phone: '+51 999 999 999'
    },
    items: [
      { name: 'Camiseta Oversize Black', size: 'M', qty: 1, price: 80.00, image: 'https://via.placeholder.com/80' },
      { name: 'Pantalón Cargo Beige', size: '32', qty: 1, price: 120.00, image: 'https://via.placeholder.com/80' },
      { name: 'Gorra Urbana', size: 'U', qty: 1, price: 45.00, image: 'https://via.placeholder.com/80' }
    ],
    summary: {
      subtotal: 245.00,
      shipping: 15.00,
      discount: 10.00,
      total: 250.00
    }
  });

  // Configuración del Stepper (Línea de Progreso)
  steps = [
    { id: 'placed', label: 'Confirmado', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'processing', label: 'Preparando', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { id: 'shipped', label: 'Enviado', icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' },
    { id: 'delivered', label: 'Entregado', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' }
  ];

  // Calcula en qué paso estamos (0, 1, 2, 3)
  currentStepIndex = computed(() => {
    const status = this.order().status;
    if (status === 'cancelled') return -1;
    // Mapeo simple: el índice coincide con el orden en 'steps'
    const statusMap: any = { 'placed': 0, 'processing': 1, 'shipped': 2, 'delivered': 3 };
    return statusMap[status] ?? 0;
  });

  isStepCompleted(index: number): boolean {
    return index <= this.currentStepIndex();
  }

}
