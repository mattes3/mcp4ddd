import Handlebars from 'handlebars';
import { z } from 'zod';

import repositoryTemplate from './templates/repository.hbs';
import repositoryImplTemplate from './templates/repositoryImpl.hbs';
import testTemplate from './templates/repositoryTests.hbs';

import { fieldSchema } from './FieldSchema.js';

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
    defaultAddAndRemoveMethods: z
        .boolean()
        .default(true)
        .describe(
            [
                'indicates whether the generator shall create',
                'default add() and remove() methods',
                'for this repository interface',
            ].join(' '),
        ),
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
        description: 'Generate a repository interface for an aggregate.',
        inputSchema: inputSchema.shape,
        outputSchema: outputSchema.shape,
    },
    async execute(params: z.infer<typeof inputSchema>): Promise<{
        content: Array<{ type: 'text'; text: string }>;
        structuredContent: z.infer<typeof outputSchema>;
    }> {
        const { aggregateName, methods, defaultAddAndRemoveMethods } = params;
        const repositoryName = `${aggregateName}Repository`;

        const allMethods = [...methods];

        if (defaultAddAndRemoveMethods) {
            allMethods.unshift({
                name: 'remove',
                parameters: [{ type: aggregateName, name: 'item' }],
                resultType: 'void',
            });
            allMethods.unshift({
                name: 'add',
                parameters: [{ type: aggregateName, name: 'item' }],
                resultType: 'void',
            });
        }

        const processedMethods = allMethods.map((method) => ({
            ...method,
            formattedParameters: method.parameters.map((p) => `${p.name}: ${p.type}`).join(', '),
        }));

        const dataForPlaceholders = { aggregateName, repositoryName, methods: processedMethods };

        Handlebars.registerHelper('angle', (t) => `<${t}>`);

        const repositoryContent = Handlebars.compile(repositoryTemplate)(dataForPlaceholders);
        const repositoryImplContent =
            Handlebars.compile(repositoryImplTemplate)(dataForPlaceholders);
        const testContent = Handlebars.compile(testTemplate)(dataForPlaceholders);

        const files = [
            {
                path: `src/domain/${aggregateName.toLowerCase()}/${repositoryName}.ts`,
                content: repositoryContent,
            },
            {
                path: `src/adapter/persistence/${aggregateName.toLowerCase()}/${repositoryName}Impl.ts`,
                content: repositoryImplContent,
            },
            {
                path: `test/${aggregateName.toLowerCase()}/${repositoryName}.spec.ts`,
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
