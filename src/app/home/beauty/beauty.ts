import { Component, ElementRef, AfterViewInit, ViewChildren, QueryList, signal, PLATFORM_ID, inject, ChangeDetectionStrategy, computed, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Products } from '../../services/product';
//widgets
import { StoriesSlider } from '../widgets/stories-slider/stories-slider';
import { ProductSlider } from '../widgets/product-slider/product-slider';
@Component({
  selector: 'app-beauty',
  imports: [CommonModule, StoriesSlider, ProductSlider],
  templateUrl: './beauty.html',
  styleUrl: './beauty.scss',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class Beauty {

 ps = inject(Products);
 
  // 1. Capturamos el contenedor del HTML
  @ViewChild('storiesList') storiesList!: ElementRef;
 
    // ESTA ES LA MAGIA:
  public top10Products = computed(() => {
    // this.ps.filterByCategory.set(['fashion'])
    // 1. Obtenemos la lista completa (que ya se habrá actualizado gracias al efecto de arriba)
    const allProducts = this.ps.displayProducts();

    // 2. Obtenemos el producto actual
    // const currentProduct = this.ps.cleanProductSlug();

    // // 3. Filtramos: Quitamos el producto actual para no duplicarlo
    // let filtered = allProducts;

    // if (currentProduct) {
    //   filtered = filtered.filter(p => p._id !== currentProduct._id);
    // }

    // console.log('Productos filtrados para top 10:', filtered);

    // 4. Retornamos solo los primeros 10
    return allProducts.slice(0,10 );
  });
  // Signals para los datos
  categories = signal([
    { name: 'Skin Care', img: 'https://euroestetika.com/wp-content/uploads/2023/07/13.skincare.jpg' },
    { name: 'Maquillaje', img: 'https://img.freepik.com/foto-gratis/coleccion-productos-maquillaje-belleza_23-2148620012.jpg?semt=ais_hybrid&w=740&q=80' },
    { name: 'Fragancias', img: 'https://latincompany.com.ec/responsive/wp-content/uploads/2018/07/Banner-post-que-son-fragancia2.jpg' },
    { name: 'Cabello', img: 'https://img.freepik.com/foto-gratis/rutina-nocturna-golpes-cabello-mujer-tiro-medio_23-2150396539.jpg?semt=ais_hybrid&w=740&q=80' },
    { name: 'Sets', img: 'https://thumbs.dreamstime.com/b/productos-cosm%C3%A9ticos-de-fondo-rosa-concepto-maquillaje-belleza-jars-botellas-cremas-accesorios-para-el-cuidado-la-piel-generado-385622576.jpg' },
     { name: 'Skin Care', img: 'https://euroestetika.com/wp-content/uploads/2023/07/13.skincare.jpg' },
    { name: 'Maquillaje', img: 'https://img.freepik.com/foto-gratis/coleccion-productos-maquillaje-belleza_23-2148620012.jpg?semt=ais_hybrid&w=740&q=80' },
    { name: 'Fragancias', img: 'https://latincompany.com.ec/responsive/wp-content/uploads/2018/07/Banner-post-que-son-fragancia2.jpg' },
    { name: 'Cabello', img: 'https://img.freepik.com/foto-gratis/rutina-nocturna-golpes-cabello-mujer-tiro-medio_23-2150396539.jpg?semt=ais_hybrid&w=740&q=80' },
    { name: 'Sets', img: 'https://thumbs.dreamstime.com/b/productos-cosm%C3%A9ticos-de-fondo-rosa-concepto-maquillaje-belleza-jars-botellas-cremas-accesorios-para-el-cuidado-la-piel-generado-385622576.jpg' },
   
  ]);

  hotSaleProducts = signal([
    { title: 'Serum Vitamina C', price: 89.90, oldPrice: 120.00, image: 'assets/img/prod1.jpg', rating: 4.8 },
    { title: 'Labial Matte Red', price: 45.00, oldPrice: 60.00, image: 'assets/img/prod2.jpg', rating: 4.5 },
    { title: 'Paleta Sombras', price: 150.00, oldPrice: 210.00, image: 'assets/img/prod3.jpg', rating: 4.9 },
    { title: 'Crema Hidratante', price: 70.00, oldPrice: 95.00, image: 'assets/img/prod4.jpg', rating: 4.7 },
    { title: 'Serum Vitamina C', price: 89.90, oldPrice: 120.00, image: 'assets/img/prod1.jpg', rating: 4.8 },
    { title: 'Labial Matte Red', price: 45.00, oldPrice: 60.00, image: 'assets/img/prod2.jpg', rating: 4.5 },
    { title: 'Paleta Sombras', price: 150.00, oldPrice: 210.00, image: 'assets/img/prod3.jpg', rating: 4.9 },
    { title: 'Crema Hidratante', price: 70.00, oldPrice: 95.00, image: 'assets/img/prod4.jpg', rating: 4.7 },
    { title: 'Serum Vitamina C', price: 89.90, oldPrice: 120.00, image: 'assets/img/prod1.jpg', rating: 4.8 },
    { title: 'Labial Matte Red', price: 45.00, oldPrice: 60.00, image: 'assets/img/prod2.jpg', rating: 4.5 },
    { title: 'Paleta Sombras', price: 150.00, oldPrice: 210.00, image: 'assets/img/prod3.jpg', rating: 4.9 },
    { title: 'Crema Hidratante', price: 70.00, oldPrice: 95.00, image: 'assets/img/prod4.jpg', rating: 4.7 },
    { title: 'Serum Vitamina C', price: 89.90, oldPrice: 120.00, image: 'assets/img/prod1.jpg', rating: 4.8 },
    { title: 'Labial Matte Red', price: 45.00, oldPrice: 60.00, image: 'assets/img/prod2.jpg', rating: 4.5 },
    { title: 'Paleta Sombras', price: 150.00, oldPrice: 210.00, image: 'assets/img/prod3.jpg', rating: 4.9 },
    { title: 'Crema Hidratante', price: 70.00, oldPrice: 95.00, image: 'assets/img/prod4.jpg', rating: 4.7 },
  ]);

  bestSellers = signal([
    { title: 'Base Cobertura Total', price: 99.00, image: 'assets/img/prod5.jpg' },
    { title: 'Mascara Volumen', price: 39.00, image: 'assets/img/prod6.jpg' },
    { title: 'Exfoliante Corporal', price: 55.00, image: 'assets/img/prod7.jpg' },
    { title: 'Aceite Facial', price: 110.00, image: 'assets/img/prod8.jpg' },
  ]);

  mostViewed = signal([
    { title: 'Rutina Glass Skin', image: 'assets/img/trend1.jpg' },
    { title: 'Look Noche de Gala', image: 'assets/img/trend2.jpg' },
    { title: 'Essentials de Verano', image: 'assets/img/trend3.jpg' },
  ]);

  trendingKeywords = ['GlassSkin', 'CleanGirlAesthetic', 'VeganBeauty', 'CrueltyFree', 'BettjimGlow', 'SelfCare'];
  // 2. Función para mover el scroll
  scrollList(direction: 'left' | 'right') {
    const container = this.storiesList.nativeElement;
    // Cantidad a desplazar (ajusta a tu gusto, 200px es suave)
    const scrollAmount = 300; 
    
    // Cálculo de la nueva posición
    const scrollTo = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;

    // Ejecutar el scroll suave
    container.scrollTo({
      left: scrollTo,
      behavior: 'smooth'
    });
  }

}
