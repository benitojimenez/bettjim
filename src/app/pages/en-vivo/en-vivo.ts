import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, computed, ElementRef, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-en-vivo',
  imports: [FormsModule, CommonModule],
  templateUrl: './en-vivo.html',
  styleUrl: './en-vivo.scss',
})
export default class EnVivo  implements AfterViewChecked {
 @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  // Control de pestañas
  activeTab = signal<'chat' | 'products'>('chat');
  
  // Lógica de mensajes
  newMessage = signal('');
  messages = signal([
    { user: 'María P.', text: '¿Tienen talla M en color rosado? 😍', brand: false },
    { user: 'Andrea G.', text: 'Acabo de comprar 2, me encantan!!', brand: false },
    { user: 'Bettjim', text: '¡Bienvenidos al Live! Hagan sus consultas.', brand: true }
  ]);


  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  setTab(tab: 'chat' | 'products') {
    this.activeTab.set(tab);
  }

  sendMessage() {
    const text = this.newMessage().trim();
    if (text) {
      this.messages.update(prev => [...prev, { 
        user: 'Usuario', // Aquí podrías jalar el nombre del usuario logueado
        text: text, 
        brand: false 
      }]);
      this.newMessage.set('');
    }
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  buyProduct(product: any) {
    console.log('Producto añadido al carrito:', product);
    // Aquí conectarías con tu cartService
  }
  // 1. Array dinámico de productos del Live
  liveProducts = signal([
    { 
      id: 'p1', 
      name: 'Pijama de Franela Polar Pinguino', 
      price: 65.00, 
      oldPrice: 90.00, 
      img: 'https://api.bettjim.com/api/product_imagen/pijama-de-franela-para-mujer-2-piezas-conjunto-de-invierno-estampado-1.webp',
      isSticky: true // <--- Este es el que aparecerá sobre el video
    },
    { 
      id: 'p2', 
      name: 'Pijama Térmica Bettjim Invierno', 
      price: 55.00, 
      oldPrice: 75.00, 
      img: 'https://api.bettjim.com/api/product_imagen/pijama-de-franela-para-mujer-2-piezas-conjunto-de-invierno-estampado-1.webp',
      isSticky: false 
    },
    { 
      id: 'p3', 
      name: 'Bata de Dormir Soft Pink', 
      price: 45.00, 
      oldPrice: 60.00, 
      img: 'https://api.bettjim.com/api/product_imagen/pijama-de-franela-para-mujer-2-piezas-conjunto-de-invierno-estampado-1.webp',
      isSticky: false 
    }
  ]);

  // 2. Variable computada para obtener el producto destacado automáticamente
  stickyProduct = computed(() => this.liveProducts().find(p => p.isSticky));

  // Función para cambiar el producto destacado desde la lista
 setSticky(productId: string) {
    this.liveProducts.update(products => 
      products.map(p => {
        if (p.id === productId) {
          // Si es el mismo producto, invertimos su estado (si era true pasa a false)
          return { ...p, isSticky: !p.isSticky };
        } else {
          // Si es cualquier otro producto, lo forzamos a false (solo puede haber uno)
          return { ...p, isSticky: false };
        }
      })
    );
  }
}
