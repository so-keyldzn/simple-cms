"use client";

import { useState, useTransition } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateSettings } from "@/features/admin/lib/setting-actions";
import { toast } from "sonner";
import type { Setting } from "@/features/admin/lib/setting-actions";
import { Loader2 } from "lucide-react";

type SettingsFormProps = {
	initialSettings: Setting[];
};

export function SettingsForm({ initialSettings }: SettingsFormProps) {
	const [isPending, startTransition] = useTransition();

	// Helper to get setting value by key
	const getSettingValue = (key: string, defaultValue: string = "") => {
		const setting = initialSettings.find((s) => s.key === key);
		return setting?.value || defaultValue;
	};

	// General Settings
	const [siteName, setSiteName] = useState(getSettingValue("site_name", "My CMS"));
	const [siteDescription, setSiteDescription] = useState(getSettingValue("site_description"));
	const [siteUrl, setSiteUrl] = useState(getSettingValue("site_url"));

	// Email Settings
	const [fromEmail, setFromEmail] = useState(getSettingValue("from_email"));
	const [fromName, setFromName] = useState(getSettingValue("from_name"));

	// Advanced Settings
	const [postsPerPage, setPostsPerPage] = useState(getSettingValue("posts_per_page", "10"));
	const [dateFormat, setDateFormat] = useState(getSettingValue("date_format", "YYYY-MM-DD"));
	const [timezone, setTimezone] = useState(getSettingValue("timezone", "UTC"));

	const handleSaveGeneral = () => {
		startTransition(async () => {
			const result = await updateSettings([
				{ key: "site_name", value: siteName, category: "general" },
				{ key: "site_description", value: siteDescription, category: "general" },
				{ key: "site_url", value: siteUrl, category: "general" },
			]);

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Paramètres généraux sauvegardés");
			}
		});
	};

	const handleSaveEmail = () => {
		startTransition(async () => {
			const result = await updateSettings([
				{ key: "from_email", value: fromEmail, category: "email" },
				{ key: "from_name", value: fromName, category: "email" },
			]);

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Paramètres email sauvegardés");
			}
		});
	};

	const handleSaveAdvanced = () => {
		startTransition(async () => {
			const result = await updateSettings([
				{ key: "posts_per_page", value: postsPerPage, category: "advanced" },
				{ key: "date_format", value: dateFormat, category: "advanced" },
				{ key: "timezone", value: timezone, category: "advanced" },
			]);

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Paramètres avancés sauvegardés");
			}
		});
	};

	return (
		<div className="grid gap-6">
			{/* General Settings */}
			<Card>
				<CardHeader>
					<CardTitle>General Settings</CardTitle>
					<CardDescription>
						Configure basic information about your site
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="site-name">Site Name</Label>
						<Input
							id="site-name"
							placeholder="Enter your site name"
							value={siteName}
							onChange={(e) => setSiteName(e.target.value)}
							disabled={isPending}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="site-description">Site Description</Label>
						<Textarea
							id="site-description"
							placeholder="Enter your site description"
							value={siteDescription}
							onChange={(e) => setSiteDescription(e.target.value)}
							rows={3}
							disabled={isPending}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="site-url">Site URL</Label>
						<Input
							id="site-url"
							type="url"
							placeholder="https://example.com"
							value={siteUrl}
							onChange={(e) => setSiteUrl(e.target.value)}
							disabled={isPending}
						/>
					</div>
					<Button onClick={handleSaveGeneral} disabled={isPending}>
						{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Save Changes
					</Button>
				</CardContent>
			</Card>

			{/* Email Settings */}
			<Card>
				<CardHeader>
					<CardTitle>Email Settings</CardTitle>
					<CardDescription>
						Configure email delivery and notifications
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="from-email">From Email</Label>
						<Input
							id="from-email"
							type="email"
							placeholder="noreply@example.com"
							value={fromEmail}
							onChange={(e) => setFromEmail(e.target.value)}
							disabled={isPending}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="from-name">From Name</Label>
						<Input
							id="from-name"
							placeholder="Your Site Name"
							value={fromName}
							onChange={(e) => setFromName(e.target.value)}
							disabled={isPending}
						/>
					</div>
					<Button onClick={handleSaveEmail} disabled={isPending}>
						{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Save Changes
					</Button>
				</CardContent>
			</Card>

			{/* Advanced Settings */}
			<Card>
				<CardHeader>
					<CardTitle>Advanced Settings</CardTitle>
					<CardDescription>
						Advanced configuration options
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="posts-per-page">Posts Per Page</Label>
						<Input
							id="posts-per-page"
							type="number"
							min="1"
							max="100"
							value={postsPerPage}
							onChange={(e) => setPostsPerPage(e.target.value)}
							disabled={isPending}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="date-format">Date Format</Label>
						<Input
							id="date-format"
							placeholder="YYYY-MM-DD"
							value={dateFormat}
							onChange={(e) => setDateFormat(e.target.value)}
							disabled={isPending}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="timezone">Timezone</Label>
						<Input
							id="timezone"
							placeholder="UTC"
							value={timezone}
							onChange={(e) => setTimezone(e.target.value)}
							disabled={isPending}
						/>
					</div>
					<Button onClick={handleSaveAdvanced} disabled={isPending}>
						{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Save Changes
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
