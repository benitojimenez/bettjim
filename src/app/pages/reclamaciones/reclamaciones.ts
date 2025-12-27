import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Complaint } from '../../services/complaint';
import { Seo } from '../../services/seo';


@Component({

  selector: 'app-reclamaciones',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reclamaciones.html',
  styleUrl: './reclamaciones.scss',
})
export default class Reclamaciones implements OnInit {

  seo = inject(Seo);
  // FORMULARIO DE RECLAMACIONES
  complaintForm: FormGroup;
  currentDate = new Date();
  claimCode = 'Generando...'; // Texto temporal hasta recibir respuesta del back
  complaint = inject(Complaint);
  // ESTADO DE CARGA (Para bloquear el botón)
  isSubmitting = signal(false);

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
  // NUEVAS SEÑALES PARA EL MODAL
  showSuccessModal = signal(false);
  registeredCode = signal('');
  ngOnInit() {
    // Generar código único tipo: 2025-REQ-000123
    // Ya no generamos el código aquí, el Backend lo hará.
    this.claimCode = 'PENDIENTE';
    this.seo.generateTags({
      title: 'Libro de Reclamaciones | Bettjim.com',  
      description: 'Registra tu reclamación en el Libro de Reclamaciones de Bettjim.com. Estamos comprometidos a resolver tus inquietudes y mejorar tu experiencia de compra. Completa el formulario con tus datos y detalles de la reclamación, y nuestro equipo se pondrá en contacto contigo lo antes posible para brindarte una solución efectiva.',
      keywords: 'Libro de reclamaciones, registrar reclamación, atención al cliente, Bettjim, experiencia de compra, solución de problemas, servicio al cliente',
      slug: 'libro-reclamaciones',
      type: 'website',
      image: 'obtener_logo/bettjim.png'
    });
  }

  onSubmit() {
    if (this.complaintForm.invalid) {
      this.complaintForm.markAllAsTouched();
      // UX: Scroll al error
      const firstInvalid = document.querySelector('.ng-invalid');
      if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    this.isSubmitting.set(true);
    // ENVIAR DATOS AL BACKEND
    this.complaint.register(this.complaintForm.value).subscribe({
      next: (res: any) => {
        this.isSubmitting.set(false);

        // 1. GUARDAMOS EL CÓDIGO QUE VINO DEL BACKEND
        this.registeredCode.set(res.claimCode);

        // 2. MOSTRAMOS EL MODAL
        this.showSuccessModal.set(true);

        // 3. LIMPIAMOS FORMULARIO (PERO NO CERRAMOS EL MODAL AÚN)
        this.complaintForm.reset();
        // Resetear valores por defecto importantes
        this.complaintForm.patchValue({
          documentType: 'DNI',
          contractType: 'producto',
          type: 'reclamo'
        });
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        console.error(err);
        // Aquí sí podrías dejar un alert simple o manejar errores
        alert('Hubo un error al registrar. Intenta nuevamente.');
      }
    });
  }

  // FUNCIÓN PARA CERRAR EL MODAL
  closeSuccessModal() {
    this.showSuccessModal.set(false);
    // Opcional: Redirigir al home
    // this.router.navigate(['/']); 
  }

  // (OPCIONAL) COPIAR AL PORTAPAPELES
  copyCode() {
    navigator.clipboard.writeText(this.registeredCode());
    // Podrías cambiar el icono temporalmente para dar feedback visual
  }
}
