import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  
  {
    path: '',  // Home
    renderMode: RenderMode.Server
  },
  {
    path: 'shop/**',  // Todas las rutas de shop (categorías, productos, etc.)
    renderMode: RenderMode.Server
  },
  {
    path: 'account/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'checkout/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'auth/**',
    renderMode: RenderMode.Prerender
  },
  // {
  //   path: 'libro-reclamaciones',
  //   renderMode: RenderMode.Client
  // },
  {
    path: 'devolucion',
    renderMode: RenderMode.Client
  },
  {
    path: 'privacidad',
    renderMode: RenderMode.Client
  },
  {
    path: 'terminos-condiciones',
    renderMode: RenderMode.Client
  },
  // {
  //   path: 'comingsoon',
  //   renderMode: RenderMode.Prerender
  // },
  {
    path: '404',
    renderMode: RenderMode.Prerender
  },

  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
