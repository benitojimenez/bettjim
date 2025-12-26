import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { SeoConfig } from '../shared/classes/seo';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Seo {

  private meta = inject(Meta);
  private titleService = inject(Title);
  private document = inject(DOCUMENT);
  
  // Configuración base
  private readonly DOMAIN = 'https://bettjim.com';
  // Fallback seguro por si API_URL no viene
  private readonly DOMAIN_IMG = environment.API_URL || 'https://api.bettjim.com'; 
  private readonly DEFAULT_IMAGE = 'https://bettjim.com/assets/img/bettjim-social-share.jpg';

  constructor() { }

  generateTags(config: SeoConfig) {
    // 0. LIMPIEZA DE TAGS FANTASMAS (Paso Nuevo y Crítico)
    // Borramos tags de producto anteriores para que no contaminen páginas que no son productos
    this.resetProductTags();

    // 1. Preparar datos
    const title = config.title ? `${config.title}` : 'Bettjim.com | Tu Mundo, a un click';
    const description = config.description || 'La mejor tienda de e-commerce en Perú.';
    
    let imageUrl = config.image || this.DEFAULT_IMAGE;
    // Validación más robusta para imágenes relativas
    if (imageUrl && !imageUrl.startsWith('http')) {
      // Quitamos slash inicial si existe para evitar doble slash //
      const cleanImgPath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
      imageUrl = `${this.DOMAIN_IMG}${cleanImgPath}`;
    }

    const url = config.slug ? `${this.DOMAIN}/${config.slug}` : this.DOMAIN;
    const type = config.type || 'website';

    // 2. Título y Meta básicos (Estos se sobrescriben, no hay problema)
    this.titleService.setTitle(title);
    this.setTag('description', description);
    this.setTag('keywords', config.keywords || 'moda, e-commerce, peru, compras online');
    this.setTag('robots', 'index, follow');
    
    // 3. Open Graph
    this.setTag('og:title', config.title || 'Bettjim'); 
    this.setTag('og:description', description);
    this.setTag('og:image', imageUrl);
    this.setTag('og:url', url);
    this.setTag('og:type', type);
    this.setTag('og:site_name', 'Bettjim');

    // 4. Twitter Card
    this.setTag('twitter:card', 'summary_large_image');
    this.setTag('twitter:title', config.title || 'Bettjim');
    this.setTag('twitter:description', description);
    this.setTag('twitter:image', imageUrl);

    // 5. Canonical
    this.createCanonicalLink(url);

    // 6. Datos de Producto (Solo si aplica)
    if (type === 'product') {
      if (config.price) {
        this.setTag('product:price:amount', config.price.toString());
        this.setTag('product:price:currency', config.currency || 'PEN');
      }
      if (config.brand) this.setTag('product:brand', config.brand);
      
      // Stock logic
      const availability = config.stock && !config.stock ? 'instock' : 'oos';
      
      this.setTag('product:availability', availability);
    }
  }

  // --- MÉTODOS PRIVADOS ---

  /**
   * Elimina tags específicos de e-commerce.
   * Se debe llamar al inicio para evitar que un producto "manche" el SEO del Home.
   */
  private resetProductTags() {
    this.meta.removeTag('property="product:price:amount"');
    this.meta.removeTag('property="product:price:currency"');
    this.meta.removeTag('property="product:brand"');
    this.meta.removeTag('property="product:availability"');
    // Si usas categorías en meta
    this.meta.removeTag('property="product:category"'); 
  }

  private setTag(nameOrProperty: string, content: string) {
    if (!content) return;
    const isProperty = nameOrProperty.startsWith('og:') || nameOrProperty.startsWith('product:');
    this.meta.updateTag({ 
      [isProperty ? 'property' : 'name']: nameOrProperty, 
      content: content 
    });
  }

  private createCanonicalLink(url: string) {
    // Buscamos el link existente
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    
    // Si no existe, lo creamos
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    
    // Actualizamos SIEMPRE la URL
    link.setAttribute('href', url);
  }
}