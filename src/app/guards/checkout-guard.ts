import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CheckoutService } from './../services/checkout'
import { Cart } from '../services/cart';

export const checkoutGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const checkoutService = inject(CheckoutService);
  const cartService = inject(Cart);

  // ====================================================
  // 1. VALIDACIÓN DE CARRITO VACÍO
  // ====================================================
  // Si tienes un CartService, descomenta esto:
  
  if (cartService.cartTotal() === 0) {
    console.warn('🛒 Guard: El carrito está vacío.');
    return router.createUrlTree(['/shop']);
  }
  

  // Obtener datos actuales del checkout (Signal)
  const data = checkoutService.checkoutData();
  const targetUrl = state.url; // La URL a la que quiere ir el usuario

  // ====================================================
  // 2. PROTEGIENDO LA RUTA: /shipping
  // ====================================================
  // Requisito: Debe haber ingresado Email y Dirección en el paso anterior
  if (targetUrl.includes('/shipping')) {
    if (!data.email || !data.shippingAddress) {
      console.warn('🚧 Guard: Falta información de contacto. Redirigiendo al paso 1.');
      return router.createUrlTree(['/checkout/information']);
    }
  }

  // ====================================================
  // 3. PROTEGIENDO LA RUTA: /payment
  // ====================================================
  // Requisito: Debe tener Dirección Y Método de Envío seleccionado
  if (targetUrl.includes('/payment')) {
    
    // Nivel 1: ¿Tiene dirección?
    if (!data.email || !data.shippingAddress) {
      return router.createUrlTree(['/checkout/information']);
    }

    // Nivel 2: ¿Eligió método de envío?
    if (!data.shippingMethodId) {
      console.warn('🚧 Guard: Falta método de envío. Redirigiendo al paso 2.');
      return router.createUrlTree(['/checkout/shipping']);
    }
  }

  // Si todo está bien, permite el acceso
  return true;
};