export interface UserDTO {
    id: string;
    name: string;
    email: string;
    role: string | null;
    updatedAt: Date | null;
}
