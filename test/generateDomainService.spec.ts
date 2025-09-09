import { describe, it } from 'node:test';
import { expect } from 'expect';
import { z } from 'zod';

import { generateDomainService } from '../src/generateDomainService.js';

describe('domain service generator', () => {
    it('creates domain service and test files', async () => {
        const params = {
            serviceName: 'transferMoney',
            injectedDependencies: [{ name: 'repo', type: 'AccountRepository' }],
            parameters: [
                { name: 'fromAccount', type: 'Account' },
                { name: 'toAccount', type: 'Account' },
                { name: 'amount', type: 'Money' },
            ],
            returns: 'void',
        };

        // Validate input with Zod (like MCP would do)
        const parsed = z.object(generateDomainService.config.inputSchema).parse(params);

        // invoke the tool
        const resultAsText = await generateDomainService.execute(parsed);

        // assert that it has generated text output
        expect(resultAsText.content[0]?.type).toEqual('text');
        expect(resultAsText.content[0]?.text.length).toBeGreaterThan(0);

        // Validate output with Zod (like MCP would do)
        const result = z
            .object(generateDomainService.config.outputSchema)
            .parse(resultAsText.structuredContent);

        // Assert that we should have usable data, now!
        expect(result.files).toHaveLength(2);
        expect(result.files[0]?.path).toMatch(/transferMoney\.ts$/);
        expect(result.files[0]?.content).toContain('export const transferMoney =');
        expect(result.files[0]?.content).toContain('(repo: AccountRepository) =>');
        expect(result.files[0]?.content).toContain(
            '(fromAccount: Account, toAccount: Account, amount: Money) => {',
        );

        expect(result.files[1]?.path).toMatch(/transferMoney.spec.ts$/);
        expect(result.files[1]?.content).toContain(
            '// test the method transferMoney(fromAccount: Account, toAccount: Account, amount: Money)',
        );
    });
});
