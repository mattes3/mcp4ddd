import Handlebars from 'handlebars';
import { z } from 'zod';

import entityTemplate from './templates/entity.hbs';
import testTemplate from './templates/entityTests.hbs';

import { fieldSchema } from './FieldSchema.js';

const inputSchema = z.object({
    entityName: z.string().describe('Name of the entity'),
    aggregateRoot: z.boolean().default(false).describe('is this an aggregate root, true/false'),
    attributes: z.array(fieldSchema).describe('the fields inside the entity'),
    methods: z.array(
        z
            .object({
                name: z.string().describe('the name of the method'),
                parameters: z
                    .array(fieldSchema)
                    .describe('the names and types of the parameters of the method'),
                resultType: z
                    .string()
                    .optional()
                    .describe('the optional name of the result type of the method'),
            })
            .describe('the method signatures of the entity'),
    ),
});

const outputSchema = z.object({
    contentSummary: z
        .string()
        .describe(
            [
                'a short summary of what the entity generator produced,',
                'with an instruction for the AI assistant about how to proceed',
            ].join(' '),
        ),
    files: z.array(
        z.object({
            path: z
                .string()
                .describe('the path where the generated source file output should be written'),
            content: z.string().describe('the content to write into the source file'),
        }),
    ),
});

export const generateEntity = {
    name: 'generateEntity',
    config: {
        title: 'Entity generator',
        description: 'Generate a DDD entity, optionally as an aggregate root.',
        inputSchema: inputSchema.shape,
        outputSchema: outputSchema.shape,
    },
    async execute(params: z.infer<typeof inputSchema>): Promise<{
        content: Array<{ type: 'text'; text: string }>;
        structuredContent: z.infer<typeof outputSchema>;
    }> {
        const { entityName, aggregateRoot, attributes, methods } = params;

        const processedMethods = methods.map((method) => ({
            ...method,
            resultType: method.resultType ?? 'void',
            formattedParameters: method.parameters.map((p) => `${p.name}: ${p.type}`).join(', '),
        }));

        const dataForPlaceholders = {
            entityName,
            aggregateRoot,
            attributes,
            methods: processedMethods,
        };
        const entityContent = Handlebars.compile(entityTemplate)(dataForPlaceholders);
        const testContent = Handlebars.compile(testTemplate)(dataForPlaceholders);

        const files = [
            {
                path: `src/domain/${entityName.toLowerCase()}/${entityName}.ts`,
                content: entityContent,
            },
            {
                path: `test/${entityName.toLowerCase()}/${entityName}.spec.ts`,
                content: testContent,
            },
        ];

        const contentSummary = [
            `Prepared ${files.length} files for entity ${entityName}.`,
            `Write the files with the exact content provided.`,
        ].join(' ');

        const structuredContent = { contentSummary, files };

        return {
            content: [{ type: 'text', text: JSON.stringify(structuredContent) }],
            structuredContent,
        };
    },
};
