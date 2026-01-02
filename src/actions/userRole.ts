import {ActionError, defineAction} from "astro:actions";
import {z} from "astro:schema";
import {isUserLoggedIn} from "./actionUtils/userAuth.ts";
import type {User} from "../../auth.ts";
import {setUserRole} from "../lib_backend/user_roles/userRoleManager.ts";

export const userRole = {
    setMyRole: defineAction({
        input: z.object({
            role: z.string(),
        }),
        handler: async (input, context) => {
            const user: User = isUserLoggedIn(context);

            try {
                await setUserRole(user, input.role);
            } catch (e) {
                throw new ActionError({code: "INTERNAL_SERVER_ERROR"});
            }
        },
    }),
};