import {db} from "../orm.ts";
import {user} from "../schema/auth-schema.ts";
import {eq} from "drizzle-orm";

/**
 * Get user's role by ID
 */
export async function getUserRoleById(userId: string) {
    const result = await db
        .select({role: user.role})
        .from(user)
        .where(eq(user.id, userId));

    return result[0]?.role;
}

/**
 * Set or update a user's role by ID
 */
export async function setUserRoleById(userId: string, newRole: string) {
    const result = await db
        .update(user)
        .set({
            role: newRole,
            updatedAt: new Date(),
        })
        .where(eq(user.id, userId))
        .returning({id: user.id, role: user.role, updatedAt: user.updatedAt});

    if (!result[0]) throw new Error("User not found or role not updated.");

    return result[0];
}

export async function getUserById(userId: string) {
    const result = await db
        .select()
        .from(user)
        .where(eq(user.id, userId));

    return result[0];
}
