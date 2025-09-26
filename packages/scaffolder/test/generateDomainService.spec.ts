import { describe, it, before } from 'node:test';
import { expect } from 'expect';
import { z } from 'zod';

import { generateDomainService } from '../src/generateDomainService.js';

describe('domain service generator', () => {
    before(() => {
        // Ensure consistent test behavior by setting the default parent folder
        process.env['BOUNDED_CONTEXTS_PARENT_FOLDER'] = 'packages/domainlogic';
    });
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
        process.env['BASIC_TYPES_FROM'] = '@ddd-components/runtime';
        process.env['BASIC_ERROR_TYPES_FROM'] = '@ddd-components/runtime';
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
        expect(result.files[0]?.path).toBe(
            'packages/domainlogic/stocks/domain/src/domainmodel/TransferMoneyErrors.ts',
        );
        expect(result.files[0]?.content).toContain('export type TransferMoneyError');
        expect(result.files[0]?.content).toContain('export const createTransferMoneyError');

        expect(result.files[1]?.path).toBe(
            'packages/domainlogic/stocks/domain/src/domainmodel/TransferMoneyParams.ts',
        );
        expect(result.files[1]?.content).toContain('const transferMoneySchema = z.object({');
        expect(result.files[1]?.content).toContain(
            '): Result<TransferMoneyParams, TransferMoneyError> {',
        );

        expect(result.files[2]?.path).toBe(
            'packages/domainlogic/stocks/domain/src/domainmodel/transferMoney.ts',
        );
        expect(result.files[2]?.content).toContain('export const transferMoneyImpl =');
        expect(result.files[2]?.content).toContain(
            '(transact: TransactionOnRepository, dummy: Dependency): TransferMoney =>',
        );

        expect(result.files[3]?.path).toBe(
            'packages/domainlogic/stocks/domain/test/transferMoney.spec.ts',
        );
        expect(result.files[3]?.content).toContain(
            '// test the method transferMoney(fromAccount: Account, toAccount: Account, amount: Money): AsyncResult<void, TransferMoneyError>',
        );
    });
});
