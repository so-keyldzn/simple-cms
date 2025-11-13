import { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getNavigationMenu } from "@/features/admin/lib/navigation-actions";
import { NavigationItemDialog } from "@/features/admin/components/navigation-item-dialog";
import { NavigationMenuDialog } from "@/features/admin/components/navigation-menu-dialog";
import { ChevronLeft, ExternalLink, Pencil } from "lucide-react";
import Link from "next/link";
import { NavigationItemActions } from "./navigation-item-actions";

export const metadata: Metadata = {
	title: "Manage Navigation | Admin",
	description: "Manage navigation menu items",
};

type PageProps = {
	params: Promise<{ menuId: string }>;
};

export default async function NavigationMenuDetailPage({ params }: PageProps) {
	const { menuId } = await params;
	const { data: menu } = await getNavigationMenu(menuId);

	if (!menu) {
		notFound();
	}

	// Get all top-level items for parent selection
	const topLevelItems = menu.items.filter((item) => !item.parentId);
	const parentItems = topLevelItems.map((item) => ({
		id: item.id,
		title: item.title,
	}));

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild>
					<Link href="/admin/navigation">
						<ChevronLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div className="flex-1">
					<div className="flex items-center gap-2">
						<h1 className="text-3xl font-bold tracking-tight">{menu.label}</h1>
						{menu.isActive && <Badge variant="secondary">Actif</Badge>}
					</div>
					<p className="text-muted-foreground">
						Gérez les éléments du menu{" "}
						<code className="text-xs bg-muted px-1 py-0.5 rounded">
							{menu.name}
						</code>
					</p>
				</div>
				<NavigationMenuDialog
					menu={menu}
					trigger={
						<Button variant="outline">
							<Pencil className="h-4 w-4 mr-2" />
							Modifier le menu
						</Button>
					}
				/>
				<NavigationItemDialog
					menuId={menu.id}
					parentItems={parentItems}
				/>
			</div>

			<Separator />

			{menu.description && (
				<Card>
					<CardHeader>
						<CardTitle>Description</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">{menu.description}</p>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle>Éléments du menu</CardTitle>
					<CardDescription>
						{menu.items.length === 0
							? "Aucun élément dans ce menu"
							: `${menu.items.length} élément(s) au total`}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{menu.items.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12">
							<p className="text-sm text-muted-foreground mb-4">
								Commencez par ajouter des éléments à ce menu
							</p>
							<NavigationItemDialog
								menuId={menu.id}
								parentItems={parentItems}
							/>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Titre</TableHead>
									<TableHead>URL</TableHead>
									<TableHead>Ordre</TableHead>
									<TableHead>Parent</TableHead>
									<TableHead>Type</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{topLevelItems.map((item) => (
									<React.Fragment key={item.id}>
										<TableRow>
											<TableCell className="font-medium">{item.title}</TableCell>
											<TableCell>
												{item.href ? (
													<div className="flex items-center gap-1">
														<code className="text-xs bg-muted px-1 py-0.5 rounded">
															{item.href}
														</code>
														{item.isExternal && (
															<ExternalLink className="h-3 w-3 text-muted-foreground" />
														)}
													</div>
												) : (
													<span className="text-muted-foreground text-sm">—</span>
												)}
											</TableCell>
											<TableCell>{item.order}</TableCell>
											<TableCell>
												<span className="text-muted-foreground text-sm">—</span>
											</TableCell>
											<TableCell>
												{item.children && item.children.length > 0 ? (
													<Badge variant="outline">
														Menu ({item.children.length})
													</Badge>
												) : (
													<Badge variant="secondary">Lien</Badge>
												)}
											</TableCell>
											<TableCell className="text-right">
												<NavigationItemActions
													item={item}
													menuId={menu.id}
													parentItems={parentItems}
												/>
											</TableCell>
										</TableRow>
										{item.children?.map((child) => (
											<TableRow key={child.id} className="bg-muted/50">
												<TableCell className="pl-8">
													<span className="text-muted-foreground mr-2">└─</span>
													{child.title}
												</TableCell>
												<TableCell>
													{child.href ? (
														<div className="flex items-center gap-1">
															<code className="text-xs bg-background px-1 py-0.5 rounded">
																{child.href}
															</code>
															{child.isExternal && (
																<ExternalLink className="h-3 w-3 text-muted-foreground" />
															)}
														</div>
													) : (
														<span className="text-muted-foreground text-sm">—</span>
													)}
												</TableCell>
												<TableCell>{child.order}</TableCell>
												<TableCell className="text-sm text-muted-foreground">
													{item.title}
												</TableCell>
												<TableCell>
													<Badge variant="secondary">Sous-élément</Badge>
												</TableCell>
												<TableCell className="text-right">
													<NavigationItemActions
														item={child}
														menuId={menu.id}
														parentItems={parentItems}
													/>
												</TableCell>
											</TableRow>
										))}
									</React.Fragment>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
