import { Component, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

interface PendingReview {
  id: string;
  orderId: string;
  productName: string;
  productImage: string;
  deliveredDate: Date;
  slug: string;
}

interface PublishedReview {
  id: string;
  productName: string;
  productImage: string;
  rating: number; // 1-5
  comment: string;
  date: Date;
  status: 'published' | 'pending_moderation';
  slug: string;
}
@Component({
  selector: 'app-reviews',
  imports: [CommonModule,DatePipe,RouterLink],
  templateUrl: './reviews.html',
  styleUrl: './reviews.scss',
})
export default class Reviews {
  activeTab = signal<'pending' | 'history'>('pending');

  // Productos entregados que aún no se han calificado
  pendingList = signal<PendingReview[]>([
    {
      id: '1',
      orderId: 'ORD-8821',
      productName: 'Casaca Denim Oversize',
      productImage: 'https://via.placeholder.com/80',
      deliveredDate: new Date(Date.now() - 86400000 * 2), // Hace 2 días
      slug: 'casaca-denim'
    },
    {
      id: '2',
      orderId: 'ORD-8815',
      productName: 'Zapatillas Urban Chunky',
      productImage: 'https://via.placeholder.com/80',
      deliveredDate: new Date(Date.now() - 86400000 * 10),
      slug: 'zapatillas-urban'
    }
  ]);

  // Reseñas ya escritas
  historyList = signal<PublishedReview[]>([
    {
      id: '101',
      productName: 'Polo Básico Algodón',
      productImage: 'https://via.placeholder.com/80',
      rating: 5,
      comment: 'Me encantó la calidad de la tela, es muy suave y el ajuste es perfecto. Definitivamente compraré en otros colores.',
      date: new Date('2023-11-15'),
      status: 'published',
      slug: 'polo-basico'
    },
    {
      id: '102',
      productName: 'Gorra Urbana Negra',
      productImage: 'https://via.placeholder.com/80',
      rating: 4,
      comment: 'Está buena, pero llegó un poco aplastada en la caja. El material es excelente.',
      date: new Date('2023-10-20'),
      status: 'published',
      slug: 'gorra-urbana'
    }
  ]);

  // Helper para generar array de estrellas
  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }
}
