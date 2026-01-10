import type {APIRoute} from "astro";
import {getProjectById} from "../../../db/data_access/project";
import {toProjectDTO} from "../../../dto/project/ProjectMapper";

/**
 * Get project by ID
 */
export const GET: APIRoute = async ({params, locals}) => {
    const user = locals.user;
    if (!user) {
        return new Response(null, {status: 401});
    }

    const project = await getProjectById(params.projectId!);
    if (!project) {
        return new Response(null, {status: 404});
    }

    // User has to be either Admin, or one of the users assigned to the project
    const allowed =
        user.role === "ADMINISTRATOR" ||
        project.customerId === user.id ||
        project.translatorId === user.id;

    if (!allowed) {
        return new Response(null, {status: 403});
    }

    return new Response(
        JSON.stringify(toProjectDTO(project)),
        {status: 200}
    );
};
