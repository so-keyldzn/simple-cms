import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from "../../../../generated/prisma";
import { admin } from "better-auth/plugins";

const prisma = new PrismaClient();
export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    trustedOrigins: ["http://localhost:3000"],
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    session: {
        expiresIn: 60 * 60 * 24 * 30, // 30 days
        updateAge: 60 * 60 * 24, // 1 day
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 24 * 30, // 30 days
        },
    },
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    plugins: [
        admin({
            defaultRole: "user",
            adminRoles: ["admin", "super-admin"],
            adminUserIds: ["UbfU6nltwO8cqWBYkNlnSf8RQNpTsN7e"], // Votre ID utilisateur du debug
            impersonationSessionDuration: 60 * 60, // 1 hour
            defaultBanReason: "Violation of terms of service",
            bannedUserMessage: "Your account has been suspended. Please contact support if you believe this is an error.",
        })
    ]
});