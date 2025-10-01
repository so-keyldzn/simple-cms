"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Palette, Moon, Sun, Loader2 } from "lucide-react";
import { saveThemeColors, resetThemeColors, getCurrentThemeColors } from "@/features/admin/lib/appearance-actions";
import { useRouter } from "next/navigation";
import { ColorPicker } from "@/components/ui/color-picker";

type ColorConfig = {
	name: string;
	variable: string;
	value: string;
	description: string;
};

const lightThemeColors: ColorConfig[] = [
	{ name: "Background", variable: "--background", value: "oklch(1 0 0)", description: "Couleur de fond principale" },
	{ name: "Foreground", variable: "--foreground", value: "oklch(0.145 0 0)", description: "Couleur du texte principal" },
	{ name: "Card", variable: "--card", value: "oklch(1 0 0)", description: "Fond des cartes" },
	{ name: "Card Foreground", variable: "--card-foreground", value: "oklch(0.145 0 0)", description: "Texte des cartes" },
	{ name: "Popover", variable: "--popover", value: "oklch(1 0 0)", description: "Fond des popovers" },
	{ name: "Popover Foreground", variable: "--popover-foreground", value: "oklch(0.145 0 0)", description: "Texte des popovers" },
	{ name: "Primary", variable: "--primary", value: "oklch(0.205 0 0)", description: "Couleur primaire (boutons, liens)" },
	{ name: "Primary Foreground", variable: "--primary-foreground", value: "oklch(0.985 0 0)", description: "Texte sur couleur primaire" },
	{ name: "Secondary", variable: "--secondary", value: "oklch(0.97 0 0)", description: "Couleur secondaire" },
	{ name: "Secondary Foreground", variable: "--secondary-foreground", value: "oklch(0.205 0 0)", description: "Texte sur couleur secondaire" },
	{ name: "Muted", variable: "--muted", value: "oklch(0.97 0 0)", description: "Couleur atténuée" },
	{ name: "Muted Foreground", variable: "--muted-foreground", value: "oklch(0.556 0 0)", description: "Texte atténué" },
	{ name: "Accent", variable: "--accent", value: "oklch(0.97 0 0)", description: "Couleur d'accentuation" },
	{ name: "Accent Foreground", variable: "--accent-foreground", value: "oklch(0.205 0 0)", description: "Texte sur accent" },
	{ name: "Destructive", variable: "--destructive", value: "oklch(0.577 0.245 27.325)", description: "Couleur destructive (erreurs, suppressions)" },
	{ name: "Destructive Foreground", variable: "--destructive-foreground", value: "oklch(0.985 0 0)", description: "Texte sur destructive" },
	{ name: "Border", variable: "--border", value: "oklch(0.922 0 0)", description: "Couleur des bordures" },
	{ name: "Input", variable: "--input", value: "oklch(0.922 0 0)", description: "Couleur des champs de saisie" },
	{ name: "Ring", variable: "--ring", value: "oklch(0.708 0 0)", description: "Couleur du focus ring" },
	{ name: "Chart 1", variable: "--chart-1", value: "oklch(0.646 0.222 41.116)", description: "Couleur graphique 1" },
	{ name: "Chart 2", variable: "--chart-2", value: "oklch(0.6 0.118 184.704)", description: "Couleur graphique 2" },
	{ name: "Chart 3", variable: "--chart-3", value: "oklch(0.398 0.07 227.392)", description: "Couleur graphique 3" },
	{ name: "Chart 4", variable: "--chart-4", value: "oklch(0.828 0.189 84.429)", description: "Couleur graphique 4" },
	{ name: "Chart 5", variable: "--chart-5", value: "oklch(0.769 0.188 70.08)", description: "Couleur graphique 5" },
	{ name: "Sidebar", variable: "--sidebar", value: "oklch(0.985 0 0)", description: "Fond de la sidebar" },
	{ name: "Sidebar Foreground", variable: "--sidebar-foreground", value: "oklch(0.145 0 0)", description: "Texte de la sidebar" },
	{ name: "Sidebar Primary", variable: "--sidebar-primary", value: "oklch(0.205 0 0)", description: "Couleur primaire sidebar" },
	{ name: "Sidebar Primary Foreground", variable: "--sidebar-primary-foreground", value: "oklch(0.985 0 0)", description: "Texte primaire sidebar" },
	{ name: "Sidebar Accent", variable: "--sidebar-accent", value: "oklch(0.97 0 0)", description: "Accent sidebar" },
	{ name: "Sidebar Accent Foreground", variable: "--sidebar-accent-foreground", value: "oklch(0.205 0 0)", description: "Texte accent sidebar" },
	{ name: "Sidebar Border", variable: "--sidebar-border", value: "oklch(0.922 0 0)", description: "Bordure sidebar" },
	{ name: "Sidebar Ring", variable: "--sidebar-ring", value: "oklch(0.708 0 0)", description: "Focus ring sidebar" },
];

const darkThemeColors: ColorConfig[] = [
	{ name: "Background", variable: "--background", value: "oklch(0.145 0 0)", description: "Couleur de fond principale" },
	{ name: "Foreground", variable: "--foreground", value: "oklch(0.985 0 0)", description: "Couleur du texte principal" },
	{ name: "Card", variable: "--card", value: "oklch(0.205 0 0)", description: "Fond des cartes" },
	{ name: "Card Foreground", variable: "--card-foreground", value: "oklch(0.985 0 0)", description: "Texte des cartes" },
	{ name: "Popover", variable: "--popover", value: "oklch(0.205 0 0)", description: "Fond des popovers" },
	{ name: "Popover Foreground", variable: "--popover-foreground", value: "oklch(0.985 0 0)", description: "Texte des popovers" },
	{ name: "Primary", variable: "--primary", value: "oklch(0.922 0 0)", description: "Couleur primaire (boutons, liens)" },
	{ name: "Primary Foreground", variable: "--primary-foreground", value: "oklch(0.205 0 0)", description: "Texte sur couleur primaire" },
	{ name: "Secondary", variable: "--secondary", value: "oklch(0.269 0 0)", description: "Couleur secondaire" },
	{ name: "Secondary Foreground", variable: "--secondary-foreground", value: "oklch(0.985 0 0)", description: "Texte sur couleur secondaire" },
	{ name: "Muted", variable: "--muted", value: "oklch(0.269 0 0)", description: "Couleur atténuée" },
	{ name: "Muted Foreground", variable: "--muted-foreground", value: "oklch(0.708 0 0)", description: "Texte atténué" },
	{ name: "Accent", variable: "--accent", value: "oklch(0.269 0 0)", description: "Couleur d'accentuation" },
	{ name: "Accent Foreground", variable: "--accent-foreground", value: "oklch(0.985 0 0)", description: "Texte sur accent" },
	{ name: "Destructive", variable: "--destructive", value: "oklch(0.704 0.191 22.216)", description: "Couleur destructive (erreurs, suppressions)" },
	{ name: "Destructive Foreground", variable: "--destructive-foreground", value: "oklch(0.985 0 0)", description: "Texte sur destructive" },
	{ name: "Border", variable: "--border", value: "oklch(1 0 0 / 10%)", description: "Couleur des bordures" },
	{ name: "Input", variable: "--input", value: "oklch(1 0 0 / 15%)", description: "Couleur des champs de saisie" },
	{ name: "Ring", variable: "--ring", value: "oklch(0.556 0 0)", description: "Couleur du focus ring" },
	{ name: "Chart 1", variable: "--chart-1", value: "oklch(0.488 0.243 264.376)", description: "Couleur graphique 1" },
	{ name: "Chart 2", variable: "--chart-2", value: "oklch(0.696 0.17 162.48)", description: "Couleur graphique 2" },
	{ name: "Chart 3", variable: "--chart-3", value: "oklch(0.769 0.188 70.08)", description: "Couleur graphique 3" },
	{ name: "Chart 4", variable: "--chart-4", value: "oklch(0.627 0.265 303.9)", description: "Couleur graphique 4" },
	{ name: "Chart 5", variable: "--chart-5", value: "oklch(0.645 0.246 16.439)", description: "Couleur graphique 5" },
	{ name: "Sidebar", variable: "--sidebar", value: "oklch(0.205 0 0)", description: "Fond de la sidebar" },
	{ name: "Sidebar Foreground", variable: "--sidebar-foreground", value: "oklch(0.985 0 0)", description: "Texte de la sidebar" },
	{ name: "Sidebar Primary", variable: "--sidebar-primary", value: "oklch(0.488 0.243 264.376)", description: "Couleur primaire sidebar" },
	{ name: "Sidebar Primary Foreground", variable: "--sidebar-primary-foreground", value: "oklch(0.985 0 0)", description: "Texte primaire sidebar" },
	{ name: "Sidebar Accent", variable: "--sidebar-accent", value: "oklch(0.269 0 0)", description: "Accent sidebar" },
	{ name: "Sidebar Accent Foreground", variable: "--sidebar-accent-foreground", value: "oklch(0.985 0 0)", description: "Texte accent sidebar" },
	{ name: "Sidebar Border", variable: "--sidebar-border", value: "oklch(1 0 0 / 10%)", description: "Bordure sidebar" },
	{ name: "Sidebar Ring", variable: "--sidebar-ring", value: "oklch(0.556 0 0)", description: "Focus ring sidebar" },
];

export default function AppearancePage() {
	const [lightColors, setLightColors] = useState(lightThemeColors);
	const [darkColors, setDarkColors] = useState(darkThemeColors);
	const [radius, setRadius] = useState("0.625rem");
	const [isSaving, setIsSaving] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	// Charger les couleurs actuelles au montage
	useEffect(() => {
		const loadCurrentColors = async () => {
			const result = await getCurrentThemeColors();
			if (result.success && result.data) {
				const { light, dark, radius: currentRadius } = result.data;

				// Mettre à jour les couleurs light
				setLightColors(prev =>
					prev.map(color => ({
						...color,
						value: light[color.variable] || color.value,
					}))
				);

				// Mettre à jour les couleurs dark
				setDarkColors(prev =>
					prev.map(color => ({
						...color,
						value: dark[color.variable] || color.value,
					}))
				);

				setRadius(currentRadius);
			}
			setIsLoading(false);
		};

		loadCurrentColors();
	}, []);

	const updateLightColor = (variable: string, value: string) => {
		setLightColors(prev =>
			prev.map(color =>
				color.variable === variable ? { ...color, value } : color
			)
		);
		// Appliquer immédiatement
		document.documentElement.style.setProperty(variable, value);
	};

	const updateDarkColor = (variable: string, value: string) => {
		setDarkColors(prev =>
			prev.map(color =>
				color.variable === variable ? { ...color, value } : color
			)
		);
		// Appliquer immédiatement en mode dark
		if (document.documentElement.classList.contains('dark')) {
			document.documentElement.style.setProperty(variable, value);
		}
	};

	const updateRadius = (value: string) => {
		setRadius(value);
		document.documentElement.style.setProperty('--radius', value);
	};

	const handleSave = async () => {
		setIsSaving(true);
		try {
			const lightColorMap = lightColors.reduce((acc, color) => {
				acc[color.variable] = color.value;
				return acc;
			}, {} as Record<string, string>);

			const darkColorMap = darkColors.reduce((acc, color) => {
				acc[color.variable] = color.value;
				return acc;
			}, {} as Record<string, string>);

			const result = await saveThemeColors({
				light: lightColorMap,
				dark: darkColorMap,
				radius,
			});

			if (result.success) {
				toast.success("Thème sauvegardé avec succès");
				router.refresh();
			} else {
				toast.error(result.error || "Erreur lors de la sauvegarde");
			}
		} catch (error: any) {
			toast.error(error.message || "Erreur lors de la sauvegarde");
		} finally {
			setIsSaving(false);
		}
	};

	const handleReset = async () => {
		setIsSaving(true);
		try {
			const result = await resetThemeColors();

			if (result.success) {
				setLightColors(lightThemeColors);
				setDarkColors(darkThemeColors);
				setRadius("0.625rem");

				// Réinitialiser les valeurs CSS
				lightThemeColors.forEach(color => {
					document.documentElement.style.setProperty(color.variable, color.value);
				});
				document.documentElement.style.setProperty('--radius', '0.625rem');

				toast.success("Thème réinitialisé");
				router.refresh();
			} else {
				toast.error(result.error || "Erreur lors de la réinitialisation");
			}
		} catch (error: any) {
			toast.error(error.message || "Erreur lors de la réinitialisation");
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-96">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Appearance</h1>
				<p className="text-muted-foreground">
					Personnalisez les couleurs et le style de votre CMS
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Palette className="h-5 w-5" />
						Border Radius
					</CardTitle>
					<CardDescription>
						Définir l'arrondi des coins pour tous les composants
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-4">
						<Input
							type="text"
							value={radius}
							onChange={(e) => updateRadius(e.target.value)}
							className="max-w-xs"
							placeholder="0.625rem"
						/>
						<div className="flex gap-2">
							<Button variant="outline" size="sm" onClick={() => updateRadius("0rem")}>0</Button>
							<Button variant="outline" size="sm" onClick={() => updateRadius("0.375rem")}>SM</Button>
							<Button variant="outline" size="sm" onClick={() => updateRadius("0.625rem")}>MD</Button>
							<Button variant="outline" size="sm" onClick={() => updateRadius("1rem")}>LG</Button>
							<Button variant="outline" size="sm" onClick={() => updateRadius("2rem")}>XL</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Theme Colors</CardTitle>
					<CardDescription>
						Personnalisez les couleurs pour les thèmes clair et sombre
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="light" className="w-full">
						<TabsList>
							<TabsTrigger value="light" className="flex items-center gap-2">
								<Sun className="h-4 w-4" />
								Light Mode
							</TabsTrigger>
							<TabsTrigger value="dark" className="flex items-center gap-2">
								<Moon className="h-4 w-4" />
								Dark Mode
							</TabsTrigger>
						</TabsList>

						<TabsContent value="light" className="space-y-4 mt-4">
							{lightColors.map((color) => (
								<div key={color.variable} className="flex items-center gap-4">
									<div className="flex-1">
										<Label>{color.name}</Label>
										<p className="text-xs text-muted-foreground">{color.description}</p>
									</div>
									<ColorPicker
										value={color.value}
										onChange={(value) => updateLightColor(color.variable, value)}
										label={color.name}
									/>
								</div>
							))}
						</TabsContent>

						<TabsContent value="dark" className="space-y-4 mt-4">
							{darkColors.map((color) => (
								<div key={color.variable} className="flex items-center gap-4">
									<div className="flex-1">
										<Label>{color.name}</Label>
										<p className="text-xs text-muted-foreground">{color.description}</p>
									</div>
									<ColorPicker
										value={color.value}
										onChange={(value) => updateDarkColor(color.variable, value)}
										label={color.name}
									/>
								</div>
							))}
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			<div className="flex gap-4">
				<Button onClick={handleSave} size="lg" disabled={isSaving}>
					{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Enregistrer les modifications
				</Button>
				<Button onClick={handleReset} variant="outline" size="lg" disabled={isSaving}>
					{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Réinitialiser
				</Button>
			</div>
		</div>
	);
}
