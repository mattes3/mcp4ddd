import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { FieldSchema } from './FieldSchema.js';

const inputSchema = z.object({
    moduleName: z.string(),
    entities: z.array(
        z.object({
            name: z.string(),
            aggregateRoot: z.boolean().default(false),
            fields: z.array(FieldSchema),
        }),
    ),
    services: z.array(z.string()).optional(),
    repositories: z.array(z.string()).optional(),
});

export const generateModule = {
    name: 'generateModule',
    config: {
        title: 'Module generator',
        description: 'Generate a bounded context module with entities, services, and repositories.',
        inputSchema: inputSchema.shape,
        outputSchema: {
            files: z.array(z.object({ path: z.string(), content: z.string() })),
        },
    },
    async execute(params: z.infer<typeof inputSchema>): Promise<{
        content: {
            type: 'text';
            text: string;
        }[];
    }> {
        const { moduleName, entities, services, repositories } = params;
        const files = [
            {
                path: `src/domain/${moduleName.toLowerCase()}/index.ts`,
                content: `// Exports for ${moduleName}`,
            },
            ...entities.map((e: any) => ({
                path: `src/domain/${moduleName.toLowerCase()}/${e.name}.ts`,
                content: `// Entity ${e.name}`,
            })),
            ...(services ?? []).map((s: any) => ({
                path: `src/domain/${moduleName.toLowerCase()}/${s}.ts`,
                content: `// Service ${s}`,
            })),
            ...(repositories ?? []).map((r: any) => ({
                path: `src/domain/${moduleName.toLowerCase()}/${r}.ts`,
                content: `// Repository ${r}`,
            })),
        ];

        return {
            content: [{ type: 'text', text: JSON.stringify({ files }) }],
        };
    },
};

export function registerGenerateModule(server: McpServer) {
    server.registerTool(
        'generateModule',
        {
            title: 'Module generator',
            description:
                'Generate a bounded context module with entities, services, and repositories.',
            inputSchema: {
                moduleName: z.string(),
                entities: z.array(
                    z.object({
                        name: z.string(),
                        aggregateRoot: z.boolean().default(false),
                        fields: z.array(FieldSchema),
                    }),
                ),
                services: z.array(z.string()).optional(),
                repositories: z.array(z.string()).optional(),
            },
            outputSchema: {
                files: z.array(z.object({ path: z.string(), content: z.string() })),
            },
        },
        async (params) => {
            const { moduleName, entities, services, repositories } = params;
            const files = [
                {
                    path: `src/domain/${moduleName.toLowerCase()}/index.ts`,
                    content: `// Exports for ${moduleName}`,
                },
                ...entities.map((e: any) => ({
                    path: `src/domain/${moduleName.toLowerCase()}/${e.name}.ts`,
                    content: `// Entity ${e.name}`,
                })),
                ...(services ?? []).map((s: any) => ({
                    path: `src/domain/${moduleName.toLowerCase()}/${s}.ts`,
                    content: `// Service ${s}`,
                })),
                ...(repositories ?? []).map((r: any) => ({
                    path: `src/domain/${moduleName.toLowerCase()}/${r}.ts`,
                    content: `// Repository ${r}`,
                })),
            ];

            return {
                content: [{ type: 'text', text: JSON.stringify({ files }) }],
            };
        },
    );
}
