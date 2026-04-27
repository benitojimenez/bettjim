import { Routes } from '@angular/router';
import { guestGuard } from './guards/guest-guard';
import { authGuard } from './guards/auth-guard';
import { title } from 'process';
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
        canActivate: [guestGuard],
        loadChildren: () => import('./auth/auth.routes').then(m => m.auth),
    },

    {
        path: 'p1/:slug',
        loadComponent: () => import('./shop/product/product-letf/product-letf').then(c => c.default),
    },
    {
        path: 'p/:slug',
        loadComponent: () => import('./shop/product/product-detail-two/product-detail-two').then(c => c.default),
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
        path: 'libro-reclamaciones',
        loadComponent: () => import('./pages/reclamaciones/reclamaciones'),
    },
    {
        path: '404',
        loadComponent: () => import('./pages/error404/error404')
    },
    {
        path: 'flash/:slug',
        loadComponent: () => import('./pages/flash-offer/flash-offer'),
    },
    // {
    //     path: 'envivo',
    //     title: 'Transmisión en Vivo | Bettjim.com',
    //     loadComponent: () => import('./pages/en-vivo/en-vivo'),

    // },
    // {
    //     path: 'live',
    //     redirectTo: '/envivo',
    //     pathMatch: 'full'
    // }, // Redirige automáticamente
    // 🔒 RUTAS PRIVADAS (Solo Logueados)
    // Aquí sí obligamos a tener cuenta
    {
        path: 'account',
        canActivate: [authGuard], // 👮‍♂️ El guardián vigila aquí
        loadChildren: () => import('./account/account.routes').then(m => m.accountRoutes),
    },
    // {
    //     path: 'tienda',
    //     loadChildren: () => import('./store/store.routes').then(m => m.store),  
    // },
    {
        path: 'product/:slug',
        redirectTo: 'p/:slug',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: '404',
    }
];
