import type {APIRoute} from "astro";
import {getProjectById, changeProjectState} from "../../../../db/data_access/project";
import {projectState} from "../../../../db/schema/project-schema";
import {toProjectDTO} from "../../../../dto/project/ProjectMapper";

export const POST: APIRoute = async ({params, locals}) => {
    const user = locals.user;
    if (!user) {
        return new Response(null, {status: 401});
    }

    const project = await getProjectById(params.projectId!);

    if (!project) {
        return new Response(null, {status: 404});
    }

    // User can only approve project if it belongs to him
    if (project.customerId !== user.id) {
        return new Response(null, {status: 403});
    }

    if (project.state !== projectState.COMPLETED) {
        return new Response("Only COMPLETED projects can be approved.", {status: 400});
    }

    const updated = await changeProjectState(project.id, projectState.APPROVED);
    return new Response(JSON.stringify(toProjectDTO(updated)));
};
