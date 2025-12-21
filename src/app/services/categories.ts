import { httpResource } from '@angular/common/http';
import { Injectable, computed } from '@angular/core';
import { environment } from '../../environments/environment';
// Modelos
import { Category } from '../shared/classes/category';

export interface CategoryResponse {
  data: Category[];
}

@Injectable({
  providedIn: 'root'
})
export class Categories {

  constructor() { }

  //  EL RECURSO (La petición HTTP reactiva)
  public categoriesResource = httpResource<CategoryResponse>(() => {
    const rlTarget = `${environment.API_URL}public_category/`;
    return { url: rlTarget, method: 'GET' };
  }, { defaultValue: { data: [] } });

  public cleanCategories = computed(() => {
    
    return this.categoriesResource.value()?.data ?? [];
  });

}
