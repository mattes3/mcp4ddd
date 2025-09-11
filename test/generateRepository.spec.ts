import { describe, it } from 'node:test';
import { expect } from 'expect';
import { z } from 'zod';

import { generateRepository } from '../src/generateRepository.js';

describe('Repository generator', () => {
    it('creates repository interface, implementation, and test files', async () => {
        const params = {
            aggregateName: 'Person',
            methods: [
                {
                    name: 'findByName',
                    parameters: [{ name: 'name', type: 'string' }],
                    resultType: 'Person[]',
                },
                {
                    name: 'findById',
                    parameters: [{ name: 'id', type: 'UUID' }],
                    resultType: 'Person',
                },
            ],
            defaultAddAndRemoveMethods: true,
            boundedContext: 'stocks',
            layer: 'domain',
        };

        // Validate input with Zod (like MCP would do)
        const parsed = z.object(generateRepository.config.inputSchema).parse(params);

        // invoke the tool
        const resultAsText = await generateRepository.execute(parsed);

        // assert that it has generated text output
        expect(resultAsText.content[0]?.type).toEqual('text');
        expect(resultAsText.content[0]?.text.length).toBeGreaterThan(0);

        // Validate output with Zod (like MCP would do)
        const result = z
            .object(generateRepository.config.outputSchema)
            .parse(resultAsText.structuredContent);

        // Assert that we should have usable data, now!

        expect(result.files).toHaveLength(3);
        expect(result.files[0]?.path).toBe(
            'packages/domainlogic/stocks/domain/src/domainmodel/PersonRepository.ts',
        );
        expect(result.files[0]?.content).toContain('export interface PersonRepository {');
        expect(result.files[0]?.content).toContain('add(item: Person): Promise<void>');

        expect(result.files[1]?.path).toBe(
            'packages/domainlogic/stocks/domain/src/adapter/persistence/PersonRepositoryImpl.ts',
        );
        expect(result.files[1]?.content).toContain(
            'export const PersonRepositoryImpl: PersonRepository = {',
        );
        expect(result.files[1]?.content).toContain('async add(item: Person): Promise<void> {');

        expect(result.files[2]?.path).toBe(
            'packages/domainlogic/stocks/domain/test/PersonRepository.spec.ts',
        );
        expect(result.files[2]?.content).toContain("describe('PersonRepository'");
        expect(result.files[2]?.content).toContain(
            '// test the method add(item: Person): Promise<void>',
        );
    });
});
