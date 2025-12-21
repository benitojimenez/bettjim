import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
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


@Component({
  selector: 'app-payment',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterLink, CodeImput],
  templateUrl: './payment.html',
  styleUrl: './payment.scss',
})
export default class Payment {
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
  private ps = inject(Products); // Assuming Products service is used somewhere, though not visible in snippet
  private cartService = inject(Cart);

  // ==========================================
  // 2. STATE SIGNALS & VARIABLES
  // ==========================================
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
  form: FormGroup = this.fb.group({
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

    this.form.get('email')?.patchValue(this.checkoutService.email());
    this.YapeForm.get('email')?.patchValue(this.checkoutService.email());
  }

  // ==========================================
  // 5. EVENT HANDLERS
  // ==========================================
  
  /**
   * Handles OTP input changes for Yape
   */
  OTPChange(e: any) {
    this.YapeForm.patchValue({
      secretNumber: e
    });
    console.log(this.YapeForm.value);
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

  // ==========================================
  // 7. PAYMENT PROCESSING LOGIC
  // ==========================================
  /**
   * Specific logic for processing Card payment via Culqi
   */
  private processCardPayment() {

    const data = {
      // eliminar espacios en blanco
      card_number: this.cardForm.value.card_number,
      cvv: this.cardForm.value.cvv,
      expiration_month: this.cardForm.value.expiration_month,
      expiration_year: this.cardForm.value.expiration_year,
      email: this.form.value.email,
      metadata: {
        dni: this.form.value.document_number
      }
    }
    // console.log(data);
    // Encriptar los datos de la tarjeta
    this._culquiService.createToken(this.encryptData(data)).subscribe({
      next: (resp) => {
        // console.log('resp-1', resp);

        const Charge = {
          amount: this.convertToCents(this.checkoutService.orderTotal()),
          currency_code: "PEN", // PEN o USD
          email: this.form.value.email,
          source_id: resp.token.id, //Soporta cargos únicos como recurrencia
          description: "Pago de Orden en Bettjim.com",
          antifraud_details: {
            first_name: this.form.value.first_name,
            last_name: this.form.value.last_name,
            address: this.form.value.address,
            address_city: this.form.value.address_city,
            country_code: "PE",
          },
          metadata: {
            dni: this.form.value.document_number,
            id_user: this.auth.getId() || 'User',
          },
         

        }

        this._culquiService.createCharge(this.encryptData(Charge)).subscribe({
          next: (chargeResp) => {
            this.cardForm.reset();
            // console.log('Charge Created:', chargeResp);
            this.toast.success(chargeResp.cargo.outcome.merchant_message, 'top-center');
            // this.checkoutService.transaccionID.set(chargeResp.cargo.id);
            
            // 3. Register Order in Backend
            this.processBackendOrder('card', chargeResp.cargo.id);
          },
          error: (err) => this.handlePaymentError(err)
          
        });

      },
      error: (err) => {
         this.isProcessing.set(false);
        // console.log('errorr', err);
        // Si el error es de la tarjeta, mostrar el mensaje de error
        if (err.error.code === 'card_declined') {
          this.toast.error(err.error.message, 'top-center');
        } else {
          // Si el error es de otro tipo, mostrar el mensaje de error general
          this.toast.error('Error al procesar el pago.', 'top-center');
        }
        // Si el error es de otro tipo, mostrar el mensaje de error general
        this.toast.error(err.error.error, 'top-center');

      }

    });
  }

  /**
   * Specific logic for processing Yape payment via Culqi
   */
  private processYapePayment() {
    const data = {
      otp: this.YapeForm.value.secretNumber,
      number_phone: this.YapeForm.value.phone,
      amount: this.convertToCents(this.checkoutService.orderTotal()),
      email: this.YapeForm.value.email,
      metadata: {
        dni: this.YapeForm.value.document_number
      }
    };

    // 1. Create Yape Token
    this._culquiService.createTokenYape(this.encryptData(data)).subscribe({
      next: (resp) => {
        // console.log('Token Yape Created:', resp);
        
        // 2. Create Charge
        const Charge = {
          amount: this.convertToCents(this.checkoutService.orderTotal()),
          currency_code: "PEN",
          email: this.checkoutService.email(),
          source_id: resp.token.id,
          description: "Pago de Orden en Bettjim.com",
          antifraud_details: {
            address: this.checkoutService.shippingAddress()?.address,
            address_city: "Lima",
            country_code: "PE",
            first_name: this.auth.getLastName() || 'Cliente Yape',
            last_name: this.auth.getLastName() || 'Cliente Yape',
            phone_number: this.YapeForm.value.phone
          },
          metadata: {
            dni: this.YapeForm.value.document_number,
            id_user: this.auth.getId() || 'User',
          }
        };

        this._culquiService.createCharge(this.encryptData(Charge)).subscribe({
          next: (chargeResp) => {
            // console.log('Charge Created:', chargeResp);
            this.YapeForm.reset();
            this.toast.success(chargeResp.cargo.outcome.merchant_message, 'top-center');
            // this.checkoutService.transaccionID.set(chargeResp.cargo.id);
            
            // 3. Register Order in Backend
            this.processBackendOrder('yape', chargeResp.cargo.id);
          },
          error: (err) => this.handlePaymentError(err)
        });
      },
      error: (err) => this.handlePaymentError(err)
    });
  }

  /**
   * General logic to register the order in your backend after payment success
   */
  private processBackendOrder(method: string, transactionId: string) {
    try {
      // 1. Save base state
      this.checkoutService.setPaymentData(
        method,
        this.billingSameAsShipping(),
        undefined
      );

      // 2. Get Items & Base Payload
      const currentItems = this.cartService.cartItems();
      const finalOrder = this.checkoutService.getFinalOrderPayload(currentItems);

      // 3. Inject Payment Details
      finalOrder.payment.transaction_id = transactionId;
      finalOrder.payment.payment_status = 'Pagado';

      // console.log('🚀 ENVIANDO AL BACKEND:', finalOrder);

      // 4. Send to Backend
      this.userService.register_order(finalOrder).subscribe({
        next: (resp) => this.handleSuccess(resp),
        error: (err) => {
          this.isProcessing.set(false);
          const msg = err.error?.message || 'Error al procesar el pedido en el servidor';
          this.toast.error(msg, 'top-center');
          console.error(err);
        },
      });

    } catch (error) {
      console.error('Error procesando el pedido:', error);
      this.toast.error('Error inesperado en el cliente', 'bottom-center');
      this.isProcessing.set(false);
    }
  }

  // ==========================================
  // 8. HELPERS & UTILITIES
  // ==========================================

  /**
   * Handles successful order creation
   */
  private handleSuccess(resp: any) {
    this.isProcessing.set(false);
    this.toast.success(resp.message || 'Orden creada con éxito', 'top-center');

    // Cleanup
    this.checkoutService.clearCheckout();
    this.cartService.clearCart();

    // Navigate
    this.router.navigate(['/checkout/thank-you', resp.order._id], {
      state: {
        order: resp.order,
        details: resp.detalles || resp.details
      }
    });
  }

  /**
   * Handles payment errors from Culqi
   */
  private handlePaymentError(err: any) {
    this.isProcessing.set(false);
    console.error('Payment Error:', err);
    
    if (err.error?.code === 'card_declined') {
      this.toast.error(err.error.message, 'top-center');
    } else {
      const msg = err.error?.error || err.error?.user_message || 'Error al procesar el pago.';
      this.toast.error(msg, 'top-center');
    }
  }

  /**
   * Converts amount to cents (integer)
   */
  convertToCents(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Encrypts data for Culqi
   */
  encryptData(data: any) {
    const iv = CryptoJS.lib.WordArray.random(16);
    const key = CryptoJS.SHA256(this.secretKey());

    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const hmac = CryptoJS.HmacSHA256(encrypted.toString(), key).toString();

    return {
      encryptedData: encrypted.toString(),
      iv: iv.toString(CryptoJS.enc.Hex),
      hmac: hmac
    };
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
