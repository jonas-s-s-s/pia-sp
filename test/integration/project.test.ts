import {describe, it, expect, beforeEach, beforeAll, vi} from "vitest";
import {db} from "../../src/db/orm";

// These files need to be unmocked because mocks are set in setup.ts which runs before every test suite starts
vi.unmock("../../src/db/data_access/project.ts");
vi.unmock("../../src/db/data_access/user.ts");
vi.unmock("../../src/db/data_access/translator.ts");

import {project} from "../../src/db/schema/project-schema.ts";
import {user} from "../../src/db/schema/auth-schema.ts";
import {
    createProject,
    assignTranslatorToProject,
    changeProjectState,
    deleteProjectById,
    getProjectById,
} from "../../src/db/data_access/project.ts";
import {eq} from "drizzle-orm";


describe("Project storage integration tests", () => {
    // Random guids as the IDs
    const customerId = "5e136a96-b584-4347-919d-19cfecf2a857";
    const translatorId = "d8176585-8749-4f1d-b3eb-8aee63e7533a";

    beforeAll(async () => {
        // Before the test cases are executed we must create users
        await db.insert(user).values([
            {
                id: customerId,
                name: "test_customer",
                email: "customer@example.com",
            },
            {
                id: translatorId,
                name: "test_translator",
                email: "translator@example.com",
            },
        ]).onConflictDoNothing();
    });

    beforeEach(async () => {
        // Delete all rows in the project table before each test
        await db.delete(project);
    });

    it("HAPPY PATH: create project with default values", async () => {
        const created = await createProject({
            customerId,
            languageCode: "cs",
        });

        const result = await db
            .select()
            .from(project)
            .where(eq(project.id, created.id));

        expect(result).toHaveLength(1);
        expect(result[0].customerId).toBe(customerId);
        expect(result[0].languageCode).toBe("cs");
        expect(result[0].translatorId).toBeNull();
        expect(result[0].state).toBe("CREATED");
        expect(result[0].createdAt).toBeInstanceOf(Date);
    });

    it("HAPPY PATH: assign translator to a project", async () => {
        const created = await createProject({
            customerId,
            languageCode: "cs",
        });
        await assignTranslatorToProject(created.id, translatorId);

        const stored = await getProjectById(created.id);
        expect(stored?.project.translatorId).toBe(translatorId);
    });

    it("HAPPY PATH: change project state", async () => {
        const created = await createProject({
            customerId,
            languageCode: "cs",
        });
        await changeProjectState(created.id, "ASSIGNED");

        const stored = await getProjectById(created.id);
        expect(stored?.project.state).toBe("ASSIGNED");
    });

    it("HAPPY PATH: delete project", async () => {
        const created = await createProject({
            customerId,
            languageCode: "cs",
        });
        await deleteProjectById(created.id);

        const stored = await getProjectById(created.id);
        expect(stored).toBeNull();
    });

    it("NEGATIVE PATH: integrity error, creating project with invalid user ID", async () => {
        await expect(
            createProject({
                customerId: "invalid-id",
                languageCode: "cs",
            })
        ).rejects.toThrow();
    });
});
