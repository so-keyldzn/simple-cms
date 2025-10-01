"use server";

import { writeFile, readFile } from "fs/promises";
import path from "path";

type ThemeColors = {
	light: Record<string, string>;
	dark: Record<string, string>;
	radius: string;
};

export async function getCurrentThemeColors() {
	try {
		const cssPath = path.join(process.cwd(), "src/app/globals.css");
		const cssContent = await readFile(cssPath, "utf-8");

		// Extraire le radius
		const radiusMatch = cssContent.match(/--radius:\s*([^;]+);/);
		const radius = radiusMatch ? radiusMatch[1].trim() : "0.625rem";

		// Extraire les couleurs light (:root)
		const rootMatch = cssContent.match(/:root\s*\{([^}]+)\}/);
		const light: Record<string, string> = {};
		if (rootMatch) {
			const rootContent = rootMatch[1];
			const colorMatches = rootContent.matchAll(/(--[a-z-]+):\s*([^;]+);/g);
			for (const match of colorMatches) {
				const variable = match[1];
				const value = match[2].trim();
				if (variable !== '--radius') {
					light[variable] = value;
				}
			}
		}

		// Extraire les couleurs dark (.dark)
		const darkMatch = cssContent.match(/\.dark\s*\{([^}]+)\}/);
		const dark: Record<string, string> = {};
		if (darkMatch) {
			const darkContent = darkMatch[1];
			const colorMatches = darkContent.matchAll(/(--[a-z-]+):\s*([^;]+);/g);
			for (const match of colorMatches) {
				const variable = match[1];
				const value = match[2].trim();
				dark[variable] = value;
			}
		}

		return { success: true, data: { light, dark, radius }, error: null };
	} catch (error: any) {
		console.error("Error reading theme:", error);
		return { success: false, data: null, error: error.message };
	}
}

export async function saveThemeColors(colors: ThemeColors) {
	try {
		const cssPath = path.join(process.cwd(), "src/app/globals.css");
		let cssContent = await readFile(cssPath, "utf-8");

		// Mettre à jour le radius
		cssContent = cssContent.replace(
			/--radius:\s*[^;]+;/,
			`--radius: ${colors.radius};`
		);

		// Mettre à jour les couleurs light
		Object.entries(colors.light).forEach(([variable, value]) => {
			const regex = new RegExp(`(${variable}):\\s*[^;]+;`, "g");
			cssContent = cssContent.replace(regex, `$1: ${value};`);
		});

		// Mettre à jour les couleurs dark
		Object.entries(colors.dark).forEach(([variable, value]) => {
			const darkRegex = new RegExp(
				`(\\.dark\\s*\\{[^}]*${variable}):\\s*[^;]+;`,
				"g"
			);
			cssContent = cssContent.replace(darkRegex, `$1: ${value};`);
		});

		await writeFile(cssPath, cssContent, "utf-8");

		return { success: true, error: null };
	} catch (error: any) {
		console.error("Error saving theme:", error);
		return { success: false, error: error.message };
	}
}

export async function resetThemeColors() {
	try {
		const defaultCSS = `@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`;

		const cssPath = path.join(process.cwd(), "src/app/globals.css");
		await writeFile(cssPath, defaultCSS, "utf-8");

		return { success: true, error: null };
	} catch (error: any) {
		console.error("Error resetting theme:", error);
		return { success: false, error: error.message };
	}
}
