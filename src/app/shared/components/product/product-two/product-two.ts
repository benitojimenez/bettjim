import { Component, computed, inject, input, signal } from '@angular/core';
import { Cart } from '../../../../services/cart';
import { Products } from '../../../../services/product';
import { Product } from '../../../classes/product';
import { environment } from '../../../../../environments/environment';
import { RouterLink } from '@angular/router';
import { DiscountPipe } from '../../../pipes/discount-pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-two',
  imports: [RouterLink,DiscountPipe, CommonModule],
  templateUrl: './product-two.html',
  styleUrl: './product-two.scss',
})
export class ProductTwo {
  ps = inject(Products)
  cartService = inject(Cart)
  /// 🔥 AQUÍ ESTÁ EL CAMBIO: Signal Input Obligatorio
  product = input.required<Product>();
  index = input.required<number>();
  discount = signal<boolean>(false)


  // Estado del Producto y UI
  public activeImage = signal<string>('');
  public ImageSrc = () => this.product().images[0].src;
  public url_img: string = environment.API_URL + 'product_imagen/';

  ChangeVariants(color: any, product: any) {
    // 1. Busca la variante de color
    const selectedVariant = product.variants.find((item: any) => item.color === color.color);

    if (selectedVariant) {
      // 2. Busca la imagen asociada al ID de la variante
      const newImage = product.images.find((img: any) => img.image_id === selectedVariant.image_id);

      if (newImage) {
        // 3. Actualiza la imagen (Manteniendo su sintaxis original)
        this.ImageSrc = () => newImage.src;
      }
    }
  }

 /* Computed 1: La fuente de la verdad sobre si el descuento ESTÁ activo.
   * Retorna true/false.
   */
  public isDiscountActive = computed(() => {
    const p = this.product();
    
    // 1. Validar existencia y valor del descuento
    if (!p.discount) return false;
    const discountVal = Number(p.discount);
    if (isNaN(discountVal) || discountVal <= 0) return false;

    // 2. Validar rango de fechas
    const now = new Date();
    // Aseguramos que las fechas sean objetos Date válidos
    const start = new Date(p.discount_start);
    const end = new Date(p.discount_end);

    // Comprobar validez de fechas (por si vienen vacías o inválidas)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;

    return now >= start && now <= end;
  });
  addToCart() {
     const data = {
        product: this.product()._id,
        inventory: null,
        user: localStorage.getItem('_id') ?? 'null',
        store: this.product().store || 'Bettjim',
        
        title: this.product().title,
        image: this.product().images[0].src, // Asegúrate de que siempre haya al menos una imagen
        variety: null, // O puedes dejarlo null
        
        quantity:1,
        max_stock: this.product().stock, // 🔥 En tipo 1, esto será prod.stock
        
        unit_price: this.product().price,
        discount: this.product().discount ?? 0,
        discount_price: this.cartService.getDiscount(this.product()),
        subtotal: 1 * this.cartService.getDiscount(this.product()),
        total: 1 * this.cartService.getDiscount(this.product()),
      };
      
      // Asegúrate de que tu cartService acepte este nuevo formato
      this.cartService.addToCart(data); 
  }
}
