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
	BarChart3,
	Database,
	Hash,
} from "lucide-react";
import {
	formatSize,
	formatDate,
	calculatePercentage,
} from "@/lib/analytics-utils";
import {
	getAnalyticsStats,
	getTopCategories,
	getTopAuthors,
	getRecentActivity,
	getPostsPerDay,
} from "@/features/admin/lib/analytics-actions";
import {
	getUserGrowth,
	getCommentsTrends,
	getMediaStorageStats,
	getContentPerformance,
	getUserActivityStats,
	getPublishingFrequency,
	getNavigationStats,
} from "@/features/admin/lib/advanced-analytics-actions";
import { StatsCard } from "@/features/admin/components/stats-card";
import { PostsChart } from "@/features/admin/components/posts-chart";
import { CategoriesChart } from "@/features/admin/components/categories-chart";
import { UserGrowthChart } from "@/features/admin/components/user-growth-chart";
import { CommentsTrendsChart } from "@/features/admin/components/comments-trends-chart";
import { MediaStorageChart } from "@/features/admin/components/media-storage-chart";

export const metadata: Metadata = {
	title: "Analytics | Admin",
	description: "Vue d'ensemble complète des analytics du site",
};

export default async function AnalyticsPage() {
	const results = await Promise.all([
		getAnalyticsStats(),
		getTopCategories(),
		getTopAuthors(),
		getRecentActivity(),
		getPostsPerDay(),
		getUserGrowth(),
		getCommentsTrends(),
		getMediaStorageStats(),
		getContentPerformance(),
		getUserActivityStats(),
		getPublishingFrequency(),
		getNavigationStats(),
	]);

	// Extract data and check for errors
	const [
		statsResult,
		topCategoriesResult,
		topAuthorsResult,
		recentActivityResult,
		postsPerDayResult,
		userGrowthResult,
		commentsTrendsResult,
		mediaStorageResult,
		contentPerformanceResult,
		userActivityResult,
		publishingFreqResult,
		navStatsResult,
	] = results;

	// Check for critical errors
	const hasErrors = results.some((result) => result.error);
	if (hasErrors) {
		const errors = results
			.filter((result) => result.error)
			.map((result) => result.error);
		console.error("Analytics errors:", errors);
	}

	const stats = statsResult.data;
	const topCategories = topCategoriesResult.data;
	const topAuthors = topAuthorsResult.data;
	const recentActivity = recentActivityResult.data;
	const postsPerDay = postsPerDayResult.data;
	const userGrowth = userGrowthResult.data;
	const commentsTrends = commentsTrendsResult.data;
	const mediaStorage = mediaStorageResult.data;
	const contentPerformance = contentPerformanceResult.data;
	const userActivity = userActivityResult.data;
	const publishingFreq = publishingFreqResult.data;
	const navStats = navStatsResult.data;

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
						Vue d&apos;ensemble complète des performances de votre site
					</p>
				</div>
			</div>

			<Separator />

			{/* Key Metrics */}
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<BarChart3 className="h-5 w-5 text-primary" />
					<h2 className="text-lg font-semibold">Statistiques clés</h2>
				</div>
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
						description={`${stats?.pendingComments || 0} en attente de modération`}
						icon={MessageSquare}
					/>
					<StatsCard
						title="Utilisateurs"
						value={stats?.totalUsers || 0}
						description={`${userActivity?.bannedUsers || 0} bannis`}
						icon={Users}
					/>
					<StatsCard
						title="Stockage Média"
						value={formatSize(mediaStorage?.totalSize || 0)}
						description={`${stats?.totalMedia || 0} fichiers`}
						icon={Image}
					/>
				</div>
			</div>

			{/* Main Analytics Tabs */}
			<Tabs defaultValue="content" className="w-full">
				<TabsList className="grid w-full grid-cols-5">
					<TabsTrigger value="content">
						<FileText className="h-4 w-4 mr-2" />
						Contenu
					</TabsTrigger>
					<TabsTrigger value="users">
						<Users className="h-4 w-4 mr-2" />
						Utilisateurs
					</TabsTrigger>
					<TabsTrigger value="engagement">
						<MessageSquare className="h-4 w-4 mr-2" />
						Engagement
					</TabsTrigger>
					<TabsTrigger value="media">
						<Database className="h-4 w-4 mr-2" />
						Médias
					</TabsTrigger>
					<TabsTrigger value="system">
						<Hash className="h-4 w-4 mr-2" />
						Système
					</TabsTrigger>
				</TabsList>

				{/* Content Tab */}
				<TabsContent value="content" className="space-y-6 mt-6">
					<div className="grid gap-6 lg:grid-cols-2">
						{postsPerDay && postsPerDay.length > 0 && (
							<PostsChart data={postsPerDay} />
						)}
						{topCategories && topCategories.length > 0 && (
							<CategoriesChart data={topCategories} />
						)}
					</div>

					<div className="grid gap-6 lg:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Posts les plus commentés</CardTitle>
								<CardDescription>
									Articles générant le plus d&apos;engagement
								</CardDescription>
							</CardHeader>
							<CardContent>
								{!contentPerformance?.mostCommentedPosts ||
								contentPerformance.mostCommentedPosts.length === 0 ? (
									<p className="text-sm text-muted-foreground text-center py-8">
										Aucune donnée
									</p>
								) : (
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Titre</TableHead>
												<TableHead className="text-right">Commentaires</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{contentPerformance.mostCommentedPosts
												.slice(0, 5)
												.map((post, index) => (
													<TableRow key={post.id} className="hover:bg-accent/50">
														<TableCell className="font-medium">
															<div className="flex items-center gap-2">
																<span className="text-muted-foreground text-sm">
																	#{index + 1}
																</span>
																<span className="line-clamp-1">{post.title}</span>
															</div>
														</TableCell>
														<TableCell className="text-right">
															<Badge variant="secondary">
																{post._count.comments}
															</Badge>
														</TableCell>
													</TableRow>
												))}
										</TableBody>
									</Table>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Tags les plus utilisés</CardTitle>
								<CardDescription>
									Tags assignés le plus souvent
								</CardDescription>
							</CardHeader>
							<CardContent>
								{!contentPerformance?.mostUsedTags ||
								contentPerformance.mostUsedTags.length === 0 ? (
									<p className="text-sm text-muted-foreground text-center py-8">
										Aucune donnée
									</p>
								) : (
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Tag</TableHead>
												<TableHead className="text-right">Posts</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{contentPerformance.mostUsedTags
												.slice(0, 5)
												.map((tag, index) => (
													<TableRow key={tag.id} className="hover:bg-accent/50">
														<TableCell className="font-medium">
															<div className="flex items-center gap-2">
																<span className="text-muted-foreground text-sm">
																	#{index + 1}
																</span>
																{tag.name}
															</div>
														</TableCell>
														<TableCell className="text-right">
															<Badge variant="secondary">{tag._count.posts}</Badge>
														</TableCell>
													</TableRow>
												))}
										</TableBody>
									</Table>
								)}
							</CardContent>
						</Card>
					</div>

					<Card className="hover:shadow-md transition-shadow">
						<CardHeader>
							<CardTitle>Fréquence de publication</CardTitle>
							<CardDescription>
								Nombre de publications par semaine (90 derniers jours)
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
								{publishingFreq && publishingFreq.length > 0 ? (
									publishingFreq.slice(-4).map((week) => (
										<div
											key={week.week}
											className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
										>
											<p className="text-sm text-muted-foreground">
												Semaine du {formatDate(week.week, "short")}
											</p>
											<p className="text-2xl font-bold mt-1">{week.count}</p>
										</div>
									))
								) : (
									<p className="text-sm text-muted-foreground col-span-4 text-center py-4">
										Aucune donnée
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Users Tab */}
				<TabsContent value="users" className="space-y-6 mt-6">
					<div className="grid gap-6 lg:grid-cols-2">
						{userGrowth && userGrowth.length > 0 && (
							<UserGrowthChart data={userGrowth} />
						)}

						<Card>
							<CardHeader>
								<CardTitle>Distribution par rôle</CardTitle>
								<CardDescription>
									Répartition des utilisateurs par rôle
								</CardDescription>
							</CardHeader>
							<CardContent>
								{!userActivity?.roleDistribution ||
								userActivity.roleDistribution.length === 0 ? (
									<p className="text-sm text-muted-foreground text-center py-8">
										Aucune donnée
									</p>
								) : (
									<div className="space-y-4">
										{userActivity.roleDistribution.map((role) => (
											<div
												key={role.role}
												className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
											>
												<div className="flex items-center gap-3">
													<div className="p-2 rounded-full bg-primary/10">
														<Users className="h-4 w-4 text-primary" />
													</div>
													<span className="font-medium capitalize">
														{role.role}
													</span>
												</div>
												<Badge variant="secondary">{role.count}</Badge>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Auteurs les plus actifs</CardTitle>
							<CardDescription>
								Utilisateurs avec le plus de contributions
							</CardDescription>
						</CardHeader>
						<CardContent>
							{!userActivity?.activeAuthors ||
							userActivity.activeAuthors.length === 0 ? (
								<p className="text-sm text-muted-foreground text-center py-8">
									Aucun auteur actif
								</p>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Auteur</TableHead>
											<TableHead className="text-right">Posts</TableHead>
											<TableHead className="text-right">Comments</TableHead>
											<TableHead className="text-right">Médias</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{userActivity.activeAuthors.slice(0, 5).map((author, index) => (
											<TableRow key={author.id} className="hover:bg-accent/50">
												<TableCell className="font-medium">
													<div className="flex items-center gap-3">
														<span className="text-muted-foreground text-sm">
															#{index + 1}
														</span>
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
												<TableCell className="text-right">
													<Badge variant="secondary">
														{author._count.comments}
													</Badge>
												</TableCell>
												<TableCell className="text-right">
													<Badge variant="secondary">{author._count.media}</Badge>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Engagement Tab */}
				<TabsContent value="engagement" className="space-y-6 mt-6">
					{commentsTrends && commentsTrends.length > 0 && (
						<CommentsTrendsChart data={commentsTrends} />
					)}

					<div className="grid gap-4 md:grid-cols-3">
						<Card className="hover:shadow-md transition-shadow">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Taux d&apos;approbation
								</CardTitle>
								<CheckCircle className="h-4 w-4 text-green-500" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{calculatePercentage(
										stats?.approvedComments || 0,
										stats?.totalComments || 0
									)}
									%
								</div>
								<p className="text-xs text-muted-foreground mt-1">
									Commentaires approuvés
								</p>
							</CardContent>
						</Card>

						<Card className="hover:shadow-md transition-shadow">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									En attente
								</CardTitle>
								<Clock className="h-4 w-4 text-yellow-500" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{stats?.pendingComments || 0}
								</div>
								<p className="text-xs text-muted-foreground mt-1">
									Nécessitent modération
								</p>
							</CardContent>
						</Card>

						<Card className="hover:shadow-md transition-shadow">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Taux de rejet
								</CardTitle>
								<XCircle className="h-4 w-4 text-red-500" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{calculatePercentage(
										stats?.rejectedComments || 0,
										stats?.totalComments || 0
									)}
									%
								</div>
								<p className="text-xs text-muted-foreground mt-1">
									Commentaires rejetés
								</p>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Media Tab */}
				<TabsContent value="media" className="space-y-6 mt-6">
					{mediaStorage && mediaStorage.mediaTypes.length > 0 && (
						<MediaStorageChart data={mediaStorage.mediaTypes} />
					)}

					<Card>
						<CardHeader>
							<CardTitle>Top contributeurs médias</CardTitle>
							<CardDescription>
								Utilisateurs ayant uploadé le plus de fichiers
							</CardDescription>
						</CardHeader>
						<CardContent>
							{!mediaStorage?.topUploaders ||
							mediaStorage.topUploaders.length === 0 ? (
								<p className="text-sm text-muted-foreground text-center py-8">
									Aucune donnée
								</p>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Utilisateur</TableHead>
											<TableHead className="text-right">Fichiers</TableHead>
											<TableHead className="text-right">Taille totale</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{mediaStorage.topUploaders.map((user, index) => (
											<TableRow key={user.id} className="hover:bg-accent/50">
												<TableCell className="font-medium">
													<div className="flex items-center gap-3">
														<span className="text-muted-foreground text-sm">
															#{index + 1}
														</span>
														<div>
															<p>{user.name || "Sans nom"}</p>
															<p className="text-xs text-muted-foreground">
																{user.email}
															</p>
														</div>
													</div>
												</TableCell>
												<TableCell className="text-right">
													<Badge variant="secondary">{user.count}</Badge>
												</TableCell>
												<TableCell className="text-right">
													<Badge variant="secondary">
														{formatSize(user.totalSize)}
													</Badge>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* System Tab */}
				<TabsContent value="system" className="space-y-6 mt-6">
					<div className="grid gap-4 md:grid-cols-3">
						<Card className="hover:shadow-md transition-shadow">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Menus de navigation
								</CardTitle>
								<Hash className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{navStats?.totalMenus || 0}
								</div>
								<p className="text-xs text-muted-foreground mt-1">
									{navStats?.totalItems || 0} éléments au total
								</p>
							</CardContent>
						</Card>

						<Card className="hover:shadow-md transition-shadow">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Catégories</CardTitle>
								<TrendingUp className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{stats?.totalCategories || 0}
								</div>
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
								<p className="text-xs text-muted-foreground mt-1">
									Tags utilisés
								</p>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Menus actifs</CardTitle>
							<CardDescription>
								Menus de navigation actuellement en ligne
							</CardDescription>
						</CardHeader>
						<CardContent>
							{!navStats?.activeMenus || navStats.activeMenus.length === 0 ? (
								<p className="text-sm text-muted-foreground text-center py-8">
									Aucun menu actif
								</p>
							) : (
								<div className="space-y-3">
									{navStats.activeMenus.map((menu) => (
										<div
											key={menu.id}
											className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
										>
											<div>
												<p className="font-medium">{menu.label}</p>
												<p className="text-sm text-muted-foreground">
													ID: {menu.name}
												</p>
											</div>
											<Badge variant="secondary">
												{menu._count.items} éléments
											</Badge>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Recent Activity */}
			<div className="space-y-4">
				<h2 className="text-lg font-semibold flex items-center gap-2">
					<Activity className="h-5 w-5 text-primary" />
					Activité récente
				</h2>
				<Card>
					<CardHeader>
						<CardDescription>Dernières actions sur le site</CardDescription>
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
											<div
												className={`p-2 rounded-lg ${
													activity.type === "post"
														? "bg-blue-500/10"
														: "bg-purple-500/10"
												}`}
											>
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
													{formatDate(activity.createdAt, "full")}
												</p>
											</div>
										</div>
										<Badge
											variant={
												activity.status === "published" ||
												activity.status === "approved"
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
