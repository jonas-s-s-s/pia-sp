import {describe, it, expect} from 'vitest';
import {setUserRole} from "../../src/lib_backend/user_roles/userRoleManager.ts";
import type {User} from "../../auth.ts";

describe('setUserRole', () => {
    const mockUser = {id: '123'} as User;

    it('HAPPY PATH: set Customer role', async () => {
        await expect(
            setUserRole(mockUser, 'Customer')
        ).resolves.toBeUndefined();
    });

    it('HAPPY PATH: set translator role', async () => {
        await expect(
            setUserRole(mockUser, 'Translator')
        ).resolves.toBeUndefined();
    });

    it('NEGATIVE PATH: try to set Administrator role', async () => {
        await expect(
            setUserRole(mockUser, 'Administrator')
        ).rejects.toThrow();
    });

    it('NEGATIVE PATH: try to set invalid role name', async () => {
        await expect(
            setUserRole(mockUser, 'asdf')
        ).rejects.toThrow();
    });
});
