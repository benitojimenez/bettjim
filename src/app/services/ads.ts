import { httpResource } from '@angular/common/http';
import { computed, Injectable } from '@angular/core';
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

  constructor() { }

    //  EL RECURSO (La petición HTTP reactiva)
  public AdsResource = httpResource<AdsResponse>(() => {

    const urlTarget = `${environment.API_URL}get_ads/`;

    return { url: urlTarget, method: 'GET' };
  }, { defaultValue: { data: [] } });

  public cleanAds = computed(() => {
    return this.AdsResource.value()?.data ?? [];
  });

}
