import { httpResource } from '@angular/common/http';
import { computed, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { Ads } from '../shared/classes/ads';

// Interfaces
interface AdsResponse {
  data: Ads[];
}

@Injectable({
  providedIn: 'root'
})
export class AdsService {
  // Inyectamos la detección de plataforma
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  constructor() { }

  // EL RECURSO (La petición HTTP reactiva segura para SSR)
  public AdsResource = httpResource<AdsResponse>(() => {
    // 🔥 Si no estamos en el navegador, suspendemos la petición.
    // Esto evita bloqueos de Firewall y el error de estabilidad.
    if (!this.isBrowser) return undefined;

    const urlTarget = `${environment.API_URL}get_ads/`;

    return { 
      url: urlTarget, 
      method: 'GET' 
    };
  }, { defaultValue: { data: [] } });

  // Computed para exponer los datos limpios
  public cleanAds = computed(() => {
    return this.AdsResource.value()?.data ?? [];
  });
}