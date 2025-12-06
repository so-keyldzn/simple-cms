import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { sendEmail } from "@/lib/email";
import { VerificationEmail } from "@/emails/verification-email";
import { ResetPasswordEmail } from "@/emails/reset-password-email";
import { prisma } from "@/lib/prisma";
import { ac, superAdmin, admin as adminRole, user } from "./permissions";
import type { Role } from "better-auth/plugins/access";

const isProduction = process.env.NODE_ENV === "production";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    trustedOrigins: process.env.NEXT_PUBLIC_APP_URL
        ? [process.env.NEXT_PUBLIC_APP_URL, "http://localhost:3000"]
        : ["http://localhost:3000"],
    advanced: {
        cookiePrefix: "simple-cms",
        useSecureCookies: isProduction,
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url }) => {
            await sendEmail({
                to: user.email,
                subject: "Réinitialisation de votre mot de passe",
                react: ResetPasswordEmail({
                    userName: user.name,
                    resetUrl: url,
                }),
            });
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            await sendEmail({
                to: user.email,
                subject: "Vérifiez votre adresse email",
                react: VerificationEmail({
                    userName: user.name,
                    verificationUrl: url,
                }),
            });
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 30, // 30 days
        updateAge: 60 * 60 * 24, // 1 day
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5, // 5 minutes (default) - improves performance while allowing timely updates
        },
    },
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    plugins: [
        admin({
            defaultRole: "user",
            adminRoles: ["admin", "super-admin"],
            // Use Access Control for fine-grained permissions including impersonation
            ac,
            roles: {
                "super-admin": superAdmin as unknown as Role,
                "admin": adminRole as unknown as Role,
                "user": user as unknown as Role,
            },
            impersonationSessionDuration: 60 * 60, // 1 hour
            defaultBanReason: "Violation of terms of service",
            bannedUserMessage: "Your account has been suspended. Please contact support if you believe this is an error.",
        }),
        // IMPORTANT: nextCookies() must be the LAST plugin in the array
        // This plugin handles cookie management for Next.js Server Actions
        nextCookies()
    ]
});