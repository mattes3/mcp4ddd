import { z } from 'zod';

import { FieldSchema } from './FieldSchema.js';

const inputSchema = z.object({
    entityName: z.string().describe('Name of the entity'),
    aggregateRoot: z.boolean().default(false).describe('is this an aggregate root, true/false'),
    fields: z.array(FieldSchema).describe('the fields inside the entity'),
});

export const generateEntity = {
    name: 'generateEntity',
    config: {
        title: 'Entity generator',
        description: 'Generate a DDD entity, optionally as an aggregate root.',
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
};
