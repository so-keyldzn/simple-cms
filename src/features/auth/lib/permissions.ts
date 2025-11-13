import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

// Define permissions for your resources
const statement = {
    ...defaultStatements, // Include Better Auth admin default permissions
    // Add custom permissions if needed
} as const;

// Create access control instance
export const ac = createAccessControl(statement);

// Define roles with their permissions
export const superAdmin = ac.newRole({
    ...adminAc.statements, // All admin permissions including impersonation
});

export const admin = ac.newRole({
    ...adminAc.statements, // All admin permissions including impersonation
});

export const user = ac.newRole({
    // Regular users have no admin permissions
});
