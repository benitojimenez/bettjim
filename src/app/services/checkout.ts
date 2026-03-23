import { Injectable, signal, computed, effect, inject, PLATFORM_ID, Signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CheckoutState, INITIAL_CHECKOUT_STATE, Address } from '../shared/classes/checkout';
import { Products } from './product';
import { Cart } from './cart';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// Interfaces locales para métodos de envío
export interface ShippingMethod {
  id: string;
  name: string;
  eta: string;
  price: number;
  originalPrice?: number; // Para mostrar tachado si es gratis
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  private platformId = inject(PLATFORM_ID);
  private ps = inject(Products);
  _http = inject(HttpClient);
  private cartService = inject(Cart)
  private readonly STORAGE_KEY = 'bettjim_checkout_session';
  private readonly FREE_SHIPPING_THRESHOLD = 99.00;

  // ==========================================
  // 1. ESTADO (SIGNAL STORE)billingAddress
  // ==========================================
  private _state = signal<CheckoutState>(INITIAL_CHECKOUT_STATE);
  // SIMULACIÓN: Esto debería venir de tu CartService.total()
  public transaccionID = signal('')
  public payment_status = signal('')
  // ==========================================
  // 2. LÓGICA DE NEGOCIO CENTRALIZADA
  // ==========================================

  // A. Progreso de Envío Gratis
  readonly shippingProgress = computed(() => {
    const total = this.cartService.cartTotal();
    return {
      percent: Math.min((total / this.FREE_SHIPPING_THRESHOLD) * 100, 100),
      isFree: total >= this.FREE_SHIPPING_THRESHOLD,
      missingAmount: Math.max(this.FREE_SHIPPING_THRESHOLD - total, 0)
    };
  });

  // B. Métodos de Envío (Calculados dinámicamente)
  readonly availableShippingMethods = computed<ShippingMethod[]>(() => {
    const isFree = this.shippingProgress().isFree;
    console.log(isFree);

    return [
      {
        id: 'standard',
        name: 'Envío Estándar',
        eta: 'Llega entre el 5 y 8 de Dic',
        price: isFree ? 0 : 10.00,
        originalPrice: isFree ? 10.00 : undefined
      },
      {
        id: 'express',
        name: 'Envío Express',
        eta: 'Llega mañana antes de las 6pm',
        price: 25.00
      }
    ];
  });

  // C. Costo de Envío Actual
  readonly currentShippingCost = computed(() => {
    const methodId = this._state().shippingMethodId;
    if (!methodId) return null; // No seleccionado aún

    const method = this.availableShippingMethods().find(m => m.id === methodId);
    return method ? method.price : 0;
  });

  // D. Total a Pagar
  readonly orderTotal = computed(() => {
    const shipping = this.currentShippingCost() || 0;
    return this.cartService.cartTotal() + shipping;
  });

  // Exponemos el estado como solo lectura para los componentes
  readonly checkoutData = computed(() => this._state());

  // Selectores específicos (opcionales, para comodidad)
  readonly email = computed(() => this._state().email);
  readonly shippingAddress = computed(() => this._state().shippingAddress);
  readonly shippingMethodId = computed(() => this._state().shippingMethodId);


  constructor() {
    // Solo ejecutamos lógica de almacenamiento si estamos en el Navegador
    if (isPlatformBrowser(this.platformId)) {

      // A. CARGAR DATOS AL INICIO (Recuperar sesión)
      const saved = sessionStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        try {
          const parsedData = JSON.parse(saved);
          this._state.set({ ...INITIAL_CHECKOUT_STATE, ...parsedData });
        } catch (e) {
          console.error('Error al recuperar datos del checkout', e);
          sessionStorage.removeItem(this.STORAGE_KEY);
        }
      }

      // B. GUARDAR DATOS AUTOMÁTICAMENTE (Effect)
      // Cada vez que _state cambia, se guarda en sessionStorage automáticamente.
      effect(() => {
        const stateJson = JSON.stringify(this._state());
        sessionStorage.setItem(this.STORAGE_KEY, stateJson);
      });
    }
  }

  // ==========================================
  // 2. ACCIONES (Métodos para actualizar)
  // ==========================================

  /**
   * Paso 1: Guardar información de contacto y dirección de envío
   */
  updateInformation(data: { email: string; newsletter: boolean; shippingAddress: Address }) {
    this._state.update(current => ({
      ...current,
      email: data.email,
      newsletter: data.newsletter,
      shippingAddress: data.shippingAddress
    }));
  }

  /**
   * Paso 2: Guardar método de envío seleccionado
   */
  setShippingMethod(methodId: string) {
    this._state.update(current => ({
      ...current,
      shippingMethodId: methodId
    }));
  }

  /**
   * Paso 3: Guardar datos de pago y facturación
   */
  setPaymentData(methodId: string, billingSameAsShipping: boolean, billingAddress?: Address) {
    this._state.update(current => ({
      ...current,
      paymentMethodId: methodId,
      billingSameAsShipping: billingSameAsShipping,
      // Si el usuario dice "Misma dirección", ignoramos el billingAddress que venga y usamos shippingAddress
      billingAddress: billingSameAsShipping ? current.shippingAddress : (billingAddress || null)
    }));
  }

  // ==========================================
  // 3. FINALIZACIÓN
  // ==========================================

  /**
   * Genera el objeto JSON final listo para enviar a tu API de Backend.
  * AHORA RECIBE LOS ITEMS DEL CARRITO COMO PARÁMETRO.
   */
  getFinalOrderPayload(cartItems: any[]) {// <--- Nuevo parámetro
    const state = this._state();

   // 1. Validaciones de seguridad para la API 1 (Solo Datos y Envío)
    if (!state.email || !state.shippingAddress) {
      throw new Error('Falta información de contacto o dirección');
    }
    if (!state.shippingMethodId) {
      throw new Error('Falta método de envío');
    }
    // 🔥 ELIMINAMOS LA VALIDACIÓN DEL MÉTODO DE PAGO AQUÍ 🔥
    // if (!state.paymentMethodId) throw new Error('Falta método de pago');
    // Mapeamos los items del Front al formato que espera tu Backend Node.js
    // El backend espera: { product: "ID", quantity: 1, variety: "ID", inventory: "ID", price: 100 }
    const formattedItems = cartItems.map(item => ({
      product: item.product._id || item.product, // Aseguramos enviar el ID
      user: "null",
      type_discount: item.type_discount,
      discount: item.discount,
      quantity: item.quantity,
      variety: item.variety || null,
      inventory: item.inventory, // ID del inventario
      code_cupon: item.code_cupon,
      code_discount: item.code_discount,
      unit_price: item.unit_price,
      discount_price: item.discount_price,
      subtotal: item.subtotal,
      total: item.total

    }));
    // Construcción del Payload
    // 1. OBTENER VALORES RAW (CRUDOS)
    // Nota: Si son Signals, recuerda ejecutarlos con ().
    const rawTotal = this.orderTotal();
    const rawSubtotal = this.cartService.cartTotal(); // O this.cartService.cartTotal()

    // 2. SANITIZAR (LIMPIEZA)
    // Number(...) convierte strings a números.
    // || 0 asegura que si es NaN, null o undefined, se convierta en 0.
    const safeTotal = Number(rawTotal) || 0;
    const safeSubtotal = Number(rawSubtotal) || 0;

    // Validación extra por seguridad en consola
    if (isNaN(safeTotal) || isNaN(safeSubtotal)) {
      console.error('🚨 ERROR CRÍTICO: Los montos son inválidos', { rawTotal, rawSubtotal });
    }

    return {
      order: {
        total: safeTotal,
        subtotal: safeSubtotal,
        email: state.email,
        shipping_title:state.shippingMethodId,
        shipping_price: this.currentShippingCost(),
        newsletter: state.newsletter,
        // ... otros campos de orden
      },
      customer: {
        email: state.email,
        newsletter: state.newsletter,
        firstName: state.shippingAddress.firstName,
        lastName: state.shippingAddress.lastName,
        phone: state.shippingAddress.phone
      },
      shipping: {
        address:'undefined',
        addressForm: state.shippingAddress,
        shipping_method: state.shippingMethodId
      },
      payment: {
        currency: 'PEN',
        payment_type:state.paymentMethodId,
        transaction_id:this.transaccionID(),
        payment_status:'success'
        // Aquí podrías agregar metadatos extra si fuera necesario
      },
      // 🔥 AQUÍ VA LA DATA CLAVE PARA EL INVITADO 🔥
      items: formattedItems,
      // Nota: Los items del carrito se suelen obtener del CartService aquí o en el backend
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Limpia todo el estado. Se llama al terminar la compra exitosamente.
   */
  clearCheckout() {
    this._state.set(INITIAL_CHECKOUT_STATE);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(this.STORAGE_KEY);
     this.cartService.serverCartResource

    }
  }

  CreateOrder(data: any): Observable<any> {
    return this._http.post(environment.API_URL + 'v1/create_order', data);
  }
  // Métodos para crear cargo
  checkoutPay(data: any): Observable<any> {
    return this._http.post(environment.API_URL+'v1/checkout',data);
  }



}