import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { User } from '../../../services/user';
import { Auth } from '../../../services/auth';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, RouterLink, ],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class Orders{

  user = inject(User);
  auth = inject(Auth);

  onSearch(query: string) {
    this.user.searchOrder.set(query);

  }
  clearFilter() {
    this.user.searchOrder.set('');
    this.user.orderFilter.set('all');
  }

  // Filtro activo actual
  activeFilter = signal<'all' | 'active' | 'completed' | 'cancelled'>('all');

  setFilter(filter: 'all' | 'active' | 'completed' | 'cancelled') {
    this.user.orderFilter.set(filter);
  }

  getStatusClass(status: string) {
    switch(status) {
      case 'pendiente': return 'badge-yellow';
      case 'procesando': return 'badge-orange';
      case 'enviado': return 'badge-blue';
      case 'completado': return 'badge-green';
      case 'cancelado': return 'badge-red';
      default: return 'badge-gray';
    }
  }
  
  
}
