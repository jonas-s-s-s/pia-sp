// @ts-check
import {defineConfig} from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// import {loadEnv} from "vite";
// const env = loadEnv(process.env.NODE_ENV || "", process.cwd(), "");

// https://astro.build/config
export default defineConfig({
    adapter: node({
        mode: 'standalone',
    }),

    integrations: [react()],
    output: 'server',

    vite: {
        plugins: [tailwindcss()]
    },

    i18n: {
        locales: ["en", "cz"],
        defaultLocale: "en",

        routing: {
            prefixDefaultLocale: true,
        },
    },
});