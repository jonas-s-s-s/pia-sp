import {createAccessControl} from "better-auth/plugins/access";

// Below we can specify permission types
export const statement = {
    myLanguages: ["update", "view"],
    upload: ["translated_file", "original_file"],
    project: ["view_assigned_projects", "create"],
    download: ["translated_file", "original_file"],
} as const;

export const ac = createAccessControl(statement);

// There are two roles: 1) Customer and 2) Translator
// The permissions of each are specified in the newRole arguments below

export const Customer = ac.newRole({
    download: ["translated_file"],
    project: ["create"],
    upload: ["original_file"]
});

export const Translator = ac.newRole({
    myLanguages: ["update", "view"],
    upload: ["translated_file"],
    project: ["view_assigned_projects"],
    download: ["translated_file"],
});

// We also define role names as strings, so we can access them in our other backend code
export const roleNames = ["Customer", "Translator"];

