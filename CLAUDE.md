# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 CMS application using the App Router, built with TypeScript, Prisma ORM (PostgreSQL), and shadcn/ui components. The project uses pnpm as the package manager and Turbopack for development and builds.

## Common Commands

### Development
```bash
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production with Turbopack
pnpm start            # Start production server
pnpm lint             # Run ESLint
```

### Prisma Database
```bash
npx prisma generate   # Generate Prisma Client (outputs to generated/prisma)
npx prisma migrate dev # Create and apply migrations
npx prisma studio     # Open Prisma Studio GUI
npx prisma db push    # Push schema changes without migrations
```

## Architecture

### Project Structure
- **src/app/** - Next.js App Router pages and layouts
  - **(admin)/** - Route group for admin pages with dedicated layout
- **src/components/ui/** - shadcn/ui components (New York style)
- **src/features/** - Feature-based modules (e.g., theme with provider/components)
- **src/lib/** - Shared utilities
- **src/hooks/** - Custom React hooks
- **prisma/** - Multi-file Prisma schema setup
  - **schema.prisma** - Main config and datasource
  - **users.prisma** - User model
  - **post.prisma** - Post model

### Key Configuration Details

**Prisma:**
- Uses a multi-file schema approach (configured in `prisma.config.ts`)
- **schema.prisma** contains only `generator` and `datasource` blocks
- Other `.prisma` files contain only model definitions (one model per file)
- All schema files in `prisma/` directory are automatically merged by Prisma
- Client outputs to `generated/prisma` (custom output path)
- PostgreSQL database

**shadcn/ui:**
- Style: "new-york"
- RSC and TypeScript enabled
- Import aliases: `@/components`, `@/lib/utils`, `@/components/ui`, `@/hooks`
- Icon library: lucide-react
- Tailwind with CSS variables

**Path Aliases:**
- `@/*` maps to `./src/*`

**Theming:**
- Uses `next-themes` with a custom `ThemeProvider` wrapper
- Configured in root layout with system theme support

### Route Groups
The `(admin)` route group provides a sidebar layout for admin pages without affecting the URL structure.

### Prisma Client Import
When using Prisma Client, import from the custom output location:
```typescript
import { PrismaClient } from '../generated/prisma';
```

### Adding shadcn/ui Components
Use the shadcn CLI with the existing configuration:
```bash
npx shadcn@latest add [component-name]
```
Components will be added to `src/components/ui/` following the New York style preset.
