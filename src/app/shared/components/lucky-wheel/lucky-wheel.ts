import { Component, signal, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import confetti from 'canvas-confetti'; // Importar arriba

@Component({
  selector: 'app-lucky-wheel',
  imports: [CommonModule],
  templateUrl: './lucky-wheel.html',
  styleUrl: './lucky-wheel.scss',
})
export class LuckyWheel implements OnInit {
 // 1. INYECCIONES DE DEPENDENCIAS
  private platformId = inject(PLATFORM_ID);

  // 2. VARIABLES DE AUDIO
  private audioTick: HTMLAudioElement | null = null;
  private audioWin: HTMLAudioElement | null = null;
  private audioLose: HTMLAudioElement | null = null;

  // 3. ESTADOS (SIGNALS)
  isOpen = signal(false);
  isSpinning = signal(false);
  prizeWon = signal<string | null>(null);
  feedbackMessage = signal('');
  rotationStyle = signal('rotate(0deg)');
  
  // false = Aún puede jugar, true = Ya jugó y canjeó
  hasPlayed = signal(false); 

  // Instancia de confeti (Signal)
  myConfetti = signal<any>(null);

  // 4. DATOS Y CONFIGURACIÓN
  winners = [
    { user: '🔥 María', city: 'Lima', win: '10% OFF' },
    { user: '🔥 Carlos', city: 'Arequipa', win: 'ENVÍO GRATIS' },
    { user: '🔥 Lucia', city: 'Trujillo', win: 'S/. 15' },
    { user: '🔥 Juan', city: 'Miraflores', win: '15% OFF' },
    { user: '🔥 Marly', city: 'Lima', win: 'SORPRESA' },
    { user: '🔥 Katerin', city: 'Huaraz', win: 'ENVÍO GRATIS' },
  ];

  PRIZES_CONFIG = [
    { text: 'ENVÍO GRATIS', weight: 5 },       // index 0
    { text: '10% OFF', weight: 40 },           // index 1
    { text: 'S/. 15 BONO', weight: 10 },       // index 2
    { text: 'SORPRESA', weight: 15 },          // index 3
    { text: '15% OFF', weight: 20 },           // index 4
    { text: 'INTENTA OTRA VEZ', weight: 10 }   // index 5
  ];

  // 5. CONSTRUCTOR E INICIALIZACIÓN
  constructor() {
    // Inicialización segura (SSR Friendly)
    if (isPlatformBrowser(this.platformId)) {

      // Crear instancia de confeti (undefined para usar canvas global/custom)
      const confettiInstance = confetti.create(undefined, {
        resize: true,
        useWorker: true,
      });
      this.myConfetti.set(confettiInstance);

      // Pre-carga de audios
      this.audioTick = new Audio('assets/audio/tick.mp3');
      this.audioWin = new Audio('assets/audio/win.mp3');
      this.audioLose = new Audio('assets/audio/lose.mp3'); 

      // Ajustar volúmenes
      if (this.audioTick) this.audioTick.volume = 0.5;
      if (this.audioWin) this.audioWin.volume = 0.8;
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Revisar historial del usuario
      const status = localStorage.getItem('wheel_status'); 

      if (status === 'claimed') {
        this.hasPlayed.set(true);
      } else {
        // Si es nuevo, esperamos y lanzamos el modal
        setTimeout(() => {
          if (!this.hasPlayed()) {
            this.isOpen.set(true);
          }
        }, 3000); // 3 segundos de cortesía
      }
    }
  }

  // 6. MÉTODOS PRINCIPALES (CORE)

  spin() {
    if (this.isSpinning()) return;

    // A. Resetear estados
    this.feedbackMessage.set('');
    this.isSpinning.set(true);
    this.playSpinSound(); // 🔊 Audio tick

    // B. Obtener ganador (Lógica Ponderada)
    const winnerIndex = this.getWeightedWinner();
    const winnerText = this.PRIZES_CONFIG[winnerIndex].text;

    // C. Cálculos Matemáticos
    const totalSegments = this.PRIZES_CONFIG.length;
    const segmentDegrees = 360 / totalSegments;

    const startAngle = winnerIndex * segmentDegrees; 
    const centerOffset = segmentDegrees / 2; 
    const safeZone = segmentDegrees * 0.4;
    const randomWiggle = (Math.random() * safeZone * 2) - safeZone;

    // El ángulo exacto dentro de la rueda donde está el premio
    const targetAngleInWheel = startAngle + centerOffset + randomWiggle;

    // D. Fórmula de Rotación Final
    const spins = 360 * 8; // 8 vueltas completas
    const finalRotation = spins + (360 - targetAngleInWheel);

    // console.log('Ganador Index:', winnerIndex);
    // console.log('Rotación Final CSS:', finalRotation);

    // E. Aplicar Rotación
    this.rotationStyle.set(`rotate(${finalRotation}deg)`);

    // F. Finalizar (4 segundos después)
    setTimeout(() => {
      this.isSpinning.set(false);
      this.stopSpinSound(); // 🛑 Parar audio tick

      const isTryAgain = winnerText.toUpperCase().includes('INTENTA');

      if (isTryAgain) {
        // PERDIÓ
        this.feedbackMessage.set('¡Casi! Gira de nuevo 🍀');
        this.playAudio('lose');
      } else {
        // GANÓ
        this.prizeWon.set(winnerText);
        this.launchConfetti();
        this.playAudio('win');
      }
    }, 4000);
  }

  claimPrize(email: string) {
    if (!email) return;

    console.log('Lead Capturado:', email);

    // Marcar como jugado definitivamente
    this.hasPlayed.set(true);
    localStorage.setItem('wheel_status', 'claimed');
    
    this.isOpen.set(false);
    alert(`¡Enviado a ${email}! Tu código es: BETTJIM20`);
  }

  close() {
    this.isOpen.set(false);
    localStorage.setItem('wheelPlayed', 'skipped');
  }

  // 7. MÉTODOS VISUALES Y AUDIO

  launchConfetti() {
    const fire = this.myConfetti();
    if (!fire) return;

    const duration = 5000;
    const end = Date.now() + duration;
    const colors = ['#FF2E63', '#FFD700', '#FFFFFF', '#5f138bff'];

    const frame = () => {
      const timeLeft = end - Date.now();
      if (timeLeft <= 0) return;

      const particleCount = 7; 

      // Cañón Izquierdo
      fire({
        particleCount: particleCount,
        angle: 60,
        spread: 80,
        origin: { x: 0, y: 0.7 },
        colors: colors,
        zIndex: 100000,
        startVelocity: 60,
        scalar: 1.2,
        drift: 1,
      });

      // Cañón Derecho
      fire({
        particleCount: particleCount,
        angle: 120,
        spread: 80,
        origin: { x: 1, y: 0.7 },
        colors: colors,
        zIndex: 100000,
        startVelocity: 60,
        scalar: 1.2,
        drift: -1,
      });

      requestAnimationFrame(frame);
    };

    frame();
  }

  playSpinSound() {
    if (!this.audioTick) return;

    let time = 0;
    const duration = 4000;

    const tickLoop = () => {
      if (!this.isSpinning()) return; 

      this.audioTick!.currentTime = 0;
      this.audioTick!.play().catch(() => { });

      const progress = time / duration;
      const nextInterval = 50 + (400 * (progress * progress));

      time += nextInterval;

      if (time < duration) {
        setTimeout(tickLoop, nextInterval);
      }
    };
    tickLoop();
  }

  stopSpinSound() {
    if (this.audioTick) {
      this.audioTick.pause();
      this.audioTick.currentTime = 0;
    }
  }

  playAudio(type: 'win' | 'lose') {
    const audio = type === 'win' ? this.audioWin : this.audioLose;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => console.log('Audio bloqueado', e));
    }
  }

  // 8. HELPERS Y UTILIDADES

  getWeightedWinner(): number {
    const totalWeight = this.PRIZES_CONFIG.reduce((sum, item) => sum + item.weight, 0);
    let randomPointer = Math.floor(Math.random() * totalWeight);

    for (let i = 0; i < this.PRIZES_CONFIG.length; i++) {
      randomPointer -= this.PRIZES_CONFIG[i].weight;
      if (randomPointer < 0) {
        return i;
      }
    }
    return 0; 
  }

  getSegmentRotation(index: number): string {
    const totalSegments = this.PRIZES_CONFIG.length;
    const segmentDegree = 360 / totalSegments;
    const rotation = (segmentDegree * index) + (segmentDegree / 2);
    return `translateX(-50%) rotate(${rotation}deg)`;
  }

  // Helper privado para randoms (si lo necesitas en el futuro)
  private randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }
}
