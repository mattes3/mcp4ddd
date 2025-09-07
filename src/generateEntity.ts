import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { FieldSchema } from './FieldSchema.js';

export function registerGenerateEntity(server: McpServer) {
    server.registerTool(
        'generateEntity',
        {
            title: 'Entity generator',
            description: 'Generate a DDD entity, optionally as an aggregate root.',
            inputSchema: {
                entityName: z.string().describe('Name of the entity'),
                aggregateRoot: z.boolean().default(false),
                fields: z.array(FieldSchema),
            },
            outputSchema: {
                files: z.array(z.object({ path: z.string(), content: z.string() })),
            },
        },
        async (params) => {
            const { entityName, aggregateRoot, fields } = params;

            const files = [
                {
                    path: `src/domain/${entityName.toLowerCase()}s/${entityName}.ts`,
                    content: `// Entity ${entityName}${aggregateRoot ? ' (Aggregate Root)' : ''}\nexport class ${entityName} { /* fields: ${JSON.stringify(fields)} */ }`,
                },
                {
                    path: `src/domain/${entityName.toLowerCase()}s/__tests__/${entityName}.spec.ts`,
                    content: `// vitest test stub for ${entityName}`,
                },
            ];

            return {
                content: [{ type: 'text', text: JSON.stringify({ files }) }],
            };
        },
    );
}
