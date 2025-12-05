"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

interface QueryProviderProps {
	children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
	// Créer le QueryClient une seule fois par composant
	// (important pour éviter de recréer le client à chaque render)
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						// Cache minimal : 30 secondes
						staleTime: 30 * 1000,
						// Ne pas refetch automatiquement au focus de la fenêtre
						refetchOnWindowFocus: false,
						// Retry une fois en cas d'erreur
						retry: 1,
						// Temps avant de considérer une query comme erreur
						retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
					},
					mutations: {
						// Retry 0 fois pour les mutations (comportement par défaut)
						retry: 0,
					},
				},
			})
	);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{/* Devtools visibles uniquement en développement */}
			{process.env.NODE_ENV === "development" && (
				<ReactQueryDevtools initialIsOpen={true} buttonPosition="bottom-right" />
			)}
		</QueryClientProvider>
	);
}
