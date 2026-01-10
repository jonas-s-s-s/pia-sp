import type {APIRoute} from "astro";
import {getProjectById, changeProjectState} from "../../../../db/data_access/project";
import {projectState} from "../../../../db/schema/project-schema";
import {toProjectDTO} from "../../../../dto/project/ProjectMapper";
import {hasAdminMarkAsClosedPermission} from "../../../../lib_backend/user_roles/permissionChecking.ts";


export const POST: APIRoute = async ({params, locals}) => {
    const user = locals.user;
    if (!user || !await hasAdminMarkAsClosedPermission(user)) {
        return new Response(null, {status: 401});
    }

    const project = await getProjectById(params.projectId!);
    if (!project) {
        return new Response(null, {status: 404});
    }

    if (project.state !== projectState.APPROVED) {
        return new Response("Only APPROVED projects can be closed.", {status: 400});
    }

    const updated = await changeProjectState(project.id, projectState.CLOSED);
    return new Response(JSON.stringify(toProjectDTO(updated)));
};
