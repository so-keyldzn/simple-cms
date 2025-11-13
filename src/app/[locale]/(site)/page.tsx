import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Users, Settings, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-muted">
			{/* Hero Section */}
			<section className="container mx-auto px-4 py-16 text-center">
				<div className="max-w-4xl mx-auto space-y-8">
					<div className="space-y-4">
						<Badge variant="secondary" className="px-4 py-2">
							<Zap className="w-4 h-4 mr-2" />
							CMS Next.js 15
						</Badge>
						<h1 className="text-5xl md:text-7xl font-bold tracking-tight">
							Votre CMS
							<span className="text-primary"> moderne</span>
						</h1>
						<p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
							Une plateforme de gestion de contenu puissante et intuitive, 
							construite avec les dernières technologies web.
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button asChild size="lg" className="text-lg px-8 py-6">
							<Link href="/blog">
								<BookOpen className="w-5 h-5 mr-2" />
								Découvrir le blog
								<ArrowRight className="w-5 h-5 ml-2" />
							</Link>
						</Button>
						<Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
							<Link href="/dashboard">
								<Settings className="w-5 h-5 mr-2" />
								Accéder au dashboard
							</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="container mx-auto px-4 py-16">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Fonctionnalités principales
						</h2>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Tout ce dont vous avez besoin pour créer et gérer votre contenu efficacement.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						<Card className="border-2 hover:border-primary/50 transition-colors">
							<CardHeader>
								<BookOpen className="w-10 h-10 text-primary mb-2" />
								<CardTitle>Gestion de contenu</CardTitle>
								<CardDescription>
									Créez et gérez vos articles avec un éditeur riche et intuitif.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2 text-sm text-muted-foreground">
									<li>• Éditeur WYSIWYG avancé</li>
									<li>• Catégories et tags</li>
									<li>• Brouillons et publication</li>
									<li>• Images et médias</li>
								</ul>
							</CardContent>
						</Card>

						<Card className="border-2 hover:border-primary/50 transition-colors">
							<CardHeader>
								<Users className="w-10 h-10 text-primary mb-2" />
								<CardTitle>Gestion des utilisateurs</CardTitle>
								<CardDescription>
									Système complet de rôles et permissions pour votre équipe.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2 text-sm text-muted-foreground">
									<li>• Rôles personnalisables</li>
									<li>• Authentification sécurisée</li>
									<li>• Gestion des permissions</li>
									<li>• Profils utilisateurs</li>
								</ul>
							</CardContent>
						</Card>

						<Card className="border-2 hover:border-primary/50 transition-colors">
							<CardHeader>
								<Settings className="w-10 h-10 text-primary mb-2" />
								<CardTitle>Administration</CardTitle>
								<CardDescription>
									Interface d&apos;administration complète et personnalisable.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2 text-sm text-muted-foreground">
									<li>• Dashboard intuitif</li>
									<li>• Thèmes personnalisables</li>
									<li>• Médiathèque organisée</li>
									<li>• Statistiques détaillées</li>
								</ul>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto text-center">
					<Card className="border-2 border-primary/20 bg-primary/5">
						<CardHeader className="pb-4">
							<CardTitle className="text-2xl md:text-3xl">
								Prêt à commencer ?
							</CardTitle>
							<CardDescription className="text-lg">
								Explorez toutes les fonctionnalités de votre CMS dès maintenant.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Button asChild size="lg">
									<Link href="/blog">
										Voir le blog
									</Link>
								</Button>
								<Button asChild variant="outline" size="lg">
									<Link href="/dashboard">
										Accéder au dashboard
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	);
}
