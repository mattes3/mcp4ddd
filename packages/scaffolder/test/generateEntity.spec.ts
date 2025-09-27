import { describe, it, before } from 'node:test';
import { expect } from 'expect';
import { z } from 'zod';

import { generateEntity } from '../src/generateEntity.js';

describe('Entity generator', () => {
    before(() => {
        // Ensure consistent test behavior by setting the default parent folder
        process.env['BOUNDED_CONTEXTS_PARENT_FOLDER'] = 'packages/domainlogic';
    });
    it('creates entity and test files', async () => {
        const params = {
            entityName: 'Order',
            aggregateRoot: true,
            attributes: [{ name: 'items', type: 'OrderItem[]', valueObject: true }],
            methods: [{ name: 'close', parameters: [{ name: 'absolute', type: 'boolean' }] }],
            boundedContext: 'stocks',
            layer: 'domain',
        };

        // Validate input with Zod (like MCP would do)
        const parsed = z.object(generateEntity.config.inputSchema).parse(params);

        // invoke the tool
        const resultAsText = await generateEntity.execute(parsed);

        // assert that it has generated text output
        expect(resultAsText.content[0]?.type).toEqual('text');
        expect(resultAsText.content[0]?.text.length).toBeGreaterThan(0);

        // Validate output with Zod (like MCP would do)
        const result = z
            .object(generateEntity.config.outputSchema)
            .parse(resultAsText.structuredContent);

        // Assert that we should have usable data, now!

        expect(result.files).toHaveLength(2);
        expect(result.files[0]?.path).toBe(
            'packages/domainlogic/stocks/domain/src/domainmodel/Order.ts',
        );
        expect(result.files[0]?.content).toContain('type Order =');

        expect(result.files[1]?.path).toBe('packages/domainlogic/stocks/domain/test/Order.spec.ts');
        expect(result.files[1]?.content).toContain('test the method close(absolute: boolean)');
    });
});
