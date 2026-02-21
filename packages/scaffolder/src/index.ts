import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { generateDomainService } from './generateDomainService.js';
import { generateDynamoDBRepository } from './generateDynamoDBRepository.js';
import { generateEntity } from './generateEntity.js';
import { generatePostgreSQLRepository } from './generatePostgreSQLRepository.js';
import { generateRepository } from './generateRepository.js';
import { generateValueObject } from './generateValueObject.js';
import {
    ScaffolderConfig,
    scaffolderConfigSchema,
    scaffolderMetadata,
} from './ScaffolderConfig.js';
import { McpTool } from './McpTool.js';

async function main() {
    const server = new McpServer(scaffolderMetadata);

    const env: ScaffolderConfig = scaffolderConfigSchema.parse({
        basicTypesFrom: process.env['BASIC_TYPES_FROM'],
        basicErrorTypesFrom: process.env['BASIC_ERROR_TYPES_FROM'],
        boundedContextsParentFolder: process.env['BOUNDED_CONTEXTS_PARENT_FOLDER'],
        dynamoDBConfigurationFrom: process.env['DYNAMODB_CONFIG_FROM'],
    });

    const registerTool = (mcpToolFactory: (env: ScaffolderConfig) => McpTool) => {
        const { name, config, execute } = mcpToolFactory(env);
        return server.registerTool(name, config, execute);
    };

    registerTool(generateEntity);
    registerTool(generateValueObject);
    registerTool(generateRepository);
    registerTool(generateDomainService);
    registerTool(generatePostgreSQLRepository);
    registerTool(generateDynamoDBRepository);

    const transport = new StdioServerTransport();

    return server
        .connect(transport)
        .then(() =>
            console.error(`MCP Server ddd-scaffolder is running on stdio. Environment:`, env),
        );
}

await main().catch((error) => {
    console.error(`Fatal error in main():`, error);
    process.exit(1);
});
