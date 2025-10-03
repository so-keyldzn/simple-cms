"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Mail, User, Globe, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { completeFullOnboarding } from "../lib/onboard-actions";

type Step = "admin" | "site";

export function OnboardingForm() {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [step, setStep] = useState<Step>("admin");

	// Admin fields
	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	// Site settings fields
	const [siteName, setSiteName] = useState("");
	const [siteDescription, setSiteDescription] = useState("");
	const [siteLogo, setSiteLogo] = useState("");
	const [siteFavicon, setSiteFavicon] = useState("");

	// Handle step 1 -> step 2 (client-side navigation)
	const handleNext = () => {
		if (password !== confirmPassword) {
			toast.error("Les mots de passe ne correspondent pas");
			return;
		}

		if (!email || !name || !password) {
			toast.error("Veuillez remplir tous les champs requis");
			return;
		}

		// Move to step 2 (no server call)
		setStep("site");
	};

	// Handle final submission (step 2 -> complete)
	const handleSubmit = () => {
		if (!siteName) {
			toast.error("Le nom du site est requis");
			return;
		}

		startTransition(async () => {
			// Submit everything in one call
			const result = await completeFullOnboarding({
				email,
				name,
				password,
				siteName,
				siteDescription,
				siteLogo: siteLogo || undefined,
				siteFavicon: siteFavicon || undefined,
			});

			if (result.error) {
				toast.error(result.error);
			} else if (result.data) {
				// Sign in the newly created admin
				const { signIn } = await import("@/features/auth/lib/auth-clients");
				const signInResult = await signIn.email({
					email,
					password,
					callbackURL: "/admin",
				});

				if (signInResult.error) {
					toast.error("Erreur lors de la connexion automatique. Veuillez vous connecter manuellement.");
					window.location.href = "/sign-in";
				} else {
					// Success! Better Auth will handle the redirect to /admin
					toast.success("Configuration terminée ! Redirection...");

					// Wait a bit for the toast to show, then force reload
					setTimeout(() => {
						window.location.href = "/admin";
					}, 500);
				}
			}
		});
	};

	if (step === "admin") {
		return (
			<Card className="w-full max-w-2xl mx-auto">
				<CardHeader>
					<CardTitle className="text-2xl">Créer le compte Super Admin</CardTitle>
					<CardDescription>
						Créez le premier compte administrateur pour accéder au panneau d&apos;administration
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email *</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="email"
									type="email"
									placeholder="admin@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									disabled={isPending}
									className="pl-10"
									required
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="name">Nom complet *</Label>
							<div className="relative">
								<User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="name"
									type="text"
									placeholder="John Doe"
									value={name}
									onChange={(e) => setName(e.target.value)}
									disabled={isPending}
									className="pl-10"
									required
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Mot de passe *</Label>
							<div className="relative">
								<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="password"
									type="password"
									placeholder="••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									disabled={isPending}
									className="pl-10"
									required
								/>
							</div>
							<p className="text-xs text-muted-foreground">
								Au moins 8 caractères, avec majuscule, minuscule et chiffre
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirm-password">Confirmer le mot de passe *</Label>
							<div className="relative">
								<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="confirm-password"
									type="password"
									placeholder="••••••••"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									disabled={isPending}
									className="pl-10"
									required
								/>
							</div>
						</div>
					</div>

					<Button
						onClick={handleNext}
						disabled={isPending || !email || !name || !password || !confirmPassword}
						className="w-full"
					>
						Suivant
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle className="text-2xl">Configuration du site</CardTitle>
				<CardDescription>
					Configurez les informations de base de votre site
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="site-name">Nom du site *</Label>
						<div className="relative">
							<Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
							<Input
								id="site-name"
								type="text"
								placeholder="Mon Super Site"
								value={siteName}
								onChange={(e) => setSiteName(e.target.value)}
								disabled={isPending}
								className="pl-10"
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="site-description">Description du site</Label>
						<Textarea
							id="site-description"
							placeholder="Décrivez votre site en quelques mots..."
							value={siteDescription}
							onChange={(e) => setSiteDescription(e.target.value)}
							disabled={isPending}
							rows={3}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="site-logo">URL du logo</Label>
						<div className="relative">
							<ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
							<Input
								id="site-logo"
								type="url"
								placeholder="https://example.com/logo.png"
								value={siteLogo}
								onChange={(e) => setSiteLogo(e.target.value)}
								disabled={isPending}
								className="pl-10"
							/>
						</div>
						<p className="text-xs text-muted-foreground">
							URL complète de votre logo (optionnel)
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="site-favicon">URL du favicon</Label>
						<div className="relative">
							<ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
							<Input
								id="site-favicon"
								type="url"
								placeholder="https://example.com/favicon.ico"
								value={siteFavicon}
								onChange={(e) => setSiteFavicon(e.target.value)}
								disabled={isPending}
								className="pl-10"
							/>
						</div>
						<p className="text-xs text-muted-foreground">
							URL complète de votre favicon (optionnel)
						</p>
					</div>
				</div>

				<div className="flex gap-3">
					<Button
						variant="outline"
						onClick={() => setStep("admin")}
						disabled={isPending}
						className="w-full"
					>
						Retour
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isPending || !siteName}
						className="w-full"
					>
						{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Terminer la configuration
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
