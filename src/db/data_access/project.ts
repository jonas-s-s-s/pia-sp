import {db} from "../orm";
import {eq} from "drizzle-orm";
import {project, projectStateEnum} from "../schema/project-schema";

export async function getProjectById(projectId: string) {
    const result = await db
        .select()
        .from(project)
        .where(eq(project.id, projectId))
        .limit(1);

    return result.length > 0 ? result[0] : null;
}

export async function assignTranslatorToProject(projectId: string, translatorId: string | null) {
    const result = await db
        .update(project)
        .set({translatorId})
        .where(eq(project.id, projectId))
        .returning({id: project.id, translatorId: project.translatorId});

    if (!result[0])
        throw new Error("Project not found or translator not assigned.");
    return result[0];
}

export async function setOriginalFilePrefix(projectId: string, prefix: string) {
    const result = await db
        .update(project)
        .set({originalFilePrefix: prefix})
        .where(eq(project.id, projectId))
        .returning({id: project.id, originalFilePrefix: project.originalFilePrefix});

    if (!result[0])
        throw new Error("Project not found or original file prefix not set.");
    return result[0];
}

export async function setTranslatedFilePrefix(projectId: string, prefix: string) {
    const result = await db
        .update(project)
        .set({translatedFilePrefix: prefix})
        .where(eq(project.id, projectId))
        .returning({id: project.id, translatedFilePrefix: project.translatedFilePrefix});

    if (!result[0])
        throw new Error("Project not found or translated file prefix not set.");
    return result[0];
}

// TypeScript stuff that converts the projectStateEnum to a propper type
type ProjectState = (typeof projectStateEnum.enumValues)[number];

export async function changeProjectState(projectId: string, newState: ProjectState) {
    const result = await db
        .update(project)
        .set({state: newState})
        .where(eq(project.id, projectId))
        .returning({id: project.id, state: project.state});

    if (!result[0])
        throw new Error("Project not found or state not updated.");
    return result[0];
}