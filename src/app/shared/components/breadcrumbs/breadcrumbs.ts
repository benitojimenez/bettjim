import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
export interface BreadcrumbItem {
  label: string;
  url?: string | any[];
  queryParams?: any; // 👈 Agregamos esto para manejar los ?cat=...
}
@Component({
  selector: 'app-breadcrumbs',
  imports: [RouterLink],
  templateUrl: './breadcrumbs.html',
  styleUrl: './breadcrumbs.scss',
})
export class Breadcrumbs {
  /// 🔥 AQUÍ ESTÁ EL CAMBIO: Signal Input Obligatorio
  items = input.required<BreadcrumbItem[]>();
}
