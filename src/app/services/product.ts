import { Injectable, computed, effect, inject, signal, resource, PLATFORM_ID } from '@angular/core';
import { httpResource, HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Product } from '../shared/classes/product'; // Ajusta la ruta si es necesario
import { Inventory } from '../shared/classes/inventory';
import { environment } from '../../environments/environment';
import { ToastService } from './toast'; // Tu nuevo servicio
import { User } from './user'; // Asumo que estos son tus servicios UserService
import { Auth } from './auth'; // Asumo que estos son tus servicios AuthService
import { isPlatformBrowser } from '@angular/common';

// Interfaces
interface ProductResponse {
  data: Product[];
}
export interface ProductSingResponse {
  data: Product;
}
interface CartResponse {
  data: any[];
  message?: string;
}
interface InventoryResponse {
  data: Inventory[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class Products {

  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private userService = inject(User);
  private authService = inject(Auth);

  // 3. INYECTAMOS EL ID DE LA PLATAFORMA
  private platformId = inject(PLATFORM_ID);

  // public apiUrl: string = environment.API_URL;
  public Currency = { name: 'PEN', currency: 'S/ ', price: 1 };
  public OpenCart = signal(false);
  // ==========================================================
  // 1. SEÑAL ACTIVADORA (Aquí guardaremos el slug que viene de la URL)

  public selectedSlug = signal<string>('');
  // ==========================================================
  // 1. GESTIÓN DE PRODUCTOS
  // ==========================================================
  public searchTerm = signal<string>('');
  //  EL RECURSO (La petición HTTP reactiva)
  public productsResource = httpResource<ProductResponse>(() => {
    const term = this.searchTerm().trim();
    let urlTarget = '';
    if (term) {
      urlTarget = `${environment.API_URL}search_product/${encodeURIComponent(term)}`;
    } else {
      urlTarget = `${environment.API_URL}list_products/`;
    }
    return { url: urlTarget, method: 'GET' };
  }, { defaultValue: { data: [] } });

  public cleanProducts = computed(() => {
    return this.productsResource.value()?.data ?? [];
  });

  //********************************************************************** */

  // 2. EL RECURSO (La petición HTTP reactiva)
  public singleProductResource = httpResource<ProductSingResponse>(() => {
    const slug = this.selectedSlug();

    // Si no hay slug (ej: estamos en otra página), no hacemos petición
    if (!slug) {
      return undefined; // O null, dependiendo de cómo maneje tu librería las pausas
    }

    // Si hay slug, lanzamos la petición
    return {
      url: `${environment.API_URL}get_product_slug/${slug}`,
      method: 'GET'
    };
  }, { defaultValue: { data: {} as Product } });

  // 3. LIMPIAMOS EL RESULTADO (Obtenemos el producto directamente o null)
  public cleanProductSlug = computed(() => {
    // Como el backend devuelve el objeto directo, lo pasamos directo.
    const product = this.singleProductResource.value()?.data;
    return product ?? null;
  });

  //********************************************************************** */


  //  EL RECURSO Inventori (La petición HTTP reactiva)
  public productInventoriResource = httpResource<InventoryResponse>(() => {
    const id = this.getProductBySlug(this.selectedSlug())?._id;
    // Si no hay slug (ej: estamos en otra página), no hacemos petición
    if (!id) {
      return undefined; // O null, dependiendo de cómo maneje tu librería las pausas
    }

    return {
      url: `${environment.API_URL}get_inventory/${id}`,
      method: 'GET'
    };
  }, { defaultValue: { data: [] } });

  public cleanInvetoryProduct = computed(() => {
    return this.productInventoriResource.value()?.data ?? [];
  });

  //
  // Busqueda pos slug
  public getProductBySlug(slug: string) {
    return this.cleanProducts().find(product => product.slug === slug) || null;
  }
  // ==========================================================
  // 2. FILTRADO
  // ==========================================================
  public filterTags = signal<string[]>([]);
  public sortOption = signal<string | null>(null);
  public filterByCategory = signal<string[]>([]);
  // 1. AGREGAMOS LAS SEÑALES DE PRECIO (Con valores por defecto)
  public minPrice = signal<number>(0);
  public maxPrice = signal<number>(10000); // Pon un número alto por defecto o el límite de tu tienda

  public displayProducts = computed(() => {
    let products = this.cleanProducts();
    const filters = this.filterTags();
    const sort = this.sortOption();
    const min = this.minPrice();
    const max = this.maxPrice();

    // A. Filtrado por PRECIO (Nuevo)
    products = products.filter(product =>
      product.price >= min && product.price <= max
    );

    // B. Filtrado por tags (colores, tallas)
    if (filters.length > 0) {
      products = products.filter(item =>
        item.tags ? filters.some(tag => item.tags.includes(tag)) : false
      );
    }
    // C. Filtrado por categoría
    if (this.filterByCategory().length > 0) {
      products = products.filter(product =>
        this.filterByCategory().includes(product.category)
      );
    }
    // D. Ordenamiento (Siempre al final preferiblemente)
    if (sort) {
      products = [...products].sort((a, b) => this.sortLogic(a, b, sort));
    }

    return products;
  });

  
  constructor() {
   
  }

  



  private sortLogic(a: Product, b: Product, sortType: string): number {
    switch (sortType) {
      case 'ascending': return (a.createdAt || '') < (b.createdAt || '') ? -1 : 1;
      case 'a-z': return a.title.localeCompare(b.title);
      case 'z-a': return b.title.localeCompare(a.title);
      case 'low': return a.price - b.price;
      case 'high': return b.price - a.price;
      default: return 0;
    }
  }

  // Creamos una señal computada en lugar de un 'get'
filterByColor = computed(() => {
  const colorMap = new Map<string, string>();

  // AQUÍ ESTÁ LA CORRECCIÓN: Le decimos explícitamente que es un arreglo de Productos (Product[])
  const products: Product[] = this.cleanProducts(); 

  for (const product of products) {
    if (!product.variants) continue; 

    for (const variant of product.variants) {
      if (variant.color && variant.color_code) {
        if (!colorMap.has(variant.color)) {
          colorMap.set(variant.color, variant.color_code);
        }
      }
    }
  }

  return Array.from(colorMap, ([color, color_code]) => ({ color, color_code }));
});

filterBySizes = computed(() => {
  // Usamos Set para almacenar valores únicos (elimina duplicados mágicamente)
  const uniqueSizes = new Set<string>(); 

  const products: Product[] = this.cleanProducts(); 

  for (const product of products) {
    if (!product.variants) continue;

    for (const variant of product.variants) {
      // Verificamos si existe el arreglo de 'sizes' dentro de la variante
      if (variant.sizes && Array.isArray(variant.sizes)) {
        // Recorremos el arreglo de tallas y las agregamos al Set
        for (const size of variant.sizes) {
          uniqueSizes.add(size);
        }
      } 
      // (Opcional) Por si en algún momento guardas la talla como string único 'variant.size'
      else if (variant.size) {
        uniqueSizes.add(variant.size);
      }
    }
  }

  // Convertimos el Set final en un arreglo normal para usarlo en el HTML
  return Array.from(uniqueSizes);
})


}