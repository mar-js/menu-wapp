# 📱 MenuWapp

**MenuWapp** es una plataforma SaaS versátil diseñada para que todo tipo de emprendedores (comercios, gastronomía, servicios y tiendas minoristas) puedan crear su propio **catálogo digital interactivo con código QR** y recibir **pedidos organizados directamente en su WhatsApp**, sin comisiones por venta y sin necesidad de que sus clientes descarguen ninguna aplicación.

---

## ✨ Características Principales

- **Multi-nicho:** Pensado no solo para gastronomía, sino para cualquier comercio local que necesite un catálogo de productos o servicios.
- **Panel de Administración (Dashboard):** Permite a los comerciantes gestionar sus productos, stock, categorías, estado de disponibilidad y métodos de pago aceptados de forma intuitiva.
- **Menú Público Dinámico (`/:slug`):** Cada local cuenta con su propia URL exclusiva y código QR generado al instante.
- **Carrito y Checkout Inteligente:** Selección de cantidades con control de stock en tiempo real, validación de datos del cliente y selector dinámico de métodos de pago configurados por el comerciante.
- **Integración con WhatsApp:** Generación de un ticket de pedido ordenado, limpio y libre de errores de codificación para una comunicación rápida y directa.
- **Optimizado para SEO:** Metadatos dinámicos, títulos personalizados y Open Graph para compartir en redes sociales y WhatsApp.

---

## 🛠️ Stack Tecnológico

El proyecto está construido utilizando tecnologías modernas y de alto rendimiento:
- **Frontend:** React + TypeScript, Vite
- **Enrutamiento:** Wouter
- **Estilos:** Tailwind CSS
- **Iconos:** Lucide React
- **Estado Global:** Zustand
- **Backend / Base de Datos:** Supabase (Autenticación, Base de datos PostgreSQL con RLS y Storage para imágenes)

---

## 🚀 Guía de Instalación y Desarrollo Local

Si querés clonar y correr el proyecto en tu computadora, seguí estos pasos:

### 1. Clonar el repositorio

```bash
git clone https://github.com/mar-js/menu-wapp.git
cd menuwapp
```

### 2. Instala las dependencias

```bash
npm i
```

### 3. Configurar las variables de entorno

Crea un archivo llamado `.env` en la raíz del proyecto basándote en tus credenciales de Supabase:
```bash
VITE_SUPABASE_URL=tu_supabase_url_aqui
VITE_SUPABASE_PUBLISHABLE_KEY=tu_supabase_publishable_key_aqui
```

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```
