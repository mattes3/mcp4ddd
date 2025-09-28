import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { generateDomainService } from './generateDomainService.js';
import { generateDynamoDBRepository } from './generateDynamoDBRepository.js';
import { generateEntity } from './generateEntity.js';
import { generatePostgreSQLRepository } from './generatePostgreSQLRepository.js';
import { generateRepository } from './generateRepository.js';
import { generateValueObject } from './generateValueObject.js';

async function main() {
    const server = new McpServer({
        name: 'ddd-scaffolder',
        version: '1.0.0',
    });

    server.registerTool(generateEntity.name, generateEntity.config, generateEntity.execute);

    server.registerTool(
        generateValueObject.name,
        generateValueObject.config,
        generateValueObject.execute,
    );

    server.registerTool(
        generateRepository.name,
        generateRepository.config,
        generateRepository.execute,
    );

    server.registerTool(
        generateDomainService.name,
        generateDomainService.config,
        generateDomainService.execute,
    );

    server.registerTool(
        generateDynamoDBRepository.name,
        generateDynamoDBRepository.config,
        generateDynamoDBRepository.execute,
    );

    server.registerTool(
        generatePostgreSQLRepository.name,
        generatePostgreSQLRepository.config,
        generatePostgreSQLRepository.execute,
    );

    const transport = new StdioServerTransport();

    const env = {
        BASIC_TYPES_FROM: process.env['BASIC_TYPES_FROM'],
        BASIC_ERROR_TYPES_FROM: process.env['BASIC_ERROR_TYPES_FROM'],
        BOUNDED_CONTEXTS_PARENT_FOLDER: process.env['BOUNDED_CONTEXTS_PARENT_FOLDER'],
        DYNAMODB_CONFIG_FROM: process.env['DYNAMODB_CONFIG_FROM'],
    };

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
