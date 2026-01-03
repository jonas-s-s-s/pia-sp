import {ActionError, defineAction} from "astro:actions";
import {z} from "astro:schema";
import type {User} from "../../auth.ts";

import {isUserLoggedIn} from "./actionUtils/userAuth.ts";

import {
    getAllProjectsWithFeedback,
    getAllProjectsByState, changeProjectState, getProjectById,
} from "../db/data_access/project.ts";

import {
    hasAdminViewProjectsPermission,
    hasAdminReactToFeedbackPermission,
    hasAdminMarkAsClosedPermission,
} from "../lib_backend/user_roles/userRoleManager.ts";

export const administrator = {
    getAllProjectsWithFeedback: defineAction({
        input: z.object({}),
        handler: async (_, context) => {
            const user: User = isUserLoggedIn(context);

            if (!await hasAdminViewProjectsPermission(user)) {
                throw new ActionError({code: "UNAUTHORIZED"});
            }

            try {
                return await getAllProjectsWithFeedback();
            } catch {
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Unable to fetch projects with feedback",
                });
            }
        },
    }),
    getAllProjectsByState: defineAction({
        input: z.object({
            state: z.enum([
                "CREATED",
                "ASSIGNED",
                "COMPLETED",
                "APPROVED",
                "CLOSED",
            ]),
        }),
        handler: async (input, context) => {
            const user: User = isUserLoggedIn(context);

            if (!await hasAdminViewProjectsPermission(user)) {
                throw new ActionError({code: "UNAUTHORIZED"});
            }

            try {
                return await getAllProjectsByState(input.state);
            } catch {
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Unable to fetch projects by state",
                });
            }
        },
    }),

    closeProject: defineAction({
        input: z.object({
            projectId: z.string(),
        }),
        handler: async (input, context) => {
            const user: User = isUserLoggedIn(context);

            // 1) Permission check
            //#############################################################################
            if (!await hasAdminMarkAsClosedPermission(user)) {
                throw new ActionError({code: "UNAUTHORIZED"});
            }

            // 2) Load project
            //#############################################################################
            const data = await getProjectById(input.projectId);
            const project = data?.project;

            if (!project) {
                throw new ActionError({
                    code: "NOT_FOUND",
                    message: "Project not found",
                });
            }

            // 3) Close project
            //#############################################################################
            try {
                return await changeProjectState(project.id, "CLOSED");
            } catch {
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Unable to close project",
                });
            }
        },
    }),

    reactToFeedback: defineAction({
        input: z.object({
            projectId: z.string(),
            destinationEmail: z.string(),
            message: z.string()
        }),
        handler: async (input, context) => {
            const user: User = isUserLoggedIn(context);

            // 1) Permission check
            //#############################################################################
            if (!await hasAdminReactToFeedbackPermission(user)) {
                throw new ActionError({code: "UNAUTHORIZED"});
            }

            // TODO: Send email
            console.log("ADMIN SEND EMAIL: " + input.destinationEmail + " " + input.message);
        },
    }),


};

