import type {TranslatorLanguagesDTO} from "./TranslatorLanguagesDTO.ts";

export function toTranslatorLanguagesDTO(id: string, languages: string[]): TranslatorLanguagesDTO {
    return {
        translatorId: id,
        languageCodes: languages,
    };
}