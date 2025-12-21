import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface TrackingResult {
  id: string;
  currentStatus: string;
  estimatedDate: string;
  progress: number; // 0 a 100
  step: number; // 1: Confirmado, 2: Preparado, 3: En Camino, 4: Entregado
  history: any[];
  items: any[];
}
@Component({
  selector: 'app-tracking',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './tracking.html',
  styleUrl: './tracking.scss',
})
export default class Tracking {
  private fb = inject(FormBuilder);
  
  trackForm: FormGroup = this.fb.group({
    orderId: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  trackingData = signal<TrackingResult | null>(null);
  isLoading = signal(false);

  searchOrder() {
    if (this.trackForm.invalid) return;
    
    this.isLoading.set(true);
    
    // SIMULACIÓN DE API
    setTimeout(() => {
      this.isLoading.set(false);
      
      // Datos simulados (Mock)
      this.trackingData.set({
        id: this.trackForm.value.orderId.toUpperCase(),
        currentStatus: 'En Tránsito',
        estimatedDate: 'Jueves 15 Dic',
        progress: 65, // % de la barra
        step: 3, // Paso activo
        history: [
          { date: new Date(), title: 'Salió del Centro de Distribución', location: 'Lurín, Lima', status: 'done' },
          { date: new Date(Date.now() - 3600000 * 5), title: 'Empaquetado completado', location: 'Almacén Central', status: 'done' },
          { date: new Date(Date.now() - 3600000 * 24), title: 'Pago confirmado', location: 'Online', status: 'done' }
        ],
        items: [
          { name: 'Zapatillas Urban Flow', qty: 1, variant: 'Talla 42', image: 'assets/img/prod-1.jpg' },
          { name: 'Gorra Bettjim Black', qty: 1, variant: 'Única', image: 'assets/img/prod-2.jpg' }
        ]
      });

    }, 1500); // 1.5s de carga para realismo
  }
}
