import { z } from "zod";

// Blocked temporary email domains
const TEMP_EMAIL_DOMAINS = [
	"tempmail.com",
	"throwaway.email",
	"guerrillamail.com",
	"10minutemail.com",
	"mailinator.com",
	"trashmail.com",
];

// Admin creation validation schema
export const createAdminSchema = z.object({
	email: z
		.string()
		.min(1, "L'email est requis")
		.email("Format d'email invalide")
		.refine(
			(email) => {
				const domain = email.split("@")[1];
				return !TEMP_EMAIL_DOMAINS.includes(domain);
			},
			{ message: "Les adresses email temporaires ne sont pas autorisées" }
		),
	name: z
		.string()
		.min(2, "Le nom doit contenir au moins 2 caractères")
		.max(100, "Le nom ne peut pas dépasser 100 caractères")
		.regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom contient des caractères invalides"),
	password: z
		.string()
		.min(8, "Le mot de passe doit contenir au moins 8 caractères")
		.regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
		.regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
		.regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
});

// Site settings validation schema
export const siteSettingsSchema = z.object({
	siteName: z
		.string()
		.min(1, "Le nom du site est requis")
		.max(100, "Le nom ne peut pas dépasser 100 caractères"),
	siteDescription: z
		.string()
		.max(500, "La description ne peut pas dépasser 500 caractères")
		.optional(),
	siteLogo: z
		.string()
		.url("URL invalide")
		.optional()
		.or(z.literal("")),
	siteFavicon: z
		.string()
		.url("URL invalide")
		.optional()
		.or(z.literal("")),
});

// Combined onboarding validation schema (admin + site settings)
export const completeOnboardingSchema = z.object({
	// Admin fields
	email: z
		.string()
		.min(1, "L'email est requis")
		.email("Format d'email invalide")
		.refine(
			(email) => {
				const domain = email.split("@")[1];
				return !TEMP_EMAIL_DOMAINS.includes(domain);
			},
			{ message: "Les adresses email temporaires ne sont pas autorisées" }
		),
	name: z
		.string()
		.min(2, "Le nom doit contenir au moins 2 caractères")
		.max(100, "Le nom ne peut pas dépasser 100 caractères")
		.regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom contient des caractères invalides"),
	password: z
		.string()
		.min(8, "Le mot de passe doit contenir au moins 8 caractères")
		.regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
		.regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
		.regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
	// Site settings fields
	siteName: z
		.string()
		.min(1, "Le nom du site est requis")
		.max(100, "Le nom ne peut pas dépasser 100 caractères"),
	siteDescription: z
		.string()
		.max(500, "La description ne peut pas dépasser 500 caractères")
		.optional(),
	siteLogo: z
		.string()
		.url("URL invalide")
		.optional()
		.or(z.literal("")),
	siteFavicon: z
		.string()
		.url("URL invalide")
		.optional()
		.or(z.literal("")),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;

// Error messages constants
export const ERROR_MESSAGES = {
	UNAUTHORIZED: "Non autorisé",
	ONBOARDING_COMPLETE: "L'onboarding a déjà été effectué",
	USER_EXISTS: "Un utilisateur avec cet email existe déjà",
	WEAK_PASSWORD: "Le mot de passe ne respecte pas les critères de sécurité",
	INVALID_EMAIL: "Format d'email invalide",
	RATE_LIMIT: "Trop de tentatives. Veuillez réessayer plus tard",
	INTERNAL_ERROR: "Une erreur interne est survenue",
	INVALID_INPUT: "Données invalides",
} as const;
