import Handlebars from 'handlebars';
import { z } from 'zod';

import repositoryTemplate from './templates/repository.hbs';
import testTemplate from './templates/repositoryTests.hbs';

import { fieldSchema } from './FieldSchema.js';
import { ScaffolderConfig } from './ScaffolderConfig.js';

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
                    .refine(
                        (val) =>
                            !['AsyncResult', 'AsyncOption'].some((substr) => val.includes(substr)),
                        {
                            message: [
                                'This return type is not allowed',
                                'as asynchronicity is handled internally.',
                                'Use a simpler data type, it will automatically',
                                'be wrapped into an asynchronous result.',
                            ].join(' '),
                        },
                    )
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
                'a short summary of what the generator produced,',
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

export const generateRepository = (env: ScaffolderConfig) => ({
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
                resultType: 'void',
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
            basicTypesFrom: env.basicTypesFrom,
            basicErrorTypesFrom: env.basicErrorTypesFrom,
        };

        Handlebars.registerHelper('angle', (t) => `<${t}>`);

        const repositoryContent = Handlebars.compile(repositoryTemplate)(dataForPlaceholders);
        const testContent = Handlebars.compile(testTemplate)(dataForPlaceholders);

        const boundedContextsParentFolder = env.boundedContextsParentFolder;

        const files = [
            {
                path: `${boundedContextsParentFolder}/${boundedContext}/src/${layer}/${repositoryName}.ts`,
                content: repositoryContent,
            },
            {
                path: `${boundedContextsParentFolder}/${boundedContext}/test/${layer}/${repositoryName}.spec.ts`,
                content: testContent,
            },
        ];

        const contentSummary = [
            `Prepared ${files.length} files for ${repositoryName}.`,
            'Assistant alert: Write the code to the named output files,',
            'exactly as the generator produced it.',
            'The generator itself does not write the code to disk.',
            'Assistant alert: Disregard compilation errors in the generated code',
            'and leave them for the human to fix.',
        ].join(' ');

        const structuredContent = { contentSummary, files };

        return {
            content: [{ type: 'text', text: JSON.stringify(structuredContent) }],
            structuredContent,
        };
    },
});
