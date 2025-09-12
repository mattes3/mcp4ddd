import { describe, it } from 'node:test';
import { expect } from 'expect';
import { z } from 'zod';

import { generateDynamoDBRepository } from '../src/generateDynamoDBRepository.js';

describe('DynamoDB Repository generator', () => {
    it('creates DynamoDB repository files with minimal parameters', async () => {
        const params = {
            boundedContext: 'stocks',
            aggregateName: 'Order',
        };

        process.env['DYNAMODB_CONFIG_FROM'] = '@ddd-components/runtime';

        // Validate input with Zod (like MCP would do)
        const parsed = z.object(generateDynamoDBRepository.config.inputSchema).parse(params);

        // invoke the tool
        const resultAsText = await generateDynamoDBRepository.execute(parsed);

        // assert that it has generated text output
        expect(resultAsText.content[0]?.type).toEqual('text');
        expect(resultAsText.content[0]?.text.length).toBeGreaterThan(0);

        // Validate output with Zod (like MCP would do)
        const result = z
            .object(generateDynamoDBRepository.config.outputSchema)
            .parse(resultAsText.structuredContent);

        // Assert that we should have usable data
        expect(result.files).toHaveLength(3);
        expect(result.files[0]?.path).toBe(
            'packages/domainlogic/stocks/domain/src/adapter/persistence/OrderEntity.ts',
        );
        expect(result.files[0]?.content).toContain(
            'export function configureOrderEntity(): Entity {',
        );

        expect(result.files[1]?.path).toBe(
            'packages/domainlogic/stocks/domain/src/adapter/persistence/OrderRepositoryImpl.ts',
        );
        expect(result.files[1]?.content).toContain(
            'export function OrderRepositoryImpl(): OrderRepository {',
        );

        expect(result.files[2]?.path).toBe(
            'packages/domainlogic/stocks/domain/test/OrderRepositoryImpl.spec.ts',
        );
        expect(result.files[2]?.content).toContain("describe('OrderRepositoryImpl'");
    });

    it('uses custom entity name and service when provided', async () => {
        const params = {
            boundedContext: 'stocks',
            aggregateName: 'Order',
            tableName: 'OrdersTable',
            entityName: 'CustomOrderEntity',
            service: 'custom-service',
            version: '2.0',
        };

        const parsed = z.object(generateDynamoDBRepository.config.inputSchema).parse(params);
        const resultAsText = await generateDynamoDBRepository.execute(parsed);
        const result = z
            .object(generateDynamoDBRepository.config.outputSchema)
            .parse(resultAsText.structuredContent);

        expect(result.files[0]?.content).toContain("entity: 'CustomOrderEntity'");
        expect(result.files[0]?.content).toContain("service: 'custom-service'");
        expect(result.files[0]?.content).toContain("version: '2.0'");
    });

    it('generates files in application layer when specified', async () => {
        const params = {
            boundedContext: 'stocks',
            aggregateName: 'Order',
            tableName: 'OrdersTable',
            layer: 'application',
        };

        const parsed = z.object(generateDynamoDBRepository.config.inputSchema).parse(params);
        const resultAsText = await generateDynamoDBRepository.execute(parsed);
        const result = z
            .object(generateDynamoDBRepository.config.outputSchema)
            .parse(resultAsText.structuredContent);

        expect(result.files[0]?.path).toBe(
            'packages/domainlogic/stocks/application/src/adapter/persistence/OrderEntity.ts',
        );
        expect(result.files[1]?.path).toBe(
            'packages/domainlogic/stocks/application/src/adapter/persistence/OrderRepositoryImpl.ts',
        );
        expect(result.files[2]?.path).toBe(
            'packages/domainlogic/stocks/application/test/OrderRepositoryImpl.spec.ts',
        );
    });

    it('handles custom attributes and indexes', async () => {
        const params = {
            boundedContext: 'stocks',
            aggregateName: 'Order',
            tableName: 'OrdersTable',
            attributes: [
                { name: 'id', type: 'string', required: true },
                { name: 'userId', type: 'string', required: true },
                { name: 'total', type: 'number', required: true },
                { name: 'status', type: 'string', required: false, default: 'pending' },
            ],
            indexes: {
                primary: {
                    pk: { field: 'id', composite: [] },
                    sk: { field: 'userId', composite: [] },
                },
                globalSecondaryIndexes: [
                    {
                        name: 'UserOrders',
                        pk: { field: 'userId', composite: [] },
                        sk: { field: 'status', composite: [] },
                    },
                ],
            },
        };

        const parsed = z.object(generateDynamoDBRepository.config.inputSchema).parse(params);
        const resultAsText = await generateDynamoDBRepository.execute(parsed);
        const result = z
            .object(generateDynamoDBRepository.config.outputSchema)
            .parse(resultAsText.structuredContent);

        const entityContent = result.files[0]?.content;
        expect(entityContent).toContain('id: {');
        expect(entityContent).toContain('userId: {');
        expect(entityContent).toContain('total: {');
        expect(entityContent).toContain('status: {');
        expect(entityContent).toContain("default: 'pending'");
        expect(entityContent).toContain('UserOrders: {');
        expect(entityContent).toContain("index: 'UserOrders'");
    });

    it('generates custom repository methods when provided', async () => {
        const params = {
            boundedContext: 'stocks',
            aggregateName: 'Order',
            tableName: 'OrdersTable',
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

        const parsed = z.object(generateDynamoDBRepository.config.inputSchema).parse(params);
        const resultAsText = await generateDynamoDBRepository.execute(parsed);
        const result = z
            .object(generateDynamoDBRepository.config.outputSchema)
            .parse(resultAsText.structuredContent);

        const repositoryContent = result.files[1]?.content;
        expect(repositoryContent).toContain('async findByUserId({ userId }) {');
        expect(repositoryContent).toContain('async findPendingOrders({  }) {');
        expect(repositoryContent).toContain('// Custom method - implement based on requirements');
    });
});
