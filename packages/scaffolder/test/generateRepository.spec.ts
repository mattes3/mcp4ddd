import { describe, it, before } from 'node:test';
import { expect } from 'expect';
import { z } from 'zod';

import { generateRepository } from '../src/generateRepository.js';

describe('Repository generator', () => {
    before(() => {
        // Ensure consistent test behavior by setting the default parent folder
        process.env['BOUNDED_CONTEXTS_PARENT_FOLDER'] = 'packages/domainlogic';
    });

    it('creates repository interface and test files', async () => {
        const params = {
            aggregateName: 'Person',
            methods: [
                {
                    name: 'findByName',
                    parameters: [{ name: 'name', type: 'string' }],
                    resultType: 'Person[]',
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

        expect(result.files).toHaveLength(2);
        expect(result.files[0]?.path).toBe(
            'packages/domainlogic/stocks/domain/src/domainmodel/PersonRepository.ts',
        );
        expect(result.files[0]?.content).toContain("import { Person } from './Person.ts';");
        expect(result.files[0]?.content).toContain('export interface PersonRepository {');
        expect(result.files[0]?.content).toContain(
            'add(params: { item: Person }): AsyncResult<void, TechError>',
        );
        expect(result.files[0]?.content).toContain(
            "get(params: { id: Person['id'] }): AsyncResult<Option<Person>, TechError>",
        );
        expect(result.files[0]?.content).toContain(
            "update(params: { id: Person['id'], updates: Partial<Omit<Person, 'id'>> }): AsyncResult<Person, TechError>",
        );
        expect(result.files[0]?.content).toContain(
            'remove(params: { item: Person }): AsyncResult<void, TechError>',
        );
        expect(result.files[0]?.content).toContain(
            'findByName(params: { name: string }): AsyncResult<Person[], TechError>',
        );

        expect(result.files[1]?.path).toBe(
            'packages/domainlogic/stocks/domain/test/PersonRepository.spec.ts',
        );
        expect(result.files[1]?.content).toContain("describe('PersonRepository'");
        expect(result.files[1]?.content).toContain(
            '// test the method add(item: Person): Promise<void>',
        );
    });
});
