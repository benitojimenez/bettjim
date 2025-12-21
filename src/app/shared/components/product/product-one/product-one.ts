import { CommonModule } from '@angular/common';
import { Component, inject, input, signal, ChangeDetectionStrategy, effect, WritableSignal, computed } from '@angular/core';
import { Product } from '../../../classes/product';
import { environment } from '../../../../../environments/environment';
import { RouterLink } from '@angular/router';
import { DiscountPipe } from '../../../pipes/discount-pipe';
import { Products } from '../../../../services/product';
import { Cart } from '../../../../services/cart';
@Component({
  selector: 'app-product-one',
  imports: [RouterLink, CommonModule, DiscountPipe],
  templateUrl: './product-one.html',
  styleUrl: './product-one.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductOne {
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
}
