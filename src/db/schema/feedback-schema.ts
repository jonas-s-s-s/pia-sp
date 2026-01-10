import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { project } from "./project-schema";
import {translatorLanguage} from "./translator-language-schema.ts";

export const feedback = pgTable("feedback", {
    projectId: text("project_id")
        .primaryKey()
        .references(() => project.id, { onDelete: "cascade" }),

    text: text("text").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type feedbackRow = typeof feedback.$inferSelect;