import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, resource, signal, ChangeDetectionStrategy, Input } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { User } from '../../../services/user';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-order-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class OrderDetail {

  private route = inject(ActivatedRoute);
  URL_IMG = signal(environment.API_URL + 'product_imagen/');
  userService = inject(User);
   @Input() id!: string;

  // orderResource = resource({

  //   loader: async () => {

  //     return await firstValueFrom(this.userService.get_order_details());
  //   }
  // });
   orderResource = resource({
    params: () => ({ id: this.id }),
    loader: async ({ params }) => {
      const res = await firstValueFrom(this.userService.get_order_details(params.id));
      return res;
    }
  });

  // TUS DATOS LISTOS PARA EL HTML   this.orderResource.value()?.status_history || []
  order = computed(() => this.orderResource.value()?.order);
  details = computed(() => this.orderResource.value()?.details || []);
  timeLine = computed(() => this.orderResource.value()?.order.shipping?.status_history || []);
    
  // // 4. Lógica de UI (Colores)
  // statusColor = computed(() => {
  //   const status = this.order()?.status;
  //   switch (status) {
  //     case 'Completado': return 'text-green-600 bg-green-100 px-3 py-1 rounded-full';
  //     case 'Enviado': return 'text-blue-600 bg-blue-100 px-3 py-1 rounded-full';
  //     case 'Cancelado': return 'text-red-600 bg-red-100 px-3 py-1 rounded-full';
  //     default: return 'text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full';
  //   }
  // });

// 1. DEFINIR LOS PASOS FIJOS (Solo 4 pasos, sin duplicados)
stepsFixed = [
  { label: 'pendiente', dbStatus: 'pendiente' },   // Índice 0
  { label: 'procesando', dbStatus: 'procesando' },  // Índice 1
  { label: 'enviado',    dbStatus: 'enviado' },     // Índice 2
  { label: 'entregado',  dbStatus: 'entregado' }   // Índice 3 (FINAL)
];

// 2. CALCULAR ÍNDICE ACTUAL
currentStepIndex = computed(() => {
  const currentStatus = this.order()?.status; 
  
  if (!currentStatus || currentStatus === 'cancelado') return -1;

  // Mapa exacto: Backend -> Índice Array (0 a 3)
  const statusMap: Record<string, number> = {
    'pendiente': 0, 
    'procesando': 1,
    'enviado': 2,
    'entregado': 3
    
  };

  return statusMap[currentStatus] ?? 0;
});

// ... (tu función statusIcons se queda igual) ...

// 3. LÓGICA DE COMPLETADO
// Usamos "<=" para que SI estamos en el paso 3, el paso 3 TAMBIÉN se marque como completado/pintado.
isStepCompleted(index: number): boolean {
  const current = this.currentStepIndex();
  // Si es -1 (cancelado o error), nada está completado
  if (current === -1) return false;
  
  return index <= current;
}
  // 3. HELPER PARA LOS ÍCONOS (Tu función mejorada)
  // Recibe el 'label' del paso (Confirmado, Preparando...)
  statusIcons(label: string): string {
    switch (label) {
      case 'pendiente': return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'procesando': return 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4';
      case 'enviado':    return 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0';
      case 'entregado':  return 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6';
      case 'cancelado':  return 'M6 18L18 6M6 6l12 12';
      default: return '';
    }
  }


}
