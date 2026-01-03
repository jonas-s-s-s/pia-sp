import {roleNames} from "./permissions.ts";
import {auth, type User} from "../../../auth.ts";
import {setUserRoleById} from "../../db/data_access/user.ts";

export async function setUserRole(user: User, role: string) {
    if (!(roleNames.includes(role)))
        throw new Error("Invalid role");

    await setUserRoleById(user.id, role)
}

//##################################
//# PERMISSION CHECKS
//##################################

export async function hasUpdateMyLanguagesPermission(user: User) {
    const result = await auth.api.userHasPermission({
        body: {
            userId: user.id,
            permissions: {
                myLanguages: ["update"],
            },
        },
    });

    return result.success;
}

export async function hasViewMyLanguagesPermission(user: User) {
    const result = await auth.api.userHasPermission({
        body: {
            userId: user.id,
            permissions: {
                myLanguages: ["view"],
            },
        },
    });

    return result.success;
}

export async function hasUploadTranslatedFilePermission(user: User) {
    const result = await auth.api.userHasPermission({
        body: {
            userId: user.id,
            permissions: {
                upload: ["translated_file"],
            },
        },
    });

    return result.success;
}

export async function hasViewAssignedProjectsPermission(user: User) {
    const result = await auth.api.userHasPermission({
        body: {
            userId: user.id,
            permissions: {
                project: ["view_assigned_projects"],
            },
        },
    });

    return result.success;
}

export async function hasDownloadTranslatedFilePermission(user: User) {
    const result = await auth.api.userHasPermission({
        body: {
            userId: user.id,
            permissions: {
                download: ["translated_file"],
            },
        },
    });

    return result.success;
}

export async function hasDownloadOriginalFilePermission(user: User) {
    const result = await auth.api.userHasPermission({
        body: {
            userId: user.id,
            permissions: {
                download: ["original_file"],
            },
        },
    });

    return result.success;
}

export async function hasCreateProjectPermission(user: User) {
    const result = await auth.api.userHasPermission({
        body: {
            userId: user.id,
            permissions: {
                project: ["create"],
            },
        },
    });

    return result.success;
}

export async function hasUploadOriginalFilePermission(user: User) {
    const result = await auth.api.userHasPermission({
        body: {
            userId: user.id,
            permissions: {
                upload: ["original_file"],
            },
        },
    });

    return result.success;
}


export async function hasViewMyProjectsPermission(user: User) {
    const result = await auth.api.userHasPermission({
        body: {
            userId: user.id,
            permissions: {
                project: ["view_my_projects"],
            },
        },
    });

    return result.success;
}

export async function hasDeleteProjectsPermission(user: User) {
    const result = await auth.api.userHasPermission({
        body: {
            userId: user.id,
            permissions: {
                project: ["delete"],
            },
        },
    });

    return result.success;
}

export async function hasAddProjectFeedbackPermission(user: User) {
    const result = await auth.api.userHasPermission({
        body: {
            userId: user.id,
            permissions: {
                project: ["add_feedback"],
            },
        },
    });

    return result.success;
}