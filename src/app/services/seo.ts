import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { SeoConfig } from '../shared/classes/seo';
import { environment } from '../../environments/environment'; // Para la URL base
@Injectable({
  providedIn: 'root'
})
export class Seo {

  private meta = inject(Meta);
  private titleService = inject(Title);
  private document = inject(DOCUMENT); // Para acceder al DOM y Canonical Link
  
  // Configuración base (Defaults)
  private readonly DOMAIN = 'https://bettjim.com';
  private readonly DOMAIN_IMG = environment.API_URL+'product_imagen/';
  private readonly DEFAULT_IMAGE = 'https://bettjim.com/assets/img/bettjim-social-share.jpg';

  constructor() { }

  /**
   * Método Maestro: Actualiza TODO con un solo objeto
   */
  generateTags(config: SeoConfig) {
    // 1. Preparar datos (Fallbacks)
    const title = config.title ? `${config.title} | Bettjim Collection` : 'Bettjim Collection';
    const description = config.description || 'La mejor tienda de e-commerce en Perú.';
    
    // Asegurar que la imagen sea URL absoluta
    let imageUrl = config.image || this.DEFAULT_IMAGE;
    if (!imageUrl.startsWith('http')) {
      imageUrl = `${this.DOMAIN_IMG}/${imageUrl}`;
    }

    const url = config.slug ? `${this.DOMAIN}/${config.slug}` : this.DOMAIN;
    const type = config.type || 'website';

    // 2. Establecer Title y Meta básicos
    this.titleService.setTitle(title);
    this.setTag('description', description);
    this.setTag('keywords', config.keywords || 'moda, e-commerce, peru, compras online');
    this.setTag('robots', 'index, follow');
    this.setTag('author', 'Bettjim Collection');

    // 3. Open Graph (Facebook / WhatsApp) - Automático
    this.setTag('og:title', config.title); // Sin el "| Bettjim" para que sea más limpio en FB
    this.setTag('og:description', description);
    this.setTag('og:image', imageUrl);
    this.setTag('og:url', url);
    this.setTag('og:type', type);
    this.setTag('og:site_name', 'Bettjim Collection');

    // 4. Twitter Card - Automático
    this.setTag('twitter:card', 'summary_large_image'); // Foto grande
    this.setTag('twitter:title', config.title);
    this.setTag('twitter:description', description);
    this.setTag('twitter:image', imageUrl);

    // 5. Canonical URL (Vital para SEO Google)
    this.createCanonicalLink(url);

    // 6. Si es PRODUCTO, agregamos datos de precio (Rich Pins)
    if (type === 'product' && config.price) {
      this.setTag('product:price:amount', config.price.toString());
      this.setTag('product:price:currency', config.currency || 'PEN');
      if (config.brand) this.setTag('product:brand', config.brand);
      this.setTag('product:availability', config.stock ? 'instock' : 'oos');
    }
  }

  /**
   * Helper privado para no repetir código.
   * Maneja inteligentemente 'name' vs 'property'.
   */
  private setTag(nameOrProperty: string, content: string) {
    if (!content) return;

    // Facebook usa 'property', Twitter y Google usan 'name'
    const isProperty = nameOrProperty.startsWith('og:') || nameOrProperty.startsWith('product:');
    
    const tag = { 
      [isProperty ? 'property' : 'name']: nameOrProperty, 
      content: content 
    };
    
    this.meta.updateTag(tag);
  }

  /**
   * Crea o actualiza el link canónico en el <head>
   * <link rel="canonical" href="..." />
   */
  private createCanonicalLink(url: string) {
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    
    link.setAttribute('href', url);
  }

}
