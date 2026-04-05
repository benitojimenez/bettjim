import { Component, signal, OnInit, PLATFORM_ID, inject, effect, HostListener } from '@angular/core';
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
  // NUEVA VARIABLE PARA AUDIO DE FONDO
  private audioBg: HTMLAudioElement | null = null;
  private audioUnlocked = false; // <-- NUEVO: Control para saber si ya lo desbloqueamos

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
    { user: ' María', city: 'Lima', win: '10% OFF' },
    { user: ' Carlos', city: 'Arequipa', win: 'ENVÍO GRATIS' },
    { user: ' Lucia', city: 'Trujillo', win: 'S/. 15' },
    { user: ' Juan', city: 'Miraflores', win: '15% OFF' },
    { user: ' Marly', city: 'Lima', win: 'SORPRESA' },
    { user: ' Katerin', city: 'Huaraz', win: 'ENVÍO GRATIS' },
  ];

  // AJUSTE: Reducido a 6 premios exactos para encajar con los 6 gajos del SCSS (16.66% c/u)
  PRIZES_CONFIG = [
    { text: 'ENVÍO GRATIS', weight: 5 },       // index 0
    { text: '10% OFF', weight: 40 },           // index 1
    { text: 'INTENTA OTRA VEZ', weight: 15 },  // index 2
    { text: 'SORPRESA', weight: 20 },          // index 3
    { text: 'S/. 15 BONO', weight: 5 },        // index 4
    { text: 'INTENTA OTRA VEZ', weight: 15 }   // index 5
  ];

  // 5. CONSTRUCTOR E INICIALIZACIÓN
  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const confettiInstance = confetti.create(undefined, {
        resize: true,
        useWorker: true,
      });
      this.myConfetti.set(confettiInstance);

      this.audioTick = new Audio('assets/audio/tick.mp3');
      this.audioWin = new Audio('assets/audio/win.mp3');
      this.audioLose = new Audio('assets/audio/lose.mp3'); 

      if (this.audioTick) this.audioTick.volume = 0.5;
      if (this.audioWin) this.audioWin.volume = 0.8;
      // 1. Instanciar el audio de fondo
      this.audioBg = new Audio('assets/audio/sonicwin.mp3'); // <-- Asegúrate de tener este archivo
      if (this.audioBg) {
        this.audioBg.loop = true; // Que se repita infinitamente
        this.audioBg.volume = 0.15; // Volumen bajo (15%) para que no sature
      }
    

    // 2. EFECTO: Vigila la señal isOpen automáticamente
    effect(() => {
      if (this.isOpen()) {
        this.playBgMusic();
      } else {
        this.stopBgMusic();
      }
    });
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const status = localStorage.getItem('wheel_status'); 

      if (status === 'claimed') {
        this.hasPlayed.set(true);
      } else {
        setTimeout(() => {
          if (!this.hasPlayed()) {
            this.isOpen.set(true);
          }
        }, 3000);
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

    // B. Obtener ganador
    const winnerIndex = this.getWeightedWinner();
    const winnerText = this.PRIZES_CONFIG[winnerIndex].text;

    // C. Cálculos Matemáticos
    const totalSegments = this.PRIZES_CONFIG.length;
    const segmentDegrees = 360 / totalSegments;

    const startAngle = winnerIndex * segmentDegrees; 
    const centerOffset = segmentDegrees / 2; 
    const safeZone = segmentDegrees * 0.4;
    const randomWiggle = (Math.random() * safeZone * 2) - safeZone;

    const targetAngleInWheel = startAngle + centerOffset + randomWiggle;

    // D. Fórmula de Rotación Final (8 vueltas completas)
    const spins = 360 * 8; 
    const finalRotation = spins + (360 - targetAngleInWheel);

    // E. Aplicar Rotación
    this.rotationStyle.set(`rotate(${finalRotation}deg)`);

    // F. Finalizar (AJUSTADO A 5000ms para coincidir con el SCSS transition: 5s)
    setTimeout(() => {
      this.isSpinning.set(false);
      this.stopSpinSound(); 

      const isTryAgain = winnerText.toUpperCase().includes('INTENTA');

      if (isTryAgain) {
        this.feedbackMessage.set('¡Casi! Gira de nuevo 🍀');
        this.playAudio('lose');
      } else {
        this.prizeWon.set(winnerText);
        this.launchConfetti();
        this.playAudio('win');
      }
    }, 5000); // ⏱️ Cambio crítico aquí
  }

  claimPrize(email: string) {
    if (!email) return;

    console.log('Lead Capturado:', email);

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
    // AJUSTE: Colores del confeti cambiados a la paleta Neon/Cyberpunk
    const colors = ['#FF2E63', '#00E5FF', '#FFD700', '#FFFFFF'];

    const frame = () => {
      const timeLeft = end - Date.now();
      if (timeLeft <= 0) return;

      const particleCount = 7; 

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
    const duration = 5000; // AJUSTADO A 5000ms

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

  // 8. HELPERS
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

  playBgMusic() {
    if (this.audioBg) {
      // El catch es importante porque los navegadores a veces bloquean 
      // el auto-play si el usuario no ha interactuado con la pantalla antes.
      this.audioBg.play().catch(e => console.log('Autoplay de fondo bloqueado por el navegador', e));
    }
  }

  stopBgMusic() {
    if (this.audioBg) {
      this.audioBg.pause();
      // Opcional: reiniciar el audio al principio cuando se cierre
      // this.audioBg.currentTime = 0; 
    }
  }

  // Seguridad: Apagar música si el componente se destruye (ej: cambio de ruta)
  ngOnDestroy() {
    this.stopBgMusic();
  }

 // =========================================
  // DESBLOQUEO DE AUDIO GLOBAL (NIVEL DIOS)
  // =========================================
  @HostListener('window:pointerdown')
  unlockAudioOnFirstTouch() {
    // Si tenemos el audio cargado y AÚN NO se ha desbloqueado...
    if (this.audioBg && !this.audioUnlocked) {
      
      // Intentamos darle Play en el momento exacto del clic
      this.audioBg.play().then(() => {
        
        this.audioUnlocked = true; 
        console.log('🎵 Audio desbloqueado por el navegador (Mouse/Touch)');
        
        // TRUCO: Si el usuario hizo clic ANTES de que pasen los 3 segundos 
        // y la ruleta aún está cerrada, pausamos el audio inmediatamente. 
        // Pero el navegador ya nos dio permiso, así que sonará perfecto cuando se abra.
        if (!this.isOpen()) {
          this.audioBg?.pause();
        }

      }).catch((error) => {
        console.log('Aún esperando interacción real...', error);
      });
      
    }
  }
}
