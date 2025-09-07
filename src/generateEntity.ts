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
            files: z.array(
                z.object({
                    path: z
                        .string()
                        .describe(
                            'the path where the generated source file output should be written',
                        ),
                    content: z.string().describe('the content to write into the source file'),
                }),
            ),
        },
    },
    async execute(params: z.infer<typeof inputSchema>): Promise<{
        content: {
            type: 'text';
            text: string;
        }[];
        structuredContent: {
            files: {
                path: string;
                content: string;
            }[];
        };
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
            content: [
                { type: 'text', text: `Generated ${files.length} files for entity ${entityName}` },
            ],
            structuredContent: { files },
        };
    },
};
