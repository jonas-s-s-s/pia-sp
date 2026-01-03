import {createAccessControl} from "better-auth/plugins/access";

// Below we can specify permission types
export const statement = {
    customerData: ["view"], // example resource
    myLanguages: ["update", "view"],
} as const;

export const ac = createAccessControl(statement);

// There are two roles: 1) Customer and 2) Translator
// The permissions of each are specified in the newRole arguments below

export const Customer = ac.newRole({
    customerData: ["view"],
});

export const Translator = ac.newRole({
    myLanguages: ["update", "view"],
});

// We also define role names as strings, so we can access them in our other backend code
export const roleNames = ["Customer", "Translator"];

