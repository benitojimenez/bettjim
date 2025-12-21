import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

// Definimos los tipos de posición permitidos
export type ToastPosition = 
  'top-left' | 'top-center' | 'top-right' | 
  'bottom-left' | 'bottom-center' | 'bottom-right';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);
  
  // Posición por defecto (Abajo Derecha)
  position = signal<ToastPosition>('bottom-right');

  // Método genérico privado
  private show(type: ToastMessage['type'], message: string, position?: ToastPosition) {
    // Si mandan posición, actualizamos la señal global
    if (position) {
      this.position.set(position);
    }

    const id = Date.now();
    this.toasts.update(current => [...current, { id, type, message }]);

    // Auto eliminar a los 3 segundos
    setTimeout(() => this.remove(id), 3500);
  }

  // Métodos públicos actualizados
  success(msg: string, pos?: ToastPosition) { this.show('success', msg, pos); }
  error(msg: string, pos?: ToastPosition)   { this.show('error', msg, pos); }
  warning(msg: string, pos?: ToastPosition) { this.show('warning', msg, pos); }
  info(msg: string, pos?: ToastPosition)    { this.show('info', msg, pos); }

  remove(id: number) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}