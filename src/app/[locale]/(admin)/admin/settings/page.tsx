import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { getSettings } from "@/features/admin/lib/setting-actions";
import { SettingsForm } from "@/features/admin/components/settings-form";
import { SeoForm } from "@/features/admin/components/seo-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
	title: "Settings | Admin",
	description: "Configure system settings",
};

export default async function SettingsPage() {
	const { data: settings } = await getSettings();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
				<p className="text-muted-foreground">
					Manage your application settings and preferences
				</p>
			</div>

			<Separator />

			<Tabs defaultValue="general" className="space-y-6">
				<TabsList>
					<TabsTrigger value="general">Configuration</TabsTrigger>
					<TabsTrigger value="seo">SEO</TabsTrigger>
				</TabsList>

				<TabsContent value="general">
					<SettingsForm initialSettings={settings || []} />
				</TabsContent>

				<TabsContent value="seo">
					<SeoForm />
				</TabsContent>
			</Tabs>
		</div>
	);
}
