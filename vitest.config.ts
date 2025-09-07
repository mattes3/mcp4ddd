import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true, // so you can use describe/it without imports
        environment: 'node', // default test environment
        include: ['test/**/*.spec.ts'], // look for test files
    },
});
