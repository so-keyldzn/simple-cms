"use client";

import { Separator } from "@/components/ui/separator";
import { useNavigationMenus } from "@/features/data/hooks/use-navigation";
import { NavigationMenuDialog } from "@/features/admin/components/navigation-menu-dialog";
import { NavigationMenuActions } from "@/features/admin/components/navigation-menu-actions";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, Settings, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NavigationPage() {
	const { data: menus, isLoading } = useNavigationMenus();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Navigation</h1>
					<p className="text-muted-foreground">
						Gérez les menus de navigation de votre site
					</p>
				</div>
				<NavigationMenuDialog />
			</div>

			<Separator />

			{!menus || menus.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Menu className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">Aucun menu</h3>
						<p className="text-sm text-muted-foreground mb-4">
							Commencez par créer votre premier menu de navigation
						</p>
						<NavigationMenuDialog />
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{menus.map((menu) => (
						<Card key={menu.id}>
							<CardHeader className="flex flex-row items-start justify-between space-y-0">
								<div className="space-y-1">
									<CardTitle className="flex items-center gap-2">
										{menu.label}
										{menu.isActive && (
											<Badge variant="secondary" className="text-xs">
												Actif
											</Badge>
										)}
									</CardTitle>
									<CardDescription className="font-mono text-xs">
										{menu.name}
									</CardDescription>
								</div>
								<NavigationMenuActions menu={menu} />
							</CardHeader>
							<CardContent>
								{menu.description && (
									<p className="text-sm text-muted-foreground mb-4">
										{menu.description}
									</p>
								)}
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">
										{menu._count?.items || 0} élément(s)
									</span>
									<div className="flex gap-2">
										<Button variant="outline" size="sm" asChild>
											<Link href={`/admin/navigation/${menu.id}`}>
												<Settings className="h-4 w-4 mr-1" />
												Gérer
											</Link>
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
