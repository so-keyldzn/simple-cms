import { NextResponse } from "next/server";
import { forceRefreshAdminIds } from "@/features/auth/lib/admin-ids";
import { auth } from "@/features/auth/lib/auth";
import { headers } from "next/headers";

/**
 * Endpoint pour rafraîchir manuellement le cache des IDs admin
 * Nécessite d'être super-admin pour l'utiliser
 */
export async function POST() {
    try {
        // Vérifier que l'utilisateur est authentifié et est super-admin
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 }
            );
        }

        const userRoles = session.user.role?.split(",") || [];
        const isSuperAdmin = userRoles.includes("super-admin");

        if (!isSuperAdmin) {
            return NextResponse.json(
                { error: "Accès refusé - super-admin requis" },
                { status: 403 }
            );
        }

        // Rafraîchir le cache
        const adminIds = await forceRefreshAdminIds();

        return NextResponse.json({
            success: true,
            count: adminIds.length,
            message: `Cache rafraîchi avec ${adminIds.length} admin(s)`,
        });
    } catch (error: any) {
        console.error("Erreur lors du rafraîchissement du cache admin:", error);
        return NextResponse.json(
            { error: error.message || "Erreur serveur" },
            { status: 500 }
        );
    }
}
