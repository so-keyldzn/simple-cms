import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	listUsersAction,
	createUserAction,
	setRoleAction,
	banUserAction,
	unbanUserAction,
	deleteUserAction,
	impersonateUserAction,
} from "@/features/admin/lib/user-actions";
import { queryKeys } from "../utils/query-keys";
import { toast } from "sonner";

// Types
export type User = {
	id: string;
	name: string | null;
	email: string;
	emailVerified: boolean;
	image: string | null;
	role: string | null;
	banned: boolean;
	banReason: string | null;
	banExpires: Date | null;
	createdAt: Date;
	updatedAt: Date;
};

type ListUsersOptions = {
	limit?: number;
	offset?: number;
	searchValue?: string;
	searchField?: "name" | "email";
	searchOperator?: "contains" | "starts_with" | "ends_with";
};

type UsersData = {
	users: User[];
	total: number;
};

type CreateUserInput = {
	name: string;
	email: string;
	password: string;
	role: string;
};

/**
 * Hook pour récupérer la liste des utilisateurs avec pagination et filtres
 */
export function useUsers(options?: ListUsersOptions) {
	return useQuery({
		queryKey: queryKeys.users.list(options || {}),
		queryFn: async () => {
			const result = await listUsersAction(options);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data as UsersData;
		},
	});
}

/**
 * Hook pour créer un nouvel utilisateur
 */
export function useCreateUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateUserInput) => {
			const result = await createUserAction(data);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
			toast.success("Utilisateur créé avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la création de l'utilisateur");
		},
	});
}

/**
 * Hook pour modifier le rôle d'un utilisateur avec optimistic updates
 */
export function useSetRole() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
			const result = await setRoleAction(userId, role);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		// Optimistic update - mettre à jour le cache avant la réponse serveur
		onMutate: async ({ userId, role }) => {
			// Annuler les requêtes en cours pour éviter les conflits
			await queryClient.cancelQueries({ queryKey: queryKeys.users.all });

			// Sauvegarder les données précédentes pour rollback
			const previousData = queryClient.getQueryData<UsersData>(queryKeys.users.lists());

			// Optimistically update the cache
			queryClient.setQueriesData<UsersData>(
				{ queryKey: queryKeys.users.all },
				(old) => {
					if (!old) return old;
					return {
						...old,
						users: old.users.map((user) =>
							user.id === userId ? { ...user, role } : user
						),
					};
				}
			);

			// Retourner le contexte avec les anciennes données pour rollback
			return { previousData };
		},
		// Si la mutation échoue, rollback
		onError: (error, _variables, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(queryKeys.users.lists(), context.previousData);
			}
			toast.error(error.message || "Erreur lors de la modification du rôle");
		},
		// Toujours refetch après la mutation (succès ou échec)
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
			toast.success("Rôle mis à jour avec succès");
		},
	});
}

/**
 * Hook pour bannir un utilisateur avec optimistic updates
 */
export function useBanUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			userId,
			banReason,
			banExpiresIn,
		}: {
			userId: string;
			banReason?: string;
			banExpiresIn?: number;
		}) => {
			const result = await banUserAction(userId, banReason, banExpiresIn);
			if (result.error) {
				throw new Error(result.error);
			}
			return result;
		},
		// Optimistic update - mettre à jour le cache avant la réponse serveur
		onMutate: async ({ userId, banReason, banExpiresIn }) => {
			// Annuler les requêtes en cours
			await queryClient.cancelQueries({ queryKey: queryKeys.users.all });

			// Sauvegarder les données précédentes
			const previousData = queryClient.getQueryData<UsersData>(queryKeys.users.lists());

			// Calculer la date d'expiration du ban
			const banExpires = banExpiresIn
				? new Date(Date.now() + banExpiresIn * 1000)
				: null;

			// Optimistically update the cache
			queryClient.setQueriesData<UsersData>(
				{ queryKey: queryKeys.users.all },
				(old) => {
					if (!old) return old;
					return {
						...old,
						users: old.users.map((user) =>
							user.id === userId
								? { ...user, banned: true, banReason: banReason || null, banExpires }
								: user
						),
					};
				}
			);

			return { previousData };
		},
		// Si la mutation échoue, rollback
		onError: (error, _variables, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(queryKeys.users.lists(), context.previousData);
			}
			toast.error(error.message || "Erreur lors du bannissement de l'utilisateur");
		},
		// Toujours refetch après la mutation
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
			toast.success("Utilisateur banni avec succès");
		},
	});
}

/**
 * Hook pour débannir un utilisateur avec optimistic updates
 */
export function useUnbanUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (userId: string) => {
			const result = await unbanUserAction(userId);
			if (result.error) {
				throw new Error(result.error);
			}
			return result;
		},
		// Optimistic update - mettre à jour le cache avant la réponse serveur
		onMutate: async (userId) => {
			// Annuler les requêtes en cours
			await queryClient.cancelQueries({ queryKey: queryKeys.users.all });

			// Sauvegarder les données précédentes
			const previousData = queryClient.getQueryData<UsersData>(queryKeys.users.lists());

			// Optimistically update the cache
			queryClient.setQueriesData<UsersData>(
				{ queryKey: queryKeys.users.all },
				(old) => {
					if (!old) return old;
					return {
						...old,
						users: old.users.map((user) =>
							user.id === userId
								? { ...user, banned: false, banReason: null, banExpires: null }
								: user
						),
					};
				}
			);

			return { previousData };
		},
		// Si la mutation échoue, rollback
		onError: (error, _variables, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(queryKeys.users.lists(), context.previousData);
			}
			toast.error(error.message || "Erreur lors du débannissement de l'utilisateur");
		},
		// Toujours refetch après la mutation
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
			toast.success("Utilisateur débanni avec succès");
		},
	});
}

/**
 * Hook pour supprimer un utilisateur
 */
export function useDeleteUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (userId: string) => {
			const result = await deleteUserAction(userId);
			if (result.error) {
				throw new Error(result.error);
			}
			return result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
			toast.success("Utilisateur supprimé avec succès");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la suppression de l'utilisateur");
		},
	});
}

/**
 * Hook pour usurper l'identité d'un utilisateur (impersonation)
 */
export function useImpersonateUser() {
	return useMutation({
		mutationFn: async (userId: string) => {
			const result = await impersonateUserAction(userId);
			if (result.error) {
				throw new Error(result.error);
			}
			return result.data;
		},
		onSuccess: () => {
			// Recharger la page pour que la session soit mise à jour
			window.location.reload();
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de l'usurpation d'identité");
		},
	});
}
