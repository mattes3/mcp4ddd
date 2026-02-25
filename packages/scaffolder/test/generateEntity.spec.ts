import { expect } from 'expect';
import { describe, it } from 'node:test';
import { z } from 'zod';

import { generateEntity as ge } from '../src/generateEntity.js';
import { testScaffolderConfig } from './testScaffolderConfig.js';

describe('Entity generator', () => {
    const generateEntity = ge(testScaffolderConfig);

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
        expect(result.files[0]?.path).toBe('packages/stocks/src/domain/order/Order.ts');
        expect(result.files[0]?.content).toContain('type Order =');

        expect(result.files[1]?.path).toBe('packages/stocks/test/domain/order/Order.spec.ts');
        expect(result.files[1]?.content).toContain('test the method close(absolute: boolean)');
    });
});
