"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Loader2, Lock, Mail, User, Globe, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { completeFullOnboarding } from "../lib/onboard-actions";

type Step = "admin" | "site";

const adminSchema = z.object({
	email: z.string().email("Email invalide"),
	name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
	password: z.string()
		.min(8, "Le mot de passe doit contenir au moins 8 caractères")
		.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"),
	confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Les mots de passe ne correspondent pas",
	path: ["confirmPassword"],
});

const siteSchema = z.object({
	siteName: z.string().min(1, "Le nom du site est requis"),
	siteDescription: z.string().optional(),
	siteLogo: z.string().url("URL invalide").optional().or(z.literal("")),
	siteFavicon: z.string().url("URL invalide").optional().or(z.literal("")),
});

type AdminFormData = z.infer<typeof adminSchema>;
type SiteFormData = z.infer<typeof siteSchema>;

export function OnboardingForm() {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [step, setStep] = useState<Step>("admin");
	const [adminData, setAdminData] = useState<AdminFormData | null>(null);

	const adminForm = useForm<AdminFormData>({
		resolver: zodResolver(adminSchema),
		defaultValues: {
			email: "",
			name: "",
			password: "",
			confirmPassword: "",
		},
	});

	const siteForm = useForm<SiteFormData>({
		resolver: zodResolver(siteSchema),
		defaultValues: {
			siteName: "",
			siteDescription: "",
			siteLogo: "",
			siteFavicon: "",
		},
	});

	// Handle step 1 -> step 2 (client-side navigation)
	const handleNext = (data: AdminFormData) => {
		setAdminData(data);
		setStep("site");
	};

	// Handle final submission (step 2 -> complete)
	const handleSubmit = (siteData: SiteFormData) => {
		if (!adminData) return;

		startTransition(async () => {
			// Submit everything in one call
			const result = await completeFullOnboarding({
				email: adminData.email,
				name: adminData.name,
				password: adminData.password,
				siteName: siteData.siteName,
				siteDescription: siteData.siteDescription || undefined,
				siteLogo: siteData.siteLogo || undefined,
				siteFavicon: siteData.siteFavicon || undefined,
			});

			if (result.error) {
				toast.error(result.error);
			} else if (result.data) {
				// Sign in the newly created admin
				const { signIn } = await import("@/features/auth/lib/auth-clients");
				const signInResult = await signIn.email({
					email: adminData.email,
					password: adminData.password,
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
					<Form {...adminForm}>
						<form onSubmit={adminForm.handleSubmit(handleNext)} className="space-y-4">
							<FormField
								control={adminForm.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email *</FormLabel>
										<FormControl>
											<InputGroup>
												<InputGroupText data-align="inline-start">
													<Mail className="h-4 w-4" />
												</InputGroupText>
												<InputGroupInput
													type="email"
													placeholder="admin@example.com"
													disabled={isPending}
													{...field}
												/>
											</InputGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={adminForm.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nom complet *</FormLabel>
										<FormControl>
											<InputGroup>
												<InputGroupText data-align="inline-start">
													<User className="h-4 w-4" />
												</InputGroupText>
												<InputGroupInput
													type="text"
													placeholder="John Doe"
													disabled={isPending}
													{...field}
												/>
											</InputGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={adminForm.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Mot de passe *</FormLabel>
										<FormControl>
											<InputGroup>
												<InputGroupText data-align="inline-start">
													<Lock className="h-4 w-4" />
												</InputGroupText>
												<InputGroupInput
													type="password"
													placeholder="••••••••"
													disabled={isPending}
													{...field}
												/>
											</InputGroup>
										</FormControl>
										<FormDescription>
											Au moins 8 caractères, avec majuscule, minuscule et chiffre
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={adminForm.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Confirmer le mot de passe *</FormLabel>
										<FormControl>
											<InputGroup>
												<InputGroupText data-align="inline-start">
													<Lock className="h-4 w-4" />
												</InputGroupText>
												<InputGroupInput
													type="password"
													placeholder="••••••••"
													disabled={isPending}
													{...field}
												/>
											</InputGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button
								type="submit"
								disabled={isPending}
								className="w-full"
							>
								Suivant
							</Button>
						</form>
					</Form>
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
				<Form {...siteForm}>
					<form onSubmit={siteForm.handleSubmit(handleSubmit)} className="space-y-4">
						<FormField
							control={siteForm.control}
							name="siteName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nom du site *</FormLabel>
									<FormControl>
										<InputGroup>
											<InputGroupText data-align="inline-start">
												<Globe className="h-4 w-4" />
											</InputGroupText>
											<InputGroupInput
												type="text"
												placeholder="Mon Super Site"
												disabled={isPending}
												{...field}
											/>
										</InputGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={siteForm.control}
							name="siteDescription"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description du site</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Décrivez votre site en quelques mots..."
											disabled={isPending}
											rows={3}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={siteForm.control}
							name="siteLogo"
							render={({ field }) => (
								<FormItem>
									<FormLabel>URL du logo</FormLabel>
									<FormControl>
										<InputGroup>
											<InputGroupText data-align="inline-start">
												<ImageIcon className="h-4 w-4" />
											</InputGroupText>
											<InputGroupInput
												type="url"
												placeholder="https://example.com/logo.png"
												disabled={isPending}
												{...field}
											/>
										</InputGroup>
									</FormControl>
									<FormDescription>
										URL complète de votre logo (optionnel)
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={siteForm.control}
							name="siteFavicon"
							render={({ field }) => (
								<FormItem>
									<FormLabel>URL du favicon</FormLabel>
									<FormControl>
										<InputGroup>
											<InputGroupText data-align="inline-start">
												<ImageIcon className="h-4 w-4" />
											</InputGroupText>
											<InputGroupInput
												type="url"
												placeholder="https://example.com/favicon.ico"
												disabled={isPending}
												{...field}
											/>
										</InputGroup>
									</FormControl>
									<FormDescription>
										URL complète de votre favicon (optionnel)
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<ButtonGroup>
							<Button
								type="button"
								variant="outline"
								onClick={() => setStep("admin")}
								disabled={isPending}
								className="flex-1"
							>
								Retour
							</Button>
							<Button
								type="submit"
								disabled={isPending}
								className="flex-1"
							>
								{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Terminer la configuration
							</Button>
						</ButtonGroup>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
