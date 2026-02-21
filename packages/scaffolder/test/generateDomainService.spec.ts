import { expect } from 'expect';
import { describe, it } from 'node:test';
import { z } from 'zod';

import { generateDomainService as gds } from '../src/generateDomainService.js';
import { testScaffolderConfig } from './testScaffolderConfig.js';

describe('domain service generator', () => {
    const generateDomainService = gds(testScaffolderConfig);

    it('creates domain service and test files', async () => {
        const params = {
            serviceName: 'transferMoney',
            injectedDependencies: [{ name: 'dummy', type: 'Dependency' }],
            parameters: [
                { name: 'fromAccount', type: 'Account' },
                { name: 'toAccount', type: 'Account' },
                { name: 'amount', type: 'Money' },
            ],
            returns: 'void',
            boundedContext: 'stocks',
            layer: 'domain',
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
        expect(result.files).toHaveLength(4);
        expect(result.files[0]?.path).toBe('packages/stocks/src/domain/TransferMoneyErrors.ts');
        expect(result.files[0]?.content).toContain('export type TransferMoneyError');
        expect(result.files[0]?.content).toContain('export const createTransferMoneyError');

        expect(result.files[1]?.path).toBe('packages/stocks/src/domain/TransferMoneyParams.ts');
        expect(result.files[1]?.content).toContain('const transferMoneySchema = z.object({');
        expect(result.files[1]?.content).toContain(
            '): Result<TransferMoneyParams, TransferMoneyError> {',
        );

        expect(result.files[2]?.path).toBe('packages/stocks/src/domain/transferMoney.ts');
        expect(result.files[2]?.content).toContain('export const transferMoneyImpl =');
        expect(result.files[2]?.content).toContain(
            '(transact: TransactionOnRepository, dummy: Dependency): TransferMoney =>',
        );

        expect(result.files[3]?.path).toBe('packages/stocks/test/domain/transferMoney.spec.ts');
        expect(result.files[3]?.content).toContain(
            '// test the method transferMoney(fromAccount: Account, toAccount: Account, amount: Money): AsyncResult<void, TransferMoneyError>',
        );
    });
});
