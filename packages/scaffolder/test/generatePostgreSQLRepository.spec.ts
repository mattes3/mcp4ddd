import { expect } from 'expect';
import { describe, it } from 'node:test';
import { z } from 'zod';

import { generatePostgreSQLRepository as gpsr } from '../src/generatePostgreSQLRepository.js';
import { testScaffolderConfig } from './testScaffolderConfig.js';

describe('PostgreSQL Repository generator', () => {
    const generatePostgreSQLRepository = gpsr(testScaffolderConfig);

    it('creates PostgreSQL repository files with minimal parameters', async () => {
        const params = {
            boundedContext: 'stocks',
            aggregateName: 'Order',
            attributes: [],
        };

        // Validate input with Zod (like MCP would do)
        const parsed = z.object(generatePostgreSQLRepository.config.inputSchema).parse(params);

        // invoke the tool
        const resultAsText = await generatePostgreSQLRepository.execute(parsed);

        // assert that it has generated text output
        expect(resultAsText.content[0]?.type).toEqual('text');
        expect(resultAsText.content[0]?.text.length).toBeGreaterThan(0);

        // Validate output with Zod (like MCP would do)
        const result = z
            .object(generatePostgreSQLRepository.config.outputSchema)
            .parse(resultAsText.structuredContent);

        // Assert that we should have usable data
        expect(result.files).toHaveLength(2);
        expect(result.files[0]?.path).toBe(
            'packages/stocks/src/adapters/persistence/OrderModel.ts',
        );
        expect(result.files[0]?.content).toContain('export class OrderModel extends Model {');

        expect(result.files[1]?.path).toBe(
            'packages/stocks/src/adapters/persistence/OrderRepositoryImpl.ts',
        );
        expect(result.files[1]?.content).toMatch(
            /export const OrderRepositoryImpl = \(\s*knex: Knex,\s*\): TransactionOnRepoProvider<OrderRepository> => \{/,
        );
        expect(result.files[1]?.content).toContain('failed:\\n');
        expect(result.files[1]?.content).not.toContain('failed:\\\\n');
    });

    it('uses custom table name when provided', async () => {
        const params = {
            boundedContext: 'stocks',
            aggregateName: 'Order',
            tableName: 'orders',
            attributes: [],
        };

        const parsed = z.object(generatePostgreSQLRepository.config.inputSchema).parse(params);
        const resultAsText = await generatePostgreSQLRepository.execute(parsed);
        const result = z
            .object(generatePostgreSQLRepository.config.outputSchema)
            .parse(resultAsText.structuredContent);

        expect(result.files[0]?.content).toContain("tableName = 'orders'");
    });

    it('handles custom attributes with different types', async () => {
        const params = {
            boundedContext: 'stocks',
            aggregateName: 'Order',
            attributes: [
                { name: 'id', type: 'string', required: true },
                { name: 'userId', type: 'string', required: true },
                { name: 'total', type: 'number', required: true },
                { name: 'isActive', type: 'boolean', required: false },
                { name: 'createdAt', type: 'date', required: true },
            ],
        };

        const parsed = z.object(generatePostgreSQLRepository.config.inputSchema).parse(params);
        const resultAsText = await generatePostgreSQLRepository.execute(parsed);
        const result = z
            .object(generatePostgreSQLRepository.config.outputSchema)
            .parse(resultAsText.structuredContent);

        const modelContent = result.files[0]?.content;
        expect(modelContent).toContain('id: {');
        expect(modelContent).toContain("type: 'string'");
        expect(modelContent).toContain('userId: {');
        expect(modelContent).toContain('total: {');
        expect(modelContent).toContain("type: 'number'");
        expect(modelContent).toContain('isActive: {');
        expect(modelContent).toContain("type: 'boolean'");
        expect(modelContent).toContain('createdAt: {');
        expect(modelContent).toContain("format: 'date-time'");
        // Required fields only
        expect(modelContent).toContain("'id'");
        expect(modelContent).toContain("'userId'");
        expect(modelContent).toContain("'total'");
        expect(modelContent).toContain("'createdAt'");
        // isActive is not required, so should not be in required array
        expect(modelContent).not.toContain("'isActive'");
    });

    it('generates custom repository methods when provided', async () => {
        const params = {
            boundedContext: 'stocks',
            aggregateName: 'Order',
            attributes: [],
            methods: [
                {
                    name: 'findByUserId',
                    parameters: [{ name: 'userId', type: 'string' }],
                    resultType: 'Order[]',
                },
                {
                    name: 'findPendingOrders',
                    parameters: [],
                    resultType: 'Order[]',
                },
            ],
        };

        const parsed = z.object(generatePostgreSQLRepository.config.inputSchema).parse(params);
        const resultAsText = await generatePostgreSQLRepository.execute(parsed);
        const result = z
            .object(generatePostgreSQLRepository.config.outputSchema)
            .parse(resultAsText.structuredContent);

        const repositoryContent = result.files[1]?.content;
        expect(repositoryContent).toContain('findByUserId({ userId }) {');
        expect(repositoryContent).toContain('findPendingOrders({  }) {');
    });
});
