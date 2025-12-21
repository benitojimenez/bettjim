export interface Address {
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  department: string; // Estado/Región
  postalCode: string;
  phone: string;
}

export interface CheckoutState {
  email: string;
  newsletter: boolean;
  shippingAddress: Address | null;
  shippingMethodId: string | null; // 'standard' | 'express'
  
  // Datos de Pago
  paymentMethodId: string | null;  // 'card' | 'yape'
  billingSameAsShipping: boolean;
  billingAddress: Address | null;
}

export const INITIAL_CHECKOUT_STATE: CheckoutState = {
  email: '',
  newsletter: true,
  shippingAddress: null,
  shippingMethodId: 'standard', // Valor por defecto
  paymentMethodId: null,
  billingSameAsShipping: true,
  billingAddress: null
};