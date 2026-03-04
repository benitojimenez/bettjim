import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators'; // 👈 Importante para desbloquear el botón

// Servicios
import { User } from '../../services/user';
import { ToastService } from '../../services/toast';
import { Auth } from '../../services/auth';
import { Cart } from '../../services/cart';
import { Breadcrumbs } from "../../shared/components/breadcrumbs/breadcrumbs";
import { Seo } from '../../services/seo';
@Component({
  selector: 'app-login',
  standalone: true, // Asumo que es standalone por los imports
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Breadcrumbs],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {

  // 1. INYECCIONES (Nombres claros)
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private seo = inject(Seo);
  

  // Servicios Públicos/Privados con nombres descriptivos
  public userService = inject(User);     // Antes "user"
  public cartService = inject(Cart); // Antes "ps"
  public auth = inject(Auth)
  private toast = inject(ToastService);
  ngOnInit() {
    // Configurar SEO para la página de login
    this.seo.generateTags({
      title: 'Iniciar sesión | Bettjim.com',  
      description: 'Accede a tu cuenta en Bettjim.com para disfrutar de una experiencia de compra personalizada. Gestiona tus pedidos, guarda tus productos favoritos y mantente al día con las últimas ofertas. Inicia sesión ahora y descubre todo lo que Bettjim tiene para ti.',
      keywords: 'Iniciar sesión, cuenta de usuario, tienda online, Bettjim, gestión de pedidos, productos favoritos, ofertas exclusivas',
      slug: 'auth/login',
      type: 'website',
      image: 'obtener_logo/bettjim.png'
    });
  }
  // 2. SEÑALES DE UI
  showPassword = signal(false);
  isLoading = signal(false);

  // 3. FORMULARIO
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // 4. MÉTODOS DE UI
  togglePassword() {
    this.showPassword.update(v => !v);
  }

  // 5. LÓGICA DE LOGIN
  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const credentials = this.loginForm.value;

    this.userService.login(credentials).subscribe({
        next: (resp: any) => {
          console.log('Respuesta Login:', resp);
          // TU LÓGICA: 
          // true = Verificado (Entra)
          // false = No Verificado (Valida código)

          if (resp.data.needConfirm === true) {
            // ✅ USA ESTO (Forma Reactiva):
            // Le pasamos los datos al servicio para que actualice la Señal
            this.auth.loginSuccess(resp.token, resp.refreshToken, resp.data._id);

            this.cartService.syncLocalCart();
            this.handleSuccessfulLogin(resp);
          } else {
            this.handleVerificationRedirect(resp);
          }
        },
        error: (err) => {
          this.handleLoginError(err);
          // console.error('Error Login:', err);
        }
      });
  }

  // --- MÉTODOS PRIVADOS ---

  private handleSuccessfulLogin(resp: any) {
    this.isLoading.set(false);
    this.toast.success(resp.message || 'Bienvenido', 'top-center');

    // // Guardar sesión
    // localStorage.setItem('token', resp.token);
    // localStorage.setItem('refreshToken', resp.refreshToken);
    // localStorage.setItem('_id', resp.data._id);


    // ✅ CORRECCIÓN CLAVE AQUÍ:
    // Agregamos '/' al inicio para que sea una ruta ABSOLUTA.
    // Antes: ['account/perfil'] -> Intentaba ir a /auth/login/account/perfil (ERROR)
    // Ahora: ['/account/perfil'] -> Va a /account/perfil (CORRECTO)
    this.router.navigate(['/account/profile']);
  }

  private handleVerificationRedirect(resp: any) {
    // ✅ Aquí también aseguramos la ruta absoluta con '/'
    this.router.navigate(['/auth/verify-code'], {
      state: {
        id: resp.data._id
      }
    });
  }

  private handleLoginError(err: any) {
    this.isLoading.set(false);
    // console.error('Error Login:', err);
    const errorMessage = err.error?.message || 'Ocurrió un error inesperado.';

    // Simplificación del switch
    if ([400, 401, 403, 500].includes(err.status)) {
      this.toast.error(errorMessage, 'top-center');
       this.handleVerificationRedirect(err.error);
    } else {
      this.toast.error('No se pudo conectar con el servidor', 'bottom-center');
    }
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
        label:'Inciar sesion',
        
      }
    ];
  });
}