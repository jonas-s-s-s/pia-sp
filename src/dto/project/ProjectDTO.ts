export interface ProjectDTO {
    id: string;
    languageCode: string;
    state: string;
    createdAt: Date;

    customer: {
        id: string | null;
        name: string | null;
    };

    translator: {
        id: string | null;
        name: string | null;
    };

    files: {
        originalPrefix: string | null;
        translatedPrefix: string | null;
    };

    feedback: {
        text: string;
        createdAt: Date;
    } | null;
}