import type {APIRoute} from "astro";
import {isIso6391} from "../../../lib_frontend/iso-639-1";
import {
    createProject, getAllProjectsByState,
    getAllProjectsWithFeedback, getProjectsByCustomerId,
    getProjectsByTranslatorId,
} from "../../../db/data_access/project";
import {toProjectDTO} from "../../../dto/project/ProjectMapper";
import {projectState} from "../../../db/schema/project-schema";
import {
    hasCreateProjectPermission,
    hasViewMyProjectsPermission,
} from "../../../lib_backend/user_roles/permissionChecking";

/**
 * Create a project
 */
export const POST: APIRoute = async ({request, locals}) => {
    //# Get user + check permissions
    //#####################################
    const user = locals.user;
    if (!user || !await hasCreateProjectPermission(user)) {
        return new Response(null, {status: 401});
    }

    //# Get data from JSON
    //#####################################
    const body = await request.json();
    const {languageCode} = body;
    if (!isIso6391(languageCode)) {
        return new Response("Invalid language code", {status: 400});
    }

    //# Create project
    //#####################################
    const project = await createProject({
        customerId: user.id,
        languageCode,
    });

    return new Response(
        JSON.stringify(toProjectDTO(project)),
        {status: 201}
    );
};

/**
 * Get projects
 */
export const GET: APIRoute = async ({request, locals}) => {
    //# Get user + check permissions
    //#####################################
    const user = locals.user;
    if (!user || !await hasViewMyProjectsPermission(user)) {
        return new Response(null, {status: 401});
    }

    //# Get possible URL parameters
    //#####################################
    const url = new URL(request.url);
    const state = url.searchParams.get("state") as projectState | null;
    let projects;


    if (user.role === "Administrator") {
        // Admin can either filter the projects by their state or get all
        projects = state ? await getAllProjectsByState(state) : await getAllProjectsWithFeedback();
    } else if (user.role === "Translator") {
        // Translator can only get projects assigned to him
        projects = await getProjectsByTranslatorId(user.id);
    } else if (user.role === "Customer") {
        // Customer can get projects he owns
        projects = await getProjectsByCustomerId(user.id);
    } else {
        return new Response(null, {status: 401});
    }

    return new Response(
        JSON.stringify(projects.map(toProjectDTO)),
        {status: 200}
    );
};
