import {userRoles} from "./permissions.ts";
import {type User} from "../../../auth.ts";
import {setUserRoleById} from "../../db/data_access/user.ts";

export async function setUserRole(user: User, role: string) {
    if (!(userRoles.includes(role)))
        throw new Error("Invalid role");

    await setUserRoleById(user.id, role)
}