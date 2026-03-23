export interface Order {
  _id?: string;
  // Relaciones (pueden venir como ID o como objeto poblado)
  user?: any; 
  shipping?: any;
  payment?: any;

  // Datos de Orden
  n_order: string;

  // Datos Económicos
  shipping_title?: string;
  shipping_price: number;
  cupon?: string;
  subtotal: number;
  total: number;

  // Estado (Usamos un tipo literal para que coincida con tu enum)
  status: 'pendiente' | 'procesando' | 'enviado' | 'completado' | 'cancelado' | 'reembolsado';

  note?: string;
  email: string;

  // Timestamps
  createdAt?: string | Date;
  updatedAt?: string | Date;
}