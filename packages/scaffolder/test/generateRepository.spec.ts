import { expect } from 'expect';
import { describe, it } from 'node:test';
import { z } from 'zod';

import { generateRepository as gr } from '../src/generateRepository.js';
import { testScaffolderConfig } from './testScaffolderConfig.js';

describe('Repository generator', () => {
    const generateRepository = gr(testScaffolderConfig);

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
        expect(result.files[0]?.path).toBe('packages/stocks/src/domain/PersonRepository.ts');
        expect(result.files[0]?.content).toContain(
            "import type { Person, PersonData } from './Person.js';",
        );
        expect(result.files[0]?.content).toContain('export interface PersonRepository {');
        expect(result.files[0]?.content).toContain(
            'add(params: { item: PersonData }): AsyncResult<void, TechError>',
        );
        expect(result.files[0]?.content).toContain(
            "get(params: { id: Person['id'] }): AsyncResult<Option<Person>, TechError>",
        );
        expect(result.files[0]?.content).toContain(
            "update(params: { id: Person['id'], updates: Partial<Omit<PersonData, 'id'>> }): AsyncResult<void, TechError>;",
        );
        expect(result.files[0]?.content).toContain(
            'remove(params: { item: PersonData }): AsyncResult<void, TechError>;',
        );
        expect(result.files[0]?.content).toContain(
            'findByName(params: { name: string }): AsyncResult<Person[], TechError>',
        );

        expect(result.files[1]?.path).toBe('packages/stocks/test/domain/PersonRepository.spec.ts');
        expect(result.files[1]?.content).toContain("describe('PersonRepository'");
        expect(result.files[1]?.content).toContain(
            '// test the method add(item: PersonData): AsyncResult<void, TechError>',
        );
    });
});
