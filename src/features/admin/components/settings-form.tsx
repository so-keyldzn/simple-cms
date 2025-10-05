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
	const [siteLogo, setSiteLogo] = useState(getSettingValue("site_logo"));
	const [siteFavicon, setSiteFavicon] = useState(getSettingValue("site_favicon"));

	// Header Settings
	const [headerSignInText, setHeaderSignInText] = useState(getSettingValue("header_signin_text", "Sign In"));
	const [headerSignInUrl, setHeaderSignInUrl] = useState(getSettingValue("header_signin_url", "/sign-in"));
	const [headerCTAText, setHeaderCTAText] = useState(getSettingValue("header_cta_text", "Get Started"));
	const [headerCTAUrl, setHeaderCTAUrl] = useState(getSettingValue("header_cta_url", "/sign-up"));

	// Email Settings
	const [fromEmail, setFromEmail] = useState(getSettingValue("from_email"));
	const [fromName, setFromName] = useState(getSettingValue("from_name"));

	// Footer Settings
	const [footerDescription, setFooterDescription] = useState(getSettingValue("footer_description"));
	const [footerCopyright, setFooterCopyright] = useState(getSettingValue("footer_copyright", `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`));

	// Social Links
	const [socialFacebook, setSocialFacebook] = useState(getSettingValue("footer_social_facebook"));
	const [socialTwitter, setSocialTwitter] = useState(getSettingValue("footer_social_twitter"));
	const [socialLinkedin, setSocialLinkedin] = useState(getSettingValue("footer_social_linkedin"));
	const [socialGithub, setSocialGithub] = useState(getSettingValue("footer_social_github"));
	const [socialInstagram, setSocialInstagram] = useState(getSettingValue("footer_social_instagram"));
	const [socialYoutube, setSocialYoutube] = useState(getSettingValue("footer_social_youtube"));

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
				{ key: "site_logo", value: siteLogo, category: "general" },
				{ key: "site_favicon", value: siteFavicon, category: "general" },
			]);

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Paramètres généraux sauvegardés");
			}
		});
	};

	const handleSaveHeader = () => {
		startTransition(async () => {
			const result = await updateSettings([
				{ key: "header_signin_text", value: headerSignInText, category: "general" },
				{ key: "header_signin_url", value: headerSignInUrl, category: "general" },
				{ key: "header_cta_text", value: headerCTAText, category: "general" },
				{ key: "header_cta_url", value: headerCTAUrl, category: "general" },
			]);

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Paramètres du header sauvegardés");
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

	const handleSaveFooter = () => {
		startTransition(async () => {
			const result = await updateSettings([
				{ key: "footer_description", value: footerDescription, category: "general" },
				{ key: "footer_copyright", value: footerCopyright, category: "general" },
				{ key: "footer_social_facebook", value: socialFacebook, category: "general" },
				{ key: "footer_social_twitter", value: socialTwitter, category: "general" },
				{ key: "footer_social_linkedin", value: socialLinkedin, category: "general" },
				{ key: "footer_social_github", value: socialGithub, category: "general" },
				{ key: "footer_social_instagram", value: socialInstagram, category: "general" },
				{ key: "footer_social_youtube", value: socialYoutube, category: "general" },
			]);

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Paramètres du footer sauvegardés");
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
					<div className="space-y-2">
						<Label htmlFor="site-logo">Logo URL</Label>
						<Input
							id="site-logo"
							type="url"
							placeholder="https://example.com/logo.png"
							value={siteLogo}
							onChange={(e) => setSiteLogo(e.target.value)}
							disabled={isPending}
						/>
						<p className="text-xs text-muted-foreground">
							URL de votre logo (optionnel)
						</p>
					</div>
					<div className="space-y-2">
						<Label htmlFor="site-favicon">Favicon URL</Label>
						<Input
							id="site-favicon"
							type="url"
							placeholder="https://example.com/favicon.ico"
							value={siteFavicon}
							onChange={(e) => setSiteFavicon(e.target.value)}
							disabled={isPending}
						/>
						<p className="text-xs text-muted-foreground">
							URL de votre favicon (optionnel)
						</p>
					</div>
					<Button onClick={handleSaveGeneral} disabled={isPending}>
						{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Save Changes
					</Button>
				</CardContent>
			</Card>

			{/* Header Settings */}
			<Card>
				<CardHeader>
					<CardTitle>Header Settings</CardTitle>
					<CardDescription>
						Configure the header navigation and call-to-action buttons
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="header-signin-text">Sign In Button Text</Label>
							<Input
								id="header-signin-text"
								placeholder="Sign In"
								value={headerSignInText}
								onChange={(e) => setHeaderSignInText(e.target.value)}
								disabled={isPending}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="header-signin-url">Sign In URL</Label>
							<Input
								id="header-signin-url"
								placeholder="/sign-in"
								value={headerSignInUrl}
								onChange={(e) => setHeaderSignInUrl(e.target.value)}
								disabled={isPending}
							/>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="header-cta-text">CTA Button Text</Label>
							<Input
								id="header-cta-text"
								placeholder="Get Started"
								value={headerCTAText}
								onChange={(e) => setHeaderCTAText(e.target.value)}
								disabled={isPending}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="header-cta-url">CTA URL</Label>
							<Input
								id="header-cta-url"
								placeholder="/sign-up"
								value={headerCTAUrl}
								onChange={(e) => setHeaderCTAUrl(e.target.value)}
								disabled={isPending}
							/>
						</div>
					</div>
					<Button onClick={handleSaveHeader} disabled={isPending}>
						{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Save Changes
					</Button>
				</CardContent>
			</Card>

			{/* Footer & Social Settings */}
			<Card>
				<CardHeader>
					<CardTitle>Footer & Social Links</CardTitle>
					<CardDescription>
						Configure footer description and social media links
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="footer-description">Footer Description</Label>
						<Textarea
							id="footer-description"
							placeholder="Une courte description de votre site..."
							value={footerDescription}
							onChange={(e) => setFooterDescription(e.target.value)}
							rows={3}
							disabled={isPending}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="footer-copyright">Copyright Text</Label>
						<Input
							id="footer-copyright"
							placeholder={`© ${new Date().getFullYear()} Your Site. All rights reserved.`}
							value={footerCopyright}
							onChange={(e) => setFooterCopyright(e.target.value)}
							disabled={isPending}
						/>
					</div>

					<div className="space-y-4 pt-4">
						<h4 className="text-sm font-medium">Réseaux Sociaux</h4>
						<p className="text-xs text-muted-foreground">
							Laissez vide pour masquer un réseau social du footer
						</p>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="social-facebook">Facebook</Label>
								<Input
									id="social-facebook"
									type="url"
									placeholder="https://facebook.com/yourpage"
									value={socialFacebook}
									onChange={(e) => setSocialFacebook(e.target.value)}
									disabled={isPending}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="social-twitter">Twitter / X</Label>
								<Input
									id="social-twitter"
									type="url"
									placeholder="https://twitter.com/yourhandle"
									value={socialTwitter}
									onChange={(e) => setSocialTwitter(e.target.value)}
									disabled={isPending}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="social-linkedin">LinkedIn</Label>
								<Input
									id="social-linkedin"
									type="url"
									placeholder="https://linkedin.com/company/yourcompany"
									value={socialLinkedin}
									onChange={(e) => setSocialLinkedin(e.target.value)}
									disabled={isPending}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="social-github">GitHub</Label>
								<Input
									id="social-github"
									type="url"
									placeholder="https://github.com/yourusername"
									value={socialGithub}
									onChange={(e) => setSocialGithub(e.target.value)}
									disabled={isPending}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="social-instagram">Instagram</Label>
								<Input
									id="social-instagram"
									type="url"
									placeholder="https://instagram.com/yourhandle"
									value={socialInstagram}
									onChange={(e) => setSocialInstagram(e.target.value)}
									disabled={isPending}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="social-youtube">YouTube</Label>
								<Input
									id="social-youtube"
									type="url"
									placeholder="https://youtube.com/@yourchannel"
									value={socialYoutube}
									onChange={(e) => setSocialYoutube(e.target.value)}
									disabled={isPending}
								/>
							</div>
						</div>
					</div>

					<Button onClick={handleSaveFooter} disabled={isPending}>
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
					<div className="rounded-lg bg-muted p-4 text-sm">
						<p className="text-muted-foreground">
							Ces paramètres sont utilisés pour l&apos;envoi des emails de vérification,
							réinitialisation de mot de passe et notifications via Resend.
						</p>
					</div>
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
						<p className="text-xs text-muted-foreground">
							Doit être un email vérifié sur Resend (ou utiliser onboarding@resend.dev en test)
						</p>
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
						<p className="text-xs text-muted-foreground">
							Nom affiché dans les emails (ex: &quot;Mon Site&quot;)
						</p>
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
