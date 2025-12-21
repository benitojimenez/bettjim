import { Routes } from '@angular/router';
import { guestGuard } from './guards/guest-guard';
import { authGuard } from './guards/auth-guard';
export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./home/home.routes').then(m => m.home),
    },
    //  {
    //     path: '',
    //     loadComponent: () => import('./pages/coming-soon/coming-soon').then(c => c.default),
    // },
    {
        path: 'shop',
        loadComponent: () => import('./shop/collection/shop/shop').then(c => c.default),
    },
   {
        path: 'auth',
        canActivate:[guestGuard],
        loadChildren: () => import('./auth/auth.routes').then(m => m.auth),
    },

    {
        path: 'product/:slug',
        loadComponent: () => import('./shop/product/product-letf/product-letf').then(c => c.default),
    },
     {
        path: 'product1/:slug',
        loadComponent: () => import('./shop/product/product-detail-one/product-detail-one').then(c => c.default),
    },
     {
        path: 'checkout',
        loadChildren: () => import('./checkout/checkout.routes').then(m => m.checkoutRoutes),
    },
    {
        path: 'terminos-condiciones',
        loadComponent: () => import('./pages/terms/terms'),
    },
    {
        path: 'devolucion',
        loadComponent: () => import('./pages/returns/returns'),
    },
    {
        path: 'privacidad',
        loadComponent: () => import('./pages/privacy/privacy'),
    },
    {
        path: 'nosotros',
        loadComponent: () => import('./pages/about/about'),
    },
     {
        path: 'tracking',
        loadComponent: () => import('./pages/tracking/tracking'),
    },
    {
        path: '404',
        loadComponent: () => import('./pages/error404/error404')
    },
    // 🔒 RUTAS PRIVADAS (Solo Logueados)
    // Aquí sí obligamos a tener cuenta
        {
        path: 'account',
        canActivate:[authGuard], // 👮‍♂️ El guardián vigila aquí
        loadChildren: () => import('./account/account.routes').then(m => m.accountRoutes),
    },
    {
        path: '**',
        redirectTo: '404',
    }
];
