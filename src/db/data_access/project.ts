import {db} from "../orm";
import {and, eq, ne} from "drizzle-orm";
import {project, projectStateEnum} from "../schema/project-schema";
import {user} from "../schema/auth-schema.ts";
import {feedback} from "../schema/feedback-schema";
import {alias} from "drizzle-orm/pg-core";

export async function getProjectById(projectId: string) {
    const result = await db
        .select({
            project,
            feedback: {
                text: feedback.text,
                createdAt: feedback.createdAt,
            },
        })
        .from(project)
        .leftJoin(feedback, eq(feedback.projectId, project.id))
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

export async function getProjectsByTranslatorId(translatorId: string) {
    // TODO: In a real project this would use some kind of pagination

    const results = await db
        .select({
            projectId: project.id,
            languageCode: project.languageCode,
            originalFilePrefix: project.originalFilePrefix,
            translatedFilePrefix: project.translatedFilePrefix,
            state: project.state,
            createdAt: project.createdAt,
            customerId: user.id,
            customerName: user.name,
            feedbackText: feedback.text,
            feedbackCreatedAt: feedback.createdAt,
        })
        .from(project)
        .leftJoin(user, eq(project.customerId, user.id))
        .leftJoin(feedback, eq(feedback.projectId, project.id))
        .where(eq(project.translatorId, translatorId));

    return results;
}

export async function getProjectsByTranslatorIdAndState(
    translatorId: string,
    state: ProjectState,
) {
    // TODO: In a real project this would use some kind of pagination

    const results = await db
        .select({
            projectId: project.id,
            languageCode: project.languageCode,
            originalFilePrefix: project.originalFilePrefix,
            translatedFilePrefix: project.translatedFilePrefix,
            state: project.state,
            createdAt: project.createdAt,
            customerId: user.id,
            customerName: user.name,
            feedbackText: feedback.text,
            feedbackCreatedAt: feedback.createdAt,
        })
        .from(project)
        .leftJoin(user, eq(project.customerId, user.id))
        .leftJoin(feedback, eq(feedback.projectId, project.id))
        .where(
            and(
                eq(project.translatorId, translatorId),
                eq(project.state, state),
            ),
        );

    return results;
}

export async function getProjectsByTranslatorIdNonAssigned(
    translatorId: string,
) {
    // TODO: In a real project this would use some kind of pagination

    const results = await db
        .select({
            projectId: project.id,
            languageCode: project.languageCode,
            originalFilePrefix: project.originalFilePrefix,
            translatedFilePrefix: project.translatedFilePrefix,
            state: project.state,
            createdAt: project.createdAt,
            customerId: user.id,
            customerName: user.name,
            feedbackText: feedback.text,
            feedbackCreatedAt: feedback.createdAt,
        })
        .from(project)
        .leftJoin(user, eq(project.customerId, user.id))
        .leftJoin(feedback, eq(feedback.projectId, project.id))
        .where(
            and(
                eq(project.translatorId, translatorId),
                ne(project.state, "ASSIGNED"),
            ),
        );

    return results;
}

export async function createProject(params: {
    customerId: string;
    languageCode: string;
    translatorId?: string | null;
    originalFilePrefix?: string | null;
    translatedFilePrefix?: string | null;
}) {
    const id = crypto.randomUUID();

    const result = await db
        .insert(project)
        .values({
            id,
            customerId: params.customerId,
            languageCode: params.languageCode,
            translatorId: params.translatorId ?? null,
            originalFilePrefix: params.originalFilePrefix ?? null,
            translatedFilePrefix: params.translatedFilePrefix ?? null,
        })
        .returning();

    if (!result[0]) {
        throw new Error("Project could not be created.");
    }

    return result[0];
}

export async function getProjectsByCustomerId(customerId: string) {
    const translator = alias(user, "translator");

    const results = await db
        .select({
            projectId: project.id,
            languageCode: project.languageCode,
            originalFilePrefix: project.originalFilePrefix,
            translatedFilePrefix: project.translatedFilePrefix,
            state: project.state,
            createdAt: project.createdAt,

            customerId: project.customerId,
            customerName: user.name,

            translatorId: project.translatorId,
            translatorName: translator.name,

            feedbackText: feedback.text,
            feedbackCreatedAt: feedback.createdAt,
        })
        .from(project)

        .leftJoin(user, eq(project.customerId, user.id))

        .leftJoin(translator, eq(project.translatorId, translator.id))

        .leftJoin(feedback, eq(feedback.projectId, project.id))
        .where(eq(project.customerId, customerId));

    return results;
}

export async function deleteProjectById(
    projectId: string,
    customerId?: string,
) {
    const whereClause = customerId
        ? and(
            eq(project.id, projectId),
            eq(project.customerId, customerId),
        )
        : eq(project.id, projectId);

    const result = await db
        .delete(project)
        .where(whereClause)
        .returning({id: project.id});

    if (!result[0]) {
        throw new Error("Project not found or not owned by customer.");
    }

    return result[0];
}

export async function getProjectsByCustomerIdAndState(
    customerId: string,
    state: ProjectState,
) {
    const translator = alias(user, "translator");

    const results = await db
        .select({
            projectId: project.id,
            languageCode: project.languageCode,
            originalFilePrefix: project.originalFilePrefix,
            translatedFilePrefix: project.translatedFilePrefix,
            state: project.state,
            createdAt: project.createdAt,

            customerId: project.customerId,
            customerName: user.name,

            translatorId: project.translatorId,
            translatorName: translator.name,

            feedbackText: feedback.text,
            feedbackCreatedAt: feedback.createdAt,
        })
        .from(project)
        .leftJoin(user, eq(project.customerId, user.id))
        .leftJoin(translator, eq(project.translatorId, translator.id))
        .leftJoin(feedback, eq(feedback.projectId, project.id))
        .where(
            and(
                eq(project.customerId, customerId),
                eq(project.state, state),
            ),
        );

    return results;
}

export async function setProjectFeedback(
    projectId: string,
    text: string,
) {
    const result = await db
        .insert(feedback)
        .values({
            projectId,
            text,
        })
        .onConflictDoUpdate({
            target: feedback.projectId,
            set: {
                text,
                createdAt: new Date(),
            },
        })
        .returning({
            projectId: feedback.projectId,
            text: feedback.text,
            createdAt: feedback.createdAt,
        });

    if (!result[0]) {
        throw new Error("Unable to set feedback.");
    }

    return result[0];
}
