import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';


// Interfaces (Mover a models/order.model.ts idealmente)
interface OrderProduct {
  name: string;
  image: string;
}

interface Order {
  id: string;
  date: Date;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  products: OrderProduct[]; // Array de productos para mostrar miniaturas
}

@Component({
  selector: 'app-orders',
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export default class Orders {
  // Filtro activo actual
  activeFilter = signal<'all' | 'active' | 'completed' | 'cancelled'>('all');

  // Datos Simulados
  orders = signal<Order[]>([
    {
      id: 'ORD-8821',
      date: new Date(),
      status: 'processing',
      total: 350.00,
      products: [
        { name: 'Camiseta Black', image: 'https://via.placeholder.com/50' },
        { name: 'Pantalón Cargo', image: 'https://via.placeholder.com/50' },
        { name: 'Gorra', image: 'https://via.placeholder.com/50' },
        { name: 'Calcetines', image: 'https://via.placeholder.com/50' }
      ]
    },
    {
      id: 'ORD-8815',
      date: new Date(Date.now() - 86400000 * 3),
      status: 'shipped',
      total: 120.50,
      products: [
        { name: 'Zapatillas Urban', image: 'https://via.placeholder.com/50' }
      ]
    },
    {
      id: 'ORD-7500',
      date: new Date('2024-01-15'),
      status: 'delivered',
      total: 89.90,
      products: [
        { name: 'Hoodie Oversize', image: 'https://via.placeholder.com/50' },
        { name: 'Case iPhone', image: 'https://via.placeholder.com/50' }
      ]
    },
     {
      id: 'ORD-6600',
      date: new Date('2023-12-10'),
      status: 'cancelled',
      total: 45.00,
      products: [
        { name: 'Taza', image: 'https://via.placeholder.com/50' }
      ]
    }
  ]);

  // Señal Computada para filtrar la lista automáticamente
  filteredOrders = computed(() => {
    const filter = this.activeFilter();
    const all = this.orders();

    if (filter === 'all') return all;
    if (filter === 'active') return all.filter(o => ['processing', 'shipped'].includes(o.status));
    if (filter === 'completed') return all.filter(o => o.status === 'delivered');
    if (filter === 'cancelled') return all.filter(o => o.status === 'cancelled');
    return all;
  });

  setFilter(filter: 'all' | 'active' | 'completed' | 'cancelled') {
    this.activeFilter.set(filter);
  }

  // Helpers de Estilo
  getStatusLabel(status: string) {
    const map: any = { processing: 'Procesando', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado' };
    return map[status] || status;
  }

  getStatusClass(status: string) {
    switch(status) {
      case 'processing': return 'badge-orange';
      case 'shipped': return 'badge-blue';
      case 'delivered': return 'badge-green';
      case 'cancelled': return 'badge-red';
      default: return 'badge-gray';
    }
  }
}
