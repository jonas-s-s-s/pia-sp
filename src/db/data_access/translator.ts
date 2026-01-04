import {db} from "../orm.ts";
import {eq, and, inArray, sql} from "drizzle-orm";
import {translatorLanguage} from "../schema/translator-language-schema.ts";
import {user} from "../schema/auth-schema.ts";

//###############################
//# Create / Delete
//###############################

export async function addTranslatorLanguage(
    translatorId: string,
    languageCode: string,
) {
    await db
        .insert(translatorLanguage)
        .values({translatorId, languageCode})
        .onConflictDoNothing();
}

export async function addTranslatorLanguages(
    translatorId: string,
    languageCodes: string[],
) {
    if (languageCodes.length === 0)
        return;

    await db
        .insert(translatorLanguage)
        .values(
            languageCodes.map(languageCode => ({
                translatorId,
                languageCode,
            })),
        )
        .onConflictDoNothing();
}

export async function removeTranslatorLanguage(
    translatorId: string,
    languageCode: string,
) {
    return db
        .delete(translatorLanguage)
        .where(
            and(
                eq(translatorLanguage.translatorId, translatorId),
                eq(translatorLanguage.languageCode, languageCode),
            ),
        );
}

export async function removeTranslatorLanguages(
    translatorId: string,
    languageCodes: string[],
) {
    if (languageCodes.length === 0) return;

    await db
        .delete(translatorLanguage)
        .where(
            and(
                eq(translatorLanguage.translatorId, translatorId),
                inArray(translatorLanguage.languageCode, languageCodes),
            ),
        );
}

//###############################
//# Query
//###############################

export async function getTranslatorLanguages(
    translatorId: string,
): Promise<string[]> {
    const result = await db
        .select({languageCode: translatorLanguage.languageCode})
        .from(translatorLanguage)
        .where(eq(translatorLanguage.translatorId, translatorId));

    return result.map(row => row.languageCode);
}

export async function translatorHasLanguage(
    translatorId: string,
    languageCode: string,
): Promise<boolean> {
    const result = await db
        .select({languageCode: translatorLanguage.languageCode})
        .from(translatorLanguage)
        .where(
            and(
                eq(translatorLanguage.translatorId, translatorId),
                eq(translatorLanguage.languageCode, languageCode),
            ),
        )
        .limit(1);

    return result.length > 0;
}


export async function getRandomTranslatorByLanguage(
    languageCode: string,
) {
    const result = await db
        .select({
            id: user.id,
            name: user.name,
            email: user.email,
        })
        .from(translatorLanguage)
        .innerJoin(user, eq(user.id, translatorLanguage.translatorId))
        .where(
            and(
                eq(translatorLanguage.languageCode, languageCode),
            ),
        )
        .orderBy(sql`random
        ()`)
        .limit(1);

    return result[0] ?? null;
}