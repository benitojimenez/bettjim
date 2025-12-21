import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import axios from 'axios';
const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();
import { environment } from './environments/environment';

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */
// -------------------------------------------------------------------------
// 🔥 SOLUCIÓN ROBOTS.TXT Y SITEMAP
// Servir archivos estáticos específicos ANTES de cualquier otra cosa
// -------------------------------------------------------------------------

// 1. Regla explícita para robots.txt
app.get('/robots.txt', (req, res) => {
  res.sendFile(join(browserDistFolder, 'robots.txt'));
});
// 2. Regla explícita para sitemap.xml (si lo tienes)

// -------------------------------------------------------------------------
// 🔥 SITEMAP DINÁMICO PARA PRODUCTOS
// Cuando Google pida el sitemap, lo generamos al vuelo.
// -------------------------------------------------------------------------
app.get('/sitemap.xml', async (req, res) => {
  try {
    const apiUrl = environment.API_URL || 'https://api.bettjim.com';
    const domain = 'https://bettjim.com';
    const imgBaseUrl = 'https://api.bettjim.com/api/product_imagen/'; // 🔥 Tu ruta base

    // 1. Consultar API
    const response = await axios.get(`${apiUrl}/list_products/`);
    
    // 2. Obtener array seguro
    let products = [];
    if (Array.isArray(response.data)) products = response.data;
    else if (response.data?.results) products = response.data.results;
    else if (response.data?.data) products = response.data.data;

    // 3. Iniciar XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

    // A. Páginas Estáticas
    const staticPages = ['', '/nosotros', '/shop', '/tracking', '/auth/login','/auth/register'];
    staticPages.forEach(page => {
      xml += `
        <url>
          <loc>${domain}${page}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>`;
    });

    // B. Productos Dinámicos + Array de Imágenes
    products.forEach((prod: any) => {
      if (prod.slug) {
        
        // --- 1. Fechas ---
        const dateStr = prod.updatedAt || prod.createdAt || new Date();
        
        // --- 2. Procesar Array de Imágenes ---
        let imagesXML = '';
        
        // Verificamos si existe el array 'images' y si tiene datos
        if (prod.images && Array.isArray(prod.images)) {
            prod.images.forEach((img: any) => {
                if (img.src) {
                    // Construir URL completa
                    const fullSrc = `${imgBaseUrl}${img.src}`;
                    
                    // Limpiar Texto ALT (Importante: combina Nombre Producto + Color)
                    // Ej: "Zapatillas Urbanas - pink"
                    const rawTitle = img.alt ? `${prod.title} - ${img.alt}` : (prod.title || 'Producto Bettjim');
                    
                    const cleanTitle = rawTitle
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&apos;');

                    // Agregar bloque de imagen
                    imagesXML += `
                    <image:image>
                        <image:loc>${fullSrc}</image:loc>
                        <image:title>${cleanTitle}</image:title>
                    </image:image>`;
                }
            });
        }

        // --- 3. Armar el bloque URL ---
        xml += `
        <url>
          <loc>${domain}/product/${prod.slug}</loc>
          <lastmod>${new Date(dateStr).toISOString()}</lastmod>
          <changefreq>daily</changefreq>
          <priority>1.0</priority>
          ${imagesXML} 
        </url>`;
      }
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);

  } catch (error: any) {
    console.error('❌ Error Sitemap:', error.message);
    res.status(500).send('Error generando sitemap');
  }
});


/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// /**
//  * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
//  */
export const reqHandler = createNodeRequestHandler(app);
/**
 * ===========================
 *  INICIO DEL SERVIDOR
 * ===========================
 */
// export function startServer() {
//   const port = process.env['PORT'] || 4000;
//   app.listen(port, () => {
//     console.log(`✅ Bettjim SSR escuchando en http://localhost:${port}`);
//   });
// }

// const metaUrl = import.meta.url;
// const isMain = isMainModule(metaUrl);
// const isPM2 = process.env['PM2'] === 'true';

// if (isMain || isPM2) {
//   startServer();
// }
