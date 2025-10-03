"use client";

import { useState, useTransition, useRef } from "react";
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
import { UserAvatar } from "@/components/user-avatar";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { updateProfile } from "@/features/auth/lib/profile-actions";
import { useRouter } from "next/navigation";

type ProfileFormProps = {
	user: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	};
};

export function ProfileForm({ user }: ProfileFormProps) {
	const [isPending, startTransition] = useTransition();
	const [isUploading, setIsUploading] = useState(false);
	const [name, setName] = useState(user.name);
	const [imageUrl, setImageUrl] = useState(user.image || "");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const router = useRouter();

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			toast.error("Veuillez sélectionner une image");
			return;
		}

		// Validate file size (max 5MB for profile photos)
		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			toast.error("L'image ne doit pas dépasser 5MB");
			return;
		}

		setIsUploading(true);

		try {
			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			const result = await response.json();

			if (!response.ok || result.error) {
				toast.error(result.error || "Erreur lors de l'upload");
				return;
			}

			// Update image URL with uploaded file
			if (result.data?.url) {
				setImageUrl(result.data.url);
				toast.success("Photo uploadée avec succès");
			}
		} catch (error) {
			console.error("Upload error:", error);
			toast.error("Erreur lors de l'upload");
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const handleSave = () => {
		if (!name.trim()) {
			toast.error("Le nom ne peut pas être vide");
			return;
		}

		startTransition(async () => {
			const result = await updateProfile({
				name: name.trim(),
				image: imageUrl.trim() || null,
			});

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Profil mis à jour avec succès");
				// Refresh the page to get updated session data
				router.refresh();
			}
		});
	};

	return (
		<div className="grid gap-6">
			{/* Profile Information */}
			<Card>
				<CardHeader>
					<CardTitle>Profile Information</CardTitle>
					<CardDescription>
						Update your personal information and profile picture
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Avatar Preview */}
					<div className="flex items-center gap-4">
						<UserAvatar
							className="h-20 w-20"
							fallbackClassName="text-lg"
							user={{ name, image: imageUrl }}
						/>
						<div className="flex-1">
							<p className="text-sm font-medium">Profile Picture</p>
							<p className="text-xs text-muted-foreground mb-2">
								Upload a photo or enter an image URL
							</p>
							<div className="flex gap-2">
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									onChange={handleFileUpload}
									className="hidden"
								/>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => fileInputRef.current?.click()}
									disabled={isUploading || isPending}
								>
									{isUploading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Uploading...
										</>
									) : (
										<>
											<Upload className="mr-2 h-4 w-4" />
											Upload Photo
										</>
									)}
								</Button>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								placeholder="Enter your name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								disabled={isPending}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={user.email}
								disabled
								className="bg-muted"
							/>
							<p className="text-xs text-muted-foreground">
								Email cannot be changed
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="image">Profile Image URL (optional)</Label>
							<Input
								id="image"
								type="url"
								placeholder="https://example.com/avatar.jpg"
								value={imageUrl}
								onChange={(e) => setImageUrl(e.target.value)}
								disabled={isPending || isUploading}
							/>
							<p className="text-xs text-muted-foreground">
								Or use the upload button above
							</p>
						</div>

						<Button onClick={handleSave} disabled={isPending || isUploading}>
							{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Save Changes
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Account Information */}
			<Card>
				<CardHeader>
					<CardTitle>Account Information</CardTitle>
					<CardDescription>
						View your account details and status
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								User ID
							</p>
							<p className="text-sm font-mono">{user.id}</p>
						</div>
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								Email Verified
							</p>
							<p className="text-sm">Yes</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
