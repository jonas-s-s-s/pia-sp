import {ActionError, defineAction} from "astro:actions";
import {z} from "astro:schema";
import type {User} from "../../auth.ts";

import {isUserLoggedIn} from "./actionUtils/userAuth.ts";

import {
    changeProjectState,
    getAllProjectsByState,
    getAllProjectsWithFeedback,
    getAllProjectsWithFeedbackByState,
    getProjectById,
} from "../db/data_access/project.ts";

import {getUserById} from "../db/data_access/user.ts";
import {sendProjectFeedback} from "../lib_backend/email.ts";
import {
    hasAdminMarkAsClosedPermission,
    hasAdminReactToFeedbackPermission,
    hasAdminViewProjectsPermission
} from "../lib_backend/user_roles/permissionChecking.ts";
import {toProjectDTO} from "../../dto/project/ProjectMapper.ts";
import {projectState} from "../db/schema/project-schema.ts";

export const administrator = {
    getAllProjectsWithFeedback: defineAction({
        input: z.object({}),
        handler: async (_, context) => {
            const user: User = isUserLoggedIn(context);

            if (!await hasAdminViewProjectsPermission(user)) {
                throw new ActionError({code: "UNAUTHORIZED"});
            }

            try {
                const projects = await getAllProjectsWithFeedback()
                return projects.map(toProjectDTO);
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
            state: z.nativeEnum(projectState)
        }),
        handler: async (input, context) => {
            const user: User = isUserLoggedIn(context);

            if (!await hasAdminViewProjectsPermission(user)) {
                throw new ActionError({code: "UNAUTHORIZED"});
            }

            try {
                const projects = await getAllProjectsByState(input.state);
                return projects.map(toProjectDTO);
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
            const project = await getProjectById(input.projectId);

            if (!project) {
                throw new ActionError({
                    code: "NOT_FOUND",
                    message: "Project not found",
                });
            }

            // 3) Verify that project is in the "APPROVED" phase
            //#############################################################################

            if (project.state !== projectState.APPROVED) {
                throw new ActionError({
                    code: "BAD_REQUEST",
                    message: "Only APPROVED project can be closed",
                });
            }

            // 4) Close project
            //#############################################################################
            try {
                const changedProject = await changeProjectState(project.id, projectState.CLOSED);
                return toProjectDTO(changedProject);
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
            destinationUserID: z.string(),
            message: z.string()
        }),
        handler: async (input, context) => {
            const user: User = isUserLoggedIn(context);

            // 1) Permission check
            //#############################################################################
            if (!await hasAdminReactToFeedbackPermission(user)) {
                throw new ActionError({code: "UNAUTHORIZED"});
            }

            // 2) Get the destination user record so we can send mail to him
            //#############################################################################
            let destinationUser: User | undefined;
            try {
                destinationUser = await getUserById(input.destinationUserID);
            } catch (e) {
                throw new ActionError({code: "BAD_REQUEST", message: "Unable to retrieve destination user data"});
            }

            if (!destinationUser) {
                throw new ActionError({code: "BAD_REQUEST", message: "Unable to retrieve destination user data"});
            }

            const destinationEmail = destinationUser.email;

            if (!destinationEmail) {
                throw new ActionError({code: "BAD_REQUEST", message: "Destination user has no email"});
            }

            // 3) Send email
            //#############################################################################
            try {
                await sendProjectFeedback(user.email, destinationEmail, input.projectId, input.message);
            } catch (e) {
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Unable to send email to destination user"
                });
            }

        },
    }),

    getAllProjectsWithFeedbackByState: defineAction({
        input: z.object({
            state: z.nativeEnum(projectState)
        }),
        handler: async (input, context) => {
            const user: User = isUserLoggedIn(context);

            if (!await hasAdminViewProjectsPermission(user)) {
                throw new ActionError({code: "UNAUTHORIZED"});
            }

            try {
                const projects = await getAllProjectsWithFeedbackByState(input.state);
                return projects.map(toProjectDTO);
            } catch {
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Unable to fetch projects with feedback by state",
                });
            }
        },
    }),
};

