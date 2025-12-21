import { Routes } from '@angular/router';
import { CheckoutLayout } from './checkout-layout/checkout-layout';
import { checkoutGuard } from './../guards/checkout-guard';
import { preventExitGuard } from '../guards/prevent-exit-guard';

export const checkoutRoutes: Routes = [   
  {
    path: '',
    component: CheckoutLayout, // El contenedor (Layout con el Resumen a la derecha)
    children: [
      {
        path: 'information', // Paso 1: Datos y Dirección
        loadComponent: () => import('./pages/information/information'),
        // Aquí valida solo si el carrito está vacío
        canActivate: [checkoutGuard],
        title: 'Información - Bettjim Checkout'
      },
      {
        path: 'shipping',    // Paso 2: Método de Envío (Express, Standard)
        loadComponent: () => import('./pages/shipping/shipping'),
        // Aquí valida que tengas Info
        canActivate: [checkoutGuard],
        title: 'Envíos - Bettjim Checkout'
      },
      {
        path: 'payment',     // Paso 3: Tarjeta, Yape, Plin
        loadComponent: () => import('./pages/payment/payment'),
        // Aquí valida que tengas Info + Shipping
        canActivate: [checkoutGuard],
        canDeactivate: [preventExitGuard], 
        title: 'Pago - Bettjim Checkout'
      },
      {
        path: '',
        redirectTo: 'information',
        pathMatch: 'full'
      }
    ]
  },
  {
    // Esta ruta va FUERA del Layout de checkout porque el diseño es distinto (Celebración)
    path: 'thank-you/:orderId',
    loadComponent: () => import('./pages/thank-you/thank-you'),
   // No ponemos guard aquí porque el usuario podría querer ver su recibo después
    title: '¡Gracias! - Bettjim'
  }
];