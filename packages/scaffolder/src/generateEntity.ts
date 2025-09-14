import Handlebars from 'handlebars';
import { z } from 'zod';

import entityTemplate from './templates/entity.hbs';
import testTemplate from './templates/entityTests.hbs';

import { fieldSchema } from './FieldSchema.js';

const getEnv = (key: string, defaultValue: string): string => process.env[key] ?? defaultValue;

const inputSchema = z.object({
    entityName: z.string().describe('Name of the entity'),
    aggregateRoot: z.boolean().default(false).describe('is this an aggregate root, true/false'),
    attributes: z
        .array(
            z.object({
                name: z.string().refine((val) => !['createdAt', 'updatedAt'].includes(val), {
                    message: 'This value is not allowed as timestamps are managed internally!',
                }),
                type: z.string(),
            }),
        )
        .describe('the fields inside the entity'),
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
    boundedContext: z.string().describe('The bounded context name (e.g., "stocks", "accounts")'),
    layer: z
        .enum(['domain', 'application'])
        .default('domain')
        .describe('The layer where the component should be generated'),
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
        description: 'Generates a DDD entity, optionally as an aggregate root.',
        inputSchema: inputSchema.shape,
        outputSchema: outputSchema.shape,
    },
    async execute(params: z.infer<typeof inputSchema>): Promise<{
        content: Array<{ type: 'text'; text: string }>;
        structuredContent: z.infer<typeof outputSchema>;
    }> {
        const { entityName, aggregateRoot, attributes, methods, boundedContext, layer } = params;

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

        const boundedContextsParentFolder = getEnv(
            'BOUNDED_CONTEXTS_PARENT_FOLDER',
            'packages/domainlogic',
        );

        const files = [
            {
                path: `${boundedContextsParentFolder}/${boundedContext}/${layer}/src/domainmodel/${entityName}.ts`,
                content: entityContent,
            },
            {
                path: `${boundedContextsParentFolder}/${boundedContext}/${layer}/test/${entityName}.spec.ts`,
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
