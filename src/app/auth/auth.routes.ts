import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { VerifyCode } from './verify-code/verify-code';

export const auth : Routes = [
  {
    path: 'login', 
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path:'verify-code',
    component:VerifyCode
  },
  // CORRECCIÓN AQUÍ 👇
  {
    path: '',            // <--- Déjalo VACÍO (string vacío)
    redirectTo: 'login', // "Si no hay ruta hija, ve al login"
    pathMatch: 'full'
  }
];