import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerGenerateDomainService } from './generateDomainService.js';
import { registerGenerateEntity } from './generateEntity.js';
import { registerGenerateModule } from './generateModule.js';
import { registerGenerateRepository } from './generateRepository.js';

async function main() {
    const server = new McpServer({
        name: 'ddd-scaffolder',
        version: '1.0.0',
    });

    registerGenerateEntity(server);
    registerGenerateModule(server);
    registerGenerateRepository(server);
    registerGenerateDomainService(server);

    const transport = new StdioServerTransport();

    return server
        .connect(transport)
        .then(() => console.error(`MCP Server DDD sample is running on stdio`));
}

await main().catch((error) => {
    console.error(`Fatal error in main():`, error);
    process.exit(1);
});
