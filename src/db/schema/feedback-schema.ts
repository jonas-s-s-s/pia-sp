import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { project } from "./project-schema";

export const feedback = pgTable("feedback", {
    projectId: text("project_id")
        .primaryKey()
        .references(() => project.id, { onDelete: "cascade" }),

    text: text("text").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});