import { expect } from 'expect';
import { describe, it } from 'node:test';

import { AnyAgentTool, OpenClawPluginApi } from 'openclaw/plugin-sdk';
import openClawPlugin from '../src/OpenClawPlugin.js';
import { testScaffolderConfig } from './testScaffolderConfig.js';

describe('Entity generator', () => {
    it('instantiates the plugin and generates an entity', async () => {
        const config = openClawPlugin.configSchema.parse(testScaffolderConfig);
        expect(config).toBeDefined();

        const toolMap: Record<string, AnyAgentTool> = {};

        const api = {
            id: '',
            name: '',
            source: '',
            logger: {
                debug: function (message: string): void {
                    console.log(`[logger.debug] ${message}`);
                },
                info: function (message: string): void {
                    console.log(`[logger.info] ${message}`);
                },
                warn: function (message: string): void {
                    console.log(`[logger.warn] ${message}`);
                },
                error: function (message: string): void {
                    console.log(`[logger.error] ${message}`);
                },
            },

            pluginConfig: testScaffolderConfig,

            registerTool(tool: AnyAgentTool) {
                toolMap[tool.name] = tool;
            },
        };

        openClawPlugin.register(api as unknown as OpenClawPluginApi);

        const entity = await toolMap['generateEntity']?.execute('toolcall-001', {
            entityName: 'Order',
            attributes: [],
            methods: [],
            boundedContext: 'OrderManagement',
        });

        expect(entity?.content).toHaveLength(1);
        if (entity?.content[0]?.type === 'text') {
            expect(entity?.content[0]?.text).toContain(
                'packages/OrderManagement/src/domain/Order.ts',
            );
        } else {
            expect(false).toBeTruthy();
        }
    });
});
