import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/features/auth/lib/auth";
import { headers } from "next/headers";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "@/features/auth/components/profile-form";

export const metadata: Metadata = {
	title: "My Profile",
	description: "Manage your profile settings",
};

export default async function ProfilePage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/sign-in");
	}

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="w-full max-w-4xl px-4">
				<div className="space-y-6">
					<div className="text-center">
						<h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
						<p className="text-muted-foreground">
							Manage your personal information and preferences
						</p>
					</div>

					<Separator />

					<ProfileForm user={session.user} />
				</div>
			</div>
		</div>
	);
}
