import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { generateDomainService } from './generateDomainService.js';
import { generateEntity } from './generateEntity.js';
import { generateModule } from './generateModule.js';
import { generateRepository } from './generateRepository.js';

async function main() {
    const server = new McpServer({
        name: 'ddd-scaffolder',
        version: '1.0.0',
    });

    server.registerTool(generateEntity.name, generateEntity.config, generateEntity.execute);
    server.registerTool(generateModule.name, generateModule.config, generateModule.execute);
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

    const transport = new StdioServerTransport();

    return server
        .connect(transport)
        .then(() => console.error(`MCP Server DDD sample is running on stdio`));
}

await main().catch((error) => {
    console.error(`Fatal error in main():`, error);
    process.exit(1);
});
