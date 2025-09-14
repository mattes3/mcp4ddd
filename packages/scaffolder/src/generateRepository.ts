import Handlebars from 'handlebars';
import { z } from 'zod';

import repositoryTemplate from './templates/repository.hbs';
import testTemplate from './templates/repositoryTests.hbs';

import { fieldSchema } from './FieldSchema.js';

const getEnv = (key: string, defaultValue: string): string => process.env[key] ?? defaultValue;

const inputSchema = z.object({
    aggregateName: z
        .string()
        .describe('name of the aggregate that is to be persisted in the repository'),
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
            .describe('the method signatures for the repository interface'),
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
                'a short summary of what the repository generator produced,',
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

export const generateRepository = {
    name: 'generateRepository',
    config: {
        title: 'Repository generator',
        description: [
            'Generates a repository interface for an aggregate.',
            'It automatically contains add(), remove(), get(), and update(),',
            'so neither save() nor findById() are needed that can',
            'usually be found in existing knowledge about DDD repositories.',
        ].join(' '),
        inputSchema: inputSchema.shape,
        outputSchema: outputSchema.shape,
    },
    async execute(params: z.infer<typeof inputSchema>): Promise<{
        content: Array<{ type: 'text'; text: string }>;
        structuredContent: z.infer<typeof outputSchema>;
    }> {
        const { aggregateName, methods, boundedContext, layer } = params;
        const repositoryName = `${aggregateName}Repository`;
        const aggregateDataName = `${aggregateName}Data`;

        const allMethods = methods.concat([
            {
                name: 'add',
                parameters: [{ name: 'item', type: aggregateDataName }],
                resultType: 'void',
            },
            {
                name: 'get',
                parameters: [{ name: 'id', type: `${aggregateName}['id']` }],
                resultType: `Option<${aggregateName}>`,
            },
            {
                name: 'update',
                parameters: [
                    { name: 'id', type: `${aggregateName}['id']` },
                    { name: 'updates', type: `Partial<Omit<${aggregateDataName}, 'id'>>` },
                ],
                resultType: aggregateName,
            },
            {
                name: 'remove',
                parameters: [{ name: 'item', type: aggregateDataName }],
                resultType: 'void',
            },
        ]);

        const asyncResultType = (typeName: string) => `AsyncResult<${typeName}, TechError>`;

        const processedMethods = allMethods.map((method) => ({
            ...method,
            resultType: method.resultType ?? 'void',
            formattedParameters: method.parameters.map((p) => `${p.name}: ${p.type}`).join(', '),
            formattedResultType: asyncResultType(method.resultType ?? 'void'),
        }));

        const dataForPlaceholders = {
            aggregateName,
            repositoryName,
            methods: processedMethods,
            basicErrorTypesFrom: getEnv('BASIC_ERROR_TYPES_FROM', '@ddd-components/runtime'),
        };

        Handlebars.registerHelper('angle', (t) => `<${t}>`);

        const repositoryContent = Handlebars.compile(repositoryTemplate)(dataForPlaceholders);
        const testContent = Handlebars.compile(testTemplate)(dataForPlaceholders);

        const boundedContextsParentFolder = getEnv(
            'BOUNDED_CONTEXTS_PARENT_FOLDER',
            'packages/domainlogic',
        );

        const files = [
            {
                path: `${boundedContextsParentFolder}/${boundedContext}/${layer}/src/domainmodel/${repositoryName}.ts`,
                content: repositoryContent,
            },
            {
                path: `${boundedContextsParentFolder}/${boundedContext}/${layer}/test/${repositoryName}.spec.ts`,
                content: testContent,
            },
        ];

        const contentSummary = [
            `Prepared ${files.length} files for ${repositoryName}.`,
            `Write the files with the exact content provided.`,
        ].join(' ');

        const structuredContent = { contentSummary, files };

        return {
            content: [{ type: 'text', text: JSON.stringify(structuredContent) }],
            structuredContent,
        };
    },
};
