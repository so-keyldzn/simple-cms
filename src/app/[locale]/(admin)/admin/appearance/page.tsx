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
import { Palette, Moon, Sun, Loader2, ChevronDown, ChevronUp, Eye, RotateCcw, Save } from "lucide-react";
import { useThemeColors, useSaveThemeColors, useResetThemeColors } from "@/features/data/hooks/use-appearance";
import { ColorPicker } from "@/components/ui/color-picker";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type ColorConfig = {
	name: string;
	variable: string;
	value: string;
	description: string;
	category?: string;
};

const lightThemeColors: ColorConfig[] = [
	{ name: "Background", variable: "--background", value: "oklch(1 0 0)", description: "Couleur de fond principale", category: "Base" },
	{ name: "Foreground", variable: "--foreground", value: "oklch(0.145 0 0)", description: "Couleur du texte principal", category: "Base" },
	{ name: "Card", variable: "--card", value: "oklch(1 0 0)", description: "Fond des cartes", category: "Composants" },
	{ name: "Card Foreground", variable: "--card-foreground", value: "oklch(0.145 0 0)", description: "Texte des cartes", category: "Composants" },
	{ name: "Popover", variable: "--popover", value: "oklch(1 0 0)", description: "Fond des popovers", category: "Composants" },
	{ name: "Popover Foreground", variable: "--popover-foreground", value: "oklch(0.145 0 0)", description: "Texte des popovers", category: "Composants" },
	{ name: "Primary", variable: "--primary", value: "oklch(0.205 0 0)", description: "Couleur primaire (boutons, liens)", category: "Actions" },
	{ name: "Primary Foreground", variable: "--primary-foreground", value: "oklch(0.985 0 0)", description: "Texte sur couleur primaire", category: "Actions" },
	{ name: "Secondary", variable: "--secondary", value: "oklch(0.97 0 0)", description: "Couleur secondaire", category: "Actions" },
	{ name: "Secondary Foreground", variable: "--secondary-foreground", value: "oklch(0.205 0 0)", description: "Texte sur couleur secondaire", category: "Actions" },
	{ name: "Muted", variable: "--muted", value: "oklch(0.97 0 0)", description: "Couleur atténuée", category: "États" },
	{ name: "Muted Foreground", variable: "--muted-foreground", value: "oklch(0.556 0 0)", description: "Texte atténué", category: "États" },
	{ name: "Accent", variable: "--accent", value: "oklch(0.97 0 0)", description: "Couleur d'accentuation", category: "États" },
	{ name: "Accent Foreground", variable: "--accent-foreground", value: "oklch(0.205 0 0)", description: "Texte sur accent", category: "États" },
	{ name: "Destructive", variable: "--destructive", value: "oklch(0.577 0.245 27.325)", description: "Couleur destructive (erreurs, suppressions)", category: "États" },
	{ name: "Destructive Foreground", variable: "--destructive-foreground", value: "oklch(0.985 0 0)", description: "Texte sur destructive", category: "États" },
	{ name: "Border", variable: "--border", value: "oklch(0.922 0 0)", description: "Couleur des bordures", category: "Bordures" },
	{ name: "Input", variable: "--input", value: "oklch(0.922 0 0)", description: "Couleur des champs de saisie", category: "Bordures" },
	{ name: "Ring", variable: "--ring", value: "oklch(0.708 0 0)", description: "Couleur du focus ring", category: "Bordures" },
	{ name: "Chart 1", variable: "--chart-1", value: "oklch(0.646 0.222 41.116)", description: "Couleur graphique 1", category: "Graphiques" },
	{ name: "Chart 2", variable: "--chart-2", value: "oklch(0.6 0.118 184.704)", description: "Couleur graphique 2", category: "Graphiques" },
	{ name: "Chart 3", variable: "--chart-3", value: "oklch(0.398 0.07 227.392)", description: "Couleur graphique 3", category: "Graphiques" },
	{ name: "Chart 4", variable: "--chart-4", value: "oklch(0.828 0.189 84.429)", description: "Couleur graphique 4", category: "Graphiques" },
	{ name: "Chart 5", variable: "--chart-5", value: "oklch(0.769 0.188 70.08)", description: "Couleur graphique 5", category: "Graphiques" },
	{ name: "Sidebar", variable: "--sidebar", value: "oklch(0.985 0 0)", description: "Fond de la sidebar", category: "Sidebar" },
	{ name: "Sidebar Foreground", variable: "--sidebar-foreground", value: "oklch(0.145 0 0)", description: "Texte de la sidebar", category: "Sidebar" },
	{ name: "Sidebar Primary", variable: "--sidebar-primary", value: "oklch(0.205 0 0)", description: "Couleur primaire sidebar", category: "Sidebar" },
	{ name: "Sidebar Primary Foreground", variable: "--sidebar-primary-foreground", value: "oklch(0.985 0 0)", description: "Texte primaire sidebar", category: "Sidebar" },
	{ name: "Sidebar Accent", variable: "--sidebar-accent", value: "oklch(0.97 0 0)", description: "Accent sidebar", category: "Sidebar" },
	{ name: "Sidebar Accent Foreground", variable: "--sidebar-accent-foreground", value: "oklch(0.205 0 0)", description: "Texte accent sidebar", category: "Sidebar" },
	{ name: "Sidebar Border", variable: "--sidebar-border", value: "oklch(0.922 0 0)", description: "Bordure sidebar", category: "Sidebar" },
	{ name: "Sidebar Ring", variable: "--sidebar-ring", value: "oklch(0.708 0 0)", description: "Focus ring sidebar", category: "Sidebar" },
];

const darkThemeColors: ColorConfig[] = [
	{ name: "Background", variable: "--background", value: "oklch(0.145 0 0)", description: "Couleur de fond principale", category: "Base" },
	{ name: "Foreground", variable: "--foreground", value: "oklch(0.985 0 0)", description: "Couleur du texte principal", category: "Base" },
	{ name: "Card", variable: "--card", value: "oklch(0.205 0 0)", description: "Fond des cartes", category: "Composants" },
	{ name: "Card Foreground", variable: "--card-foreground", value: "oklch(0.985 0 0)", description: "Texte des cartes", category: "Composants" },
	{ name: "Popover", variable: "--popover", value: "oklch(0.205 0 0)", description: "Fond des popovers", category: "Composants" },
	{ name: "Popover Foreground", variable: "--popover-foreground", value: "oklch(0.985 0 0)", description: "Texte des popovers", category: "Composants" },
	{ name: "Primary", variable: "--primary", value: "oklch(0.922 0 0)", description: "Couleur primaire (boutons, liens)", category: "Actions" },
	{ name: "Primary Foreground", variable: "--primary-foreground", value: "oklch(0.205 0 0)", description: "Texte sur couleur primaire", category: "Actions" },
	{ name: "Secondary", variable: "--secondary", value: "oklch(0.269 0 0)", description: "Couleur secondaire", category: "Actions" },
	{ name: "Secondary Foreground", variable: "--secondary-foreground", value: "oklch(0.985 0 0)", description: "Texte sur couleur secondaire", category: "Actions" },
	{ name: "Muted", variable: "--muted", value: "oklch(0.269 0 0)", description: "Couleur atténuée", category: "États" },
	{ name: "Muted Foreground", variable: "--muted-foreground", value: "oklch(0.708 0 0)", description: "Texte atténué", category: "États" },
	{ name: "Accent", variable: "--accent", value: "oklch(0.269 0 0)", description: "Couleur d'accentuation", category: "États" },
	{ name: "Accent Foreground", variable: "--accent-foreground", value: "oklch(0.985 0 0)", description: "Texte sur accent", category: "États" },
	{ name: "Destructive", variable: "--destructive", value: "oklch(0.704 0.191 22.216)", description: "Couleur destructive (erreurs, suppressions)", category: "États" },
	{ name: "Destructive Foreground", variable: "--destructive-foreground", value: "oklch(0.985 0 0)", description: "Texte sur destructive", category: "États" },
	{ name: "Border", variable: "--border", value: "oklch(1 0 0 / 10%)", description: "Couleur des bordures", category: "Bordures" },
	{ name: "Input", variable: "--input", value: "oklch(1 0 0 / 15%)", description: "Couleur des champs de saisie", category: "Bordures" },
	{ name: "Ring", variable: "--ring", value: "oklch(0.556 0 0)", description: "Couleur du focus ring", category: "Bordures" },
	{ name: "Chart 1", variable: "--chart-1", value: "oklch(0.488 0.243 264.376)", description: "Couleur graphique 1", category: "Graphiques" },
	{ name: "Chart 2", variable: "--chart-2", value: "oklch(0.696 0.17 162.48)", description: "Couleur graphique 2", category: "Graphiques" },
	{ name: "Chart 3", variable: "--chart-3", value: "oklch(0.769 0.188 70.08)", description: "Couleur graphique 3", category: "Graphiques" },
	{ name: "Chart 4", variable: "--chart-4", value: "oklch(0.627 0.265 303.9)", description: "Couleur graphique 4", category: "Graphiques" },
	{ name: "Chart 5", variable: "--chart-5", value: "oklch(0.645 0.246 16.439)", description: "Couleur graphique 5", category: "Graphiques" },
	{ name: "Sidebar", variable: "--sidebar", value: "oklch(0.205 0 0)", description: "Fond de la sidebar", category: "Sidebar" },
	{ name: "Sidebar Foreground", variable: "--sidebar-foreground", value: "oklch(0.985 0 0)", description: "Texte de la sidebar", category: "Sidebar" },
	{ name: "Sidebar Primary", variable: "--sidebar-primary", value: "oklch(0.488 0.243 264.376)", description: "Couleur primaire sidebar", category: "Sidebar" },
	{ name: "Sidebar Primary Foreground", variable: "--sidebar-primary-foreground", value: "oklch(0.985 0 0)", description: "Texte primaire sidebar", category: "Sidebar" },
	{ name: "Sidebar Accent", variable: "--sidebar-accent", value: "oklch(0.269 0 0)", description: "Accent sidebar", category: "Sidebar" },
	{ name: "Sidebar Accent Foreground", variable: "--sidebar-accent-foreground", value: "oklch(0.985 0 0)", description: "Texte accent sidebar", category: "Sidebar" },
	{ name: "Sidebar Border", variable: "--sidebar-border", value: "oklch(1 0 0 / 10%)", description: "Bordure sidebar", category: "Sidebar" },
	{ name: "Sidebar Ring", variable: "--sidebar-ring", value: "oklch(0.556 0 0)", description: "Focus ring sidebar", category: "Sidebar" },
];

// Grouper les couleurs par catégorie
function groupByCategory(colors: ColorConfig[]) {
	const groups: Record<string, ColorConfig[]> = {};
	colors.forEach(color => {
		const category = color.category || "Autres";
		if (!groups[category]) {
			groups[category] = [];
		}
		groups[category].push(color);
	});
	return groups;
}

// Composant pour afficher une catégorie de couleurs
interface ColorCategoryProps {
	category: string;
	colors: ColorConfig[];
	updateColor: (variable: string, value: string) => void;
	defaultOpen?: boolean;
}

function ColorCategory({ category, colors, updateColor, defaultOpen = false }: ColorCategoryProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<CollapsibleTrigger asChild>
				<Button
					variant="ghost"
					className="flex w-full justify-between p-4 hover:bg-muted/50"
				>
					<div className="flex items-center gap-2">
						<Badge variant="outline">{colors.length}</Badge>
						<span className="font-semibold">{category}</span>
					</div>
					{isOpen ? (
						<ChevronUp className="h-4 w-4 text-muted-foreground" />
					) : (
						<ChevronDown className="h-4 w-4 text-muted-foreground" />
					)}
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent className="space-y-3 px-4 pb-4">
				{colors.map((color) => (
					<div key={color.variable} className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/30 transition-colors">
						<div className="flex-1 min-w-0">
							<Label className="font-medium">{color.name}</Label>
							<p className="text-xs text-muted-foreground truncate">{color.description}</p>
						</div>
						<ColorPicker
							value={color.value}
							onChange={(value) => updateColor(color.variable, value)}
							label={color.name}
						/>
					</div>
				))}
			</CollapsibleContent>
		</Collapsible>
	);
}

export default function AppearancePage() {
	const [lightColors, setLightColors] = useState(lightThemeColors);
	const [darkColors, setDarkColors] = useState(darkThemeColors);
	const [radius, setRadius] = useState("0.625rem");
	const [hasChanges, setHasChanges] = useState(false);

	// TanStack Query hooks
	const { data: themeData, isLoading } = useThemeColors();
	const saveMutation = useSaveThemeColors();
	const resetMutation = useResetThemeColors();

	// Update state when query data changes
	useEffect(() => {
		if (themeData) {
			const { light, dark, radius: currentRadius } = themeData;

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
	}, [themeData]);

	const updateLightColor = (variable: string, value: string) => {
		setLightColors(prev =>
			prev.map(color =>
				color.variable === variable ? { ...color, value } : color
			)
		);
		setHasChanges(true);
		// Appliquer immédiatement
		document.documentElement.style.setProperty(variable, value);
	};

	const updateDarkColor = (variable: string, value: string) => {
		setDarkColors(prev =>
			prev.map(color =>
				color.variable === variable ? { ...color, value } : color
			)
		);
		setHasChanges(true);
		// Appliquer immédiatement en mode dark
		if (document.documentElement.classList.contains('dark')) {
			document.documentElement.style.setProperty(variable, value);
		}
	};

	const updateRadius = (value: string) => {
		setRadius(value);
		setHasChanges(true);
		document.documentElement.style.setProperty('--radius', value);
	};

	const handleSave = () => {
		const lightColorMap = lightColors.reduce((acc, color) => {
			acc[color.variable] = color.value;
			return acc;
		}, {} as Record<string, string>);

		const darkColorMap = darkColors.reduce((acc, color) => {
			acc[color.variable] = color.value;
			return acc;
		}, {} as Record<string, string>);

		saveMutation.mutate({
			light: lightColorMap,
			dark: darkColorMap,
			radius,
		}, {
			onSuccess: () => {
				setHasChanges(false);
			}
		});
	};

	const handleReset = () => {
		resetMutation.mutate(undefined, {
			onSuccess: () => {
				setLightColors(lightThemeColors);
				setDarkColors(darkThemeColors);
				setRadius("0.625rem");
				setHasChanges(false);

				// Réinitialiser les valeurs CSS
				lightThemeColors.forEach(color => {
					document.documentElement.style.setProperty(color.variable, color.value);
				});
				document.documentElement.style.setProperty('--radius', '0.625rem');
			}
		});
	};

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center h-96 gap-3">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				<p className="text-sm text-muted-foreground">Chargement des paramètres...</p>
			</div>
		);
	}

	const lightColorGroups = groupByCategory(lightColors);
	const darkColorGroups = groupByCategory(darkColors);

	return (
		<div className="space-y-6 pb-8">
			{/* Header avec statut */}
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Apparence</h1>
					<p className="text-muted-foreground mt-1">
						Personnalisez les couleurs et le style de votre CMS
					</p>
				</div>
				{hasChanges && (
					<Badge variant="secondary" className="gap-1">
						<Eye className="h-3 w-3" />
						Modifications non sauvegardées
					</Badge>
				)}
			</div>

			{/* Prévisualisation rapide */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Eye className="h-5 w-5" />
						Aperçu
					</CardTitle>
					<CardDescription>
						Visualisez les changements en temps réel sur cette page
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-3">
						<Button size="sm">Bouton primaire</Button>
						<Button size="sm" variant="secondary">Secondaire</Button>
						<Button size="sm" variant="outline">Outline</Button>
						<Button size="sm" variant="destructive">Destructif</Button>
						<Badge>Badge</Badge>
						<Badge variant="outline">Outline</Badge>
					</div>
				</CardContent>
			</Card>

			{/* Border Radius */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Palette className="h-5 w-5" />
						Arrondi des coins
					</CardTitle>
					<CardDescription>
						Définir l&apos;arrondi pour tous les composants UI
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4">
						<div className="flex flex-wrap items-center gap-2">
							<Button
								variant={radius === "0rem" ? "default" : "outline"}
								size="sm"
								onClick={() => updateRadius("0rem")}
							>
								0 - Carré
							</Button>
							<Button
								variant={radius === "0.375rem" ? "default" : "outline"}
								size="sm"
								onClick={() => updateRadius("0.375rem")}
							>
								SM
							</Button>
							<Button
								variant={radius === "0.625rem" ? "default" : "outline"}
								size="sm"
								onClick={() => updateRadius("0.625rem")}
							>
								MD - Par défaut
							</Button>
							<Button
								variant={radius === "1rem" ? "default" : "outline"}
								size="sm"
								onClick={() => updateRadius("1rem")}
							>
								LG
							</Button>
							<Button
								variant={radius === "2rem" ? "default" : "outline"}
								size="sm"
								onClick={() => updateRadius("2rem")}
							>
								XL
							</Button>
						</div>
						<div className="flex items-center gap-3">
							<Label className="min-w-[100px]">Valeur personnalisée</Label>
							<Input
								type="text"
								value={radius}
								onChange={(e) => updateRadius(e.target.value)}
								className="max-w-xs"
								placeholder="0.625rem"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Theme Colors */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Palette className="h-5 w-5" />
						Couleurs du thème
					</CardTitle>
					<CardDescription>
						Personnalisez les couleurs pour les modes clair et sombre
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="light" className="w-full">
						<TabsList className="grid w-full max-w-md grid-cols-2">
							<TabsTrigger value="light" className="flex items-center gap-2">
								<Sun className="h-4 w-4" />
								Mode clair
							</TabsTrigger>
							<TabsTrigger value="dark" className="flex items-center gap-2">
								<Moon className="h-4 w-4" />
								Mode sombre
							</TabsTrigger>
						</TabsList>

						<TabsContent value="light" className="space-y-1 mt-6">
							{Object.entries(lightColorGroups).map(([category, colors], idx) => (
								<div key={category}>
									<ColorCategory
										category={category}
										colors={colors}
										updateColor={updateLightColor}
										defaultOpen={idx === 0}
									/>
									<Separator />
								</div>
							))}
						</TabsContent>

						<TabsContent value="dark" className="space-y-1 mt-6">
							{Object.entries(darkColorGroups).map(([category, colors], idx) => (
								<div key={category}>
									<ColorCategory
										category={category}
										colors={colors}
										updateColor={updateDarkColor}
										defaultOpen={idx === 0}
									/>
									<Separator />
								</div>
							))}
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			{/* Actions */}
			<div className="flex flex-wrap gap-3 sticky bottom-0 bg-background/80 backdrop-blur-sm py-4 border-t">
				<Button
					onClick={handleSave}
					size="lg"
					disabled={saveMutation.isPending || resetMutation.isPending || !hasChanges}
					className="gap-2"
				>
					{saveMutation.isPending ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Save className="h-4 w-4" />
					)}
					{saveMutation.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
				</Button>
				<Button
					onClick={handleReset}
					variant="outline"
					size="lg"
					disabled={saveMutation.isPending || resetMutation.isPending}
					className="gap-2"
				>
					<RotateCcw className="h-4 w-4" />
					Réinitialiser
				</Button>
				{hasChanges && (
					<p className="text-sm text-muted-foreground flex items-center">
						Les changements sont visibles en temps réel mais ne seront pas sauvegardés tant que vous n&apos;avez pas cliqué sur &quot;Enregistrer&quot;
					</p>
				)}
			</div>
		</div>
	);
}
