import Handlebars from 'handlebars';
import { z } from 'zod';

import valueObjectTemplate from './templates/valueObject.hbs';
import testTemplate from './templates/valueObjectTests.hbs';

import { fieldSchema } from './FieldSchema.js';

const getEnv = (key: string, defaultValue: string): string => process.env[key] ?? defaultValue;

const inputSchema = z.object({
    valueObjectName: z.string().describe('Name of the value object'),
    attributes: z.array(fieldSchema).describe('the attributes inside the value object'),
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
            .describe('the method signatures of the value object'),
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

export const generateValueObject = {
    name: 'generateValueObject',
    config: {
        title: 'Value object generator',
        description: 'Generates a DDD value object.',
        inputSchema: inputSchema.shape,
        outputSchema: outputSchema.shape,
    },
    async execute(params: z.infer<typeof inputSchema>): Promise<{
        content: Array<{ type: 'text'; text: string }>;
        structuredContent: z.infer<typeof outputSchema>;
    }> {
        const { valueObjectName, attributes, methods, boundedContext, layer } = params;

        const processedMethods = methods.map((method) => ({
            ...method,
            resultType: method.resultType ?? 'void',
            formattedParameters: method.parameters.map((p) => `${p.name}: ${p.type}`).join(', '),
        }));

        const dataForPlaceholders = {
            valueObjectName,
            attributes,
            methods: processedMethods,
        };
        const valueObjectContent = Handlebars.compile(valueObjectTemplate)(dataForPlaceholders);
        const testContent = Handlebars.compile(testTemplate)(dataForPlaceholders);

        const boundedContextsParentFolder = getEnv(
            'BOUNDED_CONTEXTS_PARENT_FOLDER',
            'packages/domainlogic',
        );

        const files = [
            {
                path: `${boundedContextsParentFolder}/${boundedContext}/${layer}/src/domainmodel/${valueObjectName}.ts`,
                content: valueObjectContent,
            },
            {
                path: `${boundedContextsParentFolder}/${boundedContext}/${layer}/test/${valueObjectName}.spec.ts`,
                content: testContent,
            },
        ];

        const contentSummary = [
            `Prepared ${files.length} files for value object ${valueObjectName}.`,
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
};
