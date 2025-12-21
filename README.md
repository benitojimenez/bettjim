# Bettjim - Next Gen Marketplace Platform

![Angular](https://img.shields.io/badge/Angular-v21.0.0-dd0031?style=for-the-badge&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![Status](https://img.shields.io/badge/Status-Development-yellow?style=for-the-badge)

**Bettjim** es una plataforma de comercio electrónico moderna y de alto rendimiento, construida con la última arquitectura de **Angular 21**. El proyecto se centra en una experiencia de usuario inmersiva (UX), animaciones cinemáticas y una arquitectura reactiva basada en **Signals**.

---

## 🚀 Características Principales (Key Features) 

### 🎨 UI/UX & Diseño "Glassmorphism"
- **Efecto Spotlight:** Iluminación dinámica que sigue el cursor del usuario en las tarjetas (CSS Variables + TS).
- **Infinite Marquee:** Cinta de marcas con desplazamiento infinito optimizado.
- **Glassmorphism:** Uso intensivo de `backdrop-filter`, transparencias y bordes sutiles para una estética futurista Dark Mode.
- **Animaciones Ken Burns:** Sliders con zoom progresivo y transiciones suaves.

### ⚡ Rendimiento y Arquitectura
- **Angular Signals:** Gestión de estado reactiva granular para el contador de tiempo y cálculos financieros (sin Zone.js overhead).
- **Change Detection Optimization:** Animaciones pesadas (Swiper, Countdowns) ejecutadas fuera del ciclo de Angular (`runOutsideAngular`) para mantener 60fps constantes.
- **Lazy Loading:** Carga diferida de imágenes y módulos para optimizar el LCP (Largest Contentful Paint).

### 🛠 Componentes Destacados
1.  **Coming Soon Landing:** Página de espera con cuenta regresiva matemática precisa, captura de leads y feedback visual con **Canvas Confetti**.
2.  **Hero Slider Pro:** Integración avanzada de Swiper.js con soporte mixto (Video/Imagen), miniaturas sincronizadas y deeplinking.
3.  **Commission Simulator:** Calculadora reactiva de ganancias para vendedores con visualización gráfica de tarifas.

---

## 🛠 Tech Stack

* **Core:** [Angular CLI](https://github.com/angular/angular-cli) versión 21.0.0.
* **Lenguaje:** TypeScript 5.2+
* **Estilos:** SCSS (Sass) con arquitectura modular BEM.
* **Librerías UI:**
    * `swiper`: Para carruseles táctiles y sliders.
    * `canvas-confetti`: Para micro-interacciones de celebración.
* **Iconos:** SVG nativos optimizados.

---

## ⚙️ Instalación y Configuración

Sigue estos pasos para levantar el entorno de desarrollo local:

### 1. Prerrequisitos
Asegúrate de tener instalado **Node.js** (v18 o superior recomedado para Angular 21).

### 2. Clonar e Instalar
```bash
git clone [https://github.com/tu-usuario/bettjim.git](https://github.com/tu-usuario/bettjim.git)
cd bettjim
npm install