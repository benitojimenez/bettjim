export interface SeoConfig {
  title: string;
  description: string;
  image?: string;      // URL de la imagen principal
  slug?: string;       // Para armar la URL canónica (ej: product/zapatillas)
  keywords?: string;
  type?: 'website' | 'article' | 'product'; // Por defecto 'website'
  
  // Datos específicos de Producto (Opcionales)
  price?: number;
  currency?: string;
  brand?: string;
  stock?: boolean;
}