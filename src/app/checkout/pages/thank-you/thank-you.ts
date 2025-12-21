import { Component, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { Breadcrumbs } from '../../../shared/components/breadcrumbs/breadcrumbs';
import { Auth } from '../../../services/auth';


@Component({
  selector: 'app-thank-you',
  imports: [CommonModule, RouterLink, CommonModule, Breadcrumbs],
  templateUrl: './thank-you.html',
  styleUrl: './thank-you.scss',
  changeDetection:ChangeDetectionStrategy.OnPush,
})
export default class ThankYou {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  public auth = inject(Auth)
  orderData = signal<any>(null);
  orderDetails = signal<any[]>([]);
  isLoading = signal(true);
  URL_IMG = signal<string>(environment.API_URL + 'product_imagen/')
  // orderId = signal<string>('');
  orderId = this.route.snapshot.paramMap.get('id');

 // Breadcrumbs Reactivos
  public breadcrumbs = computed(() => {
    const baseCrumbs = [
      { label: 'Inicio', url: '/' },
      { label: 'Checkout', url: '/checkout' }
    ];
    return [
      ...baseCrumbs,
      {
        label:'Compra Exitosa',
        
      }
    ];
  });
// --- ESTADO INICIAL (Router State) ---
  // Capturamos el estado AQUÍ (en la inicialización), no en ngOnInit
  // private navigation = this.router.currentNavigation();
   navigation = computed(()=>{
    return this.router.currentNavigation()
  })
  private state = this.navigation()?.extras.state as { order: any, details: any } | undefined;
  
// --- SIGNALS DE DATOS ---
  // Inicializamos directamente con lo que vino del router (o null si no vino nada)
  order = signal<any>(this.state?.order || null);
  
 
  items = signal<any[]>(this.state?.details || []);
  // Fecha estimada (Hoy + 5 días)
  estimatedDate = computed(() => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date;
  });

  // --- EXTRAS (Gamificación) ---
  earnedPoints = computed(() => {
    const total = this.order()?.total || 0;
    return Math.floor(total * 0.10); // 10% del total
  });
  ngOnInit() {
   
    
  }
  // 1. Puntos Ganados
  // earnedPoints = signal(24); // 10% del total

  // 2. Recomendaciones (Cross-Sell)
  recommendations = signal([
    { name: 'Medias Invisibles Pack x3', price: 29.90, image: 'https://via.placeholder.com/150' },
    { name: 'Limpiador de Zapatillas', price: 19.90, image: 'https://via.placeholder.com/150' },
    { name: 'Gorra Urbana Negra', price: 49.90, image: 'https://via.placeholder.com/150' }
  ]);

  // // 3. Simular si es Guest (para mostrar crear cuenta)
  // isGuest = signal(true);
}
