import {pgEnum} from "drizzle-orm/pg-core";
import {pgTable, text, timestamp, index,} from "drizzle-orm/pg-core";
import {user} from "./auth-schema";
import {enumToPgEnum} from "../dbUtils.ts";

export enum projectState {
    CREATED = 'CREATED',
    ASSIGNED = 'ASSIGNED',
    COMPLETED = 'COMPLETED',
    APPROVED = 'APPROVED',
    CLOSED = 'CLOSED',
}

export const projectStatePgEnum = pgEnum("project_state", enumToPgEnum(projectState));

export const project = pgTable(
    "project",
    {
        id: text("id").primaryKey(),

        customerId: text("customer_id")
            .notNull()
            .references(() => user.id, {onDelete: "cascade"}),

        translatorId: text("translator_id")
            .references(() => user.id, {onDelete: "set null"}),

        languageCode: text("language_code").notNull(),

        /**
         * The file path inside an S3 bucket is called "prefix"
         */
        originalFilePrefix: text("original_file_prefix"),

        translatedFilePrefix: text("translated_file_prefix"),

        state: projectStatePgEnum("state")
            .default(projectState.CREATED)
            .notNull(),

        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        index("project_customer_idx").on(table.customerId),
        index("project_translator_idx").on(table.translatorId),
        index("project_state_idx").on(table.state),
    ],
);

export type projectRow = typeof project.$inferSelect;