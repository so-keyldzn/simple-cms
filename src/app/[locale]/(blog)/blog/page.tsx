import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, User, FolderOpen } from "lucide-react";
import { generateMetadata as generateMeta } from "@/lib/metadata";
import type { Metadata } from "next";

// Force dynamic rendering - database not available at build time
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
	return await generateMeta({
		title: "Blog",
		description: "Découvrez nos derniers articles de blog",
		path: "/blog",
	});
}

type Post = {
	id: string;
	title: string;
	slug: string;
	excerpt: string | null;
	coverImage: string | null;
	publishedAt: Date | null;
	author: { name: string | null; email: string };
	category: { id: string; name: string; slug: string } | null;
	tags: { tag: { id: string; name: string } }[];
};

export default async function BlogPage() {
	const posts = await prisma.post.findMany({
		where: { published: true },
		include: {
			author: { select: { name: true, email: true } },
			category: { select: { id: true, name: true, slug: true } },
			tags: { include: { tag: true } },
		},
		orderBy: { publishedAt: "desc" },
		take: 20,
	});

	return (
		<div className="container mx-auto px-4 py-12 max-w-6xl">
			<div className="space-y-8">
				<div className="text-center space-y-4">
					<h1 className="text-4xl font-bold">Blog</h1>
					<p className="text-muted-foreground text-lg">
						Découvrez nos derniers articles
					</p>
				</div>

				{posts.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-muted-foreground">Aucun article publié pour le moment</p>
					</div>
				) : (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{posts.map((post: Post) => (
							<Link key={post.id} href={`/blog/${post.slug}`}>
								<Card className="h-full hover:shadow-lg transition-shadow">
									{post.coverImage && (
										<div className="aspect-video w-full overflow-hidden rounded-t-lg relative">
											<Image
												src={post.coverImage}
												alt={post.title}
												fill
												className="object-cover"
											/>
										</div>
									)}
									<CardHeader>
										<CardTitle className="line-clamp-2">{post.title}</CardTitle>
										{post.excerpt && (
											<CardDescription className="line-clamp-3">
												{post.excerpt}
											</CardDescription>
										)}
									</CardHeader>
									<CardContent>
										<div className="flex flex-wrap gap-2">
											{post.category && (
												<Badge variant="secondary" className="gap-1">
													<FolderOpen className="h-3 w-3" />
													{post.category.name}
												</Badge>
											)}
											{post.tags.slice(0, 2).map((pt) => (
												<Badge key={pt.tag.id} variant="outline">
													{pt.tag.name}
												</Badge>
											))}
										</div>
									</CardContent>
									<CardFooter className="text-sm text-muted-foreground flex items-center gap-4">
										<div className="flex items-center gap-1">
											<User className="h-4 w-4" />
											{post.author.name || post.author.email}
										</div>
										<div className="flex items-center gap-1">
											<CalendarDays className="h-4 w-4" />
											{format(new Date(post.publishedAt!), "dd MMM yyyy", { locale: fr })}
										</div>
									</CardFooter>
								</Card>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
