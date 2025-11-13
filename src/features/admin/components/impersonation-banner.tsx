"use client";

import { useSession, authClient } from "@/features/auth/lib/auth-clients";
import { Button } from "@/components/ui/button";
import { AlertCircle, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function ImpersonationBanner() {
	const { data: session } = useSession();
	const [isVisible, setIsVisible] = useState(true);
	const t = useTranslations();

	// Vérifier si la session est impersonée
	const isImpersonating = session?.session?.impersonatedBy;

	if (!isImpersonating || !isVisible) return null;

	const handleStopImpersonating = async () => {
		try {
			setIsVisible(false);
			await authClient.admin.stopImpersonating();
			toast.success(t("admin.impersonation.returnedSuccess"));
			// Force un rechargement complet pour mettre à jour la session
			window.location.href = "/admin/users";
		} catch {
			toast.error(t("admin.impersonation.stopError"));
			setIsVisible(true);
		}
	};

	return (
		<div className="bg-orange-500 text-white px-4 py-2 flex items-center justify-between shadow-lg">
			<div className="flex items-center gap-2">
				<AlertCircle className="h-5 w-5" />
				<span className="font-medium">
					{t("admin.impersonation.banner", {
						name: session?.user.name,
						email: session?.user.email,
					})}
				</span>
			</div>
			<Button
				variant="secondary"
				size="sm"
				onClick={handleStopImpersonating}
				className="bg-white text-orange-500 hover:bg-gray-100"
			>
				<LogOut className="mr-2 h-4 w-4" />
				{t("admin.impersonation.stop")}
			</Button>
		</div>
	);
}
