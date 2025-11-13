"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/features/auth/lib/auth";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

type UpdateProfileData = {
	name: string;
	image?: string | null;
};

export async function updateProfile(data: UpdateProfileData) {
	const t = await getTranslations("errors");

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { data: null, error: t("unauthorized") };
	}

	try {
		const updatedUser = await prisma.user.update({
			where: { id: session.user.id },
			data: {
				name: data.name,
				image: data.image,
			},
		});

		// Revalidate all paths where user data is displayed
		revalidatePath("/profile");
		revalidatePath("/admin");
		revalidatePath("/dashboard");
		revalidatePath("/");

		return { data: updatedUser, error: null };
	} catch (error) {
		console.error("Error updating profile:", error);
		return { data: null, error: t("updateProfileFailed") };
	}
}

export async function getProfile() {
	const t = await getTranslations("errors");

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { data: null, error: t("unauthorized") };
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				role: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!user) {
			return { data: null, error: t("userNotFound") };
		}

		return { data: user, error: null };
	} catch (error) {
		console.error("Error fetching profile:", error);
		return { data: null, error: t("fetchProfileFailed") };
	}
}
