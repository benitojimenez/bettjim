import { Component, computed, effect, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Products } from '../../services/product';
import { ProductTwo } from '../../shared/components/product/product-two/product-two';
//widgets
import { StoriesSlider } from '../widgets/stories-slider/stories-slider';
import { ProductSlider } from '../widgets/product-slider/product-slider';
import { HeroSlider } from "../widgets/hero-slider/hero-slider";
import { Seo } from '../../services/seo';
import { TrustBadges } from "../../shared/components/trust-badges/trust-badges";
import { CategoryGrid } from "../widgets/category-grid/category-grid";
import { Brand } from "../widgets/brand/brand";

@Component({
  selector: 'app-fashion-one',
  imports: [CommonModule, ProductSlider, HeroSlider, TrustBadges, CategoryGrid, Brand],
  templateUrl: './fashion-one.html',
  styleUrl: './fashion-one.scss',
})
export class FashionOne implements OnInit {
  ps = inject(Products);
  seo = inject(Seo);

  // 1. Capturamos el contenedor del HTML
  @ViewChild('storiesList') storiesList!: ElementRef;
 
    // ESTA ES LA MAGIA:
  public top10Products = computed(() => {
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
  ngOnInit() {
    // Configurar SEO para la página de inicio de moda
    this.seo.generateTags({
       title: 'Bettjim.com | Tu mundo a un clic de distancia',
      description: 'Bettjim.com es una tienda online peruana de tecnología, moda, belleza y más. Descubre productos innovadores y confiables. Compra ahora y vive la experiencia Bettjim.',
      keywords: 'Moda, tienda de moda, ropa en línea, accesorios de moda, tendencias de moda 2026, estilo personal, compras de moda, moda sostenible, ropa casual, ropa formal, calzado de moda, bolsos y carteras, joyería de moda, moda para hombres, moda para mujeres, moda unisex, moda de verano, moda de invierno, moda urbana, moda vintage, moda de lujo',
      type: 'website',
      image: 'obtener_logo/bettjim.png'
    });
  }
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

