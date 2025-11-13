<div align="center">
  <h1>Simple CMS</h1>
  <p>Un sistema de gestión de contenido moderno y completo, construido con Next.js 15</p>

  [![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
  [![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
  [![Tests](https://img.shields.io/badge/tests-342%20pasados-brightgreen)](./tests)

  <p>
    <a href="#características">Características</a> •
    <a href="#inicio-rápido">Inicio Rápido</a> •
    <a href="#documentación">Documentación</a> •
    <a href="#stack-técnico">Stack Técnico</a> •
    <a href="#contribuir">Contribuir</a>
  </p>

  <p>
    <a href="./README.md">🇬🇧 English</a> •
    <a href="./README.fr.md">🇫🇷 Français</a> •
    <a href="./README.es.md">🇪🇸 Español</a>
  </p>
</div>

---

## Resumen

**Simple CMS** es un sistema de gestión de contenido auto-hospedado y listo para producción, diseñado para desarrolladores que quieren control total sobre su plataforma de contenido. Construido con tecnologías modernas y mejores prácticas, ofrece un panel de administración potente, sistema de blog flexible y gestión completa de usuarios desde el principio.

## Capturas de Pantalla

<details>
<summary>Click para ver las capturas de pantalla</summary>

### Panel de Administración
![Panel de Administración](./docs/screenshots/dashboard.png)
*Vista general de análisis, actividad reciente y acciones rápidas*

### Editor de Artículos
![Editor de Artículos](./docs/screenshots/post-editor.png)
*Editor de texto enriquecido con Tiptap, soportando markdown, imágenes, tablas y más*

### Biblioteca de Medios
![Biblioteca de Medios](./docs/screenshots/media-library.png)
*Gestión de medios organizada con estructura de carpetas*

### Gestión de Usuarios
![Gestión de Usuarios](./docs/screenshots/user-management.png)
*Gestión completa de usuarios con control de acceso basado en roles*

### Moderación de Comentarios
![Moderación de Comentarios](./docs/screenshots/comments.png)
*Modere comentarios con flujo de trabajo de aprobación/rechazo*

### Personalización del Tema
![Personalización del Tema](./docs/screenshots/appearance.png)
*Personalice colores del tema con selector de colores OKLCH*

</details>

> **Nota:** Las capturas de pantalla son marcadores de posición. Cree el directorio `docs/screenshots/` y agregue capturas reales para producción.

---

## Stack Técnico

| Categoría | Tecnología |
|-----------|------------|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Lenguaje** | [TypeScript 5.7](https://www.typescriptlang.org/) |
| **Base de datos** | [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/) |
| **Autenticación** | [Better Auth](https://better-auth.com/) |
| **Componentes UI** | [shadcn/ui](https://ui.shadcn.com/) (estilo New York) |
| **Estilos** | [Tailwind CSS v4](https://tailwindcss.com/) (espacio de color OKLCH) |
| **Editor de texto** | [Tiptap](https://tiptap.dev/) |
| **Pruebas** | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) |
| **Gestor de paquetes** | [pnpm](https://pnpm.io/) |
| **Herramienta de compilación** | [Turbopack](https://turbo.build/) |

## ✨ Características

### 📝 Blog & Gestión de Contenido
- ✅ **Editor de Texto Enriquecido** - Editor Tiptap con markdown, tablas, imágenes, incrustaciones YouTube, resaltado de sintaxis
- ✅ **Organización de Contenido** - Artículos con categorías, etiquetas y slugs personalizados
- ✅ **Gestión de Flujo de Trabajo** - Estado borrador/publicado con publicación programada
- ✅ **Integración de Medios** - Imágenes de portada con optimización responsive
- ✅ **Sistema de Comentarios** - Flujo de moderación con respuestas anidadas (3 niveles)
- ✅ **SEO Optimizado** - Meta tags, Open Graph, datos estructurados

### 🛠️ Panel de Administración
- ✅ **Gestión de Usuarios** - Crear, editar, bloquear usuarios con permisos basados en roles
- ✅ **Gestión de Artículos** - Operaciones CRUD completas con acciones masivas
- ✅ **Categorías & Etiquetas** - Organice contenido con taxonomía jerárquica
- ✅ **Moderación de Comentarios** - Aprobar, rechazar o eliminar comentarios con anti-spam
- ✅ **Biblioteca de Medios** - Subir, organizar archivos en carpetas con búsqueda
- ✅ **Personalización de Tema** - Selector de colores en vivo con espacio OKLCH
- ✅ **Panel de Análisis** - Seguimiento de usuarios, artículos, comentarios y almacenamiento

### 🔐 Autenticación & Seguridad
- ✅ **Control de Acceso Basado en Roles** - 6 niveles de roles (super-admin → usuario)
- ✅ **Sesiones Seguras** - Cookies httpOnly con duración de 30 días
- ✅ **Verificación de Email** - Requerida para nuevas cuentas
- ✅ **Restablecimiento de Contraseña** - Flujo seguro basado en token por email
- ✅ **Suplantación de Usuario** - Depurar problemas como otro usuario (solo admin)
- ✅ **Limitación de Velocidad** - Protección contra ataques de fuerza bruta
- ✅ **Protección XSS** - Validación y sanitización de entradas
- ✅ **Protección por Middleware** - Guardias de rutas optimizados para Edge

### 🎨 Experiencia de Usuario
- ✅ **Modo Oscuro/Claro** - Cambio de tema sensible al sistema
- ✅ **Diseño Responsive** - Mobile-first, funciona en todos los dispositivos
- ✅ **Accesibilidad** - Etiquetas ARIA, navegación por teclado
- ✅ **Notificaciones Toast** - Retroalimentación del usuario para todas las acciones
- ✅ **Estados de Carga** - Pantallas skeleton y spinners
- ✅ **Manejo de Errores** - Fallbacks elegantes y límites de error

### 🧪 Pruebas & Calidad
- ✅ **342 Pruebas Unitarias** - Cobertura completa de pruebas con Vitest
- ✅ **TypeScript** - Seguridad de tipos completa en todo el código
- ✅ **ESLint** - Calidad y consistencia del código
- ✅ **Prettier** - Formateo automático del código

---

## 🚀 Inicio Rápido

### Requisitos Previos

Asegúrese de tener instalado:

- **Node.js** 18.x o superior ([Descargar](https://nodejs.org/))
- **PostgreSQL** 14.x o superior ([Descargar](https://www.postgresql.org/download/))
- **pnpm** 8.x o superior ([Instalar](https://pnpm.io/installation))

### Instalación

**1. Clonar el repositorio**

```bash
git clone https://github.com/tuusuario/simple-cms.git
cd simple-cms
```

**2. Instalar dependencias**

```bash
pnpm install
```

**3. Configurar variables de entorno**

Copie `.env.example` a `.env.local` y configure:

```env
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/simple_cms"

# Autenticación
BETTER_AUTH_SECRET="tu-clave-secreta-min-32-caracteres"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Auto-Creación Primer Admin (creado automáticamente en el primer inicio del servidor)
SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_PASSWORD="SecurePassword123!"
SEED_ADMIN_NAME="Super Admin"

# Configuración del Sitio
NEXT_PUBLIC_SITE_NAME="Mi CMS"
NEXT_PUBLIC_SITE_DESCRIPTION="Un sistema de gestión de contenido moderno"
NEXT_PUBLIC_SITE_LOGO=""
NEXT_PUBLIC_SITE_FAVICON=""

# Email (opcional - para restablecimiento de contraseña)
EMAIL_FROM="noreply@tudominio.com"
RESEND_API_KEY="re_xxxxx"

# Almacenamiento de medios (opcional - para subidas)
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_USE_SSL="false"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET_NAME="simple-cms-media"
NEXT_PUBLIC_MINIO_ENDPOINT="http://localhost:9000"
```

> **Consejo:** Genere una clave secreta segura: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**4. Configurar la base de datos**

```bash
# Generar el cliente Prisma
npx prisma generate

# Aplicar migraciones (producción)
npx prisma migrate deploy

# O para desarrollo (interactivo)
npx prisma migrate dev
```

**5. Iniciar el servidor de desarrollo**

```bash
pnpm dev
```

**6. Auto-Creación del Primer Admin**

El primer usuario super-admin es **creado automáticamente** al iniciar el servidor usando las credenciales de su `.env.local`:
- Email: `SEED_ADMIN_EMAIL`
- Contraseña: `SEED_ADMIN_PASSWORD`
- Nombre: `SEED_ADMIN_NAME`

🎉 **¡Todo listo!** Inicie sesión en [http://localhost:3000/sign-in](http://localhost:3000/sign-in) y acceda al panel de administración en [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 📚 Documentación

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Guía para contribuidores
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía de despliegue en producción
- **[SECURITY.md](./SECURITY.md)** - Política de seguridad y mejores prácticas
- **[CLAUDE.md](./CLAUDE.md)** - Instrucciones del proyecto para Claude Code

---

## 🛠️ Comandos Disponibles

### Desarrollo

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Iniciar servidor de desarrollo con Turbopack |
| `pnpm build` | Compilar para producción |
| `pnpm start` | Iniciar servidor de producción |
| `pnpm lint` | Ejecutar ESLint |
| `pnpm test` | Ejecutar pruebas con Vitest |
| `pnpm test:ui` | Ejecutar pruebas con interfaz |
| `pnpm test:coverage` | Generar reporte de cobertura |

### Base de Datos

| Comando | Descripción |
|---------|-------------|
| `pnpm db:generate` | Generar cliente Prisma |
| `pnpm db:push` | Enviar cambios de esquema (solo dev) |
| `pnpm db:migrate` | Crear y aplicar migraciones |
| `pnpm db:migrate:deploy` | Aplicar migraciones (producción) |
| `pnpm db:studio` | Abrir interfaz Prisma Studio |

---

## 📁 Estructura del Proyecto

```
simple-cms/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (admin)/           # 🔒 Rutas admin (requiere auth)
│   │   │   ├── admin/         # Panel de control, análisis
│   │   │   ├── posts/         # Gestión de artículos
│   │   │   ├── categories/    # Gestión de categorías
│   │   │   ├── tags/          # Gestión de etiquetas
│   │   │   ├── comments/      # Moderación de comentarios
│   │   │   ├── media/         # Biblioteca de medios
│   │   │   ├── users/         # Gestión de usuarios
│   │   │   ├── appearance/    # Personalización de tema
│   │   │   └── settings/      # Configuración general
│   │   ├── (auth)/            # 🔓 Páginas de autenticación
│   │   │   ├── sign-in/       # Página de inicio de sesión
│   │   │   ├── sign-up/       # Página de registro
│   │   │   └── reset-password/ # Restablecimiento de contraseña
│   │   ├── (blog)/            # 📝 Rutas de blog públicas
│   │   │   └── blog/          # Lista y detalle de artículos
│   │   ├── (site)/            # 🌐 Rutas del sitio públicas
│   │   │   └── about/         # Página acerca de
│   │   └── api/               # Rutas API
│   │       └── auth/          # Endpoint Better Auth
│   │
│   ├── features/              # Módulos por característica
│   │   ├── auth/             # Autenticación y sesiones
│   │   │   ├── components/   # Formularios inicio sesión, registro
│   │   │   ├── lib/          # Config Better Auth, acciones
│   │   │   └── provider/     # Proveedor de sesión
│   │   ├── admin/            # Funcionalidad admin
│   │   │   ├── components/   # Componentes UI admin
│   │   │   └── lib/          # Acciones del servidor (users, media, settings)
│   │   ├── blog/             # Características blog/CMS
│   │   │   ├── components/   # Editor de artículos, diálogos
│   │   │   └── lib/          # Acciones del servidor (posts, comments)
│   │   └── theme/            # Gestión del tema
│   │       ├── components/   # Selector de tema
│   │       └── provider/     # Proveedor de tema
│   │
│   ├── components/           # Componentes UI compartidos
│   │   ├── ui/              # Componentes shadcn/ui
│   │   ├── rich-text-editor.tsx # Editor Tiptap
│   │   ├── color-picker.tsx     # Selector colores OKLCH
│   │   └── multi-select.tsx     # Selector de etiquetas
│   │
│   └── lib/                 # Utilidades compartidas
│       ├── prisma.ts       # Cliente Prisma centralizado (singleton)
│       ├── auto-seed.ts    # Auto-creación primer admin desde variables env
│       ├── site-config.ts  # Configuración del sitio desde variables env
│       ├── roles.ts        # Definiciones de roles y permisos
│       ├── utils.ts        # Funciones helper
│       └── metadata.ts     # Metadatos SEO
│
├── prisma/                  # Esquema de base de datos
│   ├── schema.prisma       # Esquema principal (generator + datasource)
│   ├── users.prisma        # Modelos User, Session, Account
│   ├── post.prisma         # Modelos Post, Category, Tag
│   ├── comment.prisma      # Modelo Comment
│   └── media.prisma        # Modelos Media, MediaFolder
│
├── tests/                   # Archivos de prueba
│   ├── features/           # Pruebas por característica
│   └── components/         # Pruebas de componentes
│
├── docs/                    # Documentación
│   └── screenshots/        # Capturas de pantalla para README
│
├── instrumentation.ts       # Inicio servidor Next.js (auto-seed admin)
├── CONTRIBUTING.md          # Guía de contribución
├── DEPLOYMENT.md            # Guía de despliegue
├── SECURITY.md              # Política de seguridad
└── CLAUDE.md                # Instrucciones Claude Code
```

---

## 🔑 Decisiones Arquitectónicas Clave

### Estructura Basada en Características
- **Diseño modular:** Cada característica es autónoma con componentes, acciones y lógica
- **Escalabilidad:** Fácil agregar nuevas características sin afectar el código existente
- **Mantenibilidad:** Separación clara de responsabilidades

### Cliente Prisma Centralizado
- **Importar desde:** `@/lib/prisma` (NO `@/generated/prisma`)
- **Patrón singleton:** Previene múltiples conexiones a la base de datos
- **Ruta de salida personalizada:** `generated/prisma` para imports más limpios

### Patrón Acciones del Servidor
- **Ubicación:** Todas las acciones en `features/*/lib/*-actions.ts`
- **Nunca en rutas app:** Mantiene las páginas ligeras y enfocadas en renderizado
- **Respuestas estandarizadas:** Patrón `{ data, error }` para consistencia

### Multi-Esquema Prisma
- **Organizado por dominio:** `users.prisma`, `post.prisma`, `comment.prisma`, `media.prisma`
- **Fusión automática:** Vía `prisma.config.ts`
- **Mejor mantenibilidad:** Más fácil navegar y comprender el esquema

### Control de Acceso Basado en Roles
- **6 niveles de roles:** super-admin, admin, editor, moderator, author, user
- **Permisos granulares:** Control de acceso a nivel de características
- **Protección middleware:** Guardias de rutas optimizados Edge
- **Definido en:** `src/lib/roles.ts` y `src/lib/route-permissions.ts`

---

## 🤝 Contribuir

¡Damos la bienvenida a las contribuciones! Por favor lea nuestra guía [CONTRIBUTING.md](./CONTRIBUTING.md) para detalles sobre:

- Código de conducta
- Configuración de desarrollo
- Estándares de código
- Proceso de pull request
- Directrices de pruebas

**Pasos rápidos para contribuir:**

1. Hacer fork del repositorio
2. Crear una rama de característica: `git checkout -b feature/caracteristica-increible`
3. Commit de sus cambios: `git commit -m 'feat: agregar característica increíble'`
4. Push a la rama: `git push origin feature/caracteristica-increible`
5. Abrir un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT** - vea el archivo [LICENSE](./LICENSE) para más detalles.

---

## 🙏 Agradecimientos

Construido con estos increíbles proyectos de código abierto:

- [Next.js](https://nextjs.org/) - Framework React
- [Prisma](https://www.prisma.io/) - ORM base de datos
- [Better Auth](https://better-auth.com/) - Biblioteca de autenticación
- [shadcn/ui](https://ui.shadcn.com/) - Biblioteca de componentes UI
- [Tiptap](https://tiptap.dev/) - Editor de texto enriquecido
- [Tailwind CSS](https://tailwindcss.com/) - CSS utility-first
- [Vitest](https://vitest.dev/) - Framework de pruebas

---

## 📞 Soporte

- **Documentación:** [CONTRIBUTING.md](./CONTRIBUTING.md) | [DEPLOYMENT.md](./DEPLOYMENT.md) | [SECURITY.md](./SECURITY.md)
- **Issues:** [GitHub Issues](https://github.com/tuusuario/simple-cms/issues)
- **Discusiones:** [GitHub Discussions](https://github.com/tuusuario/simple-cms/discussions)
- **Seguridad:** Ver [SECURITY.md](./SECURITY.md) para reportar vulnerabilidades

---

<div align="center">
  <p>Hecho con ❤️ por desarrolladores, para desarrolladores</p>
  <p>
    <a href="https://github.com/tuusuario/simple-cms">⭐ Star en GitHub</a> •
    <a href="https://github.com/tuusuario/simple-cms/issues">🐛 Reportar Bug</a> •
    <a href="https://github.com/tuusuario/simple-cms/issues">✨ Solicitar Característica</a>
  </p>
</div>
