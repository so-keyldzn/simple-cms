import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { getSettings } from "@/features/admin/lib/setting-actions";
import { SettingsForm } from "@/features/admin/components/settings-form";
import { SeoForm } from "@/features/admin/components/seo-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Search } from "lucide-react";

export const metadata: Metadata = {
	title: "Settings | Admin",
	description: "Configure system settings",
};

export default async function SettingsPage() {
	const { data: settings } = await getSettings();

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
						<Settings className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
						<p className="text-sm text-muted-foreground">
							Gérez la configuration de votre application et les paramètres globaux
						</p>
					</div>
				</div>
			</div>

			<Separator />

			<Tabs defaultValue="general" className="space-y-6">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="general">
						<Settings className="mr-2 h-4 w-4" />
						Configuration
					</TabsTrigger>
					<TabsTrigger value="seo">
						<Search className="mr-2 h-4 w-4" />
						SEO & Métadonnées
					</TabsTrigger>
				</TabsList>

				<TabsContent value="general" className="space-y-6">
					<SettingsForm initialSettings={settings || []} />
				</TabsContent>

				<TabsContent value="seo" className="space-y-6">
					<SeoForm />
				</TabsContent>
			</Tabs>
		</div>
	);
}
