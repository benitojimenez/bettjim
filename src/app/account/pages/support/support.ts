import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
  isOpen: boolean;
}
@Component({
  selector: 'app-support',
  imports: [CommonModule,FormsModule],
  templateUrl: './support.html',
  styleUrl: './support.scss',
})
export default class Support {
  searchTerm = signal('');

  // Categorías visuales
  topics = [
    { id: 'shipping', label: 'Envíos y Seguimiento', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
    { id: 'returns', label: 'Cambios y Devoluciones', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
    { id: 'payment', label: 'Pagos y Facturación', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { id: 'account', label: 'Mi Cuenta', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
  ];

  // Preguntas Frecuentes
  faqs = signal<FaqItem[]>([
    {
      category: 'shipping',
      question: '¿Cuánto tarda en llegar mi pedido?',
      answer: 'Para Lima Metropolitana el tiempo es de 1 a 2 días hábiles. Para provincias, el tiempo estimado es de 3 a 5 días hábiles dependiendo del destino.',
      isOpen: false
    },
    {
      category: 'returns',
      question: '¿Cómo puedo devolver un producto?',
      answer: 'Tienes 7 días calendario desde la recepción. Ve a la sección "Mis Pedidos", selecciona el pedido y haz clic en "Solicitar Devolución".',
      isOpen: false
    },
    {
      category: 'payment',
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos todas las tarjetas de crédito/débito (Visa, Mastercard, Amex), Yape, Plin y PagoEfectivo.',
      isOpen: false
    },
    {
      category: 'account',
      question: 'Olvidé mi contraseña, ¿qué hago?',
      answer: 'Ve a la pantalla de inicio de sesión y pulsa en "¿Olvidaste tu contraseña?". Te enviaremos un enlace a tu correo para restablecerla.',
      isOpen: false
    }
  ]);

  // Filtrado de FAQs
  filteredFaqs = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.faqs();
    
    return this.faqs().filter(f => 
      f.question.toLowerCase().includes(term) || 
      f.answer.toLowerCase().includes(term)
    );
  });

  toggleFaq(index: number) {
    // Actualizamos la lista invirtiendo el estado del item seleccionado
    this.faqs.update(list => {
      const newList = [...list];
      // Opcional: Cerrar los otros al abrir uno (Acordeón estricto)
      // newList.forEach((item, i) => { if(i !== index) item.isOpen = false; });
      
      newList[index].isOpen = !newList[index].isOpen;
      return newList;
    });
  }

  filterByTopic(category: string) {
    // Simulación: Pone el nombre de la categoría en el buscador
    // En una app real, podrías filtrar la lista directamente.
    this.searchTerm.set('');
    // Aquí podrías filtrar `faqs` solo por categoría si quisieras
    alert(`Filtrando por: ${category}`);
  }
}
