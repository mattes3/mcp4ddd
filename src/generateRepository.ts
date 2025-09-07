import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerGenerateRepository(server: McpServer) {
    server.registerTool(
        'generateRepository',
        {
            title: 'Repository generator',
            description: 'Generate a repository interface for an aggregate.',
            inputSchema: {
                aggregateName: z.string(),
                methods: z.array(z.string()),
                persistence: z.enum(['inMemory', 'typeorm', 'prisma']).default('inMemory'),
            },
            outputSchema: {
                files: z.array(z.object({ path: z.string(), content: z.string() })),
            },
        },
        async (params) => {
            const { aggregateName, methods, persistence } = params;
            const files = [
                {
                    path: `src/domain/${aggregateName.toLowerCase()}s/${aggregateName}Repository.ts`,
                    content: `// Repository interface for ${aggregateName}\nexport interface ${aggregateName}Repository { ${methods.join('; ')} }`,
                },
                {
                    path: `src/infrastructure/${aggregateName.toLowerCase()}s/${persistence}Repository.ts`,
                    content: `// ${persistence} implementation for ${aggregateName}Repository`,
                },
            ];

            return {
                content: [{ type: 'text', text: JSON.stringify({ files }) }],
            };
        },
    );
}
