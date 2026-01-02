import {createAuthClient} from "better-auth/client"
import {usernameClient, adminClient} from "better-auth/client/plugins"

export const authClient = createAuthClient({
    plugins: [
        adminClient()
    ]
})

interface AuthHandlers {
    onRequest?: (ctx: any) => void;
    onSuccess?: (ctx: any) => void;
    onError?: (ctx: any) => void;
}

export async function signUp(
    email: string,
    password: string,
    name: string,
    handlers: AuthHandlers = {}
) {
    const {data, error} = await authClient.signUp.email(
        {
            email,
            password,
            name: name,
        },
        {
            onRequest: handlers.onRequest,
            onSuccess: handlers.onSuccess,
            onError: handlers.onError,
        }
    );
    return {data, error};
}

export async function signInEmail(
    email: string,
    password: string,
    handlers: AuthHandlers = {}
) {
    const {data, error} = await authClient.signIn.email(
        {email, password},
        {
            onRequest: (ctx) => handlers.onRequest?.(ctx),
            onSuccess: (ctx) => handlers.onSuccess?.(ctx),
            onError: (ctx) => handlers.onError?.(ctx),
        }
    );

    return {data, error};
}

export async function signOut(handlers: AuthHandlers = {}) {
    try {
        handlers.onRequest?.(null);
        const {error} = await authClient.signOut();
        if (error) {
            handlers.onError?.({error});
            return {error};
        } else {
            handlers.onSuccess?.(null);
            return {};
        }
    } catch (err) {
        handlers.onError?.({error: err});
        return {error: err};
    }
}

export async function deleteUser(password: string, handlers: AuthHandlers = {}) {
    await authClient.deleteUser({password: password}, {
        onRequest: (ctx) => handlers.onRequest?.(ctx),
        onSuccess: (ctx) => handlers.onSuccess?.(ctx),
        onError: (ctx) => handlers.onError?.(ctx),
    });
}

export async function changePassword(
    currentPassword: string,
    newPassword: string,
    handlers: AuthHandlers = {}
) {
    const {data, error} = await authClient.changePassword(
        {currentPassword: currentPassword, newPassword: newPassword, revokeOtherSessions: true},
        {
            onRequest: ctx => handlers.onRequest?.(ctx),
            onSuccess: ctx => handlers.onSuccess?.(ctx),
            onError: ctx => handlers.onError?.(ctx),
        }
    );
    return {data, error};
}

export async function changeEmail(
    newEmail: string,
    handlers: AuthHandlers = {}
) {
    const {data, error} = await authClient.changeEmail(
        {newEmail: newEmail},
        {
            onRequest: ctx => handlers.onRequest?.(ctx),
            onSuccess: ctx => handlers.onSuccess?.(ctx),
            onError: ctx => handlers.onError?.(ctx),
        }
    );
    return {data, error};
}

export async function changeName(
    newName: string,
    handlers: AuthHandlers = {}
) {
    const {data, error} = await authClient.updateUser(
        {name: newName},
        {
            onRequest: ctx => handlers.onRequest?.(ctx),
            onSuccess: ctx => handlers.onSuccess?.(ctx),
            onError: ctx => handlers.onError?.(ctx),
        }
    );
    return {data, error};
}

export async function requestPasswordReset(
    email: string,
    redirectTo: string,
    handlers: AuthHandlers = {}
) {
    const {data, error} = await authClient.requestPasswordReset(
        {
            email,
            redirectTo,
        },
        {
            onRequest: handlers.onRequest,
            onSuccess: handlers.onSuccess,
            onError: handlers.onError,
        }
    );
    return {data, error};
}


export async function resetPassword(
    token: string,
    newPassword: string,
    handlers: AuthHandlers = {}
) {
    const {data, error} = await authClient.resetPassword(
        {token, newPassword},
        {
            onRequest: ctx => handlers.onRequest?.(ctx),
            onSuccess: ctx => handlers.onSuccess?.(ctx),
            onError: ctx => handlers.onError?.(ctx),
        }
    );
    return {data, error};
}

export async function signInGithub(handlers: AuthHandlers = {}) {
    const {data, error} = await authClient.signIn.social({
            provider: "github"
        },
        {
            onRequest: ctx => handlers.onRequest?.(ctx),
            onSuccess: ctx => handlers.onSuccess?.(ctx),
            onError: ctx => handlers.onError?.(ctx),
        }
    );
    return {data, error};
}