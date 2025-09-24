import { describe, it, before } from 'node:test';
import { expect } from 'expect';
import { z } from 'zod';

import { generatePostgreSQLRepository } from '../src/generatePostgreSQLRepository.js';

describe('PostgreSQL Repository generator', () => {
    before(() => {
        // Ensure consistent test behavior by setting the default parent folder
        process.env['BOUNDED_CONTEXTS_PARENT_FOLDER'] = 'packages/domainlogic';
    });

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
            'packages/domainlogic/stocks/domain/src/adapter/persistence/OrderModel.ts',
        );
        expect(result.files[0]?.content).toContain('export class OrderModel extends Model {');

        expect(result.files[1]?.path).toBe(
            'packages/domainlogic/stocks/domain/src/adapter/persistence/OrderRepositoryImpl.ts',
        );
        expect(result.files[1]?.content).toContain(
            'export function OrderRepositoryImpl(knex: Knex): OrderRepository {',
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

    it('generates files in application layer when specified', async () => {
        const params = {
            boundedContext: 'stocks',
            aggregateName: 'Order',
            layer: 'application',
            attributes: [],
        };

        const parsed = z.object(generatePostgreSQLRepository.config.inputSchema).parse(params);
        const resultAsText = await generatePostgreSQLRepository.execute(parsed);
        const result = z
            .object(generatePostgreSQLRepository.config.outputSchema)
            .parse(resultAsText.structuredContent);

        expect(result.files[0]?.path).toBe(
            'packages/domainlogic/stocks/application/src/adapter/persistence/OrderModel.ts',
        );
        expect(result.files[1]?.path).toBe(
            'packages/domainlogic/stocks/application/src/adapter/persistence/OrderRepositoryImpl.ts',
        );
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
        expect(repositoryContent).toContain('async findByUserId({ userId }) {');
        expect(repositoryContent).toContain('async findPendingOrders({  }) {');
    });
});
