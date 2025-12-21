import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" [ngClass]="toastService.position()">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [ngClass]="toast.type">
          
          <div class="icon-wrapper">
            @if(toast.type === 'success') { <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg> }
            @if(toast.type === 'error') { <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> }
            @if(toast.type === 'warning') { <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> }
            @if(toast.type === 'info') { <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
          </div>

          <div class="content"><p>{{ toast.message }}</p></div>

          <button (click)="toastService.remove(toast.id)" class="close-btn">&times;</button>
          <div class="progress-bar"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    /* --- VARIABLES --- */
    :host {
      --toast-gap: 20px; /* Margen desde el borde */
    }

    /* --- CONTENEDOR BASE --- */
    .toast-container {
      position: fixed;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 9999;
      pointer-events: none;
      transition: all 0.3s ease; /* Transición suave si cambias de posición */
    }

    /* --- POSICIONES (La clave de tu pedido) --- */
    
    /* ABAJO (Bottom) */
    .bottom-right  { bottom: var(--toast-gap); right: var(--toast-gap); align-items: flex-end; }
    .bottom-left   { bottom: var(--toast-gap); left: var(--toast-gap);  align-items: flex-start; }
    
    .bottom-center { 
      bottom: var(--toast-gap); 
      left: 50%; 
      transform: translateX(-50%); 
      align-items: center; 
    }

    /* ARRIBA (Top) */
    .top-right { top: var(--toast-gap); right: var(--toast-gap); align-items: flex-end; flex-direction: column-reverse; }
    .top-left  { top: var(--toast-gap); left: var(--toast-gap);  align-items: flex-start; flex-direction: column-reverse; }
    
    .top-center { 
      top: var(--toast-gap); 
      left: 50%; 
      transform: translateX(-50%); 
      align-items: center; 
      flex-direction: column-reverse; /* Para que los nuevos salgan pegados al borde superior */
    }

    /* --- ESTILOS DEL ITEM (Igual que antes) --- */
    .toast-item {
      pointer-events: auto;
      width: 320px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      padding: 16px;
      border-radius: 12px;
      border: 1px solid #e4e4e7;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
      display: flex; align-items: flex-start; gap: 12px;
      position: relative; overflow: hidden;
      
      /* Animación de entrada */
      animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes popIn {
      from { opacity: 0; transform: scale(0.9) translateY(10px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }

    /* Colores y detalles (igual que tu versión anterior) */
    .icon-wrapper { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .icon-wrapper svg { width: 100%; height: 100%; }
    .content { flex: 1; font-family: 'Inter', sans-serif; font-size: 0.9rem; font-weight: 500; color: #18181b; }
    .close-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #a1a1aa; line-height: 0.5; }
    
    .progress-bar { position: absolute; bottom: 0; left: 0; height: 3px; width: 100%; animation: progress 3.5s linear forwards; }
    @keyframes progress { to { transform: scaleX(0); transform-origin: left; } }

    /* Variantes */
    .success .icon-wrapper, .success .progress-bar { color: #10b981; background-color: #10b981; }
    .error .icon-wrapper, .error .progress-bar { color: #ef4444; background-color: #ef4444; }
    .icon-wrapper { background-color: transparent !important; }

  `]
})
export class Toast {
  toastService = inject(ToastService);
}