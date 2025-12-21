import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Auth } from '../../../services/auth';
import { RouterLink } from '@angular/router';
// Interfaces para tipar los datos (idealmente mover a un archivo de modelos)
interface DashboardMetrics {
  activeOrders: number;
  wishlistCount: number;
  loyaltyPoints: number;
}

interface RecentOrder {
  id: string;
  date: Date;
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  itemsCount: number;
}

@Component({
  selector: 'app-overview',
  imports: [CommonModule, RouterLink],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export default class Overview {
  public auth = inject(Auth);

  // 1. Señal para métricas principales
  metrics = signal<DashboardMetrics>({
    activeOrders: 2,
    wishlistCount: 14,
    loyaltyPoints: 350
  });

  // 2. Señal para pedidos recientes (Simulación)
  recentOrders = signal<RecentOrder[]>([
    { id: 'ORD-7829', date: new Date(), total: 145.50, status: 'processing', itemsCount: 3 },
    { id: 'ORD-7828', date: new Date(Date.now() - 86400000 * 2), total: 89.90, status: 'shipped', itemsCount: 1 },
    { id: 'ORD-7825', date: new Date(Date.now() - 86400000 * 10), total: 210.00, status: 'delivered', itemsCount: 4 },
    { id: 'ORD-7824', date: new Date(Date.now() - 86400000 * 10), total: 210.00, status: 'delivered', itemsCount: 4 },
  ]);

  // Computada para obtener el primer nombre del usuario
  firstName = computed(() => {
    const fullName = this.auth.getLastName() || '';
    return fullName.split(' ')[0] || 'Usuario';
  });

  // Helper para obtener clase CSS según el estado del pedido
  getStatusClass(status: string): string {
    switch(status) {
      case 'processing': return 'bg-orange-100 text-orange-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  // Helper para traducir estado
  getStatusLabel(status: string): string {
    const labels: {[key: string]: string} = {
      'processing': 'En Proceso',
      'shipped': 'En Camino',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  }
}
