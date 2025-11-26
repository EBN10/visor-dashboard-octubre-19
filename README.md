# Visor Bun

Bienvenido a la documentación de **Visor Bun**. Este proyecto es una aplicación web moderna diseñada para la visualización de datos geoespaciales y gestión de información, construida sobre un stack tecnológico de alto rendimiento y última generación.

## 🚀 Tecnologías y Decisiones de Diseño

Hemos seleccionado cuidadosamente cada herramienta para maximizar el rendimiento, la experiencia de desarrollo (DX) y la escalabilidad del proyecto. A continuación explicamos el "por qué" de cada elección:

- **[Bun](https://bun.sh/)**: 
  - *¿Por qué?* Elegido como nuestro entorno de ejecución y gestor de paquetes principal por su velocidad superior comparada con Node.js. Acelera drásticamente la instalación de dependencias y el inicio del servidor de desarrollo.

- **[Next.js 15](https://nextjs.org/)**: 
  - *¿Por qué?* El estándar de industria para aplicaciones React. Utilizamos la versión 15 con **App Router** para aprovechar las últimas capacidades de React Server Components (RSC), mejorando el rendimiento de carga inicial y el SEO.

- **[TypeScript](https://www.typescriptlang.org/)**: 
  - *¿Por qué?* Indispensable para un código robusto y mantenible a largo plazo. Nos permite detectar errores antes de ejecutar el código y proporciona un excelente autocompletado, lo que acelera el desarrollo.

- **[Tailwind CSS 4](https://tailwindcss.com/)**: 
  - *¿Por qué?* Para el estilizado. La versión 4 ofrece un motor de compilación instantáneo y una configuración simplificada. Nos permite construir interfaces modernas rápidamente sin salir del HTML.

- **[Shadcn/ui](https://ui.shadcn.com/)** (sobre Radix UI): 
  - *¿Por qué?* No es una librería de componentes tradicional, sino una colección de componentes que copiamos y pegamos. Esto nos da control total sobre el código, asegurando accesibilidad (a11y) y permitiendo una personalización profunda sin luchar contra la librería.

- **[Drizzle ORM](https://orm.drizzle.team/)**: 
  - *¿Por qué?* Elegido sobre Prisma por ser más ligero, tener mejor rendimiento (especialmente en entornos serverless/edge) y ofrecer una experiencia más cercana a SQL pero con la seguridad de tipos de TypeScript.

- **[React Leaflet](https://react-leaflet.js.org/)**: 
  - *¿Por qué?* Para la visualización de mapas. Es una abstracción de React sobre Leaflet, una de las librerías de mapas más ligeras, maduras y de código abierto disponibles.

- **[Clerk](https://clerk.com/)**: 
  - *¿Por qué?* Para la autenticación. Nos permite implementar un sistema de login seguro, gestión de sesiones y perfiles de usuario en minutos, delegando la complejidad de la seguridad a expertos.

- **[TanStack Query (React Query)](https://tanstack.com/query/latest)**: 
  - *¿Por qué?* Para la gestión del estado del servidor. Simplifica enormemente la obtención de datos, el caché, la sincronización y la actualización de la UI en segundo plano.

## 🛠️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu sistema:

- **[Bun](https://bun.sh/)**: v1.0 o superior (Recomendado).
- **Node.js**: Compatible si prefieres no usar Bun, pero los scripts están optimizados para Bun.
- **PostgreSQL**: Una base de datos Postgres activa.

## 📦 Instalación

Sigue estos pasos para levantar el proyecto en tu entorno local:

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd visor-bun
   ```

2. **Instalar dependencias**:
   Utilizamos Bun para una instalación ultra-rápida.
   ```bash
   bun install
   ```

3. **Configurar variables de entorno**:
   Copia el archivo de ejemplo `.env.example` a un nuevo archivo `.env` y rellena las claves necesarias.
   ```bash
   cp .env.example .env
   ```
   **Importante**: Asegúrate de configurar correctamente la `DATABASE_URL` para tu base de datos Postgres y las claves de API de Clerk (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`).

4. **Sincronizar la base de datos**:
   Empuja el esquema de la base de datos a tu instancia de Postgres usando Drizzle.
   ```bash
   bun db:push
   ```

## 💻 Uso

### Servidor de Desarrollo
Para iniciar la aplicación en modo de desarrollo con recarga en caliente (HMR):

```bash
bun dev
```
La aplicación estará disponible en `http://localhost:3000`.

### Gestión de Base de Datos
Comandos útiles para manejar la base de datos:

- `bun db:generate`: Genera archivos de migración SQL basados en cambios en tu esquema `drizzle/schema.ts`.
- `bun db:migrate`: Aplica las migraciones pendientes a la base de datos.
- `bun db:studio`: Abre **Drizzle Studio** en tu navegador, una interfaz visual para explorar y editar tus datos.

### Linting y Formateo
Mantén la calidad del código con:

- `bun run lint`: Busca errores de linting.
- `bun run format:check`: Verifica el formato del código con Prettier.

### Producción
Para construir y ejecutar la aplicación optimizada para producción:

```bash
bun run build
bun start
```

## 📂 Estructura del Proyecto

Un vistazo rápido a la organización de carpetas:

- `/src/app`: Contiene las páginas y rutas (App Router).
- `/src/components`: Componentes de UI reutilizables (botones, inputs, mapas, etc.).
- `/src/server`: Configuración del backend, esquemas de base de datos (Drizzle) y procedimientos tRPC (si aplica).
- `/src/lib`: Utilidades, helpers y configuraciones de librerías.
- `/public`: Archivos estáticos (imágenes, fuentes, etc.).
- `/drizzle`: Archivos de configuración y migraciones de la base de datos.

---
*Documentación generada para el proyecto Visor Bun.*
