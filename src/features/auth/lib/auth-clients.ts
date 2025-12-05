import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { ac, superAdmin, admin, user } from "./permissions";
import type { Role } from "better-auth/plugins/access";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
    fetchOptions: {
        credentials: "include",
    },
    plugins: [
        adminClient({
            ac,
            roles: {
                "super-admin": superAdmin as unknown as Role,
                "admin": admin as unknown as Role,
                "user": user as unknown as Role,
            }
        })
    ]
})

export const {
    signIn,
    signOut,
    signUp,
    useSession,
    forgetPassword,
    resetPassword,
} = authClient;