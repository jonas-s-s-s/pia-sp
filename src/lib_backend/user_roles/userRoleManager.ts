import {roleNames} from "./permissions.ts";
import {auth, type User} from "../../../auth.ts";
import {setUserRoleById} from "../../db/data_access/user.ts";

export async function setUserRole(user: User, role: string) {
    if (!(roleNames.includes(role)))
        throw new Error("Invalid role");

    await setUserRoleById(user.id, role)
}