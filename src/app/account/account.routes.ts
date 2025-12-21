import { Routes } from '@angular/router';
import Profile from './profile/profile';

export const accountRoutes: Routes = [
  {
    path: '',
    component: Profile, // 👈 Este es el PADRE (tiene el Sidebar y <router-outlet>)
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./pages/overview/overview') // Las tarjetas de estadísticas
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/orders/orders') 
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./pages/order-detail/order-detail') 
      },
      {
        path: 'wishlist',
        loadComponent: () => import('./pages/wishlist/wishlist') 
      },
      {
        path: 'points',
        loadComponent: () => import('./pages/points/points') 
      },
      {
        path: 'payment-methods',
        loadComponent: () => import('./pages/payment-methods/payment-methods') 
      },
      {
        path: 'coupons',
        loadComponent: () => import('./pages/coupons/coupons') 
      },
      {
        path: 'returns',
        loadComponent: () => import('./pages/returns/returns')
      },
      {
        path: 'settings', // Aquí edita sus datos personales
        loadComponent: () => import('./pages/settings/settings') 
      },
      {
        path: 'addresses',
        loadComponent: () => import('./pages/addresses/addresses')
      },
      {
        path: 'reviews',
        loadComponent: () => import('./pages/reviews/reviews')
      },
      {
        path: 'support',
        loadComponent: () => import('./pages/support/support')
      },
      // 👇 Redirección por defecto: Si entra a /account, lo mandamos a /account/overview
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full'
      }
    ]
  }
];