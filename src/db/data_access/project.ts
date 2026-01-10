import {db} from "../orm";
import {and, eq, ne} from "drizzle-orm";
import {project, projectState} from "../schema/project-schema";
import {user} from "../schema/auth-schema";
import {feedback} from "../schema/feedback-schema";
import {alias} from "drizzle-orm/pg-core";
import crypto from "crypto";


//##################################################################
/// Shared select (same field names for all queries) 
//##################################################################

function projectWithJoinsSelect(translatorAlias: ReturnType<typeof alias>) {
    return {
        id: project.id,
        languageCode: project.languageCode,
        originalFilePrefix: project.originalFilePrefix,
        translatedFilePrefix: project.translatedFilePrefix,
        state: project.state,
        createdAt: project.createdAt,

        customerId: project.customerId,
        customerName: user.name,

        translatorId: project.translatorId,
        translatorName: translatorAlias.name,

        feedbackText: feedback.text,
        feedbackCreatedAt: feedback.createdAt,
    };
}

//##################################################################
// Single project                                                   
//##################################################################

export async function getProjectById(projectId: string) {
    const translator = alias(user, "translator");

    const result = await db
        .select(projectWithJoinsSelect(translator))
        .from(project)
        .leftJoin(user, eq(project.customerId, user.id))
        .leftJoin(translator, eq(project.translatorId, translator.id))
        .leftJoin(feedback, eq(feedback.projectId, project.id))
        .where(eq(project.id, projectId))
        .limit(1);

    return result[0] ?? null;
}

//##################################################################
// Mutations
//##################################################################

export async function assignTranslatorToProject(
    projectId: string,
    translatorId: string,
) {
    const result = await db
        .update(project)
        .set({translatorId})
        .where(eq(project.id, projectId))
        .returning();

    if (!result[0]) {
        throw new Error("Project not found or translator not assigned.");
    }

    return result[0];
}

export async function setOriginalFilePrefix(
    projectId: string,
    prefix: string,
) {
    const result = await db
        .update(project)
        .set({originalFilePrefix: prefix})
        .where(eq(project.id, projectId))
        .returning();

    if (!result[0]) {
        throw new Error("Project not found or original file prefix not set.");
    }

    return result[0];
}

export async function setTranslatedFilePrefix(
    projectId: string,
    prefix: string,
) {
    const result = await db
        .update(project)
        .set({translatedFilePrefix: prefix})
        .where(eq(project.id, projectId))
        .returning();

    if (!result[0]) {
        throw new Error("Project not found or translated file prefix not set.");
    }

    return result[0];
}

export async function changeProjectState(
    projectId: string,
    newState: projectState,
) {
    const result = await db
        .update(project)
        .set({state: newState})
        .where(eq(project.id, projectId))
        .returning();

    if (!result[0]) {
        throw new Error("Project not found or state not updated.");
    }

    return result[0];
}

//##################################################################
// Creation                                                          
//##################################################################

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

//##################################################################
/// Queries by translator                                           
//##################################################################

export async function getProjectsByTranslatorId(translatorId: string) {
    const translator = alias(user, "translator");

    return db
        .select(projectWithJoinsSelect(translator))
        .from(project)
        .leftJoin(user, eq(project.customerId, user.id))
        .leftJoin(translator, eq(project.translatorId, translator.id))
        .leftJoin(feedback, eq(feedback.projectId, project.id))
        .where(eq(project.translatorId, translatorId));
}

export async function getProjectsByTranslatorIdAndState(
    translatorId: string,
    state: projectState,
) {
    const translator = alias(user, "translator");

    return db
        .select(projectWithJoinsSelect(translator))
        .from(project)
        .leftJoin(user, eq(project.customerId, user.id))
        .leftJoin(translator, eq(project.translatorId, translator.id))
        .leftJoin(feedback, eq(feedback.projectId, project.id))
        .where(
            and(
                eq(project.translatorId, translatorId),
                eq(project.state, state),
            ),
        );
}

export async function getProjectsByTranslatorIdNonAssigned(
    translatorId: string,
) {
    const translator = alias(user, "translator");

    return db
        .select(projectWithJoinsSelect(translator))
        .from(project)
        .leftJoin(user, eq(project.customerId, user.id))
        .leftJoin(translator, eq(project.translatorId, translator.id))
        .leftJoin(feedback, eq(feedback.projectId, project.id))
        .where(
            and(
                eq(project.translatorId, translatorId),
                ne(project.state, projectState.ASSIGNED),
            ),
        );
}

//##################################################################
// Queries by customer                                              
//##################################################################

export async function getProjectsByCustomerId(customerId: string) {
    const translator = alias(user, "translator");

    return db
        .select(projectWithJoinsSelect(translator))
        .from(project)
        .leftJoin(user, eq(project.customerId, user.id))
        .leftJoin(translator, eq(project.translatorId, translator.id))
        .leftJoin(feedback, eq(feedback.projectId, project.id))
        .where(eq(project.customerId, customerId));
}

export async function getProjectsByCustomerIdAndState(
    customerId: string,
    state: projectState,
) {
    const translator = alias(user, "translator");

    return db
        .select(projectWithJoinsSelect(translator))
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
}

//##################################################################
//# Feedback                                                         
//##################################################################

export async function setProjectFeedback(
    projectId: string,
    text: string,
) {
    const result = await db
        .insert(feedback)
        .values({projectId, text})
        .onConflictDoUpdate({
            target: feedback.projectId,
            set: {
                text,
                createdAt: new Date(),
            },
        })
        .returning();

    if (!result[0]) {
        throw new Error("Unable to set feedback.");
    }

    return result[0];
}

//##################################################################
//# Admin / global queries                                             
//##################################################################

export async function getAllProjectsWithFeedback() {
    const translator = alias(user, "translator");

    return db
        .select(projectWithJoinsSelect(translator))
        .from(project)
        .innerJoin(feedback, eq(feedback.projectId, project.id))
        .leftJoin(user, eq(project.customerId, user.id))
        .leftJoin(translator, eq(project.translatorId, translator.id));
}

export async function getAllProjectsByState(state: projectState) {
    const translator = alias(user, "translator");

    return db
        .select(projectWithJoinsSelect(translator))
        .from(project)
        .leftJoin(user, eq(project.customerId, user.id))
        .leftJoin(translator, eq(project.translatorId, translator.id))
        .leftJoin(feedback, eq(feedback.projectId, project.id))
        .where(eq(project.state, state));
}

export async function getAllProjectsWithFeedbackByState(
    state: projectState,
) {
    const translator = alias(user, "translator");

    return db
        .select(projectWithJoinsSelect(translator))
        .from(project)
        .innerJoin(feedback, eq(feedback.projectId, project.id))
        .leftJoin(user, eq(project.customerId, user.id))
        .leftJoin(translator, eq(project.translatorId, translator.id))
        .where(eq(project.state, state));
}

//##################################################################
//# Delete
//##################################################################

export async function deleteProjectById(projectId: string, customerId?: string,) {
    const whereClause = customerId ? and(eq(project.id, projectId), eq(project.customerId, customerId),) : eq(project.id, projectId);

    const result = await db
        .delete(project)
        .where(whereClause)
        .returning();

    if (!result[0]) {
        throw new Error("Project not found or not owned by customer.");
    }
    return result[0];
}


//##################################################################
//# Types for DTOs
//##################################################################

export type ProjectWithFeedbackRow =
    Awaited<ReturnType<typeof getAllProjectsWithFeedback>>[number];