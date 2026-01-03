import {pgEnum} from "drizzle-orm/pg-core";
import {pgTable, text, timestamp, index,} from "drizzle-orm/pg-core";
import {user} from "./auth-schema";

export const projectStateEnum = pgEnum("project_state", [
    "CREATED",
    "ASSIGNED",
    "COMPLETED",
    "APPROVED",
    "CLOSED",
]);


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
         * S3 prefix
         */
        storagePrefix: text("storage_prefix").notNull(),

        state: projectStateEnum("state")
            .default("CREATED")
            .notNull(),

        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        index("project_customer_idx").on(table.customerId),
        index("project_translator_idx").on(table.translatorId),
        index("project_state_idx").on(table.state),
    ],
);