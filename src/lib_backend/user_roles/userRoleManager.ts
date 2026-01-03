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