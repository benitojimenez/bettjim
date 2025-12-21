import { Beauty } from './beauty/beauty';
import { Routes } from '@angular/router';
import { FashionOne } from './fashion-one/fashion-one';
import { Navidad } from './navidad/navidad';

export const home : Routes = [
    {
        path: '',
        component: FashionOne,
    },
    {
        path: 'belleza',
        component: Beauty,
    }
];