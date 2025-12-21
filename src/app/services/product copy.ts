import { Injectable, computed, effect, inject, signal, resource, PLATFORM_ID } from '@angular/core';
import { httpResource, HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Product } from '../shared/classes/product'; // Ajusta la ruta si es necesario
import { Inventory } from '../shared/classes/inventory';
import { environment } from '../../environments/environment';
import { ToastService } from './toast'; // Tu nuevo servicio
import { User } from './user'; // Asumo que estos son tus servicios UserService
import { Auth } from './auth'; // Asumo que estos son tus servicios AuthService
import { isPlatformBrowser } from '@angular/common';

// Interfaces
interface ProductResponse {
  data: Product[];
}
export interface ProductSingResponse {
  data: Product;
}
interface CartResponse {
  data: any[];
  message?: string;
}
interface InventoryResponse {
  data: Inventory[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class Products {

  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private userService = inject(User);
  private authService = inject(Auth);

  // 3. INYECTAMOS EL ID DE LA PLATAFORMA
  private platformId = inject(PLATFORM_ID);

  public apiUrl: string = environment.API_URL;
  public Currency = { name: 'PEN', currency: 'S/ ', price: 1 };
  public OpenCart = signal(false);
  // ==========================================================
  // 1. SEÑAL ACTIVADORA (Aquí guardaremos el slug que viene de la URL)

  public selectedSlug = signal<string>('');
  // ==========================================================
  // 1. GESTIÓN DE PRODUCTOS
  // ==========================================================
  public searchTerm = signal<string>('');
  //  EL RECURSO (La petición HTTP reactiva)
  public productsResource = httpResource<ProductResponse>(() => {
    const term = this.searchTerm().trim();
    let urlTarget = '';
    if (term) {
      urlTarget = `${this.apiUrl}search_product/${encodeURIComponent(term)}`;
    } else {
      urlTarget = `${this.apiUrl}list_products/`;
    }
    return { url: urlTarget, method: 'GET' };
  }, { defaultValue: { data: [] } });

  public cleanProducts = computed(() => {
    return this.productsResource.value()?.data ?? [];
  });

  //********************************************************************** */

  // 2. EL RECURSO (La petición HTTP reactiva)
  public singleProductResource = httpResource<ProductSingResponse>(() => {
    const slug = this.selectedSlug();

    // Si no hay slug (ej: estamos en otra página), no hacemos petición
    if (!slug) {
      return undefined; // O null, dependiendo de cómo maneje tu librería las pausas
    }

    // Si hay slug, lanzamos la petición
    return {
      url: `${this.apiUrl}get_product_slug/${slug}`,
      method: 'GET'
    };
  }, { defaultValue: { data: {} as Product } });

  // 3. LIMPIAMOS EL RESULTADO (Obtenemos el producto directamente o null)
  public cleanProductSlug = computed(() => {
    // Como el backend devuelve el objeto directo, lo pasamos directo.
    const product = this.singleProductResource.value()?.data;
    return product ?? null;
  });

  //********************************************************************** */


  //  EL RECURSO Inventori (La petición HTTP reactiva)
  public productInventoriResource = httpResource<InventoryResponse>(() => {
    const id = this.getProductBySlug(this.selectedSlug())?._id;
    // Si no hay slug (ej: estamos en otra página), no hacemos petición
    if (!id) {
      return undefined; // O null, dependiendo de cómo maneje tu librería las pausas
    }

    return {
      url: `${this.apiUrl}get_inventory/${id}`,
      method: 'GET'
    };
  }, { defaultValue: { data: [] } });

  public cleanInvetoryProduct = computed(() => {
    return this.productInventoriResource.value()?.data ?? [];
  });

  //
  // Busqueda pos slug
  public getProductBySlug(slug: string) {
    return this.cleanProducts().find(product => product.slug === slug) || null;
  }
  // ==========================================================
  // 2. FILTRADO
  // ==========================================================
  public filterTags = signal<string[]>([]);
  public sortOption = signal<string | null>(null);
  public filterByCategory = signal<string[]>([]);
  // 1. AGREGAMOS LAS SEÑALES DE PRECIO (Con valores por defecto)
  public minPrice = signal<number>(0);
  public maxPrice = signal<number>(10000); // Pon un número alto por defecto o el límite de tu tienda

  public displayProducts = computed(() => {
    let products = this.cleanProducts();
    const filters = this.filterTags();
    const sort = this.sortOption();
    const min = this.minPrice();
    const max = this.maxPrice();

    // A. Filtrado por PRECIO (Nuevo)
    products = products.filter(product =>
      product.price >= min && product.price <= max
    );

    // B. Filtrado por tags (colores, tallas)
    if (filters.length > 0) {
      products = products.filter(item =>
        item.tags ? filters.some(tag => item.tags.includes(tag)) : false
      );
    }
    // C. Filtrado por categoría
    if (this.filterByCategory().length > 0) {
      products = products.filter(product =>
        this.filterByCategory().includes(product.category)
      );
    }
    // D. Ordenamiento (Siempre al final preferiblemente)
    if (sort) {
      products = [...products].sort((a, b) => this.sortLogic(a, b, sort));
    }

    return products;
  });

  // ==========================================================
  // 3. CARRITO (CON PROTECCIÓN SSR)
  // ==========================================================

  // Inicializamos la señal usando el método protegido
  private localCart = signal<any[]>(this.getLocalCart());
  private cartVersion = signal(0);

  public serverCartResource = httpResource<CartResponse>(() => {
    this.cartVersion();

    // 4. VERIFICAMOS SI ESTAMOS EN EL NAVEGADOR ANTES DE USAR localStorage
    if (isPlatformBrowser(this.platformId) && this.authService.isAuthenticated()) {
      const userId = localStorage.getItem('_id');
      return {
        url: `${this.apiUrl}list_cart/${userId}`,
        method: 'GET'
      };
    }
    return undefined; // En el servidor o sin auth, no hace petición
  }, { defaultValue: { data: [] } });

  private serverCartClean = computed(() => {
    const response = this.serverCartResource.value();
    return response?.data ?? [];
  });

  public cartItems = computed(() => {
    // Ojo: isAuthenticated también podría necesitar protección si usa localStorage internamente,
    // pero aquí asumimos que AuthService lo maneja o que serverCartResource devuelve [] si no hay auth.
    if (this.authService.isAuthenticated()) {
      return this.serverCartClean();
    } else {
      return this.localCart();
    }
  });

  public cartTotal = computed(() => {
    return this.cartItems().reduce((sum, item) => sum + (item.total || 0), 0);
  });

  constructor() {
    effect(() => {
      if (this.authService.isAuthenticated()) {
        // this.serverCartResource.reload();
      }
    });
  }

  // ==========================================================
  // HELPERS DE ALMACENAMIENTO (PROTEGIDOS)
  // ==========================================================

  // 5. MÉTODO CORREGIDO: getLocalCart
  private getLocalCart(): any[] {
    // Si estamos en el servidor, retornamos array vacío y NO tocamos localStorage
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }

    const local = localStorage.getItem('Cart');
    return local ? JSON.parse(local) : [];
  }

  // 6. MÉTODO CORREGIDO: setLocalCart
  private setLocalCart(cart: any[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('Cart', JSON.stringify(cart));
      this.localCart.set(cart);
    }
  }

  // Helper para obtener ID de usuario de forma segura
  private getUserId(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('_id');
    }
    return null;
  }

  // ==========================================================
  // MÉTODOS DE ACCIÓN
  // ==========================================================

  public async addToCart(product: any): Promise<boolean> {
    try {
      const discountData = this.calculateDiscountData(product);

      if (!this.authService.isAuthenticated()) {
        this.updateLocalCartItem(product, 1, discountData);
        return true;
      }

      const data = {
        product: product._id,
        user: this.getUserId(), // Usamos el helper seguro
        quantity: 1,
        ...discountData
      };

      const resp = await lastValueFrom(this.userService.create_cart(data));
      this.toast.error('Error de conexión', 'bottom-left');
      this.serverCartResource.reload();
      return true;

    } catch (err: any) {
      this.handleCartError(err);
      return false;
    }
  }

  public async addToCartVariant(product: any): Promise<boolean> {
    try {
      // 🧩 Usuario NO autenticado → carrito local
      if (!this.authService.isAuthenticated()) {
        const localCart = this.getLocalCart();
        const existingIndex = localCart.findIndex(
          (item) => item.product._id === product.product._id && item.variety === product.variety
        );

        if (existingIndex !== -1) {
          const item = localCart[existingIndex];
          item.quantity += product.quantity;
          item.subtotal = this.getDiscount(item) * item.quantity;
          item.total = this.getDiscount(item) * item.quantity;
        } else {
          localCart.push(product);
        }

        this.setLocalCart(localCart);
        this.serverCartResource.reload();
        this.toast.success('Producto agregado correctamente', 'top-center');
        return true;
      }

      // 🧩 Usuario autenticado → carrito en backend
      product.product = product.product._id;
      console.log('d', product);
      const resp = await lastValueFrom(this.userService.create_cart(product));
      this.toast.success(resp.message || 'Producto agregado correctamente', 'top-center')

      this.serverCartResource.reload();
      return true;
    } catch (err: any) {
      this.handleCartError(err);
      return false;

    }
  }

  public updateCartQuantity(cartItem: any, quantity: number): void {
    const newQty = (cartItem.quantity || 0) + quantity;
    if (newQty <= 0) {
      this.toast.warning('Mínima cantidad es 1');
      return;
    }

    if (!this.authService.isAuthenticated()) {
      const currentCart = this.getLocalCart();
      const index = currentCart.findIndex((i: any) => i.product._id === cartItem.product._id && i.variety === cartItem.variety);

      if (index !== -1) {
        currentCart[index].quantity = newQty;
        const unitPrice = currentCart[index].discount_price || currentCart[index].unit_price;
        currentCart[index].subtotal = unitPrice * newQty;
        currentCart[index].total = currentCart[index].subtotal;
        this.setLocalCart(currentCart);
        this.toast.success('Carrito actualizado','top-center');
      }
    } else {
      this.userService.update_cart(cartItem._id, { quantity: newQty, variety: cartItem.variety })
        .subscribe({
          next: (resp) => {
            this.toast.success(resp.message, 'top-center');
            this.serverCartResource.reload();
          },
          error: (err) => this.handleCartError(err)
        });
    }
  }

  public removeCartItem(cartItem: any): void {
    if (!this.authService.isAuthenticated()) {
      const currentCart = this.getLocalCart();
      const newCart = currentCart.filter((i: any) => i.product._id !== cartItem.product._id || i.variety !== cartItem.variety);
      this.setLocalCart(newCart);
      this.toast.success('Producto eliminado');
    } else {
      this.userService.delete_cart(cartItem._id).subscribe({
        next: (resp) => {
          this.toast.success(resp.message);
          this.serverCartResource.reload();
        },
        error: (err) => this.handleCartError(err)
      });
    }
  }

  public async syncLocalCart(): Promise<void> {
    if (!this.authService.isAuthenticated()) return;

    // getLocalCart ya es seguro, devuelve [] en el servidor
    const localCart = this.getLocalCart();
    if (!localCart.length) return;

    this.toast.info('Sincronizando carrito...');

    let successCount = 0;
    const userId = this.getUserId(); // Helper seguro

    for (const item of localCart) {
      const data = {
        product: item.product._id,
        user: userId,
        quantity: item.quantity,
        type_discount: item.type_discount,
        discount: item.discount,
        unit_price: item.unit_price,
        discount_price: item.discount_price,
        subtotal: item.subtotal,
        total: item.total,
        variety: item.variety || null
      };

      try {
        await lastValueFrom(this.userService.create_cart(data));
        successCount++;
      } catch (err: any) {
        // log
      }
    }

    if (successCount > 0) {
      this.toast.success(`Sincronizados ${successCount} productos`);
    }

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('Cart');
    }
    this.localCart.set([]);
    this.serverCartResource.reload();
  }

  // ==========================================================
  // HELPERS DE CÁLCULO
  // ==========================================================

  public getDiscount(product: any): number {
    if (!product.discount) return product.price;
    const date = new Date();
    const discountStart = new Date(product.discount_start);
    const discountEnd = new Date(product.discount_end);

    if (Number(product.discount) > 0 && date >= discountStart && date <= discountEnd) {
      return product.price - (product.price * Number(product.discount) / 100);
    }
    return product.price;
  }

  private calculateDiscountData(product: any) {
    const unitPrice = product.price;
    const discountPrice = this.getDiscount(product);
    return {
      unit_price: unitPrice,
      discount_price: discountPrice,
      subtotal: discountPrice,
      total: discountPrice,
      discount: product.discount ?? 0,
      type_discount: null,
      code_cupon: null,
      code_discount: null,
      inventory: null
    };
  }

  private updateLocalCartItem(product: any, qty: number, discountData: any) {
    const cart = this.getLocalCart(); // Ya es seguro
    const index = cart.findIndex((item) => item.product._id === product._id);

    if (index !== -1) {
      cart[index].quantity += qty;
      cart[index].subtotal = discountData.discount_price * cart[index].quantity;
      cart[index].total = cart[index].subtotal;
    } else {
      cart.push({ product, quantity: qty, ...discountData });
    }
    this.setLocalCart(cart); // Ya es seguro
    // this.toast.success('Producto agregado al carrito');
    this.toast.success('Producto agregado al carrito', 'top-center');
  }

  private sortLogic(a: Product, b: Product, sortType: string): number {
    switch (sortType) {
      case 'ascending': return (a.createdAt || '') < (b.createdAt || '') ? -1 : 1;
      case 'a-z': return a.title.localeCompare(b.title);
      case 'z-a': return b.title.localeCompare(a.title);
      case 'low': return a.price - b.price;
      case 'high': return b.price - a.price;
      default: return 0;
    }
  }

  private handleCartError(err: any) {
    const msg = err.error?.message || 'Error en la operación';
    if (err.status === 409) this.toast.warning(msg);
    else this.toast.error(msg);
  }

}