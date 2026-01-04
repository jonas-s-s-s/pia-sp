import {assignTranslatorToProject, changeProjectState, type Project} from "../db/data_access/project.ts"
import {getRandomTranslatorByLanguage} from "../db/data_access/translator.ts";
import {sendFailedToAssignProject, sendProjectAssigned} from "./email.ts";
import {getUserById} from "../db/data_access/user.ts";

export async function allocateProject(project: Project) {
    const translator = await getRandomTranslatorByLanguage(project.languageCode);

    if (!translator) {
        // Could not find a translator for this language code
        await handleTranslatorNotFound(project);
        return;
    }

    try {
        await assignTranslatorToProject(project.id, translator.id)
        await changeProjectState(project.id, "ASSIGNED");
    } catch (e) {
        throw new Error("Failed to assign translator to project");
    }

    try {
        await sendProjectAssigned(translator.email, project.id)
    } catch (e) {
        // Could possibly put some different error type here so caller can differentiate
        throw new Error("Failed to send email to translator");
    }
}

async function handleTranslatorNotFound(project: Project) {

    try {
        const user = await getUserById(project.customerId);
        await sendFailedToAssignProject(user.email, project.id);
    } catch (e) {
        throw new Error("Failed to send not found email to customer");
    }

    try {
        await changeProjectState(project.id, "CLOSED");
    } catch (e) {
        throw new Error("Failed to change project state to CLOSED");
    }
}