import {ActionError, defineAction} from "astro:actions";
import {z} from "astro:schema";
import type {User} from "../../auth.ts";

import {isUserLoggedIn} from "./actionUtils/userAuth.ts";
import {isIso6391} from "../lib_frontend/iso-639-1.ts";

import {
    hasCreateProjectPermission, hasUploadOriginalFilePermission, hasViewMyProjectsPermission,
} from "../lib_backend/user_roles/userRoleManager.ts";

import {
    createProject, getProjectsByCustomerId, setOriginalFilePrefix,
} from "../db/data_access/project.ts";
import {projectBucketUploadFile} from "../lib_backend/objectStorage.ts";

export const customer = {
    createProject: defineAction({
        input: z.object({
            languageCode: z.string(),
        }),
        handler: async (input, context) => {
            const user: User = isUserLoggedIn(context);

            // 1) Permission check
            //#############################################################################
            if (!await hasCreateProjectPermission(user)) {
                throw new ActionError({code: "UNAUTHORIZED"});
            }

            // 2) Validate language code
            //#############################################################################
            if (!isIso6391(input.languageCode)) {
                throw new ActionError({
                    code: "BAD_REQUEST",
                    message: "Invalid ISO 639-1 language code",
                });
            }

            // 3) Create project
            //#############################################################################
            try {
                return await createProject({
                    customerId: user.id,
                    languageCode: input.languageCode,
                });
            } catch (e) {
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Unable to create project",
                });
            }
        },
    }),
    uploadOriginalFile: defineAction({
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

            // 1) Verify that user has permission to upload original files
            //#############################################################################
            if (!await hasUploadOriginalFilePermission(user)) {
                throw new ActionError({
                    code: "UNAUTHORIZED",
                    message: "You don't have permission to upload translated files"
                });
            }

            // 2) Verify that the file is < 5 MB
            //#############################################################################
            const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
            if (file.size > MAX_FILE_SIZE) {
                throw new ActionError({
                    code: "BAD_REQUEST",
                    message: "File size must be less than 5 MB"
                });
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

            // 4) The original file prefix should now point to this file
            //#############################################################################
            await setOriginalFilePrefix(projectId, prefix);

            // 5) Assign to translator
            //#############################################################################

        }
    }),
    getMyProjects: defineAction({
        input: z.object({}),
        handler: async (input, context) => {
            const user: User = isUserLoggedIn(context);

            if (!await hasViewMyProjectsPermission(user)) {
                throw new ActionError({
                    code: "UNAUTHORIZED",
                    message: "You don't have permission to view projects"
                });
            }

            try {
                const projects = await getProjectsByCustomerId(user.id);
                return projects;
            } catch (e) {
                throw new Error("Unable to fetch projects");
            }
        }
    }),
};
