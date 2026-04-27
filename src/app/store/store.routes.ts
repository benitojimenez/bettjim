import { Routes } from '@angular/router';
import { StoreList } from './pages/store-list/store-list';
import { StoreFront } from './pages/store-front/store-front';

export const store : Routes = [
  {
    path: '', 
    component: StoreList
  },
  {
    path: ':slug',
    component: StoreFront
  },

  {
    path: '',            // <--- Déjalo VACÍO (string vacío)
    redirectTo: '', // "Si no hay ruta hija, ve al login"
    pathMatch: 'full'
  }
];