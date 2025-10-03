import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	FileText,
	MessageSquare,
	Users,
	Image,
	CheckCircle,
	Clock,
	XCircle,
	TrendingUp,
	Activity,
} from "lucide-react";
import {
	getAnalyticsStats,
	getTopCategories,
	getTopAuthors,
	getRecentActivity,
	getPostsPerDay,
} from "@/features/admin/lib/analytics-actions";
import { StatsCard } from "@/features/admin/components/stats-card";
import { PostsChart } from "@/features/admin/components/posts-chart";
import { CategoriesChart } from "@/features/admin/components/categories-chart";

export const metadata: Metadata = {
	title: "Analytics | Admin",
	description: "View site analytics and statistics",
};

export default async function AnalyticsPage() {
	const [
		{ data: stats },
		{ data: topCategories },
		{ data: topAuthors },
		{ data: recentActivity },
		{ data: postsPerDay },
	] = await Promise.all([
		getAnalyticsStats(),
		getTopCategories(5),
		getTopAuthors(5),
		getRecentActivity(10),
		getPostsPerDay(30),
	]);

	return (
		<div className="space-y-8 pb-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-1">
					<h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
						<Activity className="h-8 w-8 text-primary" />
						Analytics
					</h1>
					<p className="text-muted-foreground">
						Vue d&apos;ensemble des performances de votre site
					</p>
				</div>
			</div>

			<Separator />

			{/* Key Metrics */}
			<div className="space-y-4">
				<h2 className="text-lg font-semibold">Statistiques clés</h2>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<StatsCard
						title="Total Posts"
						value={stats?.totalPosts || 0}
						description={`${stats?.publishedPosts || 0} publiés, ${stats?.draftPosts || 0} brouillons`}
						icon={FileText}
					/>
					<StatsCard
						title="Commentaires"
						value={stats?.totalComments || 0}
						description={`${stats?.pendingComments || 0} en attente`}
						icon={MessageSquare}
					/>
					<StatsCard
						title="Utilisateurs"
						value={stats?.totalUsers || 0}
						description="Nombre total d'utilisateurs"
						icon={Users}
					/>
					<StatsCard
						title="Médias"
						value={stats?.totalMedia || 0}
						description="Fichiers uploadés"
						icon={Image}
					/>
				</div>
			</div>

			{/* Charts Section */}
			<div className="space-y-4">
				<h2 className="text-lg font-semibold">Visualisations</h2>
				<div className="grid gap-6 lg:grid-cols-2">
					{postsPerDay && postsPerDay.length > 0 && (
						<PostsChart data={postsPerDay} />
					)}
					{topCategories && topCategories.length > 0 && (
						<CategoriesChart data={topCategories} />
					)}
				</div>
			</div>

			{/* Content Stats with Tabs */}
			<div className="space-y-4">
				<h2 className="text-lg font-semibold">Métriques de contenu</h2>
				<Tabs defaultValue="overview" className="w-full">
					<TabsList className="grid w-full max-w-md grid-cols-3">
						<TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
						<TabsTrigger value="categories">Catégories</TabsTrigger>
						<TabsTrigger value="authors">Auteurs</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="space-y-4 mt-6">
						<div className="grid gap-4 md:grid-cols-3">
							<Card className="hover:shadow-md transition-shadow">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">Catégories</CardTitle>
									<TrendingUp className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{stats?.totalCategories || 0}</div>
									<p className="text-xs text-muted-foreground mt-1">
										Catégories actives
									</p>
								</CardContent>
							</Card>

							<Card className="hover:shadow-md transition-shadow">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">Tags</CardTitle>
									<TrendingUp className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{stats?.totalTags || 0}</div>
									<p className="text-xs text-muted-foreground mt-1">Tags utilisés</p>
								</CardContent>
							</Card>

							<Card className="hover:shadow-md transition-shadow">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">
										Taux de publication
									</CardTitle>
									<TrendingUp className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										{stats?.totalPosts
											? Math.round(
													((stats?.publishedPosts || 0) / stats.totalPosts) * 100
											  )
											: 0}
										%
									</div>
									<p className="text-xs text-muted-foreground mt-1">
										Posts publiés vs brouillons
									</p>
								</CardContent>
							</Card>
						</div>

						{/* Comment Stats */}
						<Card className="hover:shadow-md transition-shadow">
							<CardHeader>
								<CardTitle>Statut des commentaires</CardTitle>
								<CardDescription>
									Répartition des commentaires par statut
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid gap-4 md:grid-cols-3">
									<div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
										<div className="p-3 rounded-full bg-yellow-500/10">
											<Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
										</div>
										<div>
											<p className="text-sm font-medium text-muted-foreground">En attente</p>
											<p className="text-2xl font-bold">
												{stats?.pendingComments || 0}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
										<div className="p-3 rounded-full bg-green-500/10">
											<CheckCircle className="h-6 w-6 text-green-600 dark:text-green-500" />
										</div>
										<div>
											<p className="text-sm font-medium text-muted-foreground">Approuvés</p>
											<p className="text-2xl font-bold">
												{stats?.approvedComments || 0}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
										<div className="p-3 rounded-full bg-red-500/10">
											<XCircle className="h-6 w-6 text-red-600 dark:text-red-500" />
										</div>
										<div>
											<p className="text-sm font-medium text-muted-foreground">Rejetés</p>
											<p className="text-2xl font-bold">
												{stats?.rejectedComments || 0}
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="categories" className="mt-6">
						<Card>
							<CardHeader>
								<CardTitle>Top Catégories</CardTitle>
								<CardDescription>
									Catégories avec le plus de posts
								</CardDescription>
							</CardHeader>
							<CardContent>
								{!topCategories || topCategories.length === 0 ? (
									<p className="text-sm text-muted-foreground text-center py-8">
										Aucune catégorie
									</p>
								) : (
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Catégorie</TableHead>
												<TableHead className="text-right">Posts</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{topCategories.map((category, index) => (
												<TableRow key={category.id} className="hover:bg-accent/50">
													<TableCell className="font-medium">
														<div className="flex items-center gap-2">
															<span className="text-muted-foreground text-sm">#{index + 1}</span>
															{category.name}
														</div>
													</TableCell>
													<TableCell className="text-right">
														<Badge variant="secondary">{category._count.posts}</Badge>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="authors" className="mt-6">
						<Card>
							<CardHeader>
								<CardTitle>Top Auteurs</CardTitle>
								<CardDescription>Auteurs les plus actifs</CardDescription>
							</CardHeader>
							<CardContent>
								{!topAuthors || topAuthors.length === 0 ? (
									<p className="text-sm text-muted-foreground text-center py-8">
										Aucun auteur
									</p>
								) : (
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Auteur</TableHead>
												<TableHead className="text-right">Posts</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{topAuthors.map((author, index) => (
												<TableRow key={author.id} className="hover:bg-accent/50">
													<TableCell className="font-medium">
														<div className="flex items-center gap-3">
															<span className="text-muted-foreground text-sm">#{index + 1}</span>
															<div>
																<p>{author.name || "Sans nom"}</p>
																<p className="text-xs text-muted-foreground">
																	{author.email}
																</p>
															</div>
														</div>
													</TableCell>
													<TableCell className="text-right">
														<Badge variant="secondary">{author._count.posts}</Badge>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>

			{/* Recent Activity */}
			<div className="space-y-4">
				<h2 className="text-lg font-semibold">Activité récente</h2>
				<Card>
					<CardHeader>
						<CardDescription>
							Dernières actions sur le site
						</CardDescription>
					</CardHeader>
					<CardContent>
						{!recentActivity || recentActivity.length === 0 ? (
							<p className="text-sm text-muted-foreground text-center py-8">
								Aucune activité récente
							</p>
						) : (
							<div className="space-y-4">
								{recentActivity.map((activity) => (
									<div
										key={`${activity.type}-${activity.id}`}
										className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0 hover:bg-accent/20 -mx-2 px-2 py-2 rounded-lg transition-colors"
									>
										<div className="flex items-start gap-3">
											<div className={`p-2 rounded-lg ${
												activity.type === "post"
													? "bg-blue-500/10"
													: "bg-purple-500/10"
											}`}>
												{activity.type === "post" ? (
													<FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
												) : (
													<MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
												)}
											</div>
											<div className="flex-1">
												<p className="font-medium">{activity.title}</p>
												<p className="text-sm text-muted-foreground">
													{activity.subtitle}
												</p>
												<p className="text-xs text-muted-foreground mt-1">
													{new Date(activity.createdAt).toLocaleDateString("fr-FR", {
														day: "numeric",
														month: "long",
														year: "numeric",
														hour: "2-digit",
														minute: "2-digit",
													})}
												</p>
											</div>
										</div>
										<Badge
											variant={
												activity.status === "published" || activity.status === "approved"
													? "default"
													: activity.status === "pending"
													? "secondary"
													: "destructive"
											}
										>
											{activity.status === "published"
												? "Publié"
												: activity.status === "draft"
												? "Brouillon"
												: activity.status === "pending"
												? "En attente"
												: activity.status === "approved"
												? "Approuvé"
												: "Rejeté"}
										</Badge>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
