import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  // Estado del Menú Izquierdo
  sidebarOpen = signal(false);
  
  // ✅ NUEVO: Estado del Carrito Derecho
  cartOpen = signal(false);

  toggleSidebar() { this.sidebarOpen.update(v => !v); }
  closeSidebar() { this.sidebarOpen.set(false); }

  // ✅ Métodos para el Carrito
  toggleCart() { this.cartOpen.update(v => !v); }
  closeCart() { this.cartOpen.set(false); }

  // ✅ NUEVO: Estado para el panel de Filtros en Móvil
  filterOpen = signal(false);

  toggleFilter() { this.filterOpen.update(v => !v); }
  closeFilter() { this.filterOpen.set(false); }
  
}