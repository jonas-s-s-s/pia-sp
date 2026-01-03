import {ActionError, defineAction} from "astro:actions";
import {z} from "astro:schema";
import {isUserLoggedIn} from "./actionUtils/userAuth.ts";
import type {User} from "../../auth.ts";
import {
    hasUpdateMyLanguagesPermission, hasUploadTranslatedFilePermission,
    hasViewMyLanguagesPermission
} from "../lib_backend/user_roles/userRoleManager.ts";
import {
    addTranslatorLanguages,
    getTranslatorLanguages,
    removeTranslatorLanguages
} from "../db/data_access/translator.ts";
import {isIso6391} from "../lib_frontend/iso-639-1.ts";
import {changeProjectState, getProjectById, setTranslatedFilePrefix} from "../db/data_access/project.ts";
import {projectBucketUploadFile} from "../lib_backend/objectStorage.ts";

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

    uploadTranslatedFile: defineAction({
        accept: "form",
        handler: async (input, context) => {
            const user: User = isUserLoggedIn(context);

            //# 0) Validate input
            //#############################################################################
            const file = input.get("file") as File | null;
            if (!file) {
                throw new ActionError({code: "BAD_REQUEST", message: "No file provided"});
            }

            const projectId = input.get("projectId") as string | null;
            if (!projectId) {
                throw new ActionError({code: "BAD_REQUEST", message: "No project ID provided"});
            }

            // 1) Verify that user has permission to upload translated files
            //#############################################################################
            if (!await hasUploadTranslatedFilePermission(user)) {
                throw new ActionError({code: "UNAUTHORIZED", message: "You don't have permission to upload translated files"});
            }

            // 2) Verify that project exists, and that user is assigned to it as translator
            //#############################################################################
            const project = await getProjectById(projectId);

            if (!project) {
                throw new ActionError({code: "NOT_FOUND", message: "Project not found"});
            }

            if (project.translatorId !== user.id) {
                throw new ActionError({code: "FORBIDDEN", message: "You aren't assigned to this project as translator"});
            }

            // 3) Upload file to bucket
            //#############################################################################
            const prefix = `${projectId}/${file.name}`;
            const buffer = Buffer.from(await file.arrayBuffer());

            try {
                await projectBucketUploadFile(prefix, buffer, "application/octet-stream");
            } catch (e) {
                throw new ActionError({code: "INTERNAL_SERVER_ERROR", message: "Unable to upload file to bucket."});
            }

            // 4) The translated file prefix should now point to this file
            //#############################################################################
            await setTranslatedFilePrefix(projectId, prefix);

            // 5) Change project state
            //#############################################################################
            await changeProjectState(projectId, "COMPLETED");
        }
    })

};