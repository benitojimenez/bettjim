import { ChangeDetectionStrategy, Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// Servicios y Clases
import { CheckoutService } from '../../../services/checkout';
import { Auth } from '../../../services/auth';
import { Ubigeo } from '../../../services/ubigeo';
import { Address, CheckoutState } from './../../../shared/classes/checkout';

// Componentes
import { CustomSelect } from '../../../shared/components/custom-select/custom-select';

@Component({
  selector: 'app-information',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CustomSelect],
  templateUrl: './information.html',
  styleUrl: './information.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class Information implements OnInit {
  // --- INYECCIÓN DE DEPENDENCIAS ---
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private checkoutService = inject(CheckoutService);
  public ubigeo = inject(Ubigeo);
  public auth = inject(Auth);

  // --- ESTADO LOCAL ---
  selectedAddressId = signal<string>('new');
  
  // Alias para Signals del Ubigeo (facilita lectura en HTML)
  DEPARTAMENTOS = this.ubigeo.regiones;
  PROVINCIAS = this.ubigeo.provinciasFiltradas;
  DISTRITOS = this.ubigeo.distritosFiltrados;

  savedAddresses = signal<Address[]>([]);
  selectedAddress = signal<Address | null>(null);

  isLoggedIn = signal(false);  

  // --- FORMULARIO REACTIVO ---

  // --- CONFIGURACIÓN DEL FORMULARIO ---
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    newsletter: [true],
    phone: ['', [Validators.required, Validators.pattern(/^9[0-9]{8}$/)]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    documentType: ['DNI', Validators.required],
    documentNumber: ['', [Validators.required, Validators.minLength(8)]],
    businessName: [''],
    country: ['Perú', Validators.required],
    department: ['', Validators.required], // Guardaremos el ID para la lógica
    province: ['', Validators.required],   // Guardaremos el ID para la lógica
    district: ['', Validators.required],   // Guardaremos el ID para la lógica
    address: ['', Validators.required],
    apartment: [''],
    reference: ['', Validators.required],
    postalCode: [''],
    note: ['', Validators.maxLength(200)],
  });

  ngOnInit() {
    this.loadInitialData();
  }

  // --- PERSISTENCIA Y CARGA ---
  private loadInitialData() {
    // 1. Intentar cargar desde SessionStorage primero (Persistencia de usuario)
    const savedData = sessionStorage.getItem('bettjim_checkout_draft');
    
    if (savedData) {
      const draft = JSON.parse(savedData) as Address;
      this.patchAddressToForm(draft);
    } 
    // 2. Si no hay draft, intentar cargar del servicio (Estado global)
    else {
      const currentData = this.checkoutService.checkoutData();
      if (currentData.shippingAddress) {
        this.patchAddressToForm(currentData.shippingAddress);
      }
    }

    // 3. Email desde Auth si está logueado
    if (this.auth.currentUser()) {
      this.form.patchValue({ email: this.auth.currentUser()?.email });
    }
  }

  private patchAddressToForm(addr: Address) {
    // Seteamos los IDs en el servicio de Ubigeo para habilitar las cascadas
    this.ubigeo.setDepartamento(addr.department);
    this.ubigeo.setProvincia(addr.province);
    this.ubigeo.setDistrito(addr.district);

    this.form.patchValue({
      ...addr,
      // Aseguramos que el email se mantenga si viene del estado global
      email: this.checkoutService.email() || this.form.value.email
    });
  }

  // --- MÉTODOS DE UBIGEO ---
  onDepChange(option: any) {
    this.ubigeo.setDepartamento(option.id);
    this.form.patchValue({
      department: option.name, 
      province: '',
      district: ''
    });
  }

  onProvChange(option: any) {
    this.ubigeo.setProvincia(option.id);
    this.form.patchValue({
      province: option.name,
      district: ''
    });
  }

  onDistChange(option: any) {
    this.ubigeo.setDistrito(option.id);
    this.form.patchValue({ district: option.name });
  }

  // --- ENVÍO DEL FORMULARIO ---
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;

    const shippingAddress: Address = {
      firstName: val.firstName!,
      lastName: val.lastName!,
      documentType: val.documentType as any,
      documentNumber: val.documentNumber!,
      businessName: val.businessName || '',
      phone: val.phone!,
      country: 'Perú', // Fijo por ahora
      department: val.department!,
      province: val.province!,
      district: val.district!,
      address: val.address!,
      apartment: val.apartment || '',
      reference: val.reference!,
      postalCode: val.postalCode || '',
    };

    // 1. Guardar en el servicio global
    this.checkoutService.updateInformation({
      email: val.email!,
      newsletter: !!val.newsletter,
      shippingAddress: shippingAddress,
      note: val.note || 'null'
    });

    // 2. Guardar borrador en SessionStorage
    sessionStorage.setItem('bettjim_checkout_draft', JSON.stringify(shippingAddress));

    // 3. Navegar
    this.router.navigate(['/checkout/shipping']);
  }
  
}