import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { generateArticleMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

import { CalendarDays, User, FolderOpen, Tag as TagIcon, ArrowLeft, Clock, Eye } from "lucide-react";



type PostTag = {
	tag: {
		id: string;
		name: string;
		slug: string;
	};
};

export async function generateStaticParams() {
	const posts = await prisma.post.findMany({
		where: { published: true },
		select: { slug: true },
	});

	return posts.map((post: { slug: string }) => ({
		slug: post.slug,
	}));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const post = await prisma.post.findUnique({
		where: { slug, published: true },
		include: {
			author: { select: { name: true, email: true } },
			tags: { include: { tag: true } },
		},
	});

	if (!post) {
		return {
			title: "Article non trouvé",
		};
	}

	return generateArticleMetadata({
		title: post.title,
		description: post.excerpt || undefined,
		image: post.coverImage || undefined,
		path: `/blog/${post.slug}`,
		publishedAt: post.publishedAt || undefined,
		modifiedAt: post.updatedAt,
		authors: [post.author.name || post.author.email],
		tags: post.tags.map((pt) => pt.tag.name),
	});
}

export default async function BlogPostPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = await prisma.post.findUnique({
		where: { slug, published: true },
		include: {
			author: { select: { name: true, email: true } },
			category: { select: { id: true, name: true, slug: true } },
			tags: { include: { tag: true } },
		},
	});

	if (!post) {
		notFound();
	}

	// Calculate reading time (rough estimate: 200 words per minute)
	const wordCount = post.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
	const readingTime = Math.ceil(wordCount / 200);

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
			{/* Navigation */}
			<div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
				<div className="container mx-auto px-4 py-4">
					<Link href="/blog">
						<Button variant="ghost" size="sm" className="gap-2 hover:bg-accent/50">
							<ArrowLeft className="h-4 w-4" />
							Retour au blog
						</Button>
					</Link>
				</div>
			</div>

			<div className="container mx-auto px-4 py-12 max-w-4xl">
				<article className="space-y-12">
					{/* Header */}
					<header className="space-y-6">
						{/* Category and Tags */}
						<div className="flex flex-wrap gap-2">
							{post.category && (
								<Link href={`/blog/category/${post.category.slug}`}>
									<Badge 
										variant="secondary" 
										className="gap-1.5 px-3 py-1.5 text-sm font-medium hover:bg-secondary/80 transition-colors"
									>
										<FolderOpen className="h-3.5 w-3.5" />
										{post.category.name}
									</Badge>
								</Link>
							)}
							{post.tags.slice(0, 3).map((pt: PostTag) => (
								<Link key={pt.tag.id} href={`/blog/tag/${pt.tag.slug}`}>
									<Badge 
										variant="outline" 
										className="gap-1.5 px-3 py-1.5 text-sm hover:bg-accent/50 transition-colors"
									>
										<TagIcon className="h-3.5 w-3.5" />
										{pt.tag.name}
									</Badge>
								</Link>
							))}
							{post.tags.length > 3 && (
								<Badge variant="outline" className="px-3 py-1.5 text-sm">
									+{post.tags.length - 3} autres
								</Badge>
							)}
						</div>

						{/* Title */}
						<div className="space-y-4">
							<h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
								{post.title}
							</h1>

							{post.excerpt && (
								<p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
									{post.excerpt}
								</p>
							)}
						</div>

						{/* Meta Information */}
						<Card className="bg-muted/30 border-0">
							<CardContent className="p-6">
								<div className="flex flex-wrap items-center gap-6 text-sm">
									<div className="flex items-center gap-2">
										<div className="p-1.5 rounded-full bg-primary/10">
											<User className="h-4 w-4 text-primary" />
										</div>
										<span className="font-medium">
											{post.author.name || post.author.email}
										</span>
									</div>
									
									<Separator orientation="vertical" className="h-4" />
									
									<div className="flex items-center gap-2">
										<div className="p-1.5 rounded-full bg-primary/10">
											<CalendarDays className="h-4 w-4 text-primary" />
										</div>
										<span>
											{format(new Date(post.publishedAt!), "dd MMMM yyyy", { locale: fr })}
										</span>
									</div>
									
									<Separator orientation="vertical" className="h-4" />
									
									<div className="flex items-center gap-2">
										<div className="p-1.5 rounded-full bg-primary/10">
											<Clock className="h-4 w-4 text-primary" />
										</div>
										<span>{readingTime} min de lecture</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</header>

					{/* Cover Image */}
					{post.coverImage && (
						<div className="relative group">
							<div className="aspect-video w-full overflow-hidden rounded-xl border shadow-lg">
								<img
									src={post.coverImage}
									alt={post.title}
									className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
								/>
							</div>
							<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
						</div>
					)}

					{/* Content */}
					<Card className="border-0 shadow-sm">
						<CardContent className="p-8 md:p-12">
							<div
								className="prose prose-lg dark:prose-invert max-w-none prose-headings:scroll-m-20 prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-7 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border"
								dangerouslySetInnerHTML={{ __html: post.content }}
							/>
						</CardContent>
					</Card>

					{/* Footer */}
					{post.tags.length > 0 && (
						<footer className="space-y-6">
							<Separator />
							<Card className="bg-muted/30 border-0">
								<CardContent className="p-6">
									<div className="space-y-4">
										<h3 className="text-lg font-semibold flex items-center gap-2">
											<TagIcon className="h-5 w-5 text-primary" />
											Tags associés
										</h3>
										<div className="flex flex-wrap gap-2">
											{post.tags.map((pt: PostTag) => (
												<Link key={pt.tag.id} href={`/blog/tag/${pt.tag.slug}`}>
													<Badge 
														variant="outline" 
														className="gap-1.5 px-3 py-2 text-sm hover:bg-accent/50 transition-colors"
													>
														<TagIcon className="h-3.5 w-3.5" />
														{pt.tag.name}
													</Badge>
												</Link>
											))}
										</div>
									</div>
								</CardContent>
							</Card>
						</footer>
					)}

					{/* Back to Blog */}
					<div className="flex justify-center pt-8">
						<Link href="/blog">
							<Button variant="outline" size="lg" className="gap-2">
								<ArrowLeft className="h-4 w-4" />
								Voir tous les articles
							</Button>
						</Link>
					</div>
				</article>
			</div>
		</div>
	);
}
