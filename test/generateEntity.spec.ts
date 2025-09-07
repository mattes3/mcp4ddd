import { describe, it, expect } from 'vitest';
import { z } from 'zod';

import { generateEntity } from '../src/generateEntity.js';

describe('Entity generator', () => {
    it('creates entity and test files', async () => {
        const params = {
            entityName: 'Order',
            aggregateRoot: true,
            fields: [
                { name: 'id', type: 'UUID', valueObject: false },
                { name: 'items', type: 'OrderItem[]', valueObject: true },
            ],
        };

        // Validate input with Zod (like MCP would do)
        const parsed = z.object(generateEntity.config.inputSchema).parse(params);

        // invoke the tool
        const resultAsText = await generateEntity.execute(parsed);

        // assert that it has generated text output
        expect(resultAsText.content[0].type).toEqual('text');
        expect(resultAsText.content[0].text.length).toBeGreaterThan(0);

        // Validate output with Zod (like MCP would do)
        const result = z
            .object(generateEntity.config.outputSchema)
            .parse(JSON.parse(resultAsText.content[0].text));

        // Assert that we should have usable data, now!

        expect(result.files).toHaveLength(2);
        expect(result.files[0].path).toMatch(/Order\.ts$/);
        expect(result.files[0].content).toContain('class Order');

        expect(result.files[1].path).toMatch(/Order\.spec\.ts$/);
        expect(result.files[1].content).toContain('// vitest test stub for Order');
    });
});
