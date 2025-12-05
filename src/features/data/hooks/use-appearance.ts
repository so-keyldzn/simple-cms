import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getCurrentThemeColors,
	saveThemeColors,
	resetThemeColors,
} from "@/features/admin/lib/appearance-actions";
import { queryKeys } from "../utils/query-keys";
import { toast } from "sonner";

// Types
type ThemeColors = {
	light: Record<string, string>;
	dark: Record<string, string>;
	radius: string;
};

/**
 * Hook pour récupérer les couleurs du thème actuel
 */
export function useThemeColors() {
	return useQuery({
		queryKey: queryKeys.appearance.settings(),
		queryFn: async () => {
			const result = await getCurrentThemeColors();
			if (!result.success || result.error) {
				throw new Error(result.error || "Erreur lors de la récupération du thème");
			}
			return result.data as ThemeColors;
		},
	});
}

/**
 * Hook pour sauvegarder les couleurs du thème
 */
export function useSaveThemeColors() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (colors: ThemeColors) => {
			const result = await saveThemeColors(colors);
			if (!result.success || result.error) {
				throw new Error(result.error || "Erreur lors de la sauvegarde du thème");
			}
			return result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.appearance.all });
			toast.success("Thème sauvegardé avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la sauvegarde du thème");
		},
	});
}

/**
 * Hook pour réinitialiser le thème aux couleurs par défaut
 */
export function useResetThemeColors() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const result = await resetThemeColors();
			if (!result.success || result.error) {
				throw new Error(result.error || "Erreur lors de la réinitialisation du thème");
			}
			return result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.appearance.all });
			toast.success("Thème réinitialisé aux valeurs par défaut");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la réinitialisation du thème");
		},
	});
}
