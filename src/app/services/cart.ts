// import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
// import { Auth } from './auth';
// import { httpResource } from '@angular/common/http';
// import { isPlatformBrowser } from '@angular/common';
// import { environment } from '../../environments/environment';
// import { ToastService } from './toast';
// import { User } from './user';
// import { lastValueFrom } from 'rxjs';

// interface CartResponse {
//   data: any[];
//   message?: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class Cart {

//   public OpenCart = signal(false);
//   private authService = inject(Auth);
//   private toast = inject(ToastService);
//   private userService = inject(User);
//   // 3. INYECTAMOS EL ID DE LA PLATAFORMA
//   private platformId = inject(PLATFORM_ID);
//   public apiUrl: string = environment.API_URL;
//   public Currency = { name: 'PEN', currency: 'S/ ', price: 1 };

//   constructor() { }


//   // Inicializamos la señal usando el método protegido
//   private localCart = signal<any[]>(this.getLocalCart());
//   private cartVersion = signal(0);

//   public serverCartResource = httpResource<CartResponse>(() => {
//     this.cartVersion();

//     // 4. VERIFICAMOS SI ESTAMOS EN EL NAVEGADOR ANTES DE USAR localStorage
//     if (isPlatformBrowser(this.platformId) && this.authService.isAuthenticated()) {
//       const userId = localStorage.getItem('_id');
//       return {
//         url: `${this.apiUrl}list_cart/${userId}`,
//         method: 'GET'
//       };
//     }
//     return undefined; // En el servidor o sin auth, no hace petición
//   }, { defaultValue: { data: [] } });

//   private serverCartClean = computed(() => {
//     const response = this.serverCartResource.value();
//     return response?.data ?? [];
//   });

//   public cartItems = computed(() => {
//     // Ojo: isAuthenticated también podría necesitar protección si usa localStorage internamente,
//     // pero aquí asumimos que AuthService lo maneja o que serverCartResource devuelve [] si no hay auth.
//     if (this.authService.isAuthenticated()) {
//       return this.serverCartClean();
//     } else {
//       return this.localCart();
//     }
//   });

//   public cartTotal = computed(() => {
//     return this.cartItems().reduce((sum, item) => sum + (item.total || 0), 0);
//   });


//   // 5. MÉTODO CORREGIDO: getLocalCart
//   private getLocalCart(): any[] {
//     // Si estamos en el servidor, retornamos array vacío y NO tocamos localStorage
//     if (!isPlatformBrowser(this.platformId)) {
//       return [];
//     }

//     const local = localStorage.getItem('Cart');
//     return local ? JSON.parse(local) : [];
//   }

//   // 6. MÉTODO CORREGIDO: setLocalCart
//   private setLocalCart(cart: any[]): void {
//     if (isPlatformBrowser(this.platformId)) {
//       localStorage.setItem('Cart', JSON.stringify(cart));
//       this.localCart.set(cart);
//     }
//   }
//   // Helper para obtener ID de usuario de forma segura
//   private getUserId(): string | null {
//     if (isPlatformBrowser(this.platformId)) {
//       return localStorage.getItem('_id');
//     }
//     return null;
//   }

//   // ==========================================================
//   // MÉTODOS DE ACCIÓN
//   // ==========================================================

//   public async addToCart(product: any): Promise<boolean> {
//     try {
//       const discountData = this.calculateDiscountData(product);

//       if (!this.authService.isAuthenticated()) {
//         this.updateLocalCartItem(product, 1, discountData);
//         return true;
//       }

//       const data = {
//         product: product._id,
//         user: this.getUserId(), // Usamos el helper seguro
//         quantity: 1,
//         ...discountData
//       };

//       const resp = await lastValueFrom(this.userService.create_cart(data));
//       this.toast.error('Error de conexión', 'bottom-left');
//       this.serverCartResource.reload();
//       return true;

//     } catch (err: any) {
//       this.handleCartError(err);
//       return false;
//     }
//   }

//   public async addToCartVariant(product: any): Promise<boolean> {
//     try {
//       // 🧩 Usuario NO autenticado → carrito local
//       if (!this.authService.isAuthenticated()) {
//         const localCart = this.getLocalCart();
//         const existingIndex = localCart.findIndex(
//           (item) => item.product._id === product.product._id && item.variety === product.variety
//         );

//         if (existingIndex !== -1) {
//           const item = localCart[existingIndex];
//           item.quantity += product.quantity;
//           item.subtotal = this.getDiscount(item) * item.quantity;
//           item.total = this.getDiscount(item) * item.quantity;
//         } else {
//           localCart.push(product);
//         }

//         this.setLocalCart(localCart);
//         this.serverCartResource.reload();
//         this.toast.success('Producto agregado correctamente', 'top-center');
//         return true;
//       }

//       // 🧩 Usuario autenticado → carrito en backend
//       product.product = product.product._id;
//       // console.log('d', product);
//       const resp = await lastValueFrom(this.userService.create_cart(product));
//       this.toast.success(resp.message || 'Producto agregado correctamente', 'top-center')

//       this.serverCartResource.reload();
//       return true;
//     } catch (err: any) {
//       this.handleCartError(err);
//       return false;

//     }
//   }

//   public updateCartQuantity(cartItem: any, quantity: number): void {
//     const newQty = (cartItem.quantity || 0) + quantity;
//     if (newQty <= 0) {
//       this.toast.warning('Mínima cantidad es 1');
//       return;
//     }

//     if (!this.authService.isAuthenticated()) {
//       const currentCart = this.getLocalCart();
//       const index = currentCart.findIndex((i: any) => i.product._id === cartItem.product._id && i.variety === cartItem.variety);

//       if (index !== -1) {
//         currentCart[index].quantity = newQty;
//         const unitPrice = currentCart[index].discount_price || currentCart[index].unit_price;
//         currentCart[index].subtotal = unitPrice * newQty;
//         currentCart[index].total = currentCart[index].subtotal;
//         this.setLocalCart(currentCart);
//         this.toast.success('Carrito actualizado', 'top-center');
//       }
//     } else {
//       this.userService.update_cart(cartItem._id, { quantity: newQty, variety: cartItem.variety })
//         .subscribe({
//           next: (resp) => {
//             this.toast.success(resp.message, 'top-center');
//             this.serverCartResource.reload();
//           },
//           error: (err) => this.handleCartError(err)
//         });
//     }
//   }

//   public removeCartItem(cartItem: any): void {
//     if (!this.authService.isAuthenticated()) {
//       const currentCart = this.getLocalCart();
//       const newCart = currentCart.filter((i: any) => i.product._id !== cartItem.product._id || i.variety !== cartItem.variety);
//       this.setLocalCart(newCart);
//       this.toast.success('Producto eliminado');
//     } else {
//       this.userService.delete_cart(cartItem._id).subscribe({
//         next: (resp) => {
//           this.toast.success(resp.message);
//           this.serverCartResource.reload();
//         },
//         error: (err) => this.handleCartError(err)
//       });
//     }
//   }

//   public async syncLocalCart(): Promise<void> {
//     if (!this.authService.isAuthenticated()) return;

//     // getLocalCart ya es seguro, devuelve [] en el servidor
//     const localCart = this.getLocalCart();
//     if (!localCart.length) return;

//     this.toast.info('Sincronizando carrito...');

//     let successCount = 0;
//     const userId = this.getUserId(); // Helper seguro

//     for (const item of localCart) {
//       const data = {
//         product: item.product._id,
//         inventory:item.inventory,
//         user: userId,
//         quantity: item.quantity,
//         type_discount: item.type_discount,
//         discount: item.discount,
//         unit_price: item.unit_price,
//         discount_price: item.discount_price,
//         subtotal: item.subtotal,
//         total: item.total,
//         variety: item.variety || null
//       };
//       try {
//         await lastValueFrom(this.userService.create_cart(data));
//         successCount++;
//       } catch (err: any) {
//         console.log(err)
//         // log
//       }
//     }

//     if (successCount > 0) {
//       this.toast.success(`Sincronizados ${successCount} productos`);
//     }

//     if (isPlatformBrowser(this.platformId)) {
//       localStorage.removeItem('Cart');
//     }
//     this.localCart.set([]);
//     this.serverCartResource.reload();
//   }

//   // ==========================================================
//   // HELPERS DE CÁLCULO
//   // ==========================================================

//   public getDiscount(product: any): number {
//     if (!product.discount) return product.price;
//     const date = new Date();
//     const discountStart = new Date(product.discount_start);
//     const discountEnd = new Date(product.discount_end);

//     if (Number(product.discount) > 0 && date >= discountStart && date <= discountEnd) {
//       return product.price - (product.price * Number(product.discount) / 100);
//     }
//     return product.price;
//   }

//   private calculateDiscountData(product: any) {
//     const unitPrice = product.price;
//     const discountPrice = this.getDiscount(product);
//     return {
//       unit_price: unitPrice,
//       discount_price: discountPrice,
//       subtotal: discountPrice,
//       total: discountPrice,
//       discount: product.discount ?? 0,
//       type_discount: null,
//       code_cupon: null,
//       code_discount: null,
//       inventory: null
//     };
//   }

//   private updateLocalCartItem(product: any, qty: number, discountData: any) {
//     const cart = this.getLocalCart(); // Ya es seguro
//     const index = cart.findIndex((item) => item.product._id === product._id);

//     if (index !== -1) {
//       cart[index].quantity += qty;
//       cart[index].subtotal = discountData.discount_price * cart[index].quantity;
//       cart[index].total = cart[index].subtotal;
//     } else {
//       cart.push({ product, quantity: qty, ...discountData });
//     }
//     this.setLocalCart(cart); // Ya es seguro
//     // this.toast.success('Producto agregado al carrito');
//     this.toast.success('Producto agregado al carrito', 'top-center');
//   }

//    private handleCartError(err: any) {
//     const msg = err.error?.message || 'Error en la operación';
//     if (err.status === 409) this.toast.warning(msg);
//     else this.toast.error(msg);
//   }

//   // ==========================================================
//   // LIMPIEZA DE CARRITO (POST-COMPRA)
//   // ==========================================================

//   public clearCart(): void {
//     // 1. Limpiar localStorage (Solo si estamos en el navegador)
//     // Esto borra los datos si el usuario era invitado o si quedó basura local
//     if (isPlatformBrowser(this.platformId)) {
//       localStorage.removeItem('Cart');
//     }

//     // 2. Resetear la señal del carrito local inmediatamente
//     this.localCart.set([]);

//     // 3. Sincronizar con el servidor
//     // Como tu backend (register_order) ya eliminó los items de la BD,
//     // al hacer .reload(), el httpResource traerá un array vacío [].
//     this.serverCartResource.reload();

//     // 4. (Opcional) Cerrar el drawer del carrito si se quedó abierto
//     this.OpenCart.set(false);

//     console.log('🛒 Carrito limpiado exitosamente.');
//   }
// }
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Auth } from './auth';
import { httpResource } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { ToastService } from './toast';
import { User } from './user';
import { LayoutService } from './Layout';
import { lastValueFrom } from 'rxjs';

interface CartResponse {
  data: any[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class Cart {

  public OpenCart = signal(false);
  private authService = inject(Auth);
  private toast = inject(ToastService);
  private userService = inject(User);
  private platformId = inject(PLATFORM_ID);
  private layoutService = inject(LayoutService);

  public apiUrl: string = environment.API_URL;
  public Currency = { name: 'PEN', currency: 'S/ ', price: 1 };

  // ==========================================================
  // 1. GESTIÓN DEL ESTADO REACTIVO
  // ==========================================================

  // Inicializamos leyendo el localStorage (si es navegador)
  private localCart = signal<any[]>(this.getLocalCart());

  // El recurso HTTP reacciona a la autenticación automáticamente
  public serverCartResource = httpResource<CartResponse>(() => {
    if (isPlatformBrowser(this.platformId) && this.authService.isAuthenticated()) {
      const userId = localStorage.getItem('_id');
      if (userId) {
        return {
          url: `${this.apiUrl}list_cart/${userId}`,
          method: 'GET'
        };
      }
    }
    return undefined; // Si no hay auth o es SSR, no se hace petición
  }, { defaultValue: { data: [] } });

  // 🏆 Señal Computada Maestra: Combina Lógica Local y Servidor
  public cartItems = computed(() => {
    if (this.authService.isAuthenticated()) {
      return this.serverCartResource.value()?.data || [];
    } else {
      return this.localCart();
    }
  });

  // 3. MATEMÁTICAS SEGURAS
  public cartTotal = computed(() => {
    const items = this.cartItems();
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + (item.total || 0), 0);
  });

  public cartCount = computed(() => {
    const items = this.cartItems();
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  });

  // ==========================================================
  // 2. HELPERS DE LOCAL STORAGE
  // ==========================================================

  private getLocalCart(): any[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    const local = localStorage.getItem('Cart');
    return local ? JSON.parse(local) : [];
  }

  private setLocalCart(cart: any[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('Cart', JSON.stringify(cart));
      this.localCart.set(cart); // Actualizamos la Signal para que la UI reaccione
    }
  }

  private getUserId(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('_id') : null;
  }

  // ==========================================================
  // 3. MÉTODOS PRINCIPALES DE ACCIÓN
  // ==========================================================

  // 🔥 AGREGAR AL CARRITO (Universal: Soporta Tipo 1 y Tipo 2)
  public async addToCart(productData: any): Promise<boolean> {
    try {
      if (!this.authService.isAuthenticated()) {
        const localCart = this.getLocalCart();

        // 🧩 LA MAGIA DE LA FUSIÓN: Comparamos ID y Variedad al mismo tiempo.
        // Si es Tipo 1: variety será igual en ambos (ej: null === null).
        // Si es Tipo 2: validará que sea exactamente el mismo color y talla.
        const existingIndex = localCart.findIndex(
          (item) => item.product_id === productData.product_id && item.variety === productData.variety
        );

        if (existingIndex !== -1) {
          const item = localCart[existingIndex];

          // Validamos el escudo del Stock Máximo
          if ((item.quantity + productData.quantity) <= item.max_stock) {
            item.quantity += productData.quantity;
            item.subtotal = item.discount_price * item.quantity;
            item.total = item.subtotal;
            this.setLocalCart(localCart);
            this.toast.success('Cantidad actualizada en el carrito', 'top-center');
          } else {
            this.toast.warning('Has alcanzado el límite de stock de este producto', 'top-center');
          }
        } else {
          // Es un producto/variante nuevo en el carrito
          localCart.push(productData);
          this.setLocalCart(localCart);
          
          this.toast.success('Agregado al carrito correctamente', 'top-center');
          this.layoutService.toggleCart();
        }
        return true;
      }

    
      // 1. Angular PAUSA la ejecución aquí hasta que Node.js responda
     const resp = await lastValueFrom(this.userService.create_cart(productData));
      
     // 2. Estas líneas SOLO se ejecutan si el backend respondió con éxito (Status 200)
     this.toast.success(resp.message || 'Agregado al carrito correctamente', 'top-center');
     this.serverCartResource.reload();
     this.layoutService.toggleCart();
      return true;

    } catch (err: any) {
      this.handleCartError(err);
      return false;
    }
  }

  // 🔄 ACTUALIZAR CANTIDAD (Desde la vista del carrito)
  public updateCartQuantity(cartItem: any, quantityChange: number): void {
    const newQty = (cartItem.quantity || 0) + quantityChange;

    if (newQty <= 0) {
      this.toast.warning('Mínima cantidad es 1', 'top-center');
      return;
    }

    // Validación crucial: No superar el max_stock que guardamos en localStorage/backend
    if (newQty > (cartItem.max_stock || cartItem.product?.stock || 999)) {
      this.toast.warning('Has alcanzado el límite de stock disponible', 'top-center');
      return;
    }

    if (!this.authService.isAuthenticated()) {
      const currentCart = this.getLocalCart();
      const index = currentCart.findIndex((i: any) =>
        (i.product_id === cartItem.product_id || i.product?._id === cartItem.product?._id) &&
        i.variety === cartItem.variety
      );

      if (index !== -1) {
        currentCart[index].quantity = newQty;
        currentCart[index].subtotal = currentCart[index].discount_price * newQty;
        currentCart[index].total = currentCart[index].subtotal;
        this.setLocalCart(currentCart);
      }
    } else {
      // Petición al backend
      this.userService.update_cart(cartItem._id, { quantity: newQty, variety: cartItem.variety })
        .subscribe({
          next: (resp) => {
            this.serverCartResource.reload();
            this.toast.success(resp.message, 'top-center');
          },
          error: (err) => this.handleCartError(err)
        });
    }
  }

  // 🗑️ ELIMINAR ITEM
  public removeCartItem(cartItem: any): void {
    if (!this.authService.isAuthenticated()) {
      const currentCart = this.getLocalCart();
      const newCart = currentCart.filter((i: any) =>
        !((i.product_id === cartItem.product_id || i.product?._id === cartItem.product?._id) && i.variety === cartItem.variety)
      );
      this.setLocalCart(newCart);
      this.toast.success('Producto eliminado');
    } else {
      this.userService.delete_cart(cartItem._id).subscribe({
        next: (resp) => {
          this.toast.success(resp.message, 'top-center');
          this.serverCartResource.reload();
        },
        error: (err) => this.handleCartError(err)
      });
    }
  }

  // ♻️ SINCRONIZAR (De Local a Backend al hacer Login)
  public async syncLocalCart(): Promise<void> {
    if (!this.authService.isAuthenticated()) return;

    const localCart = this.getLocalCart();
    if (!localCart.length) return;

    this.toast.info('Sincronizando carrito...');
    let successCount = 0;
    const userId = this.getUserId();

    for (const item of localCart) {
      try {
        // Formateamos el item para asegurar que coincide con lo que espera Mongoose
        const dataForBackend = {
          ...item,
          user: userId,
          product: item.product_id // MongoDB suele esperar el ID en el campo 'product'
        };
        await lastValueFrom(this.userService.create_cart(dataForBackend));
        successCount++;
      } catch (err: any) {
        console.error("Error sincronizando item:", err);
      }
    }

    if (successCount > 0) {
      this.toast.success(`Sincronizados ${successCount} productos`);
    }

    this.clearCartLocalOnly();
    this.serverCartResource.reload();
  }

  // ==========================================================
  // 4. HELPERS
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

  private handleCartError(err: any) {
    const msg = err.error?.message || 'Error en la operación';
    if (err.status === 409) this.toast.warning(msg);
    else this.toast.error(msg);
  }

  public clearCart(): void {
    this.clearCartLocalOnly();
    this.serverCartResource.reload();
    this.OpenCart.set(false);
  }

  private clearCartLocalOnly(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('Cart');
    }
    this.localCart.set([]);
  }
}