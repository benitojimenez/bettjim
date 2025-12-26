import { Component, computed, inject, OnDestroy, OnInit, signal, ChangeDetectionStrategy, effect, Renderer2, ElementRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformServer } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, interval } from 'rxjs';
// Servicios y Configuración
import { Products } from '../../../services/product';
import { environment } from '../../../../environments/environment';
import { ProductSlider } from '../../../home/widgets/product-slider/product-slider';
// Componentes y Pipes compartidos
import { Breadcrumbs } from '../../../shared/components/breadcrumbs/breadcrumbs';
import { DiscountPipe } from "../../../shared/pipes/discount-pipe";
import { Cart } from '../../../services/cart';
import { Seo } from '../../../services/seo';
import { ShareModal } from "../../widgets/share-modal/share-modal";
import { ViewerToast } from "../../widgets/viewer-toast/viewer-toast";

@Component({
  selector: 'app-product-letf',
  standalone: true,
  imports: [CommonModule, Breadcrumbs, DiscountPipe, ProductSlider, ShareModal, ViewerToast],
  templateUrl: './product-letf.html',
  styleUrl: './product-letf.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class ProductLetf implements OnInit, OnDestroy {

  // ================================================================
  // 1. INYECCIONES Y CONFIGURACIÓN
  // ================================================================
  private seo = inject(Seo);
  private route = inject(ActivatedRoute);
  public ps = inject(Products);
  public cartService = inject(Cart);
  private renderer = inject(Renderer2);
  private el = inject(ElementRef);
  private _platformId = inject(PLATFORM_ID);
  public URL_IMG = signal(environment.API_URL + 'product_imagen/');

  // ================================================================
  // 2. ESTADO (SIGNALS)
  // ================================================================

  // Estado del Producto y UI
  isShareModalOpen = signal<boolean>(false);
  public activeImage = signal<string>('');
  public quantity = signal<number>(1);
  public loading = signal<boolean>(true);
  public activeTab = signal<string>('desc'); // 'desc' | 'reviews' | 'shipping'

  // Marketing & Urgencia
  public timeLeft = signal<string>('');
  public viewers = signal<number>(12);
  public stockLeft = signal<number>(0);
  public url: string = environment.API_URL + 'product_imagen/';
  public urlDomain: string = 'https://bettjim.com/';
  // ================================================================
  // 3. COMPUTED SIGNALS (DERIVADOS)
  // ================================================================

  // Breadcrumbs Reactivos
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

  // ESTA ES LA MAGIA:
  public relatedProducts = computed(() => {
    // 1. Obtenemos la lista completa (que ya se habrá actualizado gracias al efecto de arriba)
    const allProducts = this.ps.displayProducts();

    // 2. Obtenemos el producto actual
    const currentProduct = this.ps.cleanProductSlug();

    // 3. Filtramos: Quitamos el producto actual para no duplicarlo
    let filtered = allProducts;

    if (currentProduct) {
      filtered = filtered.filter(p => p._id !== currentProduct._id);
    }

    // console.log('Productos filtrados para top 10:', filtered);

    // 4. Retornamos solo los primeros 10
    return filtered.slice(0, 2);
  });

  // Fecha de entrega (Hoy + 3 días)
  public deliveryDate = computed(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date;
  });

  Inventory = signal<any>([])
  // ================================================================
  // 4. DATOS ESTÁTICOS / MOCKS
  // ================================================================


  public reviews = [
    { user: 'Carlos M.', rating: 5, text: 'Excelente calidad, llegó antes de tiempo.', date: new Date() },
    { user: 'Ana P.', rating: 4, text: 'Muy bonito, tal cual la foto.', date: new Date() }
  ];
  // Control de Suscripciones
  private timerSubscription?: Subscription;
  private viewersInterval?: any;

  // ================================================================
  // 5. CONSTRUCTOR & EFECTOS
  // ================================================================
  constructor() {
    // Efecto: Sincronizar imagen principal cuando carga el producto
    effect(() => {
      const product = this.ps.cleanProductSlug();
      const inventories = this.ps.cleanInvetoryProduct();
      if (product && product.images?.length > 0) {
        // Seteamos la primera imagen automáticamente
        this.activeImage.set(product.images[0].src);

      }
      // Si hay producto, actualizamos el filtro de categoría globalmente
      if (product && product.category) {
        // Usamos allowSignalWrites: true porque estamos modificando una señal dentro de un efecto
        // Nota: Asumo que filterByCategory espera un array string[]
        this.ps.filterByCategory.set([product.category]);
      }
      if (product.type_inventory === 1) {
        this.productStock.set(product.stock)
        this.stockLeft.set(product.stock)
      }
      if (inventories) {
        this.Inventory.set(inventories);
        // console.log('incentario', this.Inventory())
      }

      if (product) {
        // Solo actualizamos SEO si el producto ya cargó (no es null)
        this.seo.generateTags({
          title: product.title + ' | Bettjim.com',
          description: product.summary || `Compra ${product.title} al mejor precio en Bettjim.`,
          image: 'product_imagen/' + (product.images?.[0]?.src || product.title), // Tu lógica de imagen
          slug: `product/${product.slug}`,
          type: 'product',
          price: this.cartService.getDiscount(product),
          currency: 'PEN',
          brand: 'Bettjim',
          stock: product.stock > 0,
          keywords: `comprar ${product.title}, bettjim, moda peru`
        });

        // console.log('Agregando JSON-LD para producto:', product);
        if (isPlatformServer(this._platformId)) {
          console.log('✅ SEO actualizado para:', product.title);
          // Agregar JSON-LD para el producto
          this.addJsonLdScript(product, inventories || []);
          this.addBreadcrumbSchema(product);
        }
      }
    });

  }

  // ================================================================
  // 6. CICLO DE VIDA (Angular Hooks)
  // ================================================================
  ngOnInit() {
    // A. Escuchar URL para obtener slug
    this.route.paramMap.subscribe(params => {
      const slugFull = params.get('slug');
      if (slugFull) {
        this.ps.selectedSlug.set(slugFull);
      }
    });

    // B. Iniciar lógica de marketing
    this.startCountdown();
    this.startViewersSimulation();

  }


  ngOnDestroy() {
    // Limpieza de memoria
    if (this.timerSubscription) this.timerSubscription.unsubscribe();
    if (this.viewersInterval) clearInterval(this.viewersInterval);
  }

  // ================================================================
  // 7. MÉTODOS DE UI & LÓGICA
  // ================================================================

  // Navegación de Galería
  changeImage(src: string) {
    this.activeImage.set(src);
  }


  // Control de Cantidad (Unificado)
  updateQuantity(val: number) {
    // Obtener el valor de stock actual (asumiendo que es un signal o variable)
    const maxStock = typeof this.productStock === 'function'
      ? this.productStock() // Si es un Signal, lo leemos
      : this.productStock; // Si es una variable normal

    this.quantity.update(q => {
      const newQ = q + val;

      // 1. Límite Mínimo (Evitar negativos y cero)
      if (newQ < 1) {
        return 1;
      }

      // 2. Límite Máximo (No exceder el stock)
      if (newQ > maxStock) {
        // Si el usuario intenta sumar más allá del stock, 
        // devolvemos el stock máximo.
        return maxStock;
      }

      // Si está entre 1 y el stock, aceptamos el nuevo valor.
      return newQ;
    });
  }
  // Signal calculado para verificar si el máximo ha sido alcanzado
  public isMaxStockReached = computed(() =>
    this.productStock() === 0,
  );
  // Pestañas
  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  // Acciones de Compra
  addToCart() {
    const prod = this.ps.cleanProductSlug();
    if (prod.type_inventory === 2) {
      const data = {
        product: prod,
        user: localStorage.getItem('_id') ?? 'null',
        type_discount: null,  // 1 = porcentaje, 2 = moneda
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
      // console.log(`Agregando ${this.quantity()} de ${prod.title}`);
      this.cartService.addToCart(prod); // Asumiendo que tu servicio tiene este método
    }
  }
  addToCartVariant() {
    const prod = this.ps.cleanProductSlug();


  }
  buyNow() {
    this.addToCart();
    // this.router.navigate(['/checkout']);
    alert('Yendo al checkout directo...');
  }

  // ================================================================
  // 8. MÉTODOS INTERNOS (Marketing)
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
    // Guardamos referencia para limpiar en OnDestroy
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
  // Change Variants
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
    })
  }

  // Get Product Size
  Size(e: any, i: number) {
    this.indexSize.set(i);
    const filteredInventory = this.Inventory().filter((item: any) => {
      return item.variant.color === this.color() && item.variant.size === e;
    });

    if (filteredInventory.length > 0) {
      this.quantity.set(1);
      // Si hay al menos un resultado, actualizar el stock

      this.productStock.set(filteredInventory[0].stock);
      this.stockLeft.set(filteredInventory[0].stock)
      this.size.set(filteredInventory[0].variant.size);
      this.inventory_id.set(filteredInventory[0]._id);
      // console.log(this.size());
    } else {
      // Si no hay resultados, manejar el caso donde no haya inventario disponible
      this.productStock.set(0); // O algún valor por defecto
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
    // 1. Si no hay variantes, usa el stock global del producto
    if (product.type_inventory === 1) {
      return product.stock > 0;
    }
    // 2. Si hay variantes, verifica si AL MENOS UNA de las variantes de color está en stock.
    // Usamos el stock calculado en la preparación de variantsInfo
    const hasAnyStock = variantsWithStock.some((v: any) => v.stock > 0);
    return hasAnyStock;

  }




  private addJsonLdScript(product: any, inventories: any[]) {
    console.log('Agregando JSON-LD para producto:', product);
    if (!product) return;

    // --- PASO 1: Determinar la disponibilidad global del producto ---
    // (Este cálculo sigue siendo necesario para el esquema principal)
    const variantsInfo = product.variants?.map((variant: any) => {
      const sizesArray = Array.isArray(variant.sizes) ? variant.sizes : [variant.size];

      const hasAnyStock = sizesArray.some((size: string) => {
        const inventoryItem = inventories.find((item: any) => {
          return item.variant.color === variant.color && item.variant.size === size;
        });
        return (inventoryItem?.stock || 0) > 0;
      });

      return { stock: hasAnyStock ? 1 : 0 };
    }) || [];

    // Lógica para determinar la disponibilidad global del producto
    const isProductInStock = this.checkProductStock(product, variantsInfo);
    // ----------------------------------------------------------------------


    // --- PASO 2: Preparar datos básicos (SKU, Imágenes, Precio) ---
    const productIdBase = product._id?.$oid || product.id || "";
    const images = product.images?.map((img: any) => `${this.url}${img.src}`) || [];
    const discountPercent = parseFloat(product.discount) || 0;

    const discountActive =

      discountPercent > 0 &&

      (product.discount_start || product.start_discount) &&

      (product.discount_end || product.end_discount);
    const discountedPrice = this.cartService.getDiscount(product);
    // --------------------------------------------------------------


    // --- PASO 3: Crear el schema principal (Product) ---
    const productSchema: any = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.title,
      "description": product.summary || product.description,
      "image": images,
      "brand": {
        "@type": "Brand",
        "name": product.brand || "Bettjim"
      },
      "sku": productIdBase,
      "url": `${this.urlDomain}product/${product.slug}`,
      "category": product.category,
      "offers": {
        "@type": "Offer",
        "priceCurrency": "PEN",
        "price": discountedPrice,
        "availability": isProductInStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        "url": `${this.urlDomain}product/${product.slug}`,
        "seller": {
          "@type": "Organization",
          "name": "Bettjim",
          "url": this.urlDomain
        },
        // ... (Se mantiene la parte de priceSpecification si es necesaria para descuentos)
        ...(discountActive && {
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": discountedPrice,
            "priceCurrency": "PEN",
            "eligibleQuantity": { "@type": "QuantitativeValue", "value": 1 },
            "validFrom": product.discount_start || product.start_discount,
            "validThrough": product.discount_end || product.end_discount,
          }
        })
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.stars || 4.7,
        "reviewCount": product.t_reviews || 1
      }
    };
    // --------------------------------------------------------------

    // --- PASO 4: Inyectar el esquema JSON-LD ---
    const jsonLdArray: any[] = [productSchema]; // Solo el esquema principal

    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLdArray);

    // Adjuntar al HEAD del documento
    const head = this.el.nativeElement.ownerDocument.head;
    this.renderer.appendChild(head, script);
    // ------------------------------------------
  }


  private addBreadcrumbSchema(product: any) {
    // Inicializar el arreglo de elementos del breadcrumb
    const itemListElement: any[] = [
      // Nivel 1: Inicio
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": this.urlDomain
      }
    ];

    let positionCounter = 2; // Contador para la posición en la lista

    // Nivel 2: Categoría (Obligatorio)
    const categoryName = product.category || "Productos";
    itemListElement.push({
      "@type": "ListItem",
      "position": positionCounter++, // Usa la posición y luego incrementa
      "name": categoryName,
      "item": `${this.urlDomain}shop?category=${product.category || 'all'}`
    });

    // Nivel 3 (Opcional): Subcategoría o Colección
    // Agregamos este nivel SÓLO si la subcategoría/colección existe Y no es igual a la categoría
    const subCategory = product.subcategory || product.collections?.[0];

    if (subCategory && subCategory !== categoryName) {
      // La URL de la subcategoría debe ser lo más precisa posible
      let subCategoryUrl = `${this.urlDomain}shop?category=${product.category}`;
      if (product.subcategory) {
        subCategoryUrl += `&subcategory=${product.subcategory}`;
      } else if (product.collections?.[0]) {
        subCategoryUrl += `&collection=${product.collections[0]}`;
      }

      itemListElement.push({
        "@type": "ListItem",
        "position": positionCounter++,
        "name": subCategory,
        "item": subCategoryUrl
      });
    }

    // Último Nivel: Producto (Página Actual)
    itemListElement.push({
      "@type": "ListItem",
      "position": positionCounter++,
      "name": product.title,
      "item": `${this.urlDomain}product/${product.slug}`
    });

    // Construir el esquema final
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": itemListElement
    };

    // const script = this.renderer.createElement('script');
    // script.type = 'application/ld+json';

    // script.text = JSON.stringify(breadcrumbSchema);
    // this.renderer.appendChild(this.el.nativeElement, script);
    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(breadcrumbSchema);

    // *** CAMBIO CRUCIAL AQUÍ ***
    const head = this.el.nativeElement.ownerDocument.head;
    this.renderer.appendChild(head, script);

    // El método anterior que causaba el error era: 
    // this.renderer.appendChild(this.el.nativeElement, script);
  }
}