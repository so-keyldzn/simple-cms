import { PrismaClient } from "../../generated/prisma";

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
		// Limite le nombre de connexions pour éviter "too many clients"
		datasources: {
			db: {
				url: process.env.DATABASE_URL,
			},
		},
	});

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}

// Déconnexion propre lors de l'arrêt du serveur
if (process.env.NODE_ENV !== "production") {
	process.on("beforeExit", async () => {
		await prisma.$disconnect();
	});
}
