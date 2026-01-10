import type {ProjectDTO} from "./ProjectDTO.ts";

export function toProjectDTO(
    row: any
): ProjectDTO {
    return {
        id: String(row.id),
        languageCode: row.languageCode,
        state: row.state,
        createdAt: row.createdAt,

        customer: {
            id: row.customerId ? String(row.customerId) : null,
            name:  row.customerName ?? null,
        },

        translator: {
            id: row.translatorId ? String(row.translatorId) : null,
            name: row.translatorName ?? null,
        },

        files: {
            originalPrefix: row.originalFilePrefix,
            translatedPrefix: row.translatedFilePrefix,
        },

        feedback: row.feedbackText ? {
            text: row.feedbackText,
            createdAt: row.feedbackCreatedAt,
        } : null
    };
}