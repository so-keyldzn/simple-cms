"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

import { Checkbox } from "@/components/ui/checkbox";
import { InputGroup, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import { useState } from "react";
import { Loader2, Mail, Lock, LogIn } from "lucide-react";
import { signIn } from "@/features/auth/lib/auth-clients";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
  rememberMe: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("auth");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: FormData) {
    await signIn.email(
      {
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onResponse: () => {
          setLoading(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || t("signInError"));
        },
        onSuccess: () => {
          toast.success(t("signInSuccess"));
          router.push("/dashboard");
        },
      },
    );
  }

  return (
    <Card className=" shadow-lg min-w-md max-w-md">
      <CardHeader className="text-center border-b pb-6 pt-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
            <LogIn className="size-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">{t("signIn")}</CardTitle>
        <CardDescription className="text-sm md:text-base text-muted-foreground mt-3">
          {t("signInDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">{t("email")}</FormLabel>
                  <FormControl>
                    <InputGroup className="transition-all duration-200 hover:border-primary/50">
                      <InputGroupText className="text-muted-foreground">
                        <Mail className="size-4" />
                      </InputGroupText>
                      <InputGroupInput
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        className="transition-colors duration-200"
                        {...field}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <FormLabel className="text-sm font-medium">{t("password")}</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="ml-auto inline-block text-xs text-primary hover:text-primary/80 transition-colors duration-200 font-medium"
                    >
                      {t("forgotPassword")}
                    </Link>
                  </div>
                  <FormControl>
                    <InputGroup className="transition-all duration-200 hover:border-primary/50">
                      <InputGroupText className="text-muted-foreground">
                        <Lock className="size-4" />
                      </InputGroupText>
                      <InputGroupInput
                        type="password"
                        placeholder={t("passwordPlaceholder")}
                        autoComplete="password"
                        className="transition-colors duration-200"
                        {...field}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-1">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium cursor-pointer">{t("rememberMe")}</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <ButtonGroup className="pt-2">
              <Button
                type="submit"
                className="w-full font-semibold transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <p>{t("login")}</p>
                )}
              </Button>
            </ButtonGroup>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="flex justify-center w-full border-t py-5 mt-2">
          <p className="text-center text-xs text-muted-foreground">
           {t("builtWith")}{" "}
            <Link
              href="https://better-auth.com"
              className="text-primary hover:text-primary/80 transition-colors duration-200 font-medium"
              target="_blank"
            >
              better-auth
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}