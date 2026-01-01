import { defineConfig } from "drizzle-kit";

import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

const env = dotenv.config({
    path: ".env.development",
});
// This is needed because the dotenv library doesn't support ${} variables by default
dotenvExpand.expand(env);

export default defineConfig({
    dialect: 'postgresql', // 'mysql' | 'sqlite' | 'turso'
    schema: './src/db/schema',
    out: "./drizzle",
    dbCredentials: {
        url: process.env.DATABASE_URL ||  "",
    },
})