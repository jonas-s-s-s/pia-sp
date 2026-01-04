import {describe, it, expect, vi} from "vitest";
import {allocateProject} from "../../src/lib_backend/project/projectAllocator.ts";
import * as projectFile from "../../src/db/data_access/project.ts";
import * as translatorFile from "../../src/db/data_access/translator.ts";
import * as userFile from "../../src/db/data_access/user.ts";
import * as emailFile from "../../src/lib_backend/email.ts";
import type {Project} from "../../src/db/data_access/project.ts";

describe("allocateProject", () => {
    const project = {
        id: "p-id",
        customerId: "example-c-id",
        translatorId: null,
        languageCode: "cs",
        originalFilePrefix: "/prefix/o",
        translatedFilePrefix: null,
        state: "CREATED",
        createdAt: new Date(),
    } as Project;

    it("HAPPY PATH: translator is found, project is assigned to him", async () => {

        const result = await allocateProject(project);

        // The parameters are like this because getRandomTranslatorByLanguage is
        // mocked to return: {id: "t-d" name: "translator-n", email: "translator@example.com"}
        expect(projectFile.assignTranslatorToProject).toHaveBeenCalledWith(
            project.id,
            "t-id"
        );

        // changeProjectState is executed as the next line after assignTranslatorToProject
        expect(projectFile.changeProjectState).toHaveBeenCalledWith(
            project.id,
            "ASSIGNED"
        );

        // After the previous two calls, mocker translator's email is translator@example.com
        expect(emailFile.sendProjectAssigned).toHaveBeenCalledWith(
            "translator@example.com",
            project.id
        );

        // Not returning anything
        expect(result).toBeUndefined();
    });

    it("HAPPY PATH: no translator is found, close project", async () => {

        // This redefines the mock, making it return null,
        // because in this case we need for the translator to not be found
        (translatorFile.getRandomTranslatorByLanguage as any).mockResolvedValueOnce(
            null
        );

        await allocateProject(project);

        // This is because we need to first get the user's email before sending the mail
        expect(userFile.getUserById).toHaveBeenCalledWith(project.customerId);

        // Because getUserById is mocked to return "user@example.com"
        expect(emailFile.sendFailedToAssignProject).toHaveBeenCalledWith(
            "user@example.com",
            project.id
        );

        expect(projectFile.changeProjectState).toHaveBeenCalledWith(
            project.id,
            "CLOSED"
        );
    });

    it("NEGATIVE PATH: assignTranslatorToProject throws", async () => {

        // If assignTranslatorToProject throws, it causes the function to throw exception
        (projectFile.assignTranslatorToProject as any).mockRejectedValueOnce(
            new Error("")
        );

        await expect(allocateProject(project)).rejects.toThrow(
            "Failed to assign translator to project"
        );
    });

    it("NEGATIVE PATH: sendProjectAssigned throws", async () => {
        (emailFile.sendProjectAssigned as any).mockRejectedValueOnce(
            new Error("")
        );

        await expect(allocateProject(project)).rejects.toThrow(
            "Failed to send email to translator"
        );
    });

    it("NEGATIVE PATH: sendFailedToAssignProject throws", async () => {
        // We need to do this, because sendFailedToAssignProject is called only if translator is not found
        (translatorFile.getRandomTranslatorByLanguage as any).mockResolvedValueOnce(
            null
        );

        (emailFile.sendFailedToAssignProject as any).mockRejectedValueOnce(
            new Error("")
        );

        await expect(allocateProject(project)).rejects.toThrow(
            "Failed to send not found email to customer"
        );
    });

    it("NEGATIVE PATH: changeProjectState to CLOSED throws", async () => {
        // Again, only after not finding a translator
        (translatorFile.getRandomTranslatorByLanguage as any).mockResolvedValueOnce(
            null
        );

        (projectFile.changeProjectState as any).mockRejectedValueOnce(
            new Error("")
        );

        await expect(allocateProject(project)).rejects.toThrow(
            "Failed to change project state to CLOSED"
        );
    });
});
