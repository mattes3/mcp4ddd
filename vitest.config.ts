import { defineConfig } from 'vitest/config';
import { readFileSync } from 'node:fs';

export default defineConfig({
    test: {
        globals: true, // so you can use describe/it without imports
        environment: 'node', // default test environment
        include: ['test/**/*.spec.ts'], // look for test files
    },
    plugins: [
        {
            name: 'hbs-loader',
            enforce: 'pre',
            load(id) {
                if (id.endsWith('.hbs')) {
                    // Read the file contents as a string
                    const source = readFileSync(id, 'utf-8');
                    // Return a JS module exporting the string
                    return `export default ${JSON.stringify(source)};`;
                }
            },
        },
    ],
});
