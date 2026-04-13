export type DocumentType = 'DNI' | 'RUC' | 'CE';

export interface Address {
  // Datos Personales y legales
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  businessName?: string; // Para facturación con RUC
  phone: string;

  // Ubicación (Ubigeo)
  country: string; // Siempre Perú en este caso, pero lo dejamos para escalabilidad futura
  department: string; 
  province: string;
  district: string;

  // Detalles de Dirección
  address: string;
  apartment?: string;
  reference: string;
  postalCode?: string;
}

export interface CheckoutState {
  email: string;
  newsletter: boolean;
  shippingAddress: Address | null;
  shippingMethodId: string | null;
  paymentMethodId: string | null;
  billingSameAsShipping: boolean;
  billingAddress: Address | null;
  note?: string; // Notas adicionales del pedido
  updatedAt: number; // Para control de expiración en Storage
}

export const INITIAL_CHECKOUT_STATE: CheckoutState = {
  email: '',
  newsletter: true,
  shippingAddress: null,
  shippingMethodId: 'standard',
  paymentMethodId: null,
  billingSameAsShipping: true,
  billingAddress: null,
  updatedAt: Date.now()
};