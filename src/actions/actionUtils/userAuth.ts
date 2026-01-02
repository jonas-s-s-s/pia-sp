import {ActionError} from "astro:actions";
import type {User} from "../../../auth.ts";

export function isUserLoggedIn(context: any): User {
    if (!context.locals.user) {
        throw new ActionError({code: "UNAUTHORIZED"});
    }
    return context.locals.user;
}