import { Component, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

interface PointTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number; // Positivo (ganado) o Negativo (gastado)
  type: 'earn' | 'redeem' | 'expire';
  orderId?: string;
}
@Component({
  selector: 'app-points',
  imports: [CommonModule,CurrencyPipe,DatePipe],
  templateUrl: './points.html',
  styleUrl: './points.scss',
})
export default class Points {
  // Estado del Usuario
  userLevel = signal({
    currentPoints: 450,
    monetaryValue: 4.50, // 100 puntos = S/ 1.00 (Ejemplo)
    tierName: 'Plata',
    nextTierName: 'Oro',
    pointsToNextTier: 550, // Faltan para llegar a 1000
    tierProgress: 45 // 45% completado
  });

  // Historial de Movimientos
  history = signal<PointTransaction[]>([
    {
      id: 'TRX-998',
      date: new Date(),
      description: 'Compra Pedido #ORD-8821',
      amount: 120,
      type: 'earn',
      orderId: 'ORD-8821'
    },
    {
      id: 'TRX-990',
      date: new Date(Date.now() - 86400000 * 5),
      description: 'Canje Cupón de Descuento',
      amount: -200,
      type: 'redeem'
    },
    {
      id: 'TRX-850',
      date: new Date('2024-01-15'),
      description: 'Bono de Cumpleaños',
      amount: 50,
      type: 'earn'
    },
    {
      id: 'TRX-800',
      date: new Date('2023-12-20'),
      description: 'Vencimiento de puntos 2022',
      amount: -50,
      type: 'expire'
    }
  ]);

  // Helper para clases CSS
  getTypeClass(type: string) {
    switch(type) {
      case 'earn': return 'text-green';
      case 'redeem': return 'text-orange';
      case 'expire': return 'text-gray';
      default: return '';
    }
  }

  getTypeIcon(type: string) {
    // Retorna path del SVG según tipo
    return type === 'earn' 
      ? 'M12 6v6m0 0v6m0-6h6m-6 0H6' // Plus
      : 'M20 12H4'; // Minus
  }
}
