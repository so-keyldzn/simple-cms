"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/features/auth/lib/auth";
import { revalidatePath } from "next/cache";
import { hasPermission } from "@/lib/roles";

export async function getSeoSettings() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { data: null, error: "Non autorisé" };
  }

  try {
    const settings = await prisma.setting.findMany({
      where: { category: "seo" },
    });

    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return { data: settingsMap, error: null };
  } catch (error) {
    console.error("Error fetching SEO settings:", error);
    return { data: null, error: "Erreur lors de la récupération des paramètres" };
  }
}

export async function updateSeoSettings(data: Record<string, string>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { data: null, error: "Non autorisé" };
  }

  if (!hasPermission(session.user.role as string, "settings", "update")) {
    return { data: null, error: "Permission refusée" };
  }

  try {
    // Upsert chaque paramètre
    const promises = Object.entries(data).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value, category: "seo" },
        create: { key, value, category: "seo" },
      })
    );

    await Promise.all(promises);

    revalidatePath("/", "layout");
    return { data: true, error: null };
  } catch (error) {
    console.error("Error updating SEO settings:", error);
    return { data: null, error: "Erreur lors de la mise à jour des paramètres" };
  }
}
