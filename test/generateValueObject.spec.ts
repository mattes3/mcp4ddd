import { describe, it } from 'node:test';
import { expect } from 'expect';
import { z } from 'zod';

import { generateValueObject } from '../src/generateValueObject.js';

describe('value object generator', () => {
    it('creates value object and test files', async () => {
        const params = {
            valueObjectName: 'Address',
            aggregateRoot: true,
            attributes: [
                { name: 'street', type: 'string', valueObject: false },
                { name: 'houseNumber', type: 'string', valueObject: false },
                { name: 'city', type: 'string', valueObject: false },
                { name: 'zipCode', type: 'string', valueObject: false },
            ],
            methods: [{ name: 'validate', parameters: [{ name: 'strictly', type: 'boolean' }] }],
        };

        // Validate input with Zod (like MCP would do)
        const parsed = z.object(generateValueObject.config.inputSchema).parse(params);

        // invoke the tool
        const resultAsText = await generateValueObject.execute(parsed);

        // assert that it has generated text output
        expect(resultAsText.content[0]?.type).toEqual('text');
        expect(resultAsText.content[0]?.text.length).toBeGreaterThan(0);

        // Validate output with Zod (like MCP would do)
        const result = z
            .object(generateValueObject.config.outputSchema)
            .parse(resultAsText.structuredContent);

        // Assert that we should have usable data, now!

        expect(result.files).toHaveLength(2);
        expect(result.files[0]?.path).toMatch(/Address\.ts$/);
        expect(result.files[0]?.content).toContain('type Address =');
        expect(result.files[0]?.content).toContain('houseNumber: string;');

        expect(result.files[1]?.path).toMatch(/Address\.spec\.ts$/);
        expect(result.files[1]?.content).toContain('test the method validate(strictly: boolean)');
    });
});
