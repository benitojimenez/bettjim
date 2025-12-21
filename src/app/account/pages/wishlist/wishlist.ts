import { Component, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
// import { CartService } from '...'; // Tu servicio de carrito

interface WishProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  oldPrice?: number; // Para mostrar descuento
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  category: string;
  slug: string;
}
@Component({
  selector: 'app-wishlist',
  imports: [CommonModule,CurrencyPipe, RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss',
})
export default class Wishlist {
  // cartService = inject(CartService); 

  products = signal<WishProduct[]>([
    {
      id: '1',
      name: 'Casaca Denim Oversize',
      category: 'Chaquetas',
      image: 'https://via.placeholder.com/300x400', // Reemplazar con real
      price: 189.90,
      oldPrice: 240.00,
      stockStatus: 'in_stock',
      slug: 'casaca-denim'
    },
    {
      id: '2',
      name: 'Zapatillas Urban Chunky',
      category: 'Calzado',
      image: 'https://via.placeholder.com/300x400',
      price: 250.00,
      stockStatus: 'low_stock', // Genera urgencia
      slug: 'zapatillas-urban'
    },
    {
      id: '3',
      name: 'Polo Básico Algodón',
      category: 'Polos',
      image: 'https://via.placeholder.com/300x400',
      price: 45.00,
      stockStatus: 'out_of_stock', // Deshabilita compra
      slug: 'polo-basico'
    }
  ]);

  addToCart(product: WishProduct) {
    if(product.stockStatus === 'out_of_stock') return;
    
    console.log('Agregando al carrito:', product.name);
    // this.cartService.add(product);
    // Mostrar Toast de éxito
  }

  removeFromWishlist(id: string) {
    this.products.update(items => items.filter(p => p.id !== id));
  }
}
