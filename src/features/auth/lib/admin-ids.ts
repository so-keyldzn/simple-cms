import { prisma } from "@/lib/prisma";

/**
 * Cache pour les IDs des utilisateurs admin/super-admin
 * Permet d'éviter de requêter la base de données à chaque vérification
 *
 * IMPORTANT: Initialisé avec ADMIN_USER_IDS pour que Better Auth ait des IDs dès le départ
 * Le cache sera mis à jour avec les IDs de la DB dès que possible
 */
let cachedAdminIds: string[] = process.env.ADMIN_USER_IDS?.split(",").filter(Boolean) || [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes

/**
 * Récupère les IDs des utilisateurs ayant un rôle admin ou super-admin depuis la base de données
 */
async function fetchAdminIdsFromDB(): Promise<string[]> {
    try {
        const admins = await prisma.user.findMany({
            where: {
                OR: [
                    { role: { contains: "super-admin" } },
                    { role: { contains: "admin" } },
                ],
            },
            select: {
                id: true,
            },
        });

        return admins.map((user) => user.id);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des IDs admin:", error);
        // Fallback vers la variable d'environnement si la DB n'est pas accessible
        return process.env.ADMIN_USER_IDS?.split(",").filter(Boolean) || [];
    }
}

/**
 * Initialise le cache des IDs admin au démarrage
 * Appelé automatiquement lors du chargement du module
 */
async function initAdminIdsCache(): Promise<void> {
    const ids = await fetchAdminIdsFromDB();
    cachedAdminIds = ids;
    lastFetchTime = Date.now();

    if (process.env.NODE_ENV === "development") {
        console.log(`✅ IDs admin chargés: ${ids.length} utilisateur(s)`);
    }
}

/**
 * Rafraîchit le cache si nécessaire (appelé périodiquement)
 */
export async function refreshAdminIdsCache(): Promise<void> {
    const now = Date.now();

    // Si le cache est expiré, le rafraîchir
    if (now - lastFetchTime >= CACHE_DURATION) {
        await initAdminIdsCache();
    }
}

/**
 * Retourne les IDs admin actuellement en cache
 * Cette fonction est synchrone et peut être utilisée dans la configuration Better Auth
 */
export function getAdminUserIds(): string[] {
    return cachedAdminIds;
}

/**
 * Force le rafraîchissement immédiat du cache
 * Utile pour les endpoints API ou après la création d'un nouvel admin
 */
export async function forceRefreshAdminIds(): Promise<string[]> {
    await initAdminIdsCache();
    return cachedAdminIds;
}

// Initialisation automatique au chargement du module
initAdminIdsCache().catch((error) => {
    console.error("❌ Impossible d'initialiser le cache des IDs admin:", error);
    // Utiliser le fallback de la variable d'environnement
    cachedAdminIds = process.env.ADMIN_USER_IDS?.split(",").filter(Boolean) || [];
});

// Rafraîchissement périodique toutes les 5 minutes
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        refreshAdminIdsCache().catch((error) => {
            console.error("❌ Erreur lors du rafraîchissement du cache admin:", error);
        });
    }, CACHE_DURATION);
}
