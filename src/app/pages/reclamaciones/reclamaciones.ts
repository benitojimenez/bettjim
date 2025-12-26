import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({

  selector: 'app-reclamaciones',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './reclamaciones.html',
  styleUrl: './reclamaciones.scss',
})
export default class Reclamaciones implements OnInit {
  complaintForm: FormGroup;
  currentDate = new Date();
  claimCode = ''; // Se genera al iniciar

  // DATOS DE TU EMPRESA (OBLIGATORIO MOSTRAR)
  companyInfo = {
    razonSocial: 'PEDRO BENITO JIMENEZ ',
    ruc: '10764313246',
    address: 'Lima, Lima, Lima'
  };

  constructor(private fb: FormBuilder) {
    this.complaintForm = this.fb.group({
      // 1. Identificación Consumidor
      name: ['', Validators.required],
      documentType: ['DNI', Validators.required],
      documentNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{8,12}$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      address: ['', Validators.required],
      isMinor: [false], // Si es menor de edad
      parentName: [''], // Nombre del padre (si aplica)

      // 2. Bien Contratado
      contractType: ['producto', Validators.required], 
      amount: ['', Validators.required],
      description: ['', Validators.required],

      // 3. Detalle
      type: ['reclamo', Validators.required],
      detail: ['', [Validators.required, Validators.minLength(20)]],
      request: ['', Validators.required],
      
      // 4. Legal
      terms: [false, Validators.requiredTrue]
    });
  }

  ngOnInit() {
    // Generar código único tipo: 2025-REQ-000123
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(5, '0');
    this.claimCode = `${year}-REQ-${random}`;
  }

  onSubmit() {
    console.log('Enviando reclamo:', this.complaintForm.value);
    if (this.complaintForm.valid) {
      console.log('Enviando reclamo:', this.complaintForm.value);
      // alert(`Reclamo registrado con éxito. Su código es: ${this.claimCode}. Se envió una copia a su correo.`);
      // Redirigir al home o mostrar página de éxito
    } else {
      this.complaintForm.markAllAsTouched();
      // Scroll automático al primer error (UX)
      const firstInvalid = document.querySelector('.ng-invalid');
      if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
