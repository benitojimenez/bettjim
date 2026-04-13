import { Component, computed, inject, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

// Services
import { CheckoutService } from '../../../services/checkout';
import { Cart } from '../../../services/cart';
import { ToastService } from '../../../services/toast';
import { environment } from '../../../../environments/environment';

// Components
import { CodeImput } from '../../../shared/components/codeimput/codeimput';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterLink, CodeImput],
  templateUrl: './payment.html',
  styleUrl: './payment.scss',
})
export default class Payment implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly cartService = inject(Cart);
  public readonly checkoutService = inject(CheckoutService);
  public readonly toast = inject(ToastService);

  // --- ESTADO (SIGNALS) ---
  createdOrderId = signal<string | null>(null);
  selectedMethod = signal<'card' | 'yape' | 'plin'>('card');
  isProcessing = signal(false);
  billingSameAsShipping = signal(true);

  // --- COMPUTED: DATOS DE REVISIÓN ---
  reviewContact = this.checkoutService.email;
  
  reviewAddress = computed(() => {
    const addr = this.checkoutService.shippingAddress();
    if (!addr) return 'Cargando dirección...';
    return `${addr.address}, ${addr.district}, ${addr.province}`;
  });

  reviewShipping = computed(() => {
    const methodId = this.checkoutService.shippingMethodId();
    const method = this.checkoutService.availableShippingMethods().find(m => m.id === methodId);
    return method ? `${method.name} · S/ ${method.price.toFixed(2)}` : 'No seleccionado';
  });

  isButtonDisabled = computed(() => {
    if (this.isProcessing()) return true;
    if (this.selectedMethod() === 'card') return this.cardForm.invalid;
    if (this.selectedMethod() === 'yape') return this.yapeForm.invalid;
    return false;
  });

  // --- FORMULARIOS ---
  cardForm: FormGroup = this.fb.group({
    card_number: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    expiration_month: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])$/)]],
    expiration_year: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
  });

  formAntifraud: FormGroup = this.fb.group({
    document_type: ['dni', Validators.required],
    document_number: ['', [Validators.required, Validators.minLength(8)]],
    email: ['', [Validators.required, Validators.email]],
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    phone_number: ['', [Validators.required, Validators.pattern(/^[0-9]{9,15}$/)]],
    address: ['', Validators.required],
    address_city: ['Lima', Validators.required],
    country_code: ['PE', Validators.required]
  });

  yapeForm: FormGroup = this.fb.group({
    phone: ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]],
    secretNumber: ['', [Validators.required, Validators.minLength(6)]],
    email: ['', [Validators.required, Validators.email]],
    document_type: ['dni', Validators.required],
    document_number: ['', [Validators.required]]
  });

  ngOnInit() {
    this.syncInitialData();
    
    // RECUPERAR ESTADO DEL SERVICIO
    const state = this.checkoutService.checkoutData();
    
    // 1. Recuperar método de pago
    if (state.paymentMethodId) {
      this.selectedMethod.set(state.paymentMethodId as any);
    }
    
    // 2. Recuperar toggle de facturación
    this.billingSameAsShipping.set(state.billingSameAsShipping);
  }

  /**
   * Cambia el método de pago y sincroniza con el SessionStorage del servicio
   */
  changePaymentMethod(method: 'card' | 'yape' | 'plin') {
    this.selectedMethod.set(method);
    
    // Avisar al servicio para que guarde en el estado global
    this.checkoutService.setPaymentData(
      method,
      this.billingSameAsShipping(),
      this.billingSameAsShipping() ? undefined : undefined // Aquí iría tu formBilling si lo tuvieras
    );
  }

  toggleBilling(value: boolean) {
    this.billingSameAsShipping.set(value);
    
    // Sincronizar con el servicio
    this.checkoutService.setPaymentData(
      this.selectedMethod(), 
      value, 
      undefined // Si tuvieses un formulario de facturación específico, lo pasarías aquí
    );
  }

  private syncInitialData() {
    const state = this.checkoutService.checkoutData();
    const addr = state.shippingAddress;
    
    if (state.email) {
      this.formAntifraud.patchValue({ email: state.email });
      this.yapeForm.patchValue({ email: state.email });
    }

    if (addr) {
      this.formAntifraud.patchValue({
        first_name: addr.firstName,
        last_name: addr.lastName,
        phone_number: addr.phone,
        address: addr.address,
        document_number: addr.documentNumber
      });
      this.yapeForm.patchValue({ document_number: addr.documentNumber });
    }
  }

  // --- PROCESAMIENTO DE ORDEN ---
  async submitOrder() {
    const method = this.selectedMethod();
    
    if (method === 'card' && this.cardForm.invalid) {
      this.cardForm.markAllAsTouched();
      return this.toast.warning('Completa los datos de tu tarjeta');
    }
    
    if (method === 'yape' && this.yapeForm.invalid) {
      this.yapeForm.markAllAsTouched();
      return this.toast.warning('Revisa los datos de tu Yape');
    }

    this.isProcessing.set(true);

    try {
      const orderId = await this.ensureOrderCreated();
      if (method === 'card') await this.processCard(orderId);
      if (method === 'yape') await this.processYape(orderId);
    } catch (error: any) {
      this.handleError(error, method);
    } finally {
      this.isProcessing.set(false);
    }
  }

  private async ensureOrderCreated(): Promise<string> {
    if (this.createdOrderId()) return this.createdOrderId()!;

    const payload = this.checkoutService.getFinalOrderPayload(this.cartService.cartItems());
    const res = await firstValueFrom(this.checkoutService.createOrder(payload));
    this.toast.success(res.message || "Orden creada exitosamente", 'top-center');
    this.createdOrderId.set(res.orderId);
    return res.orderId;
  }

  private async processCard(orderId: string) {
    const token = await this.getCulqiToken();
    const res = await firstValueFrom(this.checkoutService.checkoutPay({
      orderId,
      payment_method: 'card',
      culqi_token: token,
      antifraud_details: this.formAntifraud.value
    }));
    this.handleSuccess(res);
  }

  private async processYape(orderId: string) {
    const token = await this.getYapeToken();
    const res = await firstValueFrom(this.checkoutService.checkoutPay({
      orderId,
      payment_method: 'yape',
      culqi_token: token,
      email: this.yapeForm.value.email
    }));
    this.handleSuccess(res);
  }

  private async getCulqiToken(): Promise<string> {
    const body = {
      card_number: this.cardForm.value.card_number,
      cvv: this.cardForm.value.cvv,
      expiration_month: this.cardForm.value.expiration_month,
      expiration_year: this.cardForm.value.expiration_year,
      email: this.formAntifraud.value.email
    };

    const res = await fetch("https://secure.culqi.com/v2/tokens", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${environment.culqiPublicKey}` 
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.user_message || "Error en tarjeta");
    return data.id;
  }

  private async getYapeToken(): Promise<string> {
    const body = {
      otp: this.yapeForm.value.secretNumber,
      number_phone: this.yapeForm.value.phone,
      amount: Math.round(this.checkoutService.orderTotal() * 100),
      email: this.yapeForm.value.email
    };

    const res = await fetch("https://secure.culqi.com/v2/tokens/yape", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${environment.culqiPublicKey}` 
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.user_message || "OTP de Yape inválido");
    return data.id;
  }

  private handleSuccess(resp: any) {
    this.toast.success(resp.message || "¡Pago exitoso!", 'top-center');
    const items = this.cartService.cartItems();
    this.checkoutService.clearCheckout();
    this.cartService.clearCart();
    this.createdOrderId.set(null);
    this.router.navigate(['/checkout/thank-you', resp.order._id], {
      state: { order: resp.order, details: items }
    });
  }

  private handleError(error: any, method: string) {
    const msg = error.error?.message || error.message || `Error con ${method}`;
    this.toast.error(msg,'top-center');
  }

  OTPChange(val: string) {
    this.yapeForm.patchValue({ secretNumber: val });
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.isProcessing()) $event.returnValue = true;
  }
}