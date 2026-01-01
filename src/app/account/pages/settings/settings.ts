import { Component, computed, effect, inject, resource, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Auth } from '../../../services/auth';
import { User } from '../../../services/user';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../../../services/toast';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export default class Settings {
  private fb = inject(FormBuilder);
  public auth = inject(Auth);
  user = inject(User);
  toast = inject(ToastService);

  // En tu componente .ts
  showOldPass = signal(false);
  showNewPass = signal(false);
  showConfirmPass = signal(false);
  // Para cargar datos del usuario
  // 1. Definición del recurso (Loader asíncrono)
  userResource = resource({
    loader: async () => {
      // Es buena práctica manejar el tipado aquí
      const res = await firstValueFrom(this.user.get_customer_profile());
      return res.data; // Retornamos directamente el 'data' para simplificar
    }
  });

  constructor() {
    // Sincronizar el Recurso con el Formulario
    effect(() => {
      const userData = this.userResource.value(); // Obtenemos el valor de la señal

      if (userData) {
        // Si birthdate existe, lo formateamos para el input HTML
        const formattedDate = userData.birthdate
          ? new Date(userData.birthdate).toISOString().split('T')[0]
          : '';
        // Usamos patchValue para llenar solo los campos que coincidan
        this.profileForm.patchValue({
          names: userData.names,
          lastName: userData.lastName,
          phone: userData.phone,
          dni: userData.dni,
          username: userData.username,
          birthdate: formattedDate,
          gender: userData.gender,
          country: userData.country,
          email: userData.email
        });
        console.log('Formulario actualizado con datos del usuario:', userData);
      }
    });
  }


  // Estados de carga independientes
  loadingProfile = signal(false);
  loadingPass = signal(false);

  // FORMULARIO PERFIL
  profileForm = this.fb.group({
    names: ['', [Validators.required, Validators.minLength(3)]],
    lastName: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    birthdate: ['', [Validators.required]],
    dni: [{ value: '', disabled: true }],
    gender: [{ value: '', disabled: true }],
    country: [{ value: '', disabled: true }],
    username: [{ value: '', disabled: true }],
    email: [{ value: '', disabled: true }]
  });

  // FORMULARIO PASSWORD
  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.matchPasswords });

  // Preferencias (Signals)
  notifications = signal({
    emailPromos: true,
    smsAlerts: false,
    orderUpdates: true,
    news: false
  });

  // Validador de contraseñas
  matchPasswords(control: AbstractControl) {
    const pass = control.get('newPassword')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  // Acciones
  onSaveProfile() {
    if (this.profileForm.invalid) return;
    this.loadingProfile.set(true);

    // Simular API
    this.user.update_customer_profile(this.profileForm.getRawValue()).subscribe({
      next: (res) => {
        this.loadingProfile.set(false);
        this.toast.success(res.message || 'Perfil actualizado exitosamente', 'top-center');


      },
      error: (err) => {
        this.loadingProfile.set(false);
        alert('Error al actualizar el perfil');
      }
    });
  }

  onChangePassword() {
    if (this.passwordForm.invalid) return;
    this.loadingPass.set(true);
    console.log('Cambiando contraseña...', this.passwordForm.value);
    if (this.passwordForm.valid) {
      const { currentPassword, newPassword } = this.passwordForm.value;
      console.log('Llamando a update_password con:', { currentPassword, newPassword });
      this.user.update_password({ currentPassword, newPassword }).subscribe({
        next: (res) => {
          this.loadingPass.set(false);

          this.toast.success(res.message || 'Contraseña cambiada exitosamente', 'top-center');
          this.passwordForm.reset(); // Limpiamos el formulario por seguridad
        },
        error: (err) => {
          ;
          this.loadingPass.set(false);
          // Aquí manejamos si la 'currentPassword' es incorrecta (Error 401 del backend)
          if (err.status === 401) {
            this.toast.error(err.error.message || 'Contraseña actual incorrecta', 'top-center');
          } else if (err.status === 400) {
            this.toast.error(err.error.message || 'Error en la solicitud', 'top-center');
          }
        }
      });
    }
  }


  toggleNotif(key: 'emailPromos' | 'smsAlerts' | 'orderUpdates' | 'news') {
    this.notifications.update(n => ({ ...n, [key]: !n[key] }));
  }


  // Variables (Signals)
  showDeleteModal = signal(false);
  loadingDelete = signal(false);
  onDeleteAccount() {
    this.showDeleteModal.set(true);
  }


  // Función que ejecuta el borrado real (conectada al servicio deleteUser que creamos antes)
  confirmDelete() {
    this.loadingDelete.set(true);

    // Llamada a tu servicio backend
    this.user.delete_user().subscribe({
      next: (res) => {
        this.toast.success(res.message || 'Cuenta eliminada exitosamente', 'top-center');
        this.loadingDelete.set(false);
        this.showDeleteModal.set(false);
        // Limpiar sesión y redirigir
        localStorage.clear();
        this.auth.logOut()

        // Opcional: Mostrar Toast de éxito
        // alert('Tu cuenta ha sido eliminada correctamente.'); 
      },
      error: (err) => {
        this.loadingDelete.set(false);
        this.showDeleteModal.set(false);
        console.error('Error al eliminar cuenta', err);
        // alert('Hubo un error. Inténtalo más tarde.');
      }
    });
  }



}
