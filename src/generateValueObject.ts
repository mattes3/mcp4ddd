import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { FieldSchema } from './FieldSchema.js';

export function registerGenerateValueObject(server: McpServer) {
    server.registerTool(
        'generateValueObject',
        {
            title: 'Value Object generator',
            description: 'Generate a DDD value object with validations and immutability.',
            inputSchema: {
                valueObjectName: z.string(),
                fields: z.array(FieldSchema),
                validations: z.array(z.string()).optional(),
            },
            outputSchema: {
                files: z.array(z.object({ path: z.string(), content: z.string() })),
            },
        },
        async (params) => {
            const { valueObjectName, fields, validations } = params;

            const files = [
                {
                    path: `src/domain/shared/${valueObjectName}.ts`,
                    content: `// Value Object ${valueObjectName}\n// fields: ${JSON.stringify(fields)}\n// validations: ${validations?.join(', ')}`,
                },
            ];

            return {
                content: [{ type: 'text', text: JSON.stringify({ files }) }],
            };
        },
    );
}
