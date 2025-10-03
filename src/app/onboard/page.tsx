import { OnboardingForm } from "@/features/onboard/components/onboarding-form";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Configuration initiale | Onboarding",
	description: "Configurez votre CMS pour la première fois",
};

export default async function OnboardPage() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
			<div className="w-full max-w-4xl space-y-8">
				<div className="text-center space-y-2">
					<h1 className="text-4xl font-bold tracking-tight">
						Bienvenue ! 👋
					</h1>
					<p className="text-lg text-muted-foreground">
						Configurons votre CMS en quelques étapes
					</p>
				</div>

				<OnboardingForm />

				<div className="text-center text-sm text-muted-foreground">
					<p>
						Cette configuration ne sera effectuée qu&apos;une seule fois. <br />
						Vous pourrez modifier ces paramètres plus tard dans les réglages.
					</p>
				</div>
			</div>
		</div>
	);
}
