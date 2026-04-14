import { Component, computed, inject, OnDestroy, OnInit, signal, ChangeDetectionStrategy, effect, PLATFORM_ID } from '@angular/core';
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
  standalone: true, // Asumiendo Angular 17+ por tu sintaxis de imports
  imports: [CommonModule, Breadcrumbs, DiscountPipe, ProductSlider, ShareModal, ViewerToast],
  templateUrl: './product-detail-one.html',
  styleUrl: './product-detail-one.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class ProductDetailOne implements OnInit, OnDestroy {

  activeTab = signal('detalles');

  // ================================================================
  // 1. INYECCIONES Y CONFIGURACIÓN
  // ================================================================
  private seo = inject(Seo);
  private seoJsonLd = inject(SeoJsonLd); // <-- REEMPLAZA EL MANEJO MANUAL DEL DOM
  private route = inject(ActivatedRoute);
  public ps = inject(Products);
  public cartService = inject(Cart);
  private _platformId = inject(PLATFORM_ID);
  
  // ELIMINADOS: Renderer2 y ElementRef (Ya no se ensucia el componente con manipulación del DOM)

  public URL_IMG = signal(environment.API_URL + 'product_imagen/');

  // ================================================================
  // 2. ESTADO (SIGNALS)
  // ================================================================
  isShareModalOpen = signal<boolean>(false);
  public activeImage = signal<string>('');
  public quantity = signal<number>(1);
  public loading = signal<boolean>(true);

  public timeLeft = signal<string>('');
  public viewers = signal<number>(12);
  public stockLeft = signal<number>(0);
  public url: string = environment.API_URL + 'product_imagen/';
  public urlDomain: string = 'https://bettjim.com/';

  // ================================================================
  // 3. COMPUTED SIGNALS (DERIVADOS)
  // ================================================================
  public breadcrumbs = computed(() => {
    const productData = this.ps.cleanProductSlug();
    const baseCrumbs = [
      { label: 'Inicio', url: '/' },
      { label: 'Tienda', url: '/shop' }
    ];

    if (!productData) return baseCrumbs;

    return [
      ...baseCrumbs,
      {
        label: productData.category || 'General',
        url: ['/shop'],
        queryParams: { cat: productData.category }
      },
      { label: productData.title }
    ];
  });

  public relatedProducts = computed(() => {
    const allProducts = this.ps.displayProducts();
    const currentProduct = this.ps.cleanProductSlug();
    let filtered = allProducts;

    if (currentProduct) {
      filtered = filtered.filter(p => p._id !== currentProduct._id);
    }
    return filtered.slice(0, 2);
  });

  public deliveryDate = computed(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date;
  });

  Inventory = signal<any>([])

  private timerSubscription?: Subscription;
  private viewersInterval?: any;

  // ================================================================
  // 5. CONSTRUCTOR & EFECTOS
  // ================================================================
  constructor() {
    effect(() => {
      const product = this.ps.cleanProductSlug();
      const inventories = this.ps.cleanInvetoryProduct();
      
      if (product && product.images?.length > 0) {
        this.activeImage.set(product.images[0].src);
      }
      
      if (product && product.category) {
        this.ps.filterByCategory.set([product.category]);
      }
      
      if (product?.type_inventory === 1) {
        this.productStock.set(product.stock)
        this.stockLeft.set(product.stock)
      }
      
      if (inventories) {
        this.Inventory.set(inventories);
      }

      if (product) {
        this.seo.generateTags({
          title: product.title + ' | Bettjim.com',
          description: product.summary || `Compra ${product.title} al mejor precio en Bettjim.`,
          image: 'product_imagen/' + (product.images?.[0]?.src || product.title),
          slug: `product/${product.slug}`, // Mantiene la compatibilidad con tus rutas
          type: 'product',
          price: this.cartService.getDiscount(product),
          currency: 'PEN',
          brand: 'Bettjim',
          stock: product.stock > 0,
          keywords: `comprar ${product.title}, bettjim, moda peru, tienda online peru, ${product.category}`
        });

        // DELEGACIÓN AL NUEVO SERVICIO SSR-SAFE
        if (isPlatformServer(this._platformId)) {
          this.seoJsonLd.addJsonLdScript(product, inventories || []);
          this.seoJsonLd.addBreadcrumbSchema(product);
        }
      }
    });
  }

  public isDiscountActive = computed(() => {
    const p = this.ps.cleanProductSlug();
    if (!p.discount) return false;
    
    const discountVal = Number(p.discount);
    if (isNaN(discountVal) || discountVal <= 0) return false;

    const now = new Date();
    const start = new Date(p.discount_start);
    const end = new Date(p.discount_end);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;

    return now >= start && now <= end;
  });

  // ================================================================
  // 6. CICLO DE VIDA (Angular Hooks)
  // ================================================================
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slugFull = params.get('slug');
      if (slugFull) {
        this.ps.selectedSlug.set(slugFull);
      }
    });

    this.startCountdown();
    this.startViewersSimulation();
  }

  ngOnDestroy() {
    if (this.timerSubscription) this.timerSubscription.unsubscribe();
    if (this.viewersInterval) clearInterval(this.viewersInterval);
  }

  // ================================================================
  // 7. MÉTODOS DE UI & LÓGICA
  // ================================================================
  changeImage(src: string) {
    this.activeImage.set(src);
  }

  updateQuantity(val: number) {
    const maxStock = typeof this.productStock === 'function' ? this.productStock() : this.productStock;

    this.quantity.update(q => {
      const newQ = q + val;
      if (newQ < 1) return 1;
      if (newQ > maxStock) return maxStock;
      return newQ;
    });
  }

  public isMaxStockReached = computed(() => this.productStock() === 0);

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  addToCart() {
    const prod = this.ps.cleanProductSlug();
    if (prod.type_inventory === 2) {
      const data = {
        product: prod,
        user: localStorage.getItem('_id') ?? 'null',
        type_discount: null,
        discount: prod.discount ?? 0,
        quantity: this.quantity(),
        variety: `${this.color()}-${this.size()}`,
        inventory: this.inventory_id(),
        code_cupon: null,
        code_discount: null,
        unit_price: prod.price,
        discount_price: this.cartService.getDiscount(prod),
        subtotal: this.quantity() * this.cartService.getDiscount(prod),
        total: this.quantity() * this.cartService.getDiscount(prod),
      };
      this.cartService.addToCartVariant(data);
    } else {
      this.cartService.addToCart(prod);
    }
  }

  addToCartVariant() {
    const prod = this.ps.cleanProductSlug();
  }

  buyNow() {
    this.addToCart();
    alert('Yendo al checkout directo...');
  }

  // ================================================================
  // 8. MÉTODOS INTERNOS (Marketing & Variantes)
  // ================================================================
  private startCountdown() {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    this.timerSubscription = interval(1000).subscribe(() => {
      const now = new Date();
      const diff = endOfDay.getTime() - now.getTime();

      if (diff <= 0) {
        this.timeLeft.set('00h 00m 00s');
        return;
      }

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

  public color = signal('');
  public sizes = signal([]);
  public size = signal('');
  public productStock = signal<any>(0)
  public indexSize = signal<any>(0)
  public indexVariant = signal<any>(0)
  public inventory_id = signal('');

  ChangeVariants(variants: any, product: any, index: number) {
    this.sizes.set(variants.sizes);
    this.color.set(variants.color);
    this.productStock.set(0);
    this.indexSize.set(0);
    this.quantity.set(1);
    this.indexVariant.set(index);
    this.Size(this.sizes()[0], this.indexSize());
    
    product.variants.map((item: any) => {
      if (item.color === variants.color) {
        product.images.map((img: any) => {
          if (img.image_id === item.image_id) {
            this.activeImage.set(img.src);
          }
        })
      }
    });
  }

  Size(e: any, i: number) {
    this.indexSize.set(i);
    const filteredInventory = this.Inventory().filter((item: any) => {
      return item.color === this.color() && item.size === e;
    });

    if (filteredInventory.length > 0) {
      this.quantity.set(1);
      this.productStock.set(filteredInventory[0].stock);
      this.stockLeft.set(filteredInventory[0].stock)
      this.size.set(filteredInventory[0].size);
      this.inventory_id.set(filteredInventory[0]._id);
    } else {
      this.productStock.set(0);
      this.quantity.set(1);
    }
  }

  openShare() {
    this.isShareModalOpen.set(true);
  }

  closeShare() {
    this.isShareModalOpen.set(false);
  }

  private checkProductStock(product: any, variantsWithStock: any[]): boolean {
    if (product.type_inventory === 1) {
      return product.stock > 0;
    }
    return variantsWithStock.some((v: any) => v.stock > 0);
  }

  shippingOptions = [
    {
      id: 'standard',
      title: 'Envío Estándar (Lima)',
      description: 'Entrega en 2 a 3 días hábiles a tu domicilio.',
      price: 'S/ 10.00'
    },
    {
      id: 'express',
      title: 'Envío Express (Lima)',
      description: 'Entrega el mismo día (pedidos antes de la 1:00 PM).',
      price: 'S/ 18.00'
    },
    {
      id: 'province',
      title: 'Envío a Provincias',
      description: 'Enviado a través de Olva Courier o Shalom (3-5 días hábiles).',
      price: 'S/ 15.00'
    }
  ];
}