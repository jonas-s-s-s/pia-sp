// mapper/user.mapper.ts
import type { UserDTO } from "./UserDTO.ts";
import type {userRow} from "../../src/db/schema/auth-schema.ts";

export function toUserDTO(row: userRow): UserDTO {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role ?? null,
        updatedAt: row.updatedAt ?? null
    };
}
