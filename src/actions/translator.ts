import {ActionError, defineAction} from "astro:actions";
import {z} from "astro:schema";
import {isUserLoggedIn} from "./actionUtils/userAuth.ts";
import type {User} from "../../auth.ts";
import {
    hasDownloadOriginalFilePermission,
    hasDownloadTranslatedFilePermission,
    hasUpdateMyLanguagesPermission, hasUploadTranslatedFilePermission, hasViewAssignedProjectsPermission,
    hasViewMyLanguagesPermission
} from "../lib_backend/user_roles/userRoleManager.ts";
import {
    addTranslatorLanguages,
    getTranslatorLanguages,
    removeTranslatorLanguages
} from "../db/data_access/translator.ts";
import {isIso6391} from "../lib_frontend/iso-639-1.ts";
import {
    changeProjectState,
    getProjectById,
    getProjectsByTranslatorId, getProjectsByTranslatorIdAndState, getProjectsByTranslatorIdNonAssigned,
    setTranslatedFilePrefix
} from "../db/data_access/project.ts";
import {
    deleteProjectBucketPrefix,
    projectBucketGenerateDownloadUrl,
    projectBucketUploadFile
} from "../lib_backend/objectStorage.ts";
import {sendProjectCompletedNotification} from "../lib_backend/email.ts";
import {getUserById} from "../db/data_access/user.ts";

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
                throw new ActionError({
                    code: "UNAUTHORIZED",
                    message: "You don't have permission to upload translated files"
                });
            }

            // 2) Verify that project exists, and that user is assigned to it as translator
            //#############################################################################
            const data = await getProjectById(projectId);
            const project = data?.project;

            if (!project) {
                throw new ActionError({code: "NOT_FOUND", message: "Project not found"});
            }

            if (project.translatorId !== user.id) {
                throw new ActionError({
                    code: "FORBIDDEN",
                    message: "You aren't assigned to this project as translator"
                });
            }

            // 3) File can be uploaded only if the project is in "ASSIGNED" state
            //#############################################################################
            if (project.state !== "ASSIGNED") {
                throw new ActionError({
                    code: "BAD_REQUEST",
                    message: "File can be uploaded only if the project is in 'ASSIGNED' state"
                });
            }

            // 4) Verify that the file is < 5 MB
            //#############################################################################
            const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
            if (file.size > MAX_FILE_SIZE) {
                throw new ActionError({
                    code: "BAD_REQUEST",
                    message: "File size must be less than 5 MB"
                });
            }

            // 5) Delete the current file if it exists
            //#############################################################################
            if (project.translatedFilePrefix) {
                try {
                    await deleteProjectBucketPrefix(project.translatedFilePrefix);
                } catch (e) {
                    throw new ActionError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Unable delete current file from bucket."
                    });
                }
            }

            // 6) Upload file to bucket
            //#############################################################################
            const prefix = `${projectId}/${file.name}`;
            const buffer = Buffer.from(await file.arrayBuffer());

            try {
                await projectBucketUploadFile(prefix, buffer, "application/octet-stream");
            } catch (e) {
                throw new ActionError({code: "INTERNAL_SERVER_ERROR", message: "Unable to upload file to bucket."});
            }

            // 7) The translated file prefix should now point to this file
            //#############################################################################
            await setTranslatedFilePrefix(projectId, prefix);

            // 8) Change project state
            //#############################################################################
            await changeProjectState(projectId, "COMPLETED");

            // 9) Notify customer that the project is completed
            //#############################################################################
            const customer = await getUserById(project.customerId);
            if (customer) {
                await sendProjectCompletedNotification(customer.email, projectId);
            }
        }
    }),

    getMyAssignedProjects: defineAction({
        input: z.object({}),
        handler: async (input, context) => {
            const user: User = isUserLoggedIn(context);

            if (!await hasViewAssignedProjectsPermission(user)) {
                throw new ActionError({code: "UNAUTHORIZED"});
            }

            try {
                return await getProjectsByTranslatorIdAndState(user.id, "ASSIGNED");
            } catch (e) {
                throw new ActionError({code: "INTERNAL_SERVER_ERROR"});
            }
        },
    }),

    getAllMyProjects: defineAction({
        input: z.object({}),
        handler: async (input, context) => {
            const user: User = isUserLoggedIn(context);

            if (!await hasViewAssignedProjectsPermission(user)) {
                throw new ActionError({code: "UNAUTHORIZED"});
            }

            try {
                return await getProjectsByTranslatorId(user.id);
            } catch (e) {
                throw new ActionError({code: "INTERNAL_SERVER_ERROR"});
            }
        },
    }),

    getAllMyNonAssignedProjects: defineAction({
        input: z.object({}),
        handler: async (input, context) => {
            const user: User = isUserLoggedIn(context);

            if (!await hasViewAssignedProjectsPermission(user)) {
                throw new ActionError({code: "UNAUTHORIZED"});
            }

            try {
                return await getProjectsByTranslatorIdNonAssigned(user.id);
            } catch (e) {
                throw new ActionError({code: "INTERNAL_SERVER_ERROR"});
            }
        },
    }),

    downloadFile: defineAction({
        input: z.object({
            projectId: z.string(),
            type: z.enum(["original", "translated"]),
        }),
        handler: async (input, context) => {
            const user: User = isUserLoggedIn(context);

            // 0) Check user's permission to download file
            //#############################################################################

            if (input.type == "translated" && !await hasDownloadTranslatedFilePermission(user)) {
                throw new ActionError({code: "UNAUTHORIZED"});
            }

            if (input.type == "original" && !await hasDownloadOriginalFilePermission(user)) {
                throw new ActionError({code: "UNAUTHORIZED"});
            }

            // 1) Verify that project exists, and that user is assigned to it as a translator or customer
            //#############################################################################
            const data = await getProjectById(input.projectId);
            const project = data?.project;

            if (!project) {
                throw new ActionError({code: "NOT_FOUND", message: "Project not found"});
            }

            if (project.translatorId !== user.id && project.customerId !== user.id) {
                throw new ActionError({
                    code: "FORBIDDEN",
                    message: "You aren't assigned to this project"
                });
            }

            // 2) Check if the file prefix exists
            //#############################################################################

            if (input.type == "translated" && !project.translatedFilePrefix) {
                throw new ActionError({
                    code: "NOT_FOUND",
                    message: "Translated file doesn't exist"
                });
            }

            if (input.type == "original" && !project.originalFilePrefix) {
                throw new ActionError({
                    code: "NOT_FOUND",
                    message: "Original file doesn't exist"
                });
            }

            // 3) Return the download link
            //#############################################################################

            try {
                if (input.type == "original")
                    return await projectBucketGenerateDownloadUrl(project.originalFilePrefix!);
                else
                    return await projectBucketGenerateDownloadUrl(project.translatedFilePrefix!);
            } catch (e) {
                throw new ActionError({code: "INTERNAL_SERVER_ERROR"});
            }
        },
    }),

};