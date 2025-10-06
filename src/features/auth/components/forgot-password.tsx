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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { forgetPassword } from "@/features/auth/lib/auth-clients";
import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
});

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await forgetPassword(
      {
        email: values.email,
        redirectTo: "/reset-password",
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onResponse: () => {
          setLoading(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Une erreur s'est produite");
        },
        onSuccess: () => {
          setEmailSent(true);
          toast.success("Email de réinitialisation envoyé !");
        },
      }
    );
  };

  if (emailSent) {
    return (
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Email envoyé ✉️</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Vérifiez votre boîte de réception
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nous avons envoyé un lien de réinitialisation à{" "}
            <span className="font-medium text-foreground">{form.getValues("email")}</span>.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Cliquez sur le lien dans l&apos;email pour réinitialiser votre mot de
            passe.
          </p>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button asChild className="w-full" variant="outline">
            <Link href="/sign-in">Retour à la connexion</Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setEmailSent(false)}
          >
            Renvoyer l&apos;email
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">
          Mot de passe oublié ?
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Entrez votre email pour recevoir un lien de réinitialisation
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="m@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Envoyer le lien de réinitialisation"
                )}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <div className="flex justify-center w-full border-t py-4">
              <p className="text-center text-xs text-neutral-500">
                Vous vous souvenez de votre mot de passe ?{" "}
                <Link href="/sign-in" className="underline">
                  <span className="dark:text-white/70 cursor-pointer">
                    Se connecter
                  </span>
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
