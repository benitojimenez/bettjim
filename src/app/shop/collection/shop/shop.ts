import { Variants } from './../../../shared/classes/product';
import { Component, inject, OnInit, signal } from '@angular/core';
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
  public URL_IMG: string = environment.API_URL + 'product_imagen/';
  // Servicios
  public ps = inject(Products);
  public categories = inject(Categories);
  public layout = inject(LayoutService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public seo = inject(Seo);


  // Estado UI
  public showCartDetail = false;
  // Estado del Producto y UI
  public activeImage = signal<string>('');
  // Señal para categoría activa
  activeCategory = signal<string>('');
  // Categorías
  // categoriesList = this.categories.cleanProducts();

  // 1. CAMBIO: La señal ahora es un ARRAY de strings, no un string suelto
  activeColors = signal<string[]>([]);
  //Sizes 
  activeSizes = signal<string[]>([]);
  // Configuración de Precios
  maxLimit = 1000; // El precio más alto posible en tu tienda
  minVal = signal(0);
  maxVal = signal(1000);
  // Método para actualizar la búsqueda
  onSearch(term: string) {
    // Al setear la señal, el httpResource en el servicio se dispara automáticamente
    this.ps.searchTerm.set(term);
  }
  ngOnInit() {
    // Configurar SEO para la página de inicio de moda
    this.seo.generateTags({
      title: 'Bettjim.com | Tu mundo a un clic de distancia',
      description: 'Bettjim.com es una tienda online peruana de tecnología, moda, belleza y más. Descubre productos innovadores y confiables. Compra ahora y vive la experiencia Bettjim. ',
      slug: 'shop',
      keywords: 'Moda, tienda de moda, ropa en línea, accesorios de moda, tendencias de moda 2026, estilo personal, compras de moda, moda sostenible, ropa casual, ropa formal, calzado de moda, bolsos y carteras, joyería de moda, moda para hombres, moda para mujeres, moda unisex, moda de verano, moda de invierno, moda urbana, moda vintage, moda de lujo, belleza, tienda de belleza, productos de belleza en línea, cuidado de la piel, maquillaje, fragancias, cosméticos, tecnología, gadgets, electrónica de consumo, ofertas tecnológicas, reseñas de productos tecnológicos',
      type: 'website',
      image: 'obtener_logo/bettjim.png'
    });

    // 🔥 EL CEREBRO: Escucha la URL y decide qué mostrar
    this.route.queryParams.subscribe(params => {
      // 1. Search 
      // --- 1. SEARCH & CATEGORY (Tu lógica actual) ---
      const searchTerm = params['q'];
      const categoryFilter = params['cat'];

      this.activeCategory.set(categoryFilter || '');

      if (searchTerm) {
        this.ps.searchTerm.set(searchTerm);
        this.ps.filterByCategory.set([]);
      } else if (categoryFilter) {
        this.ps.filterByCategory.set([categoryFilter]);
        this.ps.searchTerm.set('');
      } else {
        this.ps.searchTerm.set('');
        this.ps.filterByCategory.set([]);
      }
      // --- LÓGICA DE PRECIO ---
      const min = params['minPrice'];
      const max = params['maxPrice'];

      // 1. Actualiza señales locales del componente (para el slider visual)
      const minNum = min ? Number(min) : 0;
      const maxNum = max ? Number(max) : 1000;
      
      this.minVal.set(minNum);
      this.maxVal.set(maxNum);

      // 2. Actualiza señales del SERVICIO (para el filtrado real)
      this.ps.minPrice.set(minNum);
      this.ps.maxPrice.set(maxNum);
      
      // A. Colores
      const colorParam = params['color'];
      const colorsArray = colorParam ? colorParam.split(',') : [];
      this.activeColors.set(colorsArray); // Actualizamos UI

      // B. Tallas
      const sizeParam = params['size'];
      const sizesArray = sizeParam ? sizeParam.split(',') : [];
      this.activeSizes.set(sizesArray); // Actualizamos UI

      // --- 3. 🔥 UNIFICACIÓN Y ENVÍO AL SERVICIO 🔥 ---
      // Combinamos ambos arrays. Si tu backend espera 'tags' genéricos:
      const allTags = [...colorsArray, ...sizesArray];

      // Enviamos TODO junto al servicio
      this.ps.filterTags.set(allTags);
    });
  }

  // 1. Navegación para Categorías
  onCategoryChange(selectedCat: string) {
    const newCat = this.activeCategory() === selectedCat ? null : selectedCat;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { cat: newCat },
      queryParamsHandling: 'merge',
    });
  }
  // 1. Actualiza el valor VISUAL mientras arrastras (Input event)
  updateMin(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    // Evita que el min supere al max - 10 (margen de seguridad)
    if (value >= this.maxVal() - 50) {
      this.minVal.set(this.maxVal() - 50);
      (event.target as HTMLInputElement).value = this.minVal().toString();
    } else {
      this.minVal.set(value);
    }
  }

  updateMax(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    // Evita que el max sea menor al min + 10
    if (value <= this.minVal() + 50) {
      this.maxVal.set(this.minVal() + 50);
      (event.target as HTMLInputElement).value = this.maxVal().toString();
    } else {
      this.maxVal.set(value);
    }
  }

  // 2. Actualiza la URL cuando sueltas el slider (Change event)
  applyPriceFilter() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { 
        minPrice: this.minVal(), 
        maxPrice: this.maxVal() 
      },
      queryParamsHandling: 'merge',
    });
  }

  // 2. FUNCIÓN: Añadir o Quitar color del array

  onColorChange(selectedColor: string) {
    // 1. Obtenemos el valor actual (garantizado que es un array gracias al paso 1 y 2)
    const currentColors = this.activeColors();

    let updatedColors: string[];

    // 2. Lógica de Array
    if (currentColors.includes(selectedColor)) {
      // Si existe, lo filtramos (quitamos)
      updatedColors = currentColors.filter(c => c !== selectedColor);
    } else {
      // Si no existe, lo agregamos al array
      updatedColors = [...currentColors, selectedColor];
    }

    // 3. Convertir de nuevo a String para la URL
    const paramValue = updatedColors.length > 0 ? updatedColors.join(',') : null;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { color: paramValue },
      queryParamsHandling: 'merge',
    });
  }

  // 3. Función de cambio (Idéntica a onColorChange pero con 'size')
  onSizeChange(size: string) {
    const currentSizes = this.activeSizes();
    let updatedSizes: string[];

    // A. Si ya existe, lo quitamos
    if (currentSizes.includes(size)) {
      updatedSizes = currentSizes.filter(s => s !== size);
    } else {
      // B. Si no existe, lo agregamos
      updatedSizes = [...currentSizes, size];
    }

    // C. Actualizar URL
    const paramValue = updatedSizes.length > 0 ? updatedSizes.join(',') : null;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { size: paramValue },
      queryParamsHandling: 'merge',
    });
  }

  // Ordenamiento
  onSort(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.ps.sortOption.set(value);
  }

  // UI Carrito
  toggleCart() {
    this.showCartDetail = !this.showCartDetail;
  }

  // Reset Total
  resetFilters() {
    this.router.navigate(['/shop']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    this.layout.closeFilter();
  }
  // Navegación de Galería
  changeImage(src: string) {
    this.activeImage.set(src);
  }
}
