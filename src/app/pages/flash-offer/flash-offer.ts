import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-flash-offer',
  imports: [],
  templateUrl: './flash-offer.html',
  styleUrl: './flash-offer.scss',
})
export default class FlashOffer {

// 1. Inyectamos el Router (nota que se escribe 'router' con 'o')
  private router = inject(Router);

  clicFlashOffer() {
    console.log('¡Oferta flash clickeada!');
    
    // // 2. Navegamos a la ruta
    this.router.navigate(['/checkout/information']);
  }

}
