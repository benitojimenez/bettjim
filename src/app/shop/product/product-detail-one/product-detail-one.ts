import { ChangeDetectionStrategy, Component, ElementRef, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-product-detail-one',
  imports: [CommonModule],
  templateUrl: './product-detail-one.html',
  styleUrl: './product-detail-one.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export default class ProductDetailOne {
  @ViewChild('mainActions') mainActionsRef!: ElementRef;
  // Datos simulados (Vendrían de Input o Servicio)
  product = signal({
    title: 'Serum Reparador Nocturno 24K',
    price: 129.90,
    oldPrice: 180.00,
    discount: 30,
    isHot: true,
    isNew: true,
    images: [
      'https://api.bettjim.com/api/product_imagen/SXurEqd4lq3K_KQf7UUIY-6Z.webp',
      'https://api.bettjim.com/api/product_imagen/SXurEqd4lq3K_KQf7UUIY-6Z.webp',
      'https://api.bettjim.com/api/product_imagen/xY75lVzBgb27MnwSC7149HZr.webp',
      'https://api.bettjim.com/api/product_imagen/4weV_yeTc0FLqhhmwfDJs5e9.webp'
    ]
  });
// Estados
  viewers = signal(12); // Empieza en 12
  activeImage = signal('https://api.bettjim.com/api/product_imagen/SXurEqd4lq3K_KQf7UUIY-6Z.webp');
  quantity = signal(1);
  showStickyBar = signal(false);
  activeTab = signal('desc');
  selectedVariant = signal('Original');
  
  colors = [{name: 'Original', hex: '#FFD700'}, {name: 'Silver', hex: '#C0C0C0'}];
  
  private viewerInterval: any;
  private observer: IntersectionObserver | null = null;

  ngAfterViewInit() {
    this.startViewerSimulation();
    this.setupIntersectionObserver();
  }

  ngOnDestroy() {
    if (this.viewerInterval) clearInterval(this.viewerInterval);
    this.observer?.disconnect();
  }

  // 🔥 SIMULACIÓN DE GENTE VIENDO 🔥
  private startViewerSimulation() {
    this.viewerInterval = setInterval(() => {
      // Fluctúa entre 10 y 25 personas
      const newCount = Math.floor(Math.random() * (25 - 10 + 1) + 10);
      this.viewers.set(newCount);
    }, 5000); // Cambia cada 5 segundos
  }

  private setupIntersectionObserver() {
    this.observer = new IntersectionObserver(([entry]) => {
      this.showStickyBar.set(!entry.isIntersecting);
    }, { threshold: 0 });

    if (this.mainActionsRef) this.observer.observe(this.mainActionsRef.nativeElement);
  }

  setActiveImage(img: string) { this.activeImage.set(img); }
  updateQty(val: number) { this.quantity.update(v => Math.max(1, v + val)); }
}
