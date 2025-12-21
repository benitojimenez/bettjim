import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export default class Settings {
  private fb = inject(FormBuilder);
  public auth = inject(Auth);

  // Estados de carga independientes
  loadingProfile = signal(false);
  loadingPass = signal(false);

  // FORMULARIO PERFIL
  profileForm = this.fb.group({
    names: [this.auth.currentUser()?.name || '', [Validators.required, Validators.minLength(3)]],
    phone: ['+51 999 999 999', [Validators.required]], // Simulado
    email: [{value: this.auth.currentUser()?.email, disabled: true}] // El email no suele editarse directo
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
    orderUpdates: true
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
    setTimeout(() => {
      this.loadingProfile.set(false);
      alert('Perfil actualizado correctamente');
    }, 1500);
  }

  onChangePassword() {
    if (this.passwordForm.invalid) return;
    this.loadingPass.set(true);

    setTimeout(() => {
      this.loadingPass.set(false);
      this.passwordForm.reset();
      alert('Contraseña cambiada exitosamente');
    }, 1500);
  }

  toggleNotif(key: 'emailPromos' | 'smsAlerts' | 'orderUpdates') {
    this.notifications.update(n => ({ ...n, [key]: !n[key] }));
  }
}
