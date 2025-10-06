"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

import { Checkbox } from "@/components/ui/checkbox";
import { InputGroup, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import { useState } from "react";
import { Loader2, Mail, Lock } from "lucide-react";
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
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">{t("signIn")}</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          {t("signInDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("email")}</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupText>
                        <Mail className="size-4" />
                      </InputGroupText>
                      <InputGroupInput
                        type="email"
                        placeholder={t("emailPlaceholder")}
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
                    <FormLabel>{t("password")}</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="ml-auto inline-block text-sm underline"
                    >
                      {t("forgotPassword")}
                    </Link>
                  </div>
                  <FormControl>
                    <InputGroup>
                      <InputGroupText>
                        <Lock className="size-4" />
                      </InputGroupText>
                      <InputGroupInput
                        type="password"
                        placeholder={t("passwordPlaceholder")}
                        autoComplete="password"
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
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t("rememberMe")}</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <ButtonGroup>
              <Button
                type="submit"
                className="w-full"
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
        <div className="flex justify-center w-full border-t py-4">
          <p className="text-center text-xs text-neutral-500">
           {t("builtWith")}{" "}
            <Link
              href="https://better-auth.com"
              className="underline"
              target="_blank"
            >
              <span className="dark:text-white/70 cursor-pointer">
								better-auth.
							</span>
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}