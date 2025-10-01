"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSettingsByCategory, updateSettings } from "@/features/admin/lib/setting-actions";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";

export function SeoForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
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
      const { data, error } = await getSettingsByCategory("seo");
      if (error) {
        toast.error(error);
      } else if (data) {
        // Transform array to object map
        const settingsMap = data.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as Record<string, string>);

        setFormData({
          site_name: settingsMap.site_name || "",
          site_description: settingsMap.site_description || "",
          site_url: settingsMap.site_url || "",
          og_image: settingsMap.og_image || "",
          twitter_handle: settingsMap.twitter_handle || "",
          keywords: settingsMap.keywords || "",
        });
      }
      setIsFetching(false);
    }
    fetchSettings();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    // Validate file size (max 5MB for OG images)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        toast.error(result.error || "Erreur lors de l'upload");
      } else if (result.data) {
        setFormData({ ...formData, og_image: result.data.url });
        toast.success("Image téléchargée avec succès");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erreur lors du téléchargement de l'image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, og_image: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const settingsArray = Object.entries(formData).map(([key, value]) => ({
      key,
      value,
      category: "seo" as const,
    }));

    const { data, error } = await updateSettings(settingsArray);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Paramètres SEO mis à jour avec succès");
      // Force page reload to refresh data
      window.location.reload();
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

            {formData.og_image ? (
              <div className="space-y-2">
                <div className="relative w-full h-48 border rounded-md overflow-hidden">
                  <Image
                    src={formData.og_image}
                    alt="Open Graph"
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  value={formData.og_image}
                  onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                  placeholder="URL de l'image"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    id="og_image_file"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="flex-1"
                  />
                  {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                <p className="text-xs text-muted-foreground">ou</p>
                <Input
                  id="og_image"
                  value={formData.og_image}
                  onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                  placeholder="URL de l'image : https://exemple.com/image.jpg"
                />
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Image par défaut pour les partages sur réseaux sociaux (1200x630px recommandé, max 5MB).
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
