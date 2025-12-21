import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { CodeImput } from '../../shared/components/codeimput/codeimput';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../../services/user';
import { ToastService } from '../../services/toast';
import { Auth } from '../../services/auth';
import { Cart } from '../../services/cart';
import { Breadcrumbs } from "../../shared/components/breadcrumbs/breadcrumbs";
@Component({
  selector: 'app-verify-code',
  imports: [CodeImput, Breadcrumbs],
  templateUrl: './verify-code.html',
  styleUrl: './verify-code.scss',
})
export class VerifyCode {

  private router = inject(Router);
  user = inject(User);
  toast = inject(ToastService);
  cartService = inject(Cart);
  auth = inject(Auth)
  // Inyectamos el ID de la plataforma para saber si estamos en Server o Browser
  private platformId = inject(PLATFORM_ID);
  email = '';
  Token = '';
  refreshToken = '';
  userID = '';
  isLoading = signal(false);
  fullCode = signal<string>('');

  constructor() {
    // 1. Intentamos leer la señal de Angular Router (Funciona en ambos, pero suele ser null al inicio)
    const nav = this.router.currentNavigation();
    const routerState = nav?.extras.state as { email: string, token: string, refreshtoken: string, id: string } | undefined;

    if (routerState && routerState.email && routerState.id) {
      this.setData(routerState.email, routerState.token, routerState.refreshtoken, routerState.id);
    }
    else {
      // 2. FALLBACK SEGURO PARA SSR
      // Solo accedemos a 'history' si estamos en el navegador
      if (isPlatformBrowser(this.platformId)) {

        const nativeState = history.state;

        if (nativeState && nativeState.email) {
          this.setData(nativeState.email, nativeState.token, nativeState.refreshtoken, nativeState.id);
        } else {
          // Si estamos en el navegador y no hay datos, volvemos al login
          this.router.navigate(['/auth/login']);
        }
      }
      // Nota: Si estamos en el Servidor (SSR), no hacemos nada ni redirigimos aún.
      // Dejamos que el cliente se "hidrate" y tome la decisión en el navegador.
    }
  }
  // Helper para asignar datos
  private setData(email: string, token: string, refreshtoken: string, userId: string) {
    this.email = email;
    this.Token = token;
    this.refreshToken = refreshtoken
    this.userID = userId
    console.log('Datos recuperados:', this.email);
  }
  // Esta función se ejecuta cuando el hijo emite "codeCompleted"
  onCodeReady(code: string) {
    console.log('Código recibido del hijo:', code);
    this.fullCode.set(code);

    // Opcional: Enviar automáticamente al backend sin esperar click en botón
    // this.verifyCode(); 
  }

  verifyCode() {
    if (!this.fullCode()) return;

    this.isLoading.set(true);
    // Llamada a tu AuthService.verify(this.fullCode())
    // console.log('Enviando al backend:', this.fullCode());
    // console.log('Enviando al backend:', this.userID);

    let data = {
      verificationCode: this.fullCode()
    }

    this.user.verify_user(this.userID, data).subscribe({
      next: (resp) => {
        console.log(resp);
        // this._loadingService.hide();  // Ocultar el loader
        const data={
          _id:this.userID,
          token:this.Token,
          refreshToken:this.refreshToken,

        }
        this.isLoading.set(false);
        this.toast.success(resp.message, 'top-center');
        this.auth.loginSuccess(this.Token, this.refreshToken, this.userID);
        this.handleSuccessfulLogin(data);
      },
      error: (err) => {
        console.log('err:', err);
        this.isLoading.set(false);
        this.toast.error(err.error.message, 'top-center');
      }
    });
  }

  private handleSuccessfulLogin(data: any) {
    // Guardar sesión
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('_id', data._id);

    this.cartService.syncLocalCart();

    // ✅ CORRECCIÓN CLAVE AQUÍ:
    // Agregamos '/' al inicio para que sea una ruta ABSOLUTA.
    // Antes: ['account/perfil'] -> Intentaba ir a /auth/login/account/perfil (ERROR)
    // Ahora: ['/account/perfil'] -> Va a /account/perfil (CORRECTO)
    this.router.navigate(['/account/profile']);
  }


     // Breadcrumbs Reactivos
  public breadcrumbs = computed(() => {
 
    const baseCrumbs = [
      { label: 'Inicio', url: '/' },
      { label: 'Auth', url: '/auth' }
      
    ];
    return [
      ...baseCrumbs,
      {
        label:'Verificar la Cuenta',
        
      }
    ];
  });
}
