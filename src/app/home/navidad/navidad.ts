import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Products } from '../../services/product';
import { environment } from '../../../environments/environment';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navidad',
  imports: [CommonModule,RouterLink ],
  templateUrl: './navidad.html',
  styleUrl: './navidad.scss',
})
export class Navidad implements OnInit {
  public URL_IMG: string = environment.API_URL + 'product_imagen/';
  // Inyectamos el servicio. Como es 'public' en el servicio, podemos acceder a él desde el HTML.
  public ps = inject(Products);
 
  private route = inject(ActivatedRoute); // Inyectar ruta activa
  
  ngOnInit() {
    // 👇 Suscribirse a los cambios de la URL
    this.route.queryParams.subscribe(params => {
     
    });
  }
  // Datos Simulados para el Diseño (Luego conectas tu API)
  flashSaleEndTime = new Date('2025-12-25T00:00:00'); 
  
  categories = [
    { name: 'Regalos para Él', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=400' },
    { name: 'Regalos para Ella', img: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=400' },
    { name: 'Tecnología', img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=400' },
    { name: 'Decoración', img: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&q=80&w=400' }
  ];

  // Productos Flash (Simulados)
  flashProducts = [
    { title: 'Smartwatch Pro', price: 150, discount: 40, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400' },
    { title: 'Audífonos Noise', price: 220, discount: 30, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400' },
    { title: 'Cámara Reflex', price: 1200, discount: 20, img: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=400' },
    { title: 'Zapatillas Run', price: 180, discount: 50, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400' },
  ];

  // Productos Más Vistos (Simulados)
  topProducts = [
    { title: 'Perfume Elegance', price: 95, discount: 0, img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=400' },
    { title: 'Bolso Cuero', price: 140, discount: 10, img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=400' },
    { title: 'Reloj Clásico', price: 200, discount: 15, img: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=400' },
    { title: 'Gafas de Sol', price: 80, discount: 0, img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=400' }
  ];

}
