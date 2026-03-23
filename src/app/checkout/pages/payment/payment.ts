import { Component, computed, effect, HostListener, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import * as CryptoJS from 'crypto-js';

// Services
import { CheckoutService } from '../../../services/checkout';
import { Products } from '../../../services/product';
import { Cart } from '../../../services/cart';
import { User } from '../../../services/user';
import { ToastService } from '../../../services/toast';
import { CulqiService } from '../../../services/culqi';
import { Auth } from '../../../services/auth';

// Components
import { CodeImput } from '../../../shared/components/codeimput/codeimput';

// Environment
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-payment',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterLink, CodeImput],
  templateUrl: './payment.html',
  styleUrl: './payment.scss',
})
export default class Payment implements OnInit {
  // ==========================================
  // 1. DEPENDENCY INJECTION
  // ==========================================
  private router = inject(Router);
  private fb = inject(FormBuilder);
  public checkoutService = inject(CheckoutService);
  public _culquiService = inject(CulqiService);
  public auth = inject(Auth);
  public toast = inject(ToastService);
  public userService = inject(User);
  private cartService = inject(Cart);

  // ==========================================
  // STATE SIGNALS (Añadir esto al principio de tu clase)
  // ==========================================
  // Memoria para evitar duplicar órdenes si el pago falla
  createdOrderId = signal<string | null>(null);

  private secretKey = signal(environment.secretKeyEncript);

  // UI State
  selectedMethod = signal<'card' | 'yape' | 'plin'>('card');
  billingSameAsShipping = signal(true);
  isProcessing = signal(false); // Controls button spinner/disable state

  // Checkout Data (Signals from Service)
  selectedMethodId = this.checkoutService.shippingMethodId;

  progress = this.checkoutService.shippingProgress;
  methods = this.checkoutService.availableShippingMethods;

  // Review Panel Data (Computed Signals)
  reviewContact = this.checkoutService.email;

  reviewAddress = computed(() => {
    const addr = this.checkoutService.shippingAddress();
    if (!addr) return '...';
    return `${addr.address}, ${addr.city}, ${addr.department}`;
  });

  reviewShipping = computed(() => {
    const methodId = this.checkoutService.shippingMethodId();
    // In a real app, find this ID in your methods list to get the name
    if (methodId === 'express') return 'Envío Express · S/ 25.00';
    if (methodId === 'standard') return 'Envío Estándar · S/ 10.00';
    return 'Método no seleccionado';
  });

  // Computed Button State
  isButtonDisabled = computed(() => {
    // 1. Block if processing
    if (this.isProcessing()) return true;

    // 2. Block based on form validity
    if (this.selectedMethod() === 'card') {
      return this.cardForm.invalid;
    }
    // If Yape/Plin, logic depends on if you want to block before input
    // Currently returns false (enabled) for non-card methods
    return false;
  });

  // ==========================================
  // 3. FORMS CONFIGURATION
  // ==========================================

  // Card Payment Form
  cardForm: FormGroup = this.fb.group({
    card_number: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    expiration_month: ['', [Validators.required, Validators.maxLength(2)]],
    expiration_year: ['', [Validators.required, Validators.maxLength(4)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
  });

  // User/Antifraud Data Form
  formAntifraud: FormGroup = this.fb.group({
    // Identity Data
    document_type: ['', Validators.required],
    document_number: ['', [Validators.required, Validators.minLength(8)]],

    // Personal Data
    email: ['richard@piedpiper.com', [Validators.required, Validators.email]],
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],

    // Contact / Antifraud Data
    phone_number: ['', [Validators.required, Validators.pattern(/^[0-9]{9,15}$/)]],
    address: ['', Validators.required],
    address_city: ['Lima', Validators.required],
    country_code: ['PE', Validators.required]
  });

  // Yape Payment Form
  YapeForm: FormGroup = this.fb.group({
    phone: ['', [Validators.required, Validators.pattern(/^\d{9}$/), Validators.maxLength(9)]],
    secretNumber: ['', Validators.required],
    // Personal Data for Yape context
    email: ['richard@piedpiper.com', [Validators.required, Validators.email]],
    type_document: ['dni', [Validators.required]],
    document_number: ['', [Validators.required]]
  });

  // ==========================================
  // 4. LIFECYCLE HOOKS
  // ==========================================
  ngOnInit() {
    // Recover saved payment method if user refreshes or returns
    const savedState = this.checkoutService.checkoutData();
    if (savedState.paymentMethodId) {
      this.selectedMethod.set(savedState.paymentMethodId as any);
      this.billingSameAsShipping.set(savedState.billingSameAsShipping);
    }

    this.formAntifraud.get('email')?.patchValue(this.checkoutService.email());
    this.YapeForm.get('email')?.patchValue(this.checkoutService.email());

  }


  // ==========================================
  // 6. MAIN ACTION: SUBMIT ORDER
  // ==========================================
  async submitOrder() {
    const method = this.selectedMethod(); // 'card' | 'yape' | 'cash'

    // --- PHASE A: VALIDATION ---
    if (!this.validateForms(method)) {
      return;
    }

    // --- PHASE B: PROCESSING ---
    this.isProcessing.set(true); // Start loading

    if (method === 'card') {
      // TODO: Implement Card Tokenization Logic here
      // For now, we simulate success in the final step logic
      this.processCardPayment();
    }
    else if (method === 'yape') {
      this.processYapePayment();
    }
  }

  /**
   * Helper to validate forms based on selected method
   */
  private validateForms(method: string): boolean {
    if (method === 'card') {
      if (this.cardForm.invalid) {
        this.cardForm.markAllAsTouched();
        this.toast.warning('Revisa los datos de tu tarjeta', 'top-center');
        return false;
      }
    } else if (method === 'yape') {
      if (this.YapeForm.invalid) {
        console.log(this.YapeForm.value);
        this.YapeForm.markAllAsTouched(); // Fixed: was cardForm
        this.toast.warning('Revisa los datos de tu Yape', 'top-center');
        return false;
      }
    }
    return true;
  }
    /**
   * PROCESO CON TARJETA (3 PASOS)
   */
  async processCardPayment() {
    try {
      this.isProcessing.set(true);
      const currentItems = this.cartService.cartItems();

      // ==========================================
      // PASO 1: CREAR ORDEN EN TU BACKEND
      // ==========================================
      let currentOrderId = this.createdOrderId();

      if (!currentOrderId) {
        const finalOrder = this.checkoutService.getFinalOrderPayload(currentItems);
        const respOrder = await firstValueFrom(this.checkoutService.CreateOrder(finalOrder));
        currentOrderId = respOrder.orderId;
        this.toast.info(respOrder.message || 'Orden creada con éxito.', 'top-center');
        this.createdOrderId.set(currentOrderId); // Guardamos en memoria
      }

      // ==========================================
      // PASO 2: OBTENER TOKEN DIRECTO DE CULQI
      // ==========================================
      const cardPayload = {
        card_number: this.cardForm.value.card_number,
        cvv: this.cardForm.value.cvv,
        expiration_month: this.cardForm.value.expiration_month,
        expiration_year: this.cardForm.value.expiration_year,
        email: this.formAntifraud.value.email,
        metadata: { dni: this.formAntifraud.value.document_number },
      };

      const culqiResponse = await fetch("https://secure.culqi.com/v2/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${environment.culqiPublicKey}` // Llave PÚBLICA
        },
        body: JSON.stringify(cardPayload)
      });

      const culqiData = await culqiResponse.json();

      if (!culqiResponse.ok) {
        throw new Error(culqiData.user_message || "Error al validar la tarjeta con el banco.");
      }

      const culqiTokenId = culqiData.id; // ¡Este es el string seguro: tkn_live_xyz!

      // ==========================================
      // PASO 3: ENVIAR TOKEN AL BACKEND PARA COBRAR
      // ==========================================
      // Fíjate lo limpio y seguro que es este payload ahora
      const checkoutPayload = {
        orderId: currentOrderId,
        payment_method: this.selectedMethod(),
        culqi_token: culqiTokenId, 
        email: this.formAntifraud.value.email,
        // Mandamos el antifraude en texto plano porque Node lo necesita para armar el Charge
        antifraud_details: this.formAntifraud.value 
      };

      const respPayment = await firstValueFrom(this.checkoutService.checkoutPay(checkoutPayload));

      // ÉXITO
      this.createdOrderId.set(null);
      this.cardForm.reset();
      this.toast.success(respPayment.message || 'Pago procesado con éxito.', 'top-center');
      this.handleSuccess(respPayment, currentItems);

    } catch (error: any) {
      this.handleCheckoutError(error, 'Tarjeta');
    }
  }
    /**
   * PROCESO CON YAPE (3 PASOS)
   */
  async processYapePayment() {
    try {
      this.isProcessing.set(true);
      const currentItems = this.cartService.cartItems();

      // ==========================================
      // PASO 1: CREAR ORDEN EN TU BACKEND
      // ==========================================
      let currentOrderId = this.createdOrderId();

      if (!currentOrderId) {
        const finalOrder = this.checkoutService.getFinalOrderPayload(currentItems);
        const respOrder = await firstValueFrom(this.checkoutService.CreateOrder(finalOrder));
        currentOrderId = respOrder.orderId;
        this.toast.info(respOrder.message || 'Orden creada con éxito.', 'top-center');
        this.createdOrderId.set(currentOrderId);
      }

      // ==========================================
      // PASO 2: OBTENER TOKEN DE YAPE DESDE CULQI
      // ==========================================
      const yapePayload = {
        otp: this.YapeForm.value.secretNumber,
        number_phone: this.YapeForm.value.phone,
        amount: this.convertToCents(this.checkoutService.orderTotal()), 
        email: this.YapeForm.value.email,
        metadata: { dni: this.YapeForm.value.document_number }
      };

      const culqiResponse = await fetch("https://secure.culqi.com/v2/tokens/yape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${environment.culqiPublicKey}` // Llave PÚBLICA
        },
        body: JSON.stringify(yapePayload)
      });

      const culqiData = await culqiResponse.json();

      if (!culqiResponse.ok) {
        throw new Error(culqiData.user_message || "Código de Yape inválido o expirado.");
      }

      const culqiTokenId = culqiData.id;

      // ==========================================
      // PASO 3: ENVIAR TOKEN AL BACKEND PARA COBRAR
      // ==========================================
      const checkoutPayload = {
        orderId: currentOrderId,
        payment_method: 'yape',
        culqi_token: culqiTokenId,
        email: this.YapeForm.value.email,
        antifraud_details: {
          document_number: this.YapeForm.value.document_number,
          type_document: this.YapeForm.value.type_document
        }
      };

      const respPayment = await firstValueFrom(this.checkoutService.checkoutPay(checkoutPayload));

      // ÉXITO
      this.createdOrderId.set(null);
      this.YapeForm.reset();
      this.toast.success(respPayment.message || 'Pago procesado con éxito.', 'top-center');
      this.handleSuccess(respPayment, currentItems);

    } catch (error: any) {
      this.handleCheckoutError(error, 'Yape');
    }
  }

  private handleSuccess(resp: any, items: any[]) {
    this.isProcessing.set(false);
    // Cleanup
    this.checkoutService.clearCheckout();
    this.cartService.clearCart();

    // Navigate
    this.router.navigate(['/checkout/thank-you', resp.order._id], {
      state: { order: resp.order, details: items }
    });
  }


  // 5. EVENT HANDLERS
  // ==========================================
  /**
   * Helper unificado para manejar errores
   */
  private handleCheckoutError(error: any, method: string) {
    this.isProcessing.set(false);
    console.error(`Error en pago con ${method}:`, error);
    
    // Si el error viene de tu backend (HttpClient lanza un HttpErrorResponse)
    const backendMsg = error.error?.message || error.error?.error;
    
    // Si el error lo lanzamos nosotros desde el catch del fetch de Culqi (error.message)
    const finalMsg = backendMsg || error.message || `Error al procesar el pago con ${method}.`;
    
    this.toast.error(finalMsg, 'top-center');
  }
  /**
   * Handles OTP input changes for Yape
   */
  OTPChange(e: any) {
    this.YapeForm.patchValue({
      secretNumber: e
    });
    console.log(this.YapeForm.value);
  }

  /**
   * Converts amount to cents (integer)
   */
  convertToCents(amount: number): number {
    return Math.round(amount * 100);
  }


  // ==========================================
  // 9. SECURITY & GUARDS (Bunker Mode)
  // ==========================================

  /**
   * Guard: Prevent navigation if processing or unsaved changes
   */

  canDeactivate(): boolean {
    if (this.isProcessing()) {
      // Si está procesando el pago, PROHIBIDO salir
      return false;
    }

    // Si solo está llenando datos, pedimos confirmación
    if (this.cardForm.dirty) {
      return confirm('¿Estás seguro de que quieres abandonar el pago? Se perderán los datos ingresados.');
    }
    if (this.YapeForm.dirty) {
      return confirm('¿Estás seguro de que quieres abandonar el pago? Se perderán los datos ingresados.');
    }

    return true;
  }
  // =========================================================
  // 🔒 ZONA DE SEGURIDAD (MODO BÚNKER)
  // =========================================================

  /**
   * 1. ANTI-REFRESH ACCIDENTAL
   * Si el usuario intenta recargar (F5) o cerrar la pestaña
   * mientras está en esta pantalla, el navegador le lanzará una alerta nativa.
   */
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    // Si ya pagó, no bloqueamos. Si está llenando datos, sí.
    if (!this.isProcessing()) {
      $event.returnValue = true; // Muestra el popup nativo "¿Seguro que quieres salir?"
    }
  }

  /**
   * 2. ANTI-CLICK DERECHO (Evitar "Inspeccionar Elemento" básico)
   */
  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault(); // Bloquea el menú contextual
  }

  /**
   * 3. ANTI-DEVTOOLS (Bloquear atajos de teclado F12, Ctrl+U, etc.)
   */
  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    // F12 (DevTools)
    if (event.key === 'F12') {
      event.preventDefault();
      return false;
    }

    // Ctrl+Shift+I (DevTools), Ctrl+Shift+J (Consola), Ctrl+Shift+C (Inspector)
    if (event.ctrlKey && event.shiftKey && ['I', 'J', 'C'].includes(event.key.toUpperCase())) {
      event.preventDefault();
      return false;
    }

    // Ctrl+U (Ver código fuente)
    if (event.ctrlKey && event.key.toUpperCase() === 'U') {
      event.preventDefault();
      return false;
    }

    // Ctrl+S (Guardar página)
    if (event.ctrlKey && event.key.toUpperCase() === 'S') {
      event.preventDefault();
      return false;
    }

    return true;
  }
}
