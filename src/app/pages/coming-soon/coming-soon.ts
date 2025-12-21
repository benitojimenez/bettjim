import { Component, OnDestroy, OnInit, signal, HostListener, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-coming-soon',
  imports: [CommonModule, FormsModule],
  templateUrl: './coming-soon.html',
  styleUrl: './coming-soon.scss',
})
export default class ComingSoon implements OnInit, OnDestroy{
  // CONFIGURACIÓN: Fecha de lanzamiento (Ej: 14 días desde hoy)
  targetDate = new Date(new Date().getTime() + (5 * 24 * 60 * 60 * 1000));
  
  // SIGNALS para el tiempo
  days = signal('00');
  hours = signal('00');
  minutes = signal('00');
  seconds = signal('00');

  // Input del usuario
  email = '';

  // Referencias para el efecto Spotlight
  @ViewChildren('glowBox') boxes!: QueryList<ElementRef>;

  private intervalId: any;

  ngOnInit() {
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  // --- LÓGICA DEL TEMPORIZADOR ---
  startTimer() {
    this.updateTime();
    this.intervalId = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  updateTime() {
    const now = new Date().getTime();
    const distance = this.targetDate.getTime() - now;

    if (distance < 0) {
      this.stopTimer();
      return;
    }

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    this.days.set(this.pad(d));
    this.hours.set(this.pad(h));
    this.minutes.set(this.pad(m));
    this.seconds.set(this.pad(s));
  }

  pad(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  stopTimer() {
    this.days.set('00'); this.hours.set('00');
    this.minutes.set('00'); this.seconds.set('00');
    clearInterval(this.intervalId);
  }

  // --- LÓGICA DEL EFECTO SPOTLIGHT (MOUSE) ---
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    // Calculamos la posición del mouse relativa a cada caja de vidrio
    this.boxes.forEach((box) => {
      const rect = box.nativeElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Inyectamos las coordenadas CSS para mover el brillo
      box.nativeElement.style.setProperty('--mouse-x', `${x}px`);
      box.nativeElement.style.setProperty('--mouse-y', `${y}px`);
    });
  }

  subscribe() {
    if(!this.email) return;
    alert(`¡Gracias! Te avisaremos en: ${this.email}`);
    this.email = '';
  }
}
