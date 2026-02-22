import Handlebars from 'handlebars';
import { z } from 'zod';

import postgresTypesTemplate from './templates/repositoryPostgreSQLTypes.hbs';
import postgresRepositoryTemplate from './templates/repositoryPostgreSQLImpl.hbs';

import { fieldSchema } from './FieldSchema.js';
import { ScaffolderConfig } from './ScaffolderConfig.js';

const inputSchema = z.object({
    // Required parameters
    boundedContext: z.string().describe('The bounded context name (e.g., "stocks", "accounts")'),
    aggregateName: z
        .string()
        .describe('Name of the aggregate that is to be persisted in the repository'),

    // Optional parameters with smart defaults
    tableName: z
        .string()
        .optional()
        .describe('PostgreSQL table name (defaults to aggregateName in snake_case)'),

    // Business domain attributes
    attributes: z
        .array(
            z.object({
                name: z.string(),
                type: z.enum(['string', 'number', 'boolean', 'date']),
                required: z.boolean().default(true),
            }),
        )
        .describe('Business domain attributes of the aggregate'),

    // Database schema
    primaryKey: z.string().default('id').describe('Primary key field name'),

    // Repository methods
    methods: z
        .array(
            z.object({
                name: z.string().describe('the name of the method'),
                parameters: z
                    .array(fieldSchema)
                    .describe('the names and types of the parameters of the method'),
                resultType: z
                    .string()
                    .optional()
                    .describe('the optional name of the result type of the method'),
            }),
        )
        .optional()
        .describe('Custom repository methods'),
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

export const generatePostgreSQLRepository = (env: ScaffolderConfig) => ({
    name: 'generatePostgreSQLRepository',

    config: {
        title: 'PostgreSQL Repository generator',
        description:
            'Generates a PostgreSQL repository implementation using Kysely for an aggregate.',
        inputSchema: inputSchema.shape,
        outputSchema: outputSchema.shape,
    },

    async execute(params: z.infer<typeof inputSchema>): Promise<{
        content: Array<{ type: 'text'; text: string }>;
        structuredContent: z.infer<typeof outputSchema>;
    }> {
        const {
            boundedContext,
            aggregateName,
            tableName,
            attributes = [],
            primaryKey = 'id',
            methods = [],
        } = params;

        const repositoryName = `${aggregateName}Repository`;
        const typesName = `${aggregateName}Types`;
        // Convert PascalCase aggregate name to snake_case table name, e.g. "OrderItem" → "order_item"
        const toSnakeCase = (s: string) =>
            s
                .replace(/([A-Z])/g, '_$1')
                .toLowerCase()
                .replace(/^_/, '');
        const finalTableName = tableName || toSnakeCase(aggregateName);

        // Map attribute types to TypeScript types for Kysely table interface columns.
        // `date` values are stored as ISO strings in PostgreSQL (text/timestamptz columns).
        const processedAttributes = attributes
            .filter((attr) => !['createdAt', 'updatedAt'].includes(attr.name))
            .map((attr) => {
                let tsType: string;

                switch (attr.type) {
                    case 'string':
                        tsType = 'string';
                        break;
                    case 'number':
                        tsType = 'number';
                        break;
                    case 'boolean':
                        tsType = 'boolean';
                        break;

                    // You can specify a different type for each operation (select, insert and
                    // update) using the `ColumnType<SelectType, InsertType, UpdateType>`
                    // wrapper. Here we define a column that is selected as
                    // a `Date`, and provided as a `Date | string` in inserts and updates.
                    case 'date':
                        tsType = 'ColumnType<Date, Date | string, Date | string>';
                        break;
                }

                return { ...attr, tsType };
            });

        // Process methods
        const processedMethods = methods.map((method) => ({
            ...method,
            resultType: method.resultType ?? 'void',
            formattedParameters: method.parameters.map((p) => `${p.name}: ${p.type}`).join(', '),
            formattedParameterNames: method.parameters.map((p) => p.name).join(', '),
            parametersWithIndex: method.parameters.map((p, index) => ({
                ...p,
                isFirst: index === 0,
                isSecond: index === 1,
            })),
        }));

        const dataForPlaceholders = {
            boundedContext,
            aggregateName,
            repositoryName,
            typesName,
            tableName: finalTableName,
            attributes: processedAttributes,
            primaryKey,
            tsTypeDate: 'Generated<Date>',
            tsTypeSelectable: `Selectable<${aggregateName}Table>`,
            methods: processedMethods,
            basicTypesFrom: env.basicTypesFrom,
            basicErrorTypesFrom: env.basicErrorTypesFrom,
        };

        // Compile templates
        const typesTemplate = Handlebars.compile(postgresTypesTemplate);
        const repositoryTemplate = Handlebars.compile(postgresRepositoryTemplate);

        const typesContent = typesTemplate(dataForPlaceholders);
        const repositoryContent = repositoryTemplate(dataForPlaceholders);

        const boundedContextsParentFolder = env.boundedContextsParentFolder;

        const files = [
            {
                path: `${boundedContextsParentFolder}/${boundedContext}/src/adapters/persistence/${typesName}.ts`,
                content: typesContent,
            },
            {
                path: `${boundedContextsParentFolder}/${boundedContext}/src/adapters/persistence/${repositoryName}Impl.ts`,
                content: repositoryContent,
            },
        ];

        const contentSummary = [
            `Prepared ${files.length} files for PostgreSQL repository ${repositoryName}.`,
            `Generated Kysely table types and repository implementation.`,
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
