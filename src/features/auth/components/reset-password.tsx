"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { resetPassword } from "@/features/auth/lib/auth-clients";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const errorParam = searchParams.get("error");

    if (errorParam === "INVALID_TOKEN") {
      toast.error("Le lien de réinitialisation est invalide ou expiré");
      router.push("/forgot-password");
      return;
    }

    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast.error("Token de réinitialisation manquant");
      router.push("/forgot-password");
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (!token) {
      toast.error("Token de réinitialisation manquant");
      return;
    }

    await resetPassword(
      {
        newPassword: password,
        token,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onResponse: () => {
          setLoading(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Erreur lors de la réinitialisation");
        },
        onSuccess: () => {
          setSuccess(true);
          toast.success("Mot de passe réinitialisé avec succès !");
        },
      }
    );
  };

  if (success) {
    return (
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <CardTitle className="text-lg md:text-xl">
              Mot de passe réinitialisé !
            </CardTitle>
          </div>
          <CardDescription className="text-xs md:text-sm">
            Votre mot de passe a été modifié avec succès
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/sign-in">Se connecter</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">
          Réinitialiser le mot de passe
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Entrez votre nouveau mot de passe
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 8 caractères
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirm-password">
                Confirmer le mot de passe
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !token}>
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Réinitialiser le mot de passe"
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <div className="flex justify-center w-full border-t py-4">
            <p className="text-center text-xs text-neutral-500">
              Retour à{" "}
              <Link href="/sign-in" className="underline">
                <span className="dark:text-white/70 cursor-pointer">
                  la connexion
                </span>
              </Link>
            </p>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
