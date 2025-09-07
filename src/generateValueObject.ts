import { z } from 'zod';

import { FieldSchema } from './FieldSchema.js';

const inputSchema = z.object({
    valueObjectName: z.string(),
    fields: z.array(FieldSchema),
    validations: z
        .array(z.string())
        .optional()
        .describe('optional validation rules for the fields in the value object'),
});

export const generateValueObject = {
    name: 'generateValueObject',
    config: {
        title: 'Value Object generator',
        description: 'Generate a DDD value object with validations and immutability.',
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
        const { valueObjectName, fields, validations } = params;

        const files = [
            {
                path: `src/domain/shared/${valueObjectName}.ts`,
                content: `// Value Object ${valueObjectName}\n// fields: ${JSON.stringify(fields)}\n// validations: ${validations?.join(', ')}`,
            },
        ];

        return {
            content: [
                {
                    type: 'text',
                    text: `Generated ${files.length} files for value object ${valueObjectName}`,
                },
            ],
            structuredContent: { files },
        };
    },
};
