import { Component, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Coupon {
  id: string;
  code: string;
  description: string;
  discount: string; // Ej: '20%', 'S/ 50'
  type: 'percentage' | 'fixed' | 'shipping';
  minPurchase?: number;
  expiryDate: Date;
  status: 'active' | 'expiring' | 'used';
  bgGradient: string; // Para darle personalidad a cada cupón
}
@Component({
  selector: 'app-coupons',
  imports: [CommonModule,DatePipe],
  templateUrl: './coupons.html',
  styleUrl: './coupons.scss',
})
export default class Coupons {
  // Feedback visual de copia
  copiedId = signal<string | null>(null);

  coupons = signal<Coupon[]>([
    {
      id: '1',
      code: 'BETTJIM20',
      description: 'Descuento en toda la tienda',
      discount: '20%',
      type: 'percentage',
      minPurchase: 100,
      expiryDate: new Date(Date.now() + 86400000 * 5), // 5 días
      status: 'active',
      bgGradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' // Violeta moderno
    },
    {
      id: '2',
      code: 'VERANO50',
      description: 'Ahorra en colección Verano',
      discount: 'S/ 50',
      type: 'fixed',
      minPurchase: 200,
      expiryDate: new Date(Date.now() + 86400000 * 1), // Mañana (Urgencia)
      status: 'expiring',
      bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' // Naranja fuego
    },
    {
      id: '3',
      code: 'ENVIOFREE',
      description: 'Envío gratis a todo el país',
      discount: 'ENVÍO GRATIS',
      type: 'shipping',
      expiryDate: new Date('2024-12-31'),
      status: 'active',
      bgGradient: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)' // Verde/Azul fresco
    },
    {
      id: '4',
      code: 'BIENVENIDA10',
      description: 'Por tu primera compra',
      discount: '10%',
      type: 'percentage',
      expiryDate: new Date('2023-01-01'),
      status: 'used',
      bgGradient: 'linear-gradient(135deg, #9ca3af 0%, #4b5563 100%)' // Gris
    }
  ]);

  copyCode(coupon: Coupon) {
    if (coupon.status === 'used') return;

    navigator.clipboard.writeText(coupon.code).then(() => {
      // Activar animación de "Copiado!"
      this.copiedId.set(coupon.id);
      
      // Resetear después de 2 segundos
      setTimeout(() => {
        this.copiedId.set(null);
      }, 2000);
    });
  }
}
