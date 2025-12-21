import { inject, Pipe, type PipeTransform } from '@angular/core';
import { Products } from '../../services/product';

@Pipe({
  name: 'appDiscount',
})
export class DiscountPipe implements PipeTransform {

   _productService = inject(Products)
  currency = this._productService.Currency;
  transform(value: any, args?: any): any {
    
    if (!args) return null;

    const date = new Date();
    const discount = Number(args.discount);
    const discountStart = new Date(args.discount_start);
    const discountEnd = new Date(args.discount_end);
    const price = args.price;

    // Verificar si el descuento es válido en rango de fechas
    if (discount > 0 && date >= discountStart && date <= discountEnd) {
      const discountedPrice = price - (price * discount / 100);
      return (discountedPrice / this.currency.price).toFixed(2);
    }

    return (price / this.currency.price).toFixed(2);
  }

}
