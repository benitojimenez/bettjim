import { Injectable, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CheckoutState, INITIAL_CHECKOUT_STATE, Address } from '../shared/classes/checkout';
import { Cart } from './cart';
import { environment } from '../../environments/environment';

export interface ShippingMethod {
  id: string;
  name: string;
  eta: string;
  price: number;
  originalPrice?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  // --- INYECCIONES ---
  private readonly _http = inject(HttpClient);
  private readonly _cartService = inject(Cart);
  private readonly _platformId = inject(PLATFORM_ID);

  // --- CONSTANTES ---
  private readonly STORAGE_KEY = 'bettjim_checkout_session';
  private readonly FREE_SHIPPING_THRESHOLD = 99.00;

  // --- ESTADO (SIGNALS) ---
  private _state = signal<CheckoutState>(INITIAL_CHECKOUT_STATE);

  // Información de pasarela de pago
  public transactionID = signal<string>('');
  public paymentStatus = signal<string>('pending');

  // --- COMPUTED: LÓGICA DE ENVÍO Y TOTALES ---

  // Progreso para envío gratis (Threshold: S/ 99.00)
  readonly shippingProgress = computed(() => {
    const total = this._cartService.cartTotal();
    return {
      percent: Math.min((total / this.FREE_SHIPPING_THRESHOLD) * 100, 100),
      isFree: total >= this.FREE_SHIPPING_THRESHOLD,
      missingAmount: Math.max(this.FREE_SHIPPING_THRESHOLD - total, 0)
    };
  });

  // Métodos de envío disponibles
  readonly availableShippingMethods = computed<ShippingMethod[]>(() => {
    const isFree = this.shippingProgress().isFree;
    return [
      {
        id: 'standard',
        name: 'Envío Estándar',
        eta: 'Llega en 3 a 5 días hábiles',
        price: isFree ? 0 : 10.00,
        originalPrice: isFree ? 10.00 : undefined
      },
      {
        id: 'express',
        name: 'Envío Express (Solo Lima)',
        eta: 'Llega en 24 horas',
        price: 25.00
      }
    ];
  });

  // Costo del método seleccionado
  readonly currentShippingCost = computed(() => {
    const methodId = this._state().shippingMethodId;
    if (!methodId) return 0;
    const method = this.availableShippingMethods().find(m => m.id === methodId);
    return method ? method.price : 0;
  });

  // TOTAL FINAL (Productos + Envío)
  readonly orderTotal = computed(() => {
    return this._cartService.cartTotal() + this.currentShippingCost();
  });

  // Selectores de estado
  readonly checkoutData = computed(() => this._state());
  readonly shippingAddress = computed(() => this._state().shippingAddress);

  constructor() {
    this.initPersistence();
  }

  // --- PERSISTENCIA (SESSION STORAGE) ---
  private initPersistence() {
    if (isPlatformBrowser(this._platformId)) {
      // 1. Recuperar sesión al cargar el servicio
      const saved = sessionStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        try {
          this._state.set({ ...INITIAL_CHECKOUT_STATE, ...JSON.parse(saved) });
        } catch (e) {
          sessionStorage.removeItem(this.STORAGE_KEY);
        }
      }

      // 2. Efecto para guardar automáticamente ante cualquier cambio
      effect(() => {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._state()));
      });
    }
  }

  // --- ACCIONES (ACTUALIZACIÓN DE ESTADO) ---

  updateInformation(data: { email: string; newsletter: boolean; shippingAddress: Address, note?: string }) {
    this._state.update(current => ({
      ...current,
      email: data.email,
      newsletter: data.newsletter,
      shippingAddress: data.shippingAddress,
      note: data.note || current.note
    }));
  }

  setShippingMethod(methodId: string) {
    this._state.update(current => ({ ...current, shippingMethodId: methodId }));
  }

  setPaymentData(methodId: string, billingSameAsShipping: boolean, billingAddress?: Address) {
    this._state.update(current => ({
      ...current,
      paymentMethodId: methodId,
      billingSameAsShipping,
      billingAddress: billingSameAsShipping ? current.shippingAddress : (billingAddress || null)
    }));
  }

  // --- GENERACIÓN DE PEDIDO (PAYLOAD PARA BACKEND) ---

  getFinalOrderPayload(cartItems: any[]) {
    const state = this._state();

    if (!state.email || !state.shippingAddress) {
      throw new Error('Falta información de contacto o dirección');
    }

    // Formateo de items para la API de Node.js
    const formattedItems = cartItems.map(item => ({
      product: item.product._id || item.product,
      quantity: item.quantity,
      variety: item.variety?._id || item.variety || null,
      inventory: item.inventory,
      unit_price: item.unit_price,
      total: item.total,
      discount: item.discount || 0,
      code_cupon: item.code_cupon || null
    }));

    return {
      order: {
        total: this.orderTotal(),
        subtotal: this._cartService.cartTotal(),
        email: state.email,
        shipping_title: state.shippingMethodId,
        shipping_price: this.currentShippingCost(),
        note: state.note || ''
      },
      customer: {
        email: state.email,
        firstName: state.shippingAddress.firstName,
        lastName: state.shippingAddress.lastName,
        phone: state.shippingAddress.phone,
        documentType: state.shippingAddress.documentType,
        documentNumber: state.shippingAddress.documentNumber
      },
      shipping: {
        addressForm: state.shippingAddress,
        shipping_method: state.shippingMethodId
      },
      payment: {
        currency: 'PEN',
        payment_type: state.paymentMethodId,
        transaction_id: this.transactionID(),
        payment_status: this.paymentStatus()
      },
      items: formattedItems
    };
  }

  // --- LLAMADAS API ---

  createOrder(data: any): Observable<any> {
    return this._http.post(`${environment.API_URL}v1/create_order`, data);
  }

  checkoutPay(data: any): Observable<any> {
    return this._http.post(`${environment.API_URL}v1/checkout`, data);
  }

  clearCheckout() {
    this._state.set(INITIAL_CHECKOUT_STATE);
    this.transactionID.set('');
    this.paymentStatus.set('pending');
    if (isPlatformBrowser(this._platformId)) {
      sessionStorage.removeItem(this.STORAGE_KEY);
    }
  }

  // --- SELECTORES DE ESTADO (Para acceso directo desde componentes) ---

  // 1. Email
  readonly email = computed(() => this._state().email);

  // 2. ID del Método de envío
  readonly shippingMethodId = computed(() => this._state().shippingMethodId);

  // 3. ¿La facturación es igual al envío?
  readonly billingSameAsShipping = computed(() => this._state().billingSameAsShipping);

  // 4. Dirección de facturación
  readonly billingAddress = computed(() => this._state().billingAddress);

  // 5. Método de pago
  readonly paymentMethodId = computed(() => this._state().paymentMethodId);
}