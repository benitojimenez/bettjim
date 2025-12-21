import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface CreditCard {
  id: string;
  type: 'visa' | 'mastercard' | 'amex';
  last4: string;
  holderName: string;
  expiry: string; // MM/YY
  isDefault: boolean;
  bgGradient: string; // Para el estilo visual
}

@Component({
  selector: 'app-payment-methods',
  imports: [CommonModule],
  templateUrl: './payment-methods.html',
  styleUrl: './payment-methods.scss',
})
export default class PaymentMethods {
  cards = signal<CreditCard[]>([
    {
      id: '1',
      type: 'visa',
      last4: '4242',
      holderName: 'JUAN PEREZ',
      expiry: '12/28',
      isDefault: true,
      bgGradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' // Azul Profundo
    },
    {
      id: '2',
      type: 'mastercard',
      last4: '8899',
      holderName: 'JUAN PEREZ',
      expiry: '09/25',
      isDefault: false,
      bgGradient: 'linear-gradient(135deg, #c31432 0%, #240b36 100%)' // Rojo Oscuro
    }
  ]);

  setDefault(id: string) {
    this.cards.update(list => list.map(c => ({
      ...c,
      isDefault: c.id === id
    })));
  }

  deleteCard(id: string) {
    if(confirm('¿Eliminar esta tarjeta?')) {
      this.cards.update(list => list.filter(c => c.id !== id));
    }
  }

  // Helper para mostrar el logo correcto
  getCardIcon(type: string): string {
    // Retorna rutas simples o nombres de iconos. 
    // En el HTML usaremos SVGs inline para mejor calidad.
    return type;
  }
}
