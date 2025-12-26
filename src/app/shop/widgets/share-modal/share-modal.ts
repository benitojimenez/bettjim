import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-share-modal',
  imports: [CommonModule],
  templateUrl: './share-modal.html',
  styleUrl: './share-modal.scss',
})
export class ShareModal {
  // Inputs: Qué vamos a compartir
  @Input({ required: true }) productUrl!: string;
  @Input() productTitle: string = 'Mira este producto increíble en Bettjim';
  domain = 'https://bettjim.com/product/';
  
  // Output: Para cerrar el modal desde el padre
  @Output() close = new EventEmitter<void>();

  // Estado del botón "Copiar"
  isCopied = signal(false);

  // Lógica para cerrar (click en el fondo o en la X)
  closeModal() {
    this.close.emit();
    this.isCopied.set(false); // Resetear estado
  }

  // Prevenir que el click dentro del modal lo cierre
  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  // Lógica de Copiado al Portapapeles
  async copyLink() {
    try {
      await navigator.clipboard.writeText(this.domain+this.productUrl);
      
      // Feedback Visual
      this.isCopied.set(true);
      setTimeout(() => this.isCopied.set(false), 2000); // Volver a la normalidad en 2s
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  }

  // Lógica para Redes Sociales
  shareTo(platform: 'whatsapp' | 'facebook' | 'twitter' | 'linkedin') {
    const url = encodeURIComponent(this.domain+this.productUrl);
    const text = encodeURIComponent(this.productTitle);
    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter': // X
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
    }

    // Abrir en ventana popup centrada
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    window.open(
      shareUrl, 
      'Compartir', 
      `width=${width},height=${height},top=${top},left=${left},scrollbars=no`
    );
  }

}
