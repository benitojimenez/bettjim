import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-viewer-toast',
  imports: [CommonModule],
  templateUrl: './viewer-toast.html',
  styleUrl: './viewer-toast.scss',
})
export class ViewerToast implements OnInit, OnDestroy {
  // Signal para el número de personas (Empieza en null para no mostrar nada al inicio)
  viewerCount = signal<number | null>(null);
  isVisible = signal(false);

  private intervalId: any;

  ngOnInit() {
    // Retrasamos la aparición 2 segundos para no abrumar al entrar
    setTimeout(() => {
      this.startSimulation();
    }, 2000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  startSimulation() {
    // Número inicial aleatorio entre 12 y 25
    let currentCount = Math.floor(Math.random() * (25 - 12 + 1)) + 12;
    this.viewerCount.set(currentCount);
    this.isVisible.set(true);

    // Actualizamos cada 5 segundos para que parezca "Vivo"
    this.intervalId = setInterval(() => {
      // Fluctúa: A veces suma, a veces resta (random entre -2 y +3)
      const change = Math.floor(Math.random() * 6) - 2; 
      currentCount += change;
      
      // Mantenemos límites realistas (mínimo 8, máximo 40)
      if (currentCount < 8) currentCount = 8;
      if (currentCount > 40) currentCount = 40;

      this.viewerCount.set(currentCount);
    }, 5000);
  }

  close() {
    this.isVisible.set(false);
  }
}
