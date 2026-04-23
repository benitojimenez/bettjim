import { Variants } from './../../../shared/classes/product';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { DiscountPipe } from '../../../shared/pipes/discount-pipe';
import { Products } from '../../../services/product';
import { LayoutService } from '../../../services/Layout';
import { Categories} from '../../../services/categories';
import { ProductOne } from '../../../shared/components/product/product-one/product-one';
import { ProductTwo } from '../../../shared/components/product/product-two/product-two';
import { Seo } from '../../../services/seo';

@Component({
  selector: 'app-shop',
  imports: [CommonModule, ProductTwo],
  templateUrl: './shop.html',
  styleUrl: './shop.scss',
})
export default class Shop implements OnInit {
  // ==========================================
  // 💉 1. DEPENDENCIAS
  // ==========================================
  public productService = inject(Products);
  public categories = inject(Categories);
  public layout = inject(LayoutService);
  public route = inject(ActivatedRoute);
  private router = inject(Router);
  public seo = inject(Seo);

  // ==========================================
  // 🎛️ 2. ESTADO DE LA UI
  // ==========================================
  public URL_IMG: string = environment.API_URL + 'product_imagen/';
  public showCartDetail = false;
  public activeImage = signal<string>('');
  
  // Conexión directa con el Resource
  isLoading = this.productService.productsResource.isLoading;
  pagination = this.productService.productPagination;
  error = this.productService.productsResource.error;

  // Enlazamos variables locales directamente a las del servicio para facilidad de lectura en HTML
  searchQuery = this.productService.search;
  activeCategory = this.productService.category;
  activeColors = this.productService.color;
  activeSizes = this.productService.size;

  // Precios
  maxLimit = 1000;
  minVal = signal(0);
  maxVal = signal(1000);

  // Computados de Paginación
  hasNext = computed(() => this.pagination()?.hasNextPage ?? false);
  hasPrev = computed(() => this.pagination()?.hasPrevPage ?? false);
  visiblePages = computed(() => {
    const pag = this.pagination();
    if (!pag) return [];
    const current = pag.currentPage;
    const total = pag.totalPages;
    const pages: number[] = [];
    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);
    if (current <= 2 && total >= 5) end = 5;
    if (current >= total - 1 && total >= 5) start = total - 4;
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  // ==========================================
  // 🚀 3. EL CEREBRO REACTIVO (effect)
  // ==========================================
  constructor() {
    // EL EFFECT MANDA: Si CUALQUIER Signal cambia, la URL se actualiza automáticamente.
   effect(() => {
      const page = this.productService.page();
      const search = this.productService.search();
      const category = this.productService.category();
      const price = this.productService.price();
      
      // 🧹 LIMPIEZA EXTREMA: Quitamos cualquier string vacío o nulo del array
      const colorArr = this.productService.color().filter(c => c && c.trim() !== '');
      const sizeArr = this.productService.size().filter(s => s && s.trim() !== '');

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { 
          page: page === 1 ? null : page,
          search: search || null,
          category: category || null,
          price: price || null,
          // Si el array limpio tiene elementos, los une con coma. Si no, manda null para borrarlo de la URL
          color: colorArr.length > 0 ? colorArr.join(',') : null,
          size: sizeArr.length > 0 ? sizeArr.join(',') : null,
        },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    });
  }

  ngOnInit() {
    this.seo.generateTags({
      title: 'Bettjim.com | Tu mundo a un clic de distancia',
      description: 'Descubre productos innovadores y confiables.',
      slug: 'shop',
      image: 'obtener_logo/bettjim.png'
    });

    // LECTURA INICIAL (Solo una vez al cargar la página si el usuario entra por un link compartido)
    const params = this.route.snapshot.queryParams;
    
    if (params['page']) this.productService.page.set(Number(params['page']));
    if (params['search']) this.productService.search.set(params['search']);
    if (params['category']) this.productService.category.set(params['category']);
    
    if (params['color']) {
      // Separa por comas y elimina los vacíos
      const cleanColors = params['color'].split(',').filter((c: string) => c.trim() !== '');
      this.productService.color.set(cleanColors);
    }
    
    if (params['size']) {
      const cleanSizes = params['size'].split(',').filter((s: string) => s.trim() !== '');
      this.productService.size.set(cleanSizes);
    }
    
    if (params['price']) {
      const [min, max] = params['price'].split('-');
      this.minVal.set(Number(min) || 0);
      this.maxVal.set(Number(max) || this.maxLimit);
      this.productService.price.set(params['price']);
    }
  }

  // ==========================================
  // 🖱️ 4. ACCIONES (Solo actualizan Signals)
  // ==========================================

  onCategoryChange(selectedCat: string) {
    const newCat = this.activeCategory() === selectedCat ? '' : selectedCat;
    this.productService.category.set(newCat);
    this.productService.page.set(1); // Siempre volver a pag 1 al filtrar
  }

  onColorChange(selectedColor: string) {
    const current = this.activeColors();
    const updated = current.includes(selectedColor) 
      ? current.filter(c => c !== selectedColor) 
      : [...current, selectedColor];

    this.productService.color.set(updated);
    this.productService.page.set(1);
  }

  onSizeChange(size: string) {
    const current = this.activeSizes();
    const updated = current.includes(size) 
      ? current.filter(s => s !== size) 
      : [...current, size];

    this.productService.size.set(updated);
    this.productService.page.set(1);
  }

  updateMin(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    if (value >= this.maxVal() - 50) {
      this.minVal.set(this.maxVal() - 50);
      (event.target as HTMLInputElement).value = this.minVal().toString();
    } else {
      this.minVal.set(value);
    }
  }

  updateMax(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    if (value <= this.minVal() + 50) {
      this.maxVal.set(this.minVal() + 50);
      (event.target as HTMLInputElement).value = this.maxVal().toString();
    } else {
      this.maxVal.set(value);
    }
  }

  applyPriceFilter() {
    this.productService.price.set(`${this.minVal()}-${this.maxVal()}`);
    this.productService.page.set(1);
  }

  onSort(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.productService.sortOption.set(value); 
  }

  resetFilters() {
    // Reseteamos todas las Signals. El effect limpiará la URL y el Resource hará la petición.
    this.productService.search.set('');
    this.productService.category.set('');
    this.productService.color.set([]);
    this.productService.size.set([]);
    this.productService.price.set('');
    this.productService.page.set(1);
    
    this.minVal.set(0);
    this.maxVal.set(this.maxLimit);
    
    this.layout.closeFilter();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================
  // 📄 5. PAGINACIÓN 
  // ==========================================

  nextPage() {
    if (this.hasNext()) {
      this.productService.page.update(p => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevPage() {
    if (this.hasPrev()) {
      this.productService.page.update(p => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToPage(page: number) {
    if (page !== this.pagination()?.currentPage) {
      this.productService.page.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ==========================================
  // 🛠️ 6. HELPERS
  // ==========================================
  toggleCart() {
    this.showCartDetail = !this.showCartDetail;
  }

  changeImage(src: string) {
    this.activeImage.set(src);
  }
}
