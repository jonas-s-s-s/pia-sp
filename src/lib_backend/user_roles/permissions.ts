import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

// Below we can specify permission types
export const statement = {
    ...defaultStatements,
    customerData: ["view", "update"], // example resource
    translations: ["create", "update", "delete", "approve"], // example resource
} as const;

export const ac = createAccessControl(statement);

// There are two roles: 1) Customer and 2) Translator
// The permissions of each are specified in the newRole arguments below

export const Customer = ac.newRole({
    customerData: ["view"],
});

export const Translator = ac.newRole({
    translations: ["create", "update"],
});
