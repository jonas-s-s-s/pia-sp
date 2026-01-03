import {ac, Administrator, Customer, Translator} from "./src/lib_backend/user_roles/permissions.ts";

import {betterAuth, type GenericEndpointContext} from "better-auth";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {db} from "./src/db/orm.ts";
import {admin as adminPlugin} from "better-auth/plugins";
import {user, session, account, verification} from "./src/db/schema/auth-schema.ts";


// TODO: Sending email?
// import {sendVerificationEmail, sendChangeEmailVerification, sendPasswordResetEmail} from "./email.ts";

async function beforeUserDelete(user: User) {
    // "Clean up" BEFORE a user account is deleted
}

async function afterUserDelete(deletedUser: User) {
    // "Clean up" AFTER a user account is deleted
}

const auth = betterAuth({
    secret: import.meta.env.BETTER_AUTH_SECRET,
    trustedOrigins: [import.meta.env.BASE_WEBSITE_URL, "http://localhost:80", "http://localhost:4321", "http://localhost",],
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema: {
            user,
            session,
            account,
            verification,
        },
    }),
    emailAndPassword: {
        enabled: true,
        // requireEmailVerification: true,
        // sendResetPassword: async ({user, url, token}, request) => {
        //     await sendPasswordResetEmail(user.email, url);
        // },
    },
    // emailVerification: {
    //     sendOnSignUp: true,
    //     autoSignInAfterVerification: true,
    //     sendVerificationEmail: async ({user, url, token}, request) => {
    //         await sendVerificationEmail(user.email, url)
    //     }
    // },
    user: {
        deleteUser: {

            enabled: true,
            beforeDelete: async (user: any) => {
                await beforeUserDelete(user);
            },
            afterDelete: async (deletedUser: any) => {
                await afterUserDelete(deletedUser);
            }
        },
        // changeEmail: {
        //     enabled: true,
        //     sendChangeEmailVerification: async ({user, newEmail, url, token}) => {
        //         await sendChangeEmailVerification(user.email, newEmail, url);
        //     }
        // },
    },
    rateLimit: {
        enabled: false, // TODO: Enable in production
        window: 10, // Time window to use for rate limiting. The value should be in seconds.
        max: 25, // The default maximum number of requests allowed within the window.
    },
    databaseHooks: {
        user: {
            create: {
                // This function is called AFTER a user account has been created
                after: async (user: any, context?: GenericEndpointContext | null) => {

                }
            }
        }
    },
    plugins: [
        adminPlugin(
            {
                ac,
                roles: {
                    Customer,
                    Translator,
                    Administrator,
                },
                defaultRole: "Customer",
                //adminUserIds: [""], // TODO: Set default admin?
                defaultBanReason: "Ban reason not specified.",
                defaultBanExpiresIn: 60 * 60 * 24, // 1 day,
                bannedUserMessage: "You have been banned.", // The message to show when a banned user tries to sign in
            }
        )
    ],
    socialProviders: {
        github: {
            clientId: import.meta.env.GITHUB_CLIENT_ID as string,
            clientSecret: import.meta.env.GITHUB_CLIENT_SECRET as string,
        },
    },
});


type User = (typeof auth.$Infer)["Session"]["user"];
type Session = (typeof auth.$Infer)["Session"]["session"];
export {auth, type User, type Session};