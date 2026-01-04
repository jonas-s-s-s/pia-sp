import {ActionError, defineAction} from "astro:actions";
import {z} from "astro:schema";
import type {User} from "../../auth.ts";

import {isUserLoggedIn} from "./actionUtils/userAuth.ts";
import {isIso6391} from "../lib_frontend/iso-639-1.ts";

import {
    hasAddProjectFeedbackPermission,
    hasCreateProjectPermission,
    hasDeleteProjectsPermission,
    hasUploadOriginalFilePermission,
    hasViewMyProjectsPermission,
} from "../lib_backend/user_roles/userRoleManager.ts";

import {
    changeProjectState,
    createProject,
    deleteProjectById,
    getProjectById,
    getProjectsByCustomerId, getProjectsByCustomerIdAndState,
    setOriginalFilePrefix, setProjectFeedback,
} from "../db/data_access/project.ts";
import {deleteProjectBucketPrefix, projectBucketUploadFile} from "../lib_backend/objectStorage.ts";
import {allocateProject} from "../lib_backend/projectAllocator.ts";

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

            // 3) Verify that project exists, and that user is assigned to it as customer
            //#############################################################################
            const data = await getProjectById(projectId);
            const project = data?.project;

            if (!project) {
                throw new ActionError({code: "NOT_FOUND", message: "Project not found"});
            }

            if (project.customerId !== user.id) {
                throw new ActionError({
                    code: "FORBIDDEN",
                    message: "You aren't assigned to this project as customer"
                });
            }

            // 4) File can be uploaded only if the project is in "CREATED" state
            //#############################################################################
            if (project.state !== "CREATED") {
                throw new ActionError({
                    code: "BAD_REQUEST",
                    message: "File can be uploaded only if the project is in 'CREATED' state"
                });
            }

            // 5) Delete the current file if it exists
            //#############################################################################
            if (project.originalFilePrefix) {
                try {
                    await deleteProjectBucketPrefix(project.originalFilePrefix);
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

            // 7) The original file prefix should now point to this file
            //#############################################################################
            await setOriginalFilePrefix(projectId, prefix);

            // 8) Assign to translator
            //#############################################################################
            try {
                await allocateProject(project);
            } catch (e) {
                throw new ActionError({code: "INTERNAL_SERVER_ERROR", message: "Project allocation to translator failed"});
            }
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
                return await getProjectsByCustomerId(user.id);
            } catch (e) {
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Unable to fetch projects",
                });
            }
        }
    }),

    deleteMyProject: defineAction({
        input: z.object({
            projectId: z.string(),
        }),
        handler: async (input, context) => {
            const user: User = isUserLoggedIn(context);

            // 1) Verify delete permission
            //#############################################################################
            if (!await hasDeleteProjectsPermission(user)) {
                throw new ActionError({code: "UNAUTHORIZED"});
            }

            // 2) Verify project exists and belongs to this customer
            //#############################################################################
            const data = await getProjectById(input.projectId);
            const project = data?.project;

            if (!project) {
                throw new ActionError({
                    code: "NOT_FOUND",
                    message: "Project not found",
                });
            }

            if (project.customerId !== user.id) {
                throw new ActionError({
                    code: "FORBIDDEN",
                    message: "You don't own this project",
                });
            }

            // 3) Delete files from bucket
            //#############################################################################
            try {
                if (project.originalFilePrefix) {
                    await deleteProjectBucketPrefix(project.originalFilePrefix);
                }

                if (project.translatedFilePrefix) {
                    await deleteProjectBucketPrefix(project.translatedFilePrefix);
                }
            } catch (e) {
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Unable to delete files in project bucket",
                });
            }

            // 4) Delete project record from DB
            //#############################################################################
            try {
                await deleteProjectById(project.id, user.id);
            } catch (e) {
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Unable to delete project from DB",
                });
            }
        },
    }),

    getMyCompletedProjects: defineAction({
        input: z.object({}),
        handler: async (_, context) => {
            const user: User = isUserLoggedIn(context);

            if (!await hasViewMyProjectsPermission(user)) {
                throw new ActionError({
                    code: "UNAUTHORIZED",
                    message: "You don't have permission to view projects",
                });
            }

            try {
                return await getProjectsByCustomerIdAndState(user.id, "COMPLETED");
            } catch (e) {
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Unable to fetch assigned projects",
                });
            }
        },
    }),

    setProjectFeedback: defineAction({
        input: z.object({
            projectId: z.string(),
            text: z.string().min(1),
        }),
        handler: async (input, context) => {
            const user: User = isUserLoggedIn(context);

            if (!await hasAddProjectFeedbackPermission(user)) {
                throw new ActionError({code: "UNAUTHORIZED"});
            }

            // 1) Load project
            //#############################################################################
            const data = await getProjectById(input.projectId);
            const project = data?.project;

            if (!project) {
                throw new ActionError({
                    code: "NOT_FOUND",
                    message: "Project not found",
                });
            }

            // 2) Check if user owns this project
            //#############################################################################
            if (project.customerId !== user.id) {
                throw new ActionError({
                    code: "FORBIDDEN",
                    message: "You don't own this project",
                });
            }

            // 3) State check
            //#############################################################################
            if (project.state !== "COMPLETED") {
                throw new ActionError({
                    code: "BAD_REQUEST",
                    message: "Feedback can only be set for COMPLETED projects",
                });
            }

            // 4) Save user feedback
            //#############################################################################
            try {
                return await setProjectFeedback(input.projectId, input.text);
            } catch (e) {
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Unable to save feedback",
                });
            }
        },
    }),

    approveProject: defineAction({
        input: z.object({
            projectId: z.string(),
        }),
        handler: async (input, context) => {
            const user: User = isUserLoggedIn(context);

            if (!await hasViewMyProjectsPermission(user)) {
                throw new ActionError({code: "UNAUTHORIZED"});
            }

            // 1) Load project
            //#############################################################################
            const data = await getProjectById(input.projectId);
            const project = data?.project;

            if (!project) {
                throw new ActionError({
                    code: "NOT_FOUND",
                    message: "Project not found",
                });
            }

            // 2) Check if user owns this project
            //#############################################################################
            if (project.customerId !== user.id) {
                throw new ActionError({
                    code: "FORBIDDEN",
                    message: "You don't own this project",
                });
            }

            // 3) State validation
            //#############################################################################
            if (project.state !== "COMPLETED") {
                throw new ActionError({
                    code: "BAD_REQUEST",
                    message: "Only COMPLETED projects can be approved",
                });
            }

            // 4) Approve project
            //#############################################################################
            try {
                return await changeProjectState(project.id, "APPROVED");
            } catch {
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Unable to approve project",
                });
            }
        },
    }),

    rejectProject: defineAction({
        input: z.object({
            projectId: z.string(),
        }),
        handler: async (input, context) => {
            const user: User = isUserLoggedIn(context);

            if (!await hasViewMyProjectsPermission(user)) {
                throw new ActionError({code: "UNAUTHORIZED"});
            }

            // 1) Load project
            //#############################################################################
            const data = await getProjectById(input.projectId);
            const project = data?.project;

            if (!project) {
                throw new ActionError({
                    code: "NOT_FOUND",
                    message: "Project not found",
                });
            }

            // 2) Check if user owns this project
            //#############################################################################
            if (project.customerId !== user.id) {
                throw new ActionError({
                    code: "FORBIDDEN",
                    message: "You don't own this project",
                });
            }

            // 3) State validation
            //#############################################################################
            if (project.state !== "COMPLETED") {
                throw new ActionError({
                    code: "BAD_REQUEST",
                    message: "Only COMPLETED projects can be rejected",
                });
            }

            // 4) Reject moves it back to "ASSIGNED"
            //#############################################################################
            try {
                return await changeProjectState(project.id, "ASSIGNED");
            } catch {
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Unable to reject project",
                });
            }
        },
    }),

};
