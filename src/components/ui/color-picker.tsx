"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Paintbrush } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ColorPickerProps {
	value: string;
	onChange: (value: string) => void;
	label?: string;
}

// Parser pour extraire les valeurs OKLCH
function parseOKLCH(color: string): { l: number; c: number; h: number; alpha?: number } | null {
	const match = color.match(/oklch\(([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+%?))?\)/);
	if (!match) return null;

	return {
		l: parseFloat(match[1]),
		c: parseFloat(match[2]),
		h: parseFloat(match[3]),
		alpha: match[4] ? parseFloat(match[4]) : undefined,
	};
}

// Formatter pour créer une chaîne OKLCH
function formatOKLCH(l: number, c: number, h: number, alpha?: number): string {
	if (alpha !== undefined && alpha < 100) {
		return `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${h.toFixed(4)} / ${alpha}%)`;
	}
	return `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${h.toFixed(4)})`;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
	const parsed = parseOKLCH(value);
	const [lightness, setLightness] = React.useState(parsed?.l ?? 0.5);
	const [chroma, setChroma] = React.useState(parsed?.c ?? 0.1);
	const [hue, setHue] = React.useState(parsed?.h ?? 180);
	const [alpha, setAlpha] = React.useState(parsed?.alpha ?? 100);
	const [manualValue, setManualValue] = React.useState(value);

	React.useEffect(() => {
		const parsed = parseOKLCH(value);
		if (parsed) {
			setLightness(parsed.l);
			setChroma(parsed.c);
			setHue(parsed.h);
			setAlpha(parsed.alpha ?? 100);
		}
		setManualValue(value);
	}, [value]);

	const updateColor = (l: number, c: number, h: number, a: number) => {
		const newColor = formatOKLCH(l, c, h, a < 100 ? a : undefined);
		setManualValue(newColor);
		onChange(newColor);
	};

	const handleLightnessChange = (values: number[]) => {
		const l = values[0];
		setLightness(l);
		updateColor(l, chroma, hue, alpha);
	};

	const handleChromaChange = (values: number[]) => {
		const c = values[0];
		setChroma(c);
		updateColor(lightness, c, hue, alpha);
	};

	const handleHueChange = (values: number[]) => {
		const h = values[0];
		setHue(h);
		updateColor(lightness, chroma, h, alpha);
	};

	const handleAlphaChange = (values: number[]) => {
		const a = values[0];
		setAlpha(a);
		updateColor(lightness, chroma, hue, a);
	};

	const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setManualValue(newValue);
		const parsed = parseOKLCH(newValue);
		if (parsed) {
			setLightness(parsed.l);
			setChroma(parsed.c);
			setHue(parsed.h);
			setAlpha(parsed.alpha ?? 100);
			onChange(newValue);
		}
	};

	const currentColor = formatOKLCH(lightness, chroma, hue, alpha < 100 ? alpha : undefined);

	return (
		<div className="flex items-center gap-2">
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className="w-10 h-10 p-0 border-2"
						style={{ backgroundColor: currentColor }}
					>
						<Paintbrush className="h-4 w-4" style={{
							color: lightness < 0.5 ? 'white' : 'black'
						}} />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-80">
					<div className="space-y-4">
						{label && <Label className="font-semibold">{label}</Label>}

						{/* Prévisualisation grande */}
						<div
							className="h-24 rounded-lg border-2 shadow-sm"
							style={{ backgroundColor: currentColor }}
						/>

						<Tabs defaultValue="sliders">
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="sliders">Sélecteur</TabsTrigger>
								<TabsTrigger value="manual">Manuel</TabsTrigger>
							</TabsList>

							<TabsContent value="sliders" className="space-y-4 mt-4">
								{/* Lightness Slider */}
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<Label className="text-xs font-medium">Luminosité (L)</Label>
										<span className="text-xs text-muted-foreground">{(lightness * 100).toFixed(0)}%</span>
									</div>
									<Slider
										value={[lightness]}
										onValueChange={handleLightnessChange}
										min={0}
										max={1}
										step={0.01}
										className="w-full"
									/>
									<div
										className="h-2 rounded"
										style={{
											background: `linear-gradient(to right,
												oklch(0 ${chroma} ${hue}),
												oklch(0.5 ${chroma} ${hue}),
												oklch(1 ${chroma} ${hue}))`
										}}
									/>
								</div>

								{/* Chroma Slider */}
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<Label className="text-xs font-medium">Saturation (C)</Label>
										<span className="text-xs text-muted-foreground">{((chroma / 0.4) * 100).toFixed(0)}%</span>
									</div>
									<Slider
										value={[chroma]}
										onValueChange={handleChromaChange}
										min={0}
										max={0.4}
										step={0.01}
										className="w-full"
									/>
									<div
										className="h-2 rounded"
										style={{
											background: `linear-gradient(to right,
												oklch(${lightness} 0 ${hue}),
												oklch(${lightness} 0.2 ${hue}),
												oklch(${lightness} 0.4 ${hue}))`
										}}
									/>
								</div>

								{/* Hue Slider */}
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<Label className="text-xs font-medium">Teinte (H)</Label>
										<span className="text-xs text-muted-foreground">{hue.toFixed(0)}°</span>
									</div>
									<Slider
										value={[hue]}
										onValueChange={handleHueChange}
										min={0}
										max={360}
										step={1}
										className="w-full"
									/>
									<div
										className="h-2 rounded"
										style={{
											background: `linear-gradient(to right,
												oklch(${lightness} ${chroma} 0),
												oklch(${lightness} ${chroma} 60),
												oklch(${lightness} ${chroma} 120),
												oklch(${lightness} ${chroma} 180),
												oklch(${lightness} ${chroma} 240),
												oklch(${lightness} ${chroma} 300),
												oklch(${lightness} ${chroma} 360))`
										}}
									/>
								</div>

								{/* Alpha Slider */}
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<Label className="text-xs font-medium">Opacité</Label>
										<span className="text-xs text-muted-foreground">{alpha.toFixed(0)}%</span>
									</div>
									<Slider
										value={[alpha]}
										onValueChange={handleAlphaChange}
										min={0}
										max={100}
										step={1}
										className="w-full"
									/>
								</div>
							</TabsContent>

							<TabsContent value="manual" className="space-y-3 mt-4">
								<div className="space-y-2">
									<Label className="text-xs font-medium">Valeur OKLCH</Label>
									<Input
										type="text"
										value={manualValue}
										onChange={handleManualChange}
										className="font-mono text-sm"
										placeholder="oklch(0.5 0.2 180)"
									/>
								</div>
								<div className="text-xs text-muted-foreground space-y-1">
									<p className="font-medium">Format OKLCH :</p>
									<p>oklch(lightness chroma hue)</p>
									<p>- Lightness: 0 à 1 (noir à blanc)</p>
									<p>- Chroma: 0 à 0.4 (gris à saturé)</p>
									<p>- Hue: 0 à 360 (roue des couleurs)</p>
								</div>
							</TabsContent>
						</Tabs>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}
