import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from "../../../../generated/prisma";
import { admin } from "better-auth/plugins";

const prisma = new PrismaClient();
export const auth = betterAuth({
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
            adminRoles: ["admin"],
        })
    ]
});