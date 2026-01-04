import {vi} from "vitest";

//###################################################################
//# Mocks for DB data access functions
//###################################################################

vi.mock("../src/db/data_access/project.ts", () => ({
    assignTranslatorToProject: vi.fn(async (projectId: string, translatorId: string) => ({
        id: projectId,
        translatorId,
    })),
    changeProjectState: vi.fn(async (projectId: string, newState: string) => ({
        id: projectId,
        state: newState,
    })),
}));

vi.mock("../src/db/data_access/translator.ts", () => ({
    getRandomTranslatorByLanguage: vi.fn(async (languageCode: string) => ({
        id: "t-id",
        name: "A B",
        email: "translator@example.com",
    })),
}));

vi.mock("../src/db/data_access/user.ts", () => ({
    getUserById: vi.fn(async (userId: string) => ({
        id: userId,
        email: "user@example.com",
    })),
    setUserRoleById: vi.fn(async () => {
    }),
}));

//###################################################################
//# Mocks for email functions
//###################################################################

vi.mock("../src/lib_backend/email.ts", () => ({
    sendProjectAssigned: vi.fn(async (_email: string, _projectId: string) => {
    }),
    sendFailedToAssignProject: vi.fn(async (_email: string, _projectId: string) => {
    }),
}));