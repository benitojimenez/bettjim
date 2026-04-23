import { Component, computed, inject, OnDestroy, OnInit, signal, ChangeDetectionStrategy, effect, PLATFORM_ID, Input } from '@angular/core';
import { CommonModule, isPlatformServer } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, interval } from 'rxjs';

// Servicios y Configuración
import { Products } from '../../../services/product';
import { environment } from '../../../../environments/environment';
import { Cart } from '../../../services/cart';
import { Seo } from '../../../services/seo';
import { SeoJsonLd } from '../../../services/SeoJsonLd';

// Componentes y Pipes compartidos
import { ProductSlider } from '../../../home/widgets/product-slider/product-slider';
import { Breadcrumbs } from '../../../shared/components/breadcrumbs/breadcrumbs';
import { DiscountPipe } from "../../../shared/pipes/discount-pipe";
import { ShareModal } from "../../widgets/share-modal/share-modal";
import { ViewerToast } from "../../widgets/viewer-toast/viewer-toast";

@Component({
  selector: 'app-product-detail-one',
  imports: [CommonModule, Breadcrumbs, DiscountPipe, ProductSlider, ShareModal, ViewerToast],
  templateUrl: './product-detail-one.html',
  styleUrl: './product-detail-one.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class ProductDetailOne implements OnInit, OnDestroy {

  @Input() slug!: string;

  // ================================================================
  // 1. INYECCIONES Y CONFIGURACIÓN
  // ================================================================
  private seo = inject(Seo);
  private seoJsonLd = inject(SeoJsonLd);
  private route = inject(ActivatedRoute);
  public ps = inject(Products);
  public cartService = inject(Cart);
  private _platformId = inject(PLATFORM_ID);

  public URL_IMG = signal(environment.API_URL+'product_imagen/' );

  // ================================================================
  // 2. ESTADO BASE (Fuente de Verdad)
  // ================================================================
  public product = computed(() => this.ps.cleanProductSlug());
  public Inventory = computed(() => this.ps.cleanInventoryProduct() || []);
  
  public isLoading = computed(() => this.ps.singleProductResource.isLoading());
  public error = computed(() => this.ps.singleProductResource.error());

  // Selecciones del Usuario
  public selectedColor = signal<string>('');
  public selectedSize = signal<string>('');
  public quantity = signal<number>(1);
  public hoverImage = signal<string | null>(null);
  
  // UI States
  public activeTab = signal('detalles');
  public isShareModalOpen = signal(false);
  public timeLeft = signal('');
  public viewers = signal(12);

  // ================================================================
  // 3. ESTADO DERIVADO (Magia Reactiva)
  // ================================================================
  
  // Extraemos todos los colores únicos del producto
 public availableColors = computed(() => {
    const p = this.product();
    if (!p || !p.variants) return [];
    
    const uniqueVariants: any[] = [];
    const seenColors = new Set<string>();

    for (const variant of p.variants) {
      if (variant && variant.color && !seenColors.has(variant.color)) {
        seenColors.add(variant.color);
        uniqueVariants.push(variant); // Empujamos el objeto real y seguro
      }
    }
    
    return uniqueVariants;
  });

  // Tallas disponibles basadas en el color seleccionado
  // Tallas disponibles basadas en el color seleccionado
  public availableSizes = computed(() => {
    const p = this.product();
    const color = this.selectedColor();
    if (!p || !p.variants || !color) return [];
    
    // 1. Buscamos la única variante que tiene ese color
    const variant = p.variants.find((v: any) => v.color === color);
    
    // 2. Devolvemos su array de tallas de forma plana.
    // Si la variante existe y tiene tallas, las devuelve: ["S", "M", "L"]
    // Si no, devuelve un array vacío para no romper el HTML.
    return (variant && variant.sizes) ? variant.sizes : [];
  });
  // Imagen activa automática
  public activeImage = computed(() => {
    if (this.hoverImage()) return this.hoverImage();
    
    const p = this.product();
    if (!p) return '';

    if (this.selectedColor() && p.variants) {
      const variant = p.variants.find((v: any) => v.color === this.selectedColor());
      if (variant) {
        const match = p.images?.find((img: any) => img.image_id === variant.image_id);
        if (match) return match.src;
      }
    }
    return p.images?.[0]?.src || '';
  });

  // Stock calculado exacto
  public currentStock = computed(() => {
    const p = this.product();
    if (!p) return 0;
    
    if (p.type_inventory === 1) return p.stock;

    const color = this.selectedColor();
    const size = this.selectedSize();
    if (!color || !size) return 0; // Si no ha elegido ambos, mostramos 0

    const match = this.Inventory().find((i: any) => i.color === color && i.size === size);
    return match ? match.stock : 0;
  });

  public isMaxStockReached = computed(() => this.currentStock() === 0 || this.quantity() >= this.currentStock());

  public isDiscountActive = computed(() => {
    const p = this.product();
    if (!p?.discount) return false;
    const now = Date.now();
    const start = new Date(p.discount_start).getTime();
    const end = new Date(p.discount_end).getTime();
    return now >= start && now <= end;
  });

  public relatedProducts = computed(() => {
    const p = this.product();
    if (!p) return [];
    return this.ps.displayProducts().filter(prod => prod._id !== p._id).slice(0, 2);
  });

  public breadcrumbs = computed(() => {
    const p = this.product();
    const base = [{ label: 'Inicio', url: '/' }, { label: 'Tienda', url: '/shop' }];
    if (!p) return base;
    return [...base, { label: p.category || 'General', url: ['/shop'], queryParams: { cat: p.category } }, { label: p.title }];
  });

  private timerSubscription?: Subscription;
  private viewersInterval?: any;

  // ================================================================
  // 4. EFECTOS Y CICLO DE VIDA
  // ================================================================
  constructor() {
    effect(() => {
      const p = this.product();
      
      if (p) {
        // Reseteos automáticos al cambiar de producto
        this.selectedColor.set('');
        this.selectedSize.set('');
        this.quantity.set(1);
        this.hoverImage.set(null);

        // SEO
        this.seo.generateTags({
          title: `${p.title} | Bettjim.com`,
          description: p.summary || `Compra ${p.title} al mejor precio.`,
          image: `product_imagen/${p.images?.[0]?.src}`,
          slug: `product/${p.slug}`,
          type: 'product',
          price: this.cartService.getDiscount(p),
          currency: 'PEN',
          stock: p.stock > 0
        });

        if (isPlatformServer(this._platformId)) {
          this.seoJsonLd.addJsonLdScript(p, this.Inventory() || []);
          this.seoJsonLd.addBreadcrumbSchema(p);
        }
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    // Si viene por Input (App Router Bindings)
    if (this.slug) {
      this.ps.selectedSlug.set(this.slug);
    }

    this.startCountdown();
    this.startViewersSimulation();
  }

  ngOnDestroy() {
    if (this.timerSubscription) this.timerSubscription.unsubscribe();
    if (this.viewersInterval) clearInterval(this.viewersInterval);
  }

  // ================================================================
  // 5. ACCIONES DEL USUARIO (Limpias y directas)
  // ================================================================
  
  selectColor(color: string) {
    console.log('Color seleccionado:', color);
    this.selectedColor.set(color);
    this.selectedSize.set(''); // Al cambiar color, borramos la talla seleccionada
    this.quantity.set(1);
  }

  selectSize(size: string) {
    console.log('Talla seleccionada:', size);
    this.selectedSize.set(size);
    this.quantity.set(1);
  }

  updateQuantity(val: number) {
    this.quantity.update(q => {
      const newQ = q + val;
      return Math.max(1, Math.min(newQ, this.currentStock()));
    });
  }

  changeImage(src: string | null) {
    this.hoverImage.set(src);
  }

  addToCart() {
    const prod = this.product();
    
    // 1. Obtenemos la imagen exacta de la variante (o la principal)
    const cartImage = this.activeImage(); 
    
    // 2. Extraemos el stock máximo (usando nuestra Signal computada Nivel Dios)
    const availableStock = this.currentStock();

    if (prod.type_inventory === 2) {
      // Validamos variantes
      if (!this.selectedColor() || !this.selectedSize()) {
        alert("Por favor, selecciona un color y una talla.");
        return;
      }
      
      const invMatch = this.Inventory().find((i: any) => i.color === this.selectedColor() && i.size === this.selectedSize());
      
      const data = {
        // --- Identificadores ---
        product: prod._id,
        inventory: invMatch?._id || null, 
        user: localStorage.getItem('_id') ?? 'null',
        store: prod.store || 'Bettjim', // La tienda (Por defecto Bettjim si está vacío)
        
        // --- Info Visual para el Carrito (Lean Data) ---
        title: prod.title,
        image: cartImage,
        variety: `${this.selectedColor()} - ${this.selectedSize()}`,
        
        // --- Cantidades y Límites ---
        quantity: this.quantity(),
        max_stock: availableStock, // 🔥 El tope para el botón '+' en el carrito
        
        // --- Precios ---
        unit_price: prod.price,
        discount: prod.discount ?? 0,
        discount_price: this.cartService.getDiscount(prod),
        discount_amount: prod.price - this.cartService.getDiscount(prod), // Monto descontado por unidad
        subtotal: this.quantity() * this.cartService.getDiscount(prod),
        total: this.quantity() * this.cartService.getDiscount(prod),
        
      };
      
      this.cartService.addToCart(data);

    } else {
      // Lógica para productos Tipo 1 (Sin variantes)
      const data = {
        product: prod._id,
        inventory: null,
        user: localStorage.getItem('_id') ?? 'null',
        store: prod.store || 'Bettjim',
        
        title: prod.title,
        image: cartImage,
        variety: null, // O puedes dejarlo null
        
        quantity: this.quantity(),
        max_stock: availableStock, // 🔥 En tipo 1, esto será prod.stock
        
        unit_price: prod.price,
        discount: prod.discount ?? 0,
        discount_price: this.cartService.getDiscount(prod),
       discount_amount: 0, // Monto descontado por unidad
        subtotal: this.quantity() * this.cartService.getDiscount(prod),
        total: this.quantity() * this.cartService.getDiscount(prod),
      };
      
      // Asegúrate de que tu cartService acepte este nuevo formato
      this.cartService.addToCart(data); 
    }
  }
  // --- Helpers UI y Marketing ---
  openShare() { this.isShareModalOpen.set(true); }
  closeShare() { this.isShareModalOpen.set(false); }
  setTab(tab: string) { this.activeTab.set(tab); }

  private startCountdown() {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    this.timerSubscription = interval(1000).subscribe(() => {
      const now = new Date();
      const diff = endOfDay.getTime() - now.getTime();
      if (diff <= 0) { this.timeLeft.set('00h 00m 00s'); return; }
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      this.timeLeft.set(`${h}h ${m}m ${s}s`);
    });
  }

  private startViewersSimulation() {
    this.viewersInterval = setInterval(() => {
      const change = Math.random() > 0.5 ? 1 : -1;
      this.viewers.update(v => Math.max(5, Math.min(30, v + change)));
    }, 5000);
  }

  shippingOptions = [
    { id: 'standard', title: 'Envío Estándar (Lima)', description: 'Entrega en 2 a 3 días hábiles.', price: 'S/ 10.00' },
    { id: 'express', title: 'Envío Express (Lima)', description: 'Entrega el mismo día (pedidos antes de 1 PM).', price: 'S/ 18.00' },
    { id: 'province', title: 'Envío a Provincias', description: 'Olva Courier o Shalom (3-5 días).', price: 'S/ 15.00' }
  ];
}