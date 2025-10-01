"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/features/auth/lib/auth";
import { revalidatePath } from "next/cache";

type UpdateProfileData = {
	name: string;
	image?: string | null;
};

export async function updateProfile(data: UpdateProfileData) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { data: null, error: "Non autorisé" };
	}

	try {
		const updatedUser = await prisma.user.update({
			where: { id: session.user.id },
			data: {
				name: data.name,
				image: data.image,
			},
		});

		revalidatePath("/profile");
		revalidatePath("/admin");
		revalidatePath("/dashboard");

		return { data: updatedUser, error: null };
	} catch (error) {
		console.error("Error updating profile:", error);
		return { data: null, error: "Erreur lors de la mise à jour du profil" };
	}
}

export async function getProfile() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { data: null, error: "Non autorisé" };
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
			return { data: null, error: "Utilisateur non trouvé" };
		}

		return { data: user, error: null };
	} catch (error) {
		console.error("Error fetching profile:", error);
		return { data: null, error: "Erreur lors de la récupération du profil" };
	}
}
