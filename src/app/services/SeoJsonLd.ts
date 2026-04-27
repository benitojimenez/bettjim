import { Injectable, Inject, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../environments/environment';
import { Cart } from './cart'; // Asegúrate de que la ruta sea correcta

@Injectable({
  providedIn: 'root'
})
export class SeoJsonLd {
  private renderer: Renderer2;
  private url: string = environment.API_URL + 'product_imagen/';
  private urlDomain: string = 'https://bettjim.com/';

  constructor(
    @Inject(DOCUMENT) private document: Document,
    rendererFactory: RendererFactory2,
    private cartService: Cart // Inyectamos tu servicio de carrito para los cálculos de descuento
  ) {
    // En un servicio no podemos inyectar Renderer2 directamente, usamos el Factory
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Genera e inyecta el esquema de Producto (Product Object)
   */
  public addJsonLdScript(product: any, inventories: any[]) {
    if (!product) return;

    // --- PASO 1: Determinar disponibilidad ---
    const variantsInfo = product.variants?.map((variant: any) => {
      const sizesArray = Array.isArray(variant.sizes) ? variant.sizes : [variant.size];
      const hasAnyStock = sizesArray.some((size: string) => {
        const inventoryItem = inventories.find((item: any) => 
          item.variant?.color === variant.color && item.variant?.size === size || 
          item.color === variant.color && item.size === size
        );
        return (inventoryItem?.stock || 0) > 0;
      });
      return { stock: hasAnyStock ? 1 : 0 };
    }) || [];

    const isProductInStock = this.checkProductStock(product, variantsInfo);

    // --- PASO 2: Preparar Datos ---
    const productIdBase = product._id?.$oid || product._id || product.id || "";
    const images = product.images?.map((img: any) => `${this.url}${img.src}`) || [];
    
    // Fecha de validez obligatoria para Merchant Center (1 año desde hoy)
    const validUntilDate = new Date();
    validUntilDate.setFullYear(validUntilDate.getFullYear() + 1);

    const discountPercent = parseFloat(product.discount) || 0;
    const discountActive = discountPercent > 0 && (product.discount_start || product.start_discount) && (product.discount_end || product.end_discount);
    const discountedPrice = this.cartService.getDiscount(product);
    const productUrl = `${this.urlDomain}p/${product.slug}`;

    // --- PASO 3: Construir Schema ---
    const productSchema: any = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.title,
      "description": product.summary || product.description || `Compra ${product.title} en Bettjim`,
      "image": images,
      "brand": {
        "@type": "Brand",
        "name": product.brand || "Bettjim"
      },
      "sku": productIdBase,
      "url": productUrl,
      "category": product.category,
      "offers": {
        "@type": "Offer",
        "priceCurrency": "PEN",
        "price": discountedPrice,
        "itemCondition": "https://schema.org/NewCondition", // REQUERIDO POR GOOGLE
        "availability": isProductInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "url": productUrl,
        "priceValidUntil": validUntilDate.toISOString().split('T')[0], // REQUERIDO POR GOOGLE
        "seller": {
          "@type": "Organization",
          "name": "Bettjim",
          "url": this.urlDomain
        },
        ...(discountActive && {
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": discountedPrice,
            "priceCurrency": "PEN",
            "eligibleQuantity": { "@type": "QuantitativeValue", "value": 1 },
            "validFrom": product.discount_start || product.start_discount,
            "validThrough": product.discount_end || product.end_discount,
          }
        })
      }
    };

    // Agregar valoraciones solo si existen de forma real
    if (product.t_reviews && product.t_reviews > 0 && product.stars) {
      productSchema.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": product.stars,
        "reviewCount": product.t_reviews
      };
    }

    this.injectOrUpdateScript('json-ld-product-schema', productSchema);
  }

  /**
   * Genera e inyecta el esquema de Migas de Pan (BreadcrumbList)
   */
  public addBreadcrumbSchema(product: any) {
    if (!product) return;

    const itemListElement: any[] = [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": this.urlDomain }
    ];

    let positionCounter = 2;
    const categoryName = product.category || "Productos";
    
    itemListElement.push({
      "@type": "ListItem",
      "position": positionCounter++,
      "name": categoryName,
      "item": `${this.urlDomain}shop?category=${product.category || 'all'}`
    });

    const subCategory = product.subcategory || product.collections?.[0];
    if (subCategory && subCategory !== categoryName) {
      let subCategoryUrl = `${this.urlDomain}shop?category=${product.category}`;
      if (product.subcategory) {
        subCategoryUrl += `?subcategory=${product.subcategory}`;
      } else if (product.collections?.[0]) {
        subCategoryUrl += `&collection=${product.collections[0]}`;
      }

      itemListElement.push({
        "@type": "ListItem",
        "position": positionCounter++,
        "name": subCategory,
        "item": subCategoryUrl
      });
    }

    itemListElement.push({
      "@type": "ListItem",
      "position": positionCounter,
      "name": product.title,
      "item": `${this.urlDomain}product/${product.slug}`
    });

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": itemListElement
    };

    this.injectOrUpdateScript('json-ld-breadcrumb-schema', breadcrumbSchema);
  }

  /**
   * Método auxiliar para inyectar de forma segura en el DOM (SSR Ready)
   */
  private injectOrUpdateScript(scriptId: string, schemaObj: any): void {
    const newScriptContent = JSON.stringify(schemaObj);
    const head = this.document.head;
    const existingScript = head.querySelector(`#${scriptId}`);

    if (existingScript) {
      // Si ya existe (navegación CSR), actualizamos el contenido
      this.renderer.setProperty(existingScript, 'text', newScriptContent);
    } else {
      // Si no existe (primera carga SSR o primera vez CSR), creamos el script
      const script = this.renderer.createElement('script');
      this.renderer.setAttribute(script, 'id', scriptId);
      this.renderer.setAttribute(script, 'type', 'application/ld+json');
      this.renderer.setProperty(script, 'text', newScriptContent);
      this.renderer.appendChild(head, script);
    }
  }

  /**
   * Lógica interna para calcular stock
   */
  private checkProductStock(product: any, variantsWithStock: any[]): boolean {
    if (product.type_inventory === 1) {
      return product.stock > 0;
    }
    return variantsWithStock.some((v: any) => v.stock > 0);
  }
}