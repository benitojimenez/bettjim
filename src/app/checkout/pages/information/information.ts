import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CheckoutService } from '../../../services/checkout';
import { Address } from './../../../shared/classes/checkout';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-information',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './information.html',
  styleUrl: './information.scss',
})
export default class Information implements OnInit{
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private checkoutService = inject(CheckoutService);
  public auth = inject(Auth)
  // Simulación de Estado de Usuario (Esto vendría de tu AuthService)
  // Estado Local
  isLoggedIn = signal(false); // Simulación
  selectedAddressId = signal<string>('new'); // 'new' o ID de dirección guardada

  // Direcciones guardadas (Simulación)
  savedAddresses = signal([
    { id: 'addr_1', alias: 'Casa', firstName: 'Juan', lastName: 'Pérez', line1: 'Av. Larco 123', city: 'Miraflores', department: 'Lima', postalCode: '15047', phone: '999111222' },
    { id: 'addr_2', alias: 'Oficina', firstName: 'Juan', lastName: 'Pérez', line1: 'Calle Las Begonias 450', city: 'San Isidro', department: 'Lima', postalCode: '27001', phone: '999333444' }
  ]);

  // Formulario Reactivo
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    newsletter: [true],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    address: ['', Validators.required],
    apartment: [''],
    city: ['', Validators.required],
    department: ['', Validators.required], // Región/Estado
    postalCode: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{9,}$/)]]
  });

  // Lógica: Cuando seleccionas una tarjeta de dirección guardada
  selectAddress(addressId: string) {
    this.selectedAddressId.set(addressId);
    
    if (addressId === 'new') {
      // Limpiar solo los campos de dirección, mantener email
      this.form.patchValue({
        firstName: '', lastName: '', address: '', apartment: '',
        city: '', department: '', postalCode: '', phone: ''
      });
    } else {
      const addr = this.savedAddresses().find(a => a.id === addressId);
      if (addr) {
        this.form.patchValue({
          firstName: addr.firstName,
          lastName: addr.lastName,
          address: addr.line1,
          city: addr.city,
          department: addr.department,
          postalCode: addr.postalCode,
          phone: addr.phone
        });
      }
    }
  }
 
  ngOnInit() {
    // 1. RECUPERAR DATOS DEL SERVICIO (Si el usuario regresa del paso 2)
    const currentData = this.checkoutService.checkoutData();
    
    // Si ya hay datos guardados en el servicio, rellenamos el formulario
    if (currentData.email) {
      this.form.patchValue({
        email: currentData.email,
        newsletter: currentData.newsletter
      });
    }

    if (currentData.shippingAddress) {
      this.form.patchValue({
        firstName: currentData.shippingAddress.firstName,
        lastName: currentData.shippingAddress.lastName,
        address: currentData.shippingAddress.address,
        apartment: currentData.shippingAddress.apartment,
        city: currentData.shippingAddress.city,
        department: currentData.shippingAddress.department,
        postalCode: currentData.shippingAddress.postalCode,
        phone: currentData.shippingAddress.phone
      });
      // Si la dirección coincide con una guardada, podríamos marcarla aquí (lógica opcional)
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // Muestra los errores rojos
      return;
    }

    const val = this.form.value;

    // 2. CONSTRUIR EL OBJETO ADDRESS
    // Mapeamos el formulario plano a la estructura anidada que pide el servicio
    const shippingData: Address = {
      firstName: val.firstName!,
      lastName: val.lastName!,
      address: val.address!,
      apartment: val.apartment || '', // Opcional
      city: val.city!,
      department: val.department!,
      postalCode: val.postalCode!,
      phone: val.phone!
    };

    // 3. GUARDAR EN EL SERVICIO (Persistencia)
    this.checkoutService.updateInformation({
      email: val.email!,
      newsletter: val.newsletter === true,
      shippingAddress: shippingData
    });

    // console.log('✅ Datos guardados en CheckoutService:', this.checkoutService.checkoutData());

    // 4. NAVEGAR AL SIGUIENTE PASO
    this.router.navigate(['/checkout/shipping']);
  }
}

