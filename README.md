# Super 10 Chile - MVP Plataforma E-Commerce & Rediseño Omnicanal

Prototipo de alta fidelidad y propuesta estratégica de transformación digital para la cadena de supermercados **Super 10** (filial de SMU S.A. en Chile), inspirado en los estándares de excelencia de gigantes del retail como **Jumbo (Cencosud)** y **Líder (Walmart Chile)**.

---

## 🎯 Objetivo de la Propuesta
Transformar el actual sitio web estático e informativo de `super10.cl` en una **plataforma moderna de e-commerce omnicanal transaccional**, capaz de:
1. **Capturar ventas digitales** a través de despacho a domicilio express y retiro en tienda gratuito (*Click & Collect*).
2. **Potenciar las Marcas Propias de SMU** (Amada Masa, Nuestra Cocina, Merkat, Smart Clean, Azul Profundo, Nubelin, Fundo Río Alegre) mostrando catálogo con precios, promociones y disponibilidad real.
3. **Monetizar y fidelizar mediante Club 10 y Tarjeta Unipay**, integrando descuentos dinámicos (15% OFF) directamente en el flujo del carro de compras.
4. **Competir de igual a igual** frente a formatos de conveniencia y precios bajos de la competencia (Lider Express, Alvi, Mayorista 10, Unimarc).

---

## 🚀 Características Principales del MVP

### 1. Experiencia de Compra Omnicanal
* **Selector de Modalidad:** Alterna entre *Despacho a Domicilio* (con dirección) y *Retiro en Tienda* (Click & Collect 100% gratis).
* **Buscador Inteligente Predictivo:** Búsqueda en tiempo real con sugerencias instantáneas por nombre, categoría o marca exclusiva.
* **Carro de Compras Lateral Interactivo:**
  * Barra de progreso con meta de despacho gratis (umbral de $25.000 CLP).
  * Control de cantidades con modificadores (+ / -).
  * Aplicador de cupones de descuento (ej: `SUPER10`).
  * Switch de descuento automático con **Tarjeta Unipay (15% OFF adicional)**.
  * Resumen de pedido con desglose claro (Subtotal, Descuentos, Despacho, Total).

### 2. Catálogo & Merchandising Retail
* **Zona Súper Lukas:** Sección de ofertas flash con temporizador animado en cuenta regresiva para productos a $1.000 y $2.000.
* **Vitrina de Marcas Propias:** Carrusel de marcas exclusivas de SMU con filtrado rápido por tarjeta.
* **Filtros por Categoría:** Panadería, Despensa, Aseo, Congelados, Papelería y Lácteos.
* **Ordenamiento Avanzado:** Por mayor descuento, menor precio, mayor precio y mejor valoración.
* **Quick View Modal:** Ficha rápida de producto con detalle, código EAN y botón directo al carro.

### 3. Localizador de Tiendas y Catálogo Digital
* **Buscador de Locales:** Filtro en tiempo real por comuna (Santiago Centro, Puente Alto, Maipú, Viña del Mar, Concepción, etc.) con horarios y servicios (autoatención, retiro, estacionamiento).
* **Visor de Folleto Digital:** Acceso a ofertas impresas de la quincena.

---

## 🛠️ Tecnologías y Arquitectura
* **Frontend:** HTML5 Semántico, CSS3 moderno con variables (Design Tokens), Vanilla JavaScript ES6+.
* **Diseño:** Sistema tipográfico Plus Jakarta Sans, paleta oficial Super 10 (Rojo S10 `#E30613`, Amarillo `#FFD200`, Navy `#0F172A`).
* **Performance:** Cero dependencias externas pesadas, carga ultrarrápida (< 1s), 100% responsive para dispositivos móviles y escritorio.
* **Persistencia:** `localStorage` para preservar el estado del carro de compras y preferencias del cliente.

---

## 📦 Cómo Probar y Publicar

### Visualización Local
Simplemente abre `index.html` en cualquier navegador web moderno o levanta un servidor local:
```bash
npx serve .
# o con python:
python3 -m http.server 8080
```

### Publicación Gratuita en 1 Clic con GitHub Pages
1. Sube este repositorio a GitHub.
2. Ve a **Settings** -> **Pages**.
3. En **Branch**, selecciona `main` y la carpeta `/ (root)`.
4. Haz clic en **Save**. En un par de minutos tu demo estará disponible en:
   `https://<tu-usuario>.github.io/DemoSuper10/`

---

## 📄 Licencia y Derechos
Concepto de rediseño y desarrollo elaborado como propuesta comercial profesional para Super 10 / SMU S.A.
Marcas y logotipos son propiedad de sus respectivos dueños.
