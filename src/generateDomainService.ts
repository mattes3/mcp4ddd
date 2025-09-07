import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerGenerateDomainService(server: McpServer) {
    server.registerTool(
        'generateDomainService',
        {
            title: 'Domain Service generator',
            description: 'Generate a domain service with operations.',
            inputSchema: {
                serviceName: z.string(),
                operations: z.array(
                    z.object({
                        name: z.string(),
                        parameters: z.array(z.string()),
                        returns: z.string(),
                    }),
                ),
            },
            outputSchema: {
                files: z.array(z.object({ path: z.string(), content: z.string() })),
            },
        },
        async (params) => {
            const { serviceName, operations } = params;

            const files = [
                {
                    path: `src/domain/${serviceName.replace(/Service$/, '').toLowerCase()}s/${serviceName}.ts`,
                    content: `// Service ${serviceName}\nexport class ${serviceName} { ${operations
                        .map((op) => `${op.name}(${op.parameters.join(', ')}): ${op.returns} {}`)
                        .join('\n')} }`,
                },
            ];

            return {
                content: [{ type: 'text', text: JSON.stringify({ files }) }],
            };
        },
    );
}
