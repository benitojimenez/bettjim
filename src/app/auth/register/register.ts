import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../services/user';
import { ToastService } from '../../services/toast';
import { Breadcrumbs } from "../../shared/components/breadcrumbs/breadcrumbs";
import { Seo } from '../../services/seo';
@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Breadcrumbs],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements OnInit {
  private fb = inject(FormBuilder);
  userService = inject(User)
  toast = inject(ToastService)
  router = inject(Router)
  seo = inject(Seo);

  // Señales de UI
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);

  // Formulario con Validador de Grupo
  registerForm = this.fb.group({
    names: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    username: ['', Validators.required],
    confirmPassword: ['', [Validators.required]],
    method: ['direct', Validators.required],
    acceptpolitic: [false, [Validators.requiredTrue]]
  }, { validators: this.passwordMatchValidator }); // 👈 Validación Global

  // Validador personalizado: Compara Pass vs Confirm
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirm = control.get('confirmPassword');

    if (!password || !confirm) return null;

    // Si son diferentes, retornamos el error 'mismatch'
    return password.value === confirm.value ? null : { mismatch: true };
  }

  // Getters para UI más limpia
  get f() { return this.registerForm.controls; }
  get hasMismatchError() {
    return this.registerForm.hasError('mismatch') && this.registerForm.get('confirmPassword')?.touched;
  }
  ngOnInit(): void {
    // Configurar SEO para la página de registro
    this.seo.generateTags({
      title: 'Crear cuenta | Bettjim.com',
      description: 'Únete a Bettjim.com y crea tu cuenta para disfrutar de una experiencia de compra personalizada. Guarda tus productos favoritos, realiza pedidos fácilmente y mantente informado sobre las últimas ofertas y novedades. Regístrate ahora y forma parte de la comunidad Bettjim.',
      keywords: 'Crear cuenta, registro de usuario, tienda online, Bettjim, experiencia de compra personalizada, productos favoritos, ofertas exclusivas, registro fácil',
      slug: 'auth/register',
      type: 'website',
      image: 'obtener_logo/bettjim.png'
    });

     
    this.registerForm.get('email')?.valueChanges.subscribe(value => {
      // console.log('Valor del email:', value);
    
      if (value) {
        const lowerCaseEmail = value.toLowerCase();
        // Actualiza el valor del email a minúsculas
        this.registerForm.get('email')?.setValue(lowerCaseEmail, { emitEvent: false }); // Evita bucles infinitos
    
         // Verificar que el email contenga una "@" y sea válido antes de generar el username
        if (this.registerForm.get('email')?.valid && lowerCaseEmail.includes('@')) {
          this.registerForm.get('username')?.setValue(this.generarUsername(lowerCaseEmail));
        }
      }
    });

    this.registerForm.get('names')?.valueChanges.subscribe(value => {
      if (value) {
        this.registerForm.get('names')?.setValue(this.capitalize(value), { emitEvent: false });
      }
    });

    this.registerForm.get('lastName')?.valueChanges.subscribe(value => {
      if (value) {
        this.registerForm.get('lastName')?.setValue(this.capitalize(value), { emitEvent: false });
      }
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    // Simular API
    console.log('Register Data:', this.registerForm.value);
    this.userService.register(this.registerForm.value).subscribe({
      next: (resp) => {
        this.isLoading.set(false);
        // this._loadingService.hide();
        this.registerForm.reset();
        this.toast.success(resp.message, 'top-center');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
         this.isLoading.set(false);
        // console.log('respuesta de la creacion del cliente', err);
        this.toast.error(err.error.message, 'bottom-left');
      }
    });
  }

   generarUsername(email: string) {
    // Extrae la parte del nombre de usuario del correo
    const baseUsername = email.split('@')[0];

    return baseUsername;
  }
   capitalize(value: string): string {
    if (!value) return '';
    return value
      .toLowerCase() // Convertir todo a minúscula
      .split(' ') // Dividir en palabras
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalizar la primera letra de cada palabra
      .join(' '); // Volver a unir las palabras
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
        label:'Crear Cuenta',
        
      }
    ];
  });
}
