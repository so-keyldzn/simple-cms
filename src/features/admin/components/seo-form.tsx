"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSeoSettings, updateSeoSettings } from "@/features/admin/lib/seo-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function SeoForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    site_name: "",
    site_description: "",
    site_url: "",
    og_image: "",
    twitter_handle: "",
    keywords: "",
  });

  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await getSeoSettings();
      if (error) {
        toast.error(error);
      } else if (data) {
        setFormData({
          site_name: data.site_name || "",
          site_description: data.site_description || "",
          site_url: data.site_url || "",
          og_image: data.og_image || "",
          twitter_handle: data.twitter_handle || "",
          keywords: data.keywords || "",
        });
      }
      setIsFetching(false);
    }
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await updateSeoSettings(formData);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Paramètres SEO mis à jour avec succès");
    }

    setIsLoading(false);
  };

  if (isFetching) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Paramètres SEO</CardTitle>
          <CardDescription>
            Configurez les métadonnées de votre site pour le référencement naturel et les réseaux sociaux.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="site_name">Nom du site</Label>
            <Input
              id="site_name"
              value={formData.site_name}
              onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
              placeholder="Haez Club CMS"
            />
            <p className="text-xs text-muted-foreground">
              Le nom de votre site tel qu'il apparaîtra dans les résultats de recherche et sur les réseaux sociaux.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site_description">Description du site</Label>
            <Textarea
              id="site_description"
              value={formData.site_description}
              onChange={(e) => setFormData({ ...formData, site_description: e.target.value })}
              placeholder="Blog et système de gestion de contenu moderne"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Une description concise de votre site (150-160 caractères recommandés).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site_url">URL du site</Label>
            <Input
              id="site_url"
              type="url"
              value={formData.site_url}
              onChange={(e) => setFormData({ ...formData, site_url: e.target.value })}
              placeholder="https://monsite.com"
            />
            <p className="text-xs text-muted-foreground">
              L'URL complète de votre site (sans le slash final).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="og_image">Image Open Graph par défaut</Label>
            <Input
              id="og_image"
              value={formData.og_image}
              onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
              placeholder="/og-image.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Chemin vers l'image par défaut pour les partages sur réseaux sociaux (1200x630px recommandé).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter_handle">Identifiant Twitter</Label>
            <Input
              id="twitter_handle"
              value={formData.twitter_handle}
              onChange={(e) => setFormData({ ...formData, twitter_handle: e.target.value })}
              placeholder="@haezclub"
            />
            <p className="text-xs text-muted-foreground">
              Votre identifiant Twitter/X (avec le @).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Mots-clés par défaut</Label>
            <Input
              id="keywords"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder='["blog", "cms", "next.js"]'
            />
            <p className="text-xs text-muted-foreground">
              Liste de mots-clés au format JSON : ["mot1", "mot2", "mot3"]
            </p>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
