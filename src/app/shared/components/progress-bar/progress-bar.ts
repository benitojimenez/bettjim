import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, Event } from '@angular/router';

@Component({
  selector: 'app-progress-bar',
  imports: [],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
})
export class ProgressBar {
  private router = inject(Router);
  isLoading = signal(false);
  progress = signal(0);
  private intervalId: any;

  constructor() {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) this.startLoading();
      else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) this.stopLoading();
    });
  }

  private startLoading() {
    this.isLoading.set(true);
    this.progress.set(0);
    if (this.intervalId) clearInterval(this.intervalId);

    // Lógica rápida y orgánica
    this.intervalId = setInterval(() => {
      this.progress.update(current => {
        if (current >= 95) return 95;
        // Salto aleatorio para que parezca "pensando"
        const jump = Math.random() > 0.5 ? Math.random() * 15 : 2; 
        return Math.min(current + jump, 95);
      });
    }, 200);
  }

  private stopLoading() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.progress.set(100);
    setTimeout(() => {
      this.isLoading.set(false);
      setTimeout(() => this.progress.set(0), 200);
    }, 400);
  }
}
