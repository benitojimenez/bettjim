import { auth } from './../../../../auth/auth.routes';
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../../../../services/Layout';
import { Categories } from '../../../../services/categories';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../../services/auth';
// Estructura de datos para el menú
interface MenuItem {
  title: string;
  expanded?: boolean;
  subcategories?: MenuItem[];
}
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  layout = inject(LayoutService);
  auth = inject(Auth);
  categories = inject(Categories);
  // Datos simulados (Idealmente vendrían de una API)

  
 /**
   * @param item El ítem que se clickeó
   * @param allItems La lista completa de items en ese nivel (hermanos)
   */
  toggle(item: any, allItems: any[]) {
    // 1. Si el ítem ya está abierto, simplemente lo cerramos
    if (item.expanded) {
      item.expanded = false;
      return;
    }

    // 2. Si estaba cerrado: Primero cerramos TODOS los hermanos
    allItems.forEach((i) => {
      i.expanded = false; 
    });

    // 3. Finalmente abrimos el que se clickeó
    item.expanded = true;
  }

}
