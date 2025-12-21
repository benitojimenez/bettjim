import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';


interface ReturnItem {
  name: string;
  image: string;
  qty: number;
}

interface ReturnRequest {
  id: string;
  orderId: string;
  date: Date;
  status: 'pending' | 'approved' | 'shipping' | 'refunded' | 'rejected';
  amount: number;
  items: ReturnItem[];
}
@Component({
  selector: 'app-returns',
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './returns.html',
  styleUrl: './returns.scss',
})
export default class Returns {
  // Control de Tabs
  activeTab = signal<'active' | 'history'>('active');

  // Datos Simulados
  returns = signal<ReturnRequest[]>([
    {
      id: 'RET-2024-001',
      orderId: 'ORD-8821',
      date: new Date(),
      status: 'pending', // Pendiente de aprobación
      amount: 120.00,
      items: [
        { name: 'Pantalón Cargo Beige', image: 'https://via.placeholder.com/60', qty: 1 }
      ]
    },
    {
      id: 'RET-2024-002',
      orderId: 'ORD-8815',
      date: new Date(Date.now() - 86400000 * 2),
      status: 'shipping', // Aprobado, esperando envío del usuario
      amount: 80.00,
      items: [
        { name: 'Zapatillas Urban', image: 'https://via.placeholder.com/60', qty: 1 }
      ]
    },
    {
      id: 'RET-2023-099',
      orderId: 'ORD-7500',
      date: new Date('2023-12-15'),
      status: 'refunded', // Finalizado
      amount: 45.00,
      items: [
        { name: 'Taza Cerámica', image: 'https://via.placeholder.com/60', qty: 2 }
      ]
    }
  ]);

  // Filtrado automático según el Tab seleccionado
  filteredReturns = computed(() => {
    const tab = this.activeTab();
    const all = this.returns();
    
    if (tab === 'active') {
      return all.filter(r => ['pending', 'approved', 'shipping'].includes(r.status));
    } else {
      return all.filter(r => ['refunded', 'rejected'].includes(r.status));
    }
  });

  // Helpers UI
  getStatusLabel(status: string) {
    const map: any = {
      pending: 'Pendiente de Aprobación',
      approved: 'Aprobada',
      shipping: 'Esperando Envío',
      refunded: 'Reembolsado',
      rejected: 'Rechazada'
    };
    return map[status] || status;
  }

  getStatusClass(status: string) {
    switch(status) {
      case 'pending': return 'badge-yellow';
      case 'approved': 
      case 'shipping': return 'badge-blue';
      case 'refunded': return 'badge-green';
      case 'rejected': return 'badge-red';
      default: return 'badge-gray';
    }
  }
}
