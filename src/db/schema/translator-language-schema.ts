import {pgTable, text, uniqueIndex} from "drizzle-orm/pg-core";
import {user} from "./auth-schema";

export const translatorLanguage = pgTable(
    "translator_language",
    {
        translatorId: text("translator_id")
            .notNull()
            .references(() => user.id, {onDelete: "cascade"}),

        languageCode: text("language_code")
            .notNull(),
    },
    (table) => [
        uniqueIndex("translator_language_unique_idx").on(
            table.translatorId,
            table.languageCode,
        ),
    ],
);