import type { AnyAgentTool, OpenClawPluginApi } from 'openclaw/plugin-sdk';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import {
    type ScaffolderConfig,
    scaffolderConfigSchema,
    scaffolderMetadata,
} from './ScaffolderConfig.js';

import { generateDomainService } from './generateDomainService.js';
import { generateDynamoDBRepository } from './generateDynamoDBRepository.js';
import { generateEntity } from './generateEntity.js';
import { generatePostgreSQLRepository } from './generatePostgreSQLRepository.js';
import { generateRepository } from './generateRepository.js';
import { generateValueObject } from './generateValueObject.js';
import { McpTool } from './McpTool.js';

function wrapAsOpenClawAgentTool(mcpTool: McpTool): AnyAgentTool {
    return {
        name: mcpTool.name,
        label: mcpTool.config.title,
        description: mcpTool.config.description,

        // Convert Zod schema to JSON Schema
        parameters: zodToJsonSchema(z.object(mcpTool.config.inputSchema)),

        async execute(_toolCallId, params, _signal, _onUpdate) {
            const json = (payload: unknown) => ({
                content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }],
                details: payload,
            });

            try {
                const validInput = z.object(mcpTool.config.inputSchema).parse(params);

                const toolResult = await mcpTool.execute(validInput);

                const validOutput = z
                    .object(mcpTool.config.outputSchema)
                    .parse(toolResult.structuredContent);

                const { contentSummary, ...data } = validOutput;
                return json({ success: true, data, message: contentSummary });
            } catch (error) {
                // Handle validation errors
                if (error instanceof z.ZodError) {
                    const errors = error.errors
                        .map((e) => `${e.path.join('.')}: ${e.message}`)
                        .join(', ');

                    throw new Error(`Invalid parameters: ${errors}`);
                }

                // Handle runtime errors
                if (error instanceof Error) {
                    throw new Error(`The ${mcpTool.name} tool failed: ${error.message}`);
                }

                throw new Error('An unexpected error occurred');
            }
        },
    };
}

const pluginDescriptor = {
    ...scaffolderMetadata,
    description: 'Generator for DDD entities, value objects, repositories, and services',

    configSchema: {
        parse(value: unknown): ScaffolderConfig {
            return scaffolderConfigSchema.parse(value);
        },

        uiHints: {
            basicTypesFrom: {
                label: 'Package with Basic Types',
                placeholder: '@ddd-components/runtime',
            },
            basicErrorTypesFrom: {
                label: 'Package with Basic Error Types',
                placeholder: '@ddd-components/runtime',
            },
            boundedContextsParentFolder: {
                label: 'Parent folder for bounded contexts',
                placeholder: 'packages',
            },
            dynamoDBConfigurationFrom: {
                label: 'Package with configuration for DynamoDB',
                placeholder: '@ddd-components/runtime',
            },
        },
    },

    register(api: OpenClawPluginApi) {
        api.logger.info(`${scaffolderMetadata.name} plugin initialized`);

        const registerTool = (mcpToolFactory: (env: ScaffolderConfig) => McpTool) =>
            api.registerTool(
                wrapAsOpenClawAgentTool(mcpToolFactory(api.pluginConfig as ScaffolderConfig)),
            );

        try {
            registerTool(generateEntity);
            registerTool(generateValueObject);
            registerTool(generateRepository);
            registerTool(generateDomainService);
            registerTool(generatePostgreSQLRepository);
            registerTool(generateDynamoDBRepository);
        } catch (error) {
            api.logger.error(
                `${scaffolderMetadata.name} plugin crashed: ${error} ${error instanceof Error && error.stack}`,
            );
        }
    },
};

export default pluginDescriptor;

export const openclawConfigJSON = {
    id: scaffolderMetadata.name,
    configSchema: zodToJsonSchema(scaffolderConfigSchema),
    uiHints: pluginDescriptor.configSchema.uiHints,
};
