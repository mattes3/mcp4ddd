import Handlebars from 'handlebars';
import { z } from 'zod';

import dynamoDBEntityTemplate from './templates/repositoryDynamoDBEntity.hbs';
import dynamoDBRepositoryTemplate from './templates/repositoryDynamoDBImpl.hbs';
import dynamoDBTestTemplate from './templates/repositoryDynamoDBTests.hbs';

import { fieldSchema } from './FieldSchema.js';

const getEnv = (key: string, defaultValue: string): string => process.env[key] ?? defaultValue;

const inputSchema = z.object({
    // Required parameters (minimal for usability)
    boundedContext: z.string().describe('The bounded context name (e.g., "stocks", "accounts")'),
    aggregateName: z
        .string()
        .describe('Name of the aggregate that is to be persisted in the repository'),

    // Optional parameters with smart defaults
    layer: z
        .enum(['domain', 'application'])
        .default('domain')
        .describe('The layer where the component should be generated'),
    service: z.string().optional().describe('ElectroDB service name (defaults to boundedContext)'),
    version: z.string().default('1').describe('ElectroDB entity version'),

    // DynamoDB schema (optional with defaults)
    attributes: z
        .array(
            z.object({
                name: z.string(),
                type: z.enum(['string', 'number', 'boolean', 'list', 'map']),
                required: z.boolean().default(true),
                default: z.any().optional(),
                readOnly: z.boolean().default(false),
                watch: z.string().optional(),
            }),
        )
        .optional()
        .describe('DynamoDB item attributes'),

    indexes: z
        .object({
            primary: z.object({
                pk: z.object({
                    field: z.string(),
                    composite: z.array(z.string()).optional(),
                }),
                sk: z
                    .object({
                        field: z.string(),
                        composite: z.array(z.string()).optional(),
                    })
                    .optional(),
            }),
            globalSecondaryIndexes: z
                .array(
                    z.object({
                        name: z.string(),
                        pk: z.object({
                            field: z.string(),
                            composite: z.array(z.string()).optional(),
                        }),
                        sk: z
                            .object({
                                field: z.string(),
                                composite: z.array(z.string()).optional(),
                            })
                            .optional(),
                    }),
                )
                .optional(),
        })
        .optional()
        .describe('DynamoDB key schema and indexes'),

    // Repository methods (optional with defaults)
    methods: z
        .array(
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
        )
        .optional()
        .describe('Custom repository methods'),
});

const outputSchema = z.object({
    contentSummary: z
        .string()
        .describe('A short summary of what the DynamoDB repository generator produced'),
    files: z.array(
        z.object({
            path: z
                .string()
                .describe('the path where the generated source file output should be written'),
            content: z.string().describe('the content to write into the source file'),
        }),
    ),
});

export const generateDynamoDBRepository = {
    name: 'generateDynamoDBRepository',

    config: {
        title: 'DynamoDB Repository generator',
        description:
            'Generates a DynamoDB repository implementation using ElectroDB for an aggregate.',
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
            layer = 'domain',
            service = boundedContext,
            version = '1',
            attributes = [],
            indexes,
            methods = [],
        } = params;

        const repositoryName = `${aggregateName}Repository`;

        // Provide default indexes if none specified
        const defaultIndexes = indexes || {
            primary: {
                pk: { field: 'id', composite: [] },
            },
        };

        // Provide default methods if none specified
        const defaultMethods = methods.concat([
            {
                name: 'create',
                parameters: [{ name: 'item', type: aggregateName }],
                resultType: 'void',
            },
            {
                name: 'getById',
                parameters: [{ name: 'id', type: 'string' }],
                resultType: aggregateName,
            },
            {
                name: 'update',
                parameters: [
                    { name: 'id', type: 'string' },
                    { name: 'updates', type: `Partial<${aggregateName}>` },
                ],
                resultType: 'void',
            },
            {
                name: 'delete',
                parameters: [{ name: 'id', type: 'string' }],
                resultType: 'void',
            },
        ]);

        const processedAttributes = attributes.map((attr) => ({
            ...attr,
            isStringType: attr.type === 'string',
        }));

        const processedMethods = defaultMethods.map((method) => ({
            ...method,
            resultType: method.resultType ?? 'void',
            formattedParameters: method.parameters.map((p) => `${p.name}: ${p.type}`).join(', '),
            formattedParameterNames: method.parameters.map((p) => p.name).join(', '),
            isCreate: method.name === 'create',
            isGetById: method.name === 'getById',
            isUpdate: method.name === 'update',
            isDelete: method.name === 'delete',
            isCustom: !['create', 'getById', 'update', 'delete'].includes(method.name),
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
            layer,
            service,
            version,
            attributes: processedAttributes,
            indexes: defaultIndexes,
            methods: processedMethods,
            dynamoDBConfigurationFrom: getEnv('DYNAMODB_CONFIG_FROM', '@ddd-components/runtime'),
        };

        const entityTemplate = Handlebars.compile(dynamoDBEntityTemplate);
        const repositoryTemplateCompiled = Handlebars.compile(dynamoDBRepositoryTemplate);
        const testTemplateCompiled = Handlebars.compile(dynamoDBTestTemplate);

        const entityContent = entityTemplate(dataForPlaceholders);
        const repositoryContent = repositoryTemplateCompiled(dataForPlaceholders);
        const testContent = testTemplateCompiled(dataForPlaceholders);

        const boundedContextsParentFolder = getEnv(
            'BOUNDED_CONTEXTS_PARENT_FOLDER',
            'packages/domainlogic',
        );

        const files = [
            {
                path: `${boundedContextsParentFolder}/${boundedContext}/${layer}/src/adapter/persistence/${aggregateName}Entity.ts`,
                content: entityContent,
            },
            {
                path: `${boundedContextsParentFolder}/${boundedContext}/${layer}/src/adapter/persistence/${repositoryName}Impl.ts`,
                content: repositoryContent,
            },
            {
                path: `${boundedContextsParentFolder}/${boundedContext}/${layer}/test/${repositoryName}Impl.spec.ts`,
                content: testContent,
            },
        ];

        const contentSummary = [
            `Prepared ${files.length} files for DynamoDB repository ${repositoryName}.`,
            `Generated ElectroDB entity, repository implementation, and tests.`,
            `Write the files with the exact content provided.`,
        ].join(' ');

        const structuredContent = { contentSummary, files };

        return {
            content: [{ type: 'text', text: JSON.stringify(structuredContent) }],
            structuredContent,
        };
    },
};
