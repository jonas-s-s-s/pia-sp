import {ActionError, defineAction} from "astro:actions";
import {z} from "astro:schema";
import {isUserLoggedIn} from "./actionUtils/userAuth.ts";
import type {User} from "../../auth.ts";
import {
    hasUpdateMyLanguagesPermission,
    hasViewMyLanguagesPermission
} from "../lib_backend/user_roles/userRoleManager.ts";
import {
    addTranslatorLanguages,
    getTranslatorLanguages,
    removeTranslatorLanguages
} from "../db/data_access/translator.ts";
import {isIso6391} from "../lib_frontend/iso-639-1.ts";

export const translator = {
    addMyLanguages: defineAction({
        input: z.object({
            languages: z.string().array(),
        }),
        handler: async (input, context) => {
            const user: User = isUserLoggedIn(context);

            if (!await hasUpdateMyLanguagesPermission(user)) {
                throw new ActionError({code: "UNAUTHORIZED"});
            }

            for (const lang of input.languages) {
                if (!isIso6391(lang))
                    throw new ActionError({
                        code: "BAD_REQUEST",
                        message: `Language ${lang} is not valid ISO 639-1 code.`
                    });
            }

            try {
                await addTranslatorLanguages(user.id, input.languages);
            } catch (e) {
                throw new ActionError({code: "INTERNAL_SERVER_ERROR"});
            }
        },
    }),

    removeMyLanguages: defineAction({
        input: z.object({
            languages: z.string().array(),
        }),
        handler: async (input, context) => {
            const user: User = isUserLoggedIn(context);

            if (!await hasUpdateMyLanguagesPermission(user)) {
                throw new ActionError({code: "UNAUTHORIZED"});
            }

            try {
                await removeTranslatorLanguages(user.id, input.languages);
            } catch (e) {
                throw new ActionError({code: "INTERNAL_SERVER_ERROR"});
            }
        },
    }),

    viewMyLanguages: defineAction({
        input: z.object({}),
        handler: async (input, context) => {
            const user: User = isUserLoggedIn(context);

            if (!await hasViewMyLanguagesPermission(user)) {
                throw new ActionError({code: "UNAUTHORIZED"});
            }

            try {
                return await getTranslatorLanguages(user.id);
            } catch (e) {
                throw new ActionError({code: "INTERNAL_SERVER_ERROR"});
            }
        },
    }),

};