/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';
import { loadEnv } from 'vite';

export default getViteConfig({
    test: {
        include: ['test/**/*.test.ts'],
        environment: 'node',
        globals: true,
        setupFiles: ['./test/setup.ts'],
        restoreMocks: true,
        // We need to load env variables from .env.development to access DB in project.test.ts
        env: loadEnv("development", process.cwd(), '')
    },
});