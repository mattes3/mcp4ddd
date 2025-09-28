import Handlebars from 'handlebars';
import { z } from 'zod';

import dynamoDBEntityTemplate from './templates/repositoryDynamoDBEntity.hbs';
import dynamoDBRepositoryTemplate from './templates/repositoryDynamoDBImpl.hbs';

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

    // Business domain attributes of the aggregate that will become attributes of the DynamoDB schema
    attributes: z
        .array(
            z.object({
                name: z.string().refine((val) => !['createdAt', 'updatedAt'].includes(val), {
                    message: 'This value is not allowed as timestamps are managed internally!',
                }),
                type: z.enum(['string', 'number', 'boolean', 'list', 'map']),
                required: z.boolean().default(true),
                default: z.any().optional(),
                readOnly: z.boolean().default(false),
                watch: z.string().optional(),
            }),
        )
        .describe(
            [
                'Business domain attributes of the aggregate to be persisted.',
                'These will also become attributes of the DynamoDB entity.',
                'createdAt and updatedAt timestamps are automatically',
                "added by this tool, using ElectroDB's built-in timestamp management.",
            ].join(' '),
        ),

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

        const processedAttributes = attributes.map((attr) => ({
            ...attr,
            isStringType: attr.type === 'string',
        }));

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
            layer,
            service,
            version,
            attributes: processedAttributes,
            indexes: defaultIndexes,
            methods: processedMethods,
            basicTypesFrom: getEnv('BASIC_TYPES_FROM', '@ddd-components/runtime'),
            basicErrorTypesFrom: getEnv('BASIC_ERROR_TYPES_FROM', '@ddd-components/runtime'),
            dynamoDBConfigurationFrom: getEnv('DYNAMODB_CONFIG_FROM', '@ddd-components/runtime'),
        };

        const entityTemplate = Handlebars.compile(dynamoDBEntityTemplate);
        const repositoryTemplateCompiled = Handlebars.compile(dynamoDBRepositoryTemplate);

        const entityContent = entityTemplate(dataForPlaceholders);
        const repositoryContent = repositoryTemplateCompiled(dataForPlaceholders);

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
        ];

        const contentSummary = [
            `Prepared ${files.length} files for DynamoDB repository ${repositoryName}.`,
            `Generated ElectroDB entity, repository implementation, and tests.`,
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
