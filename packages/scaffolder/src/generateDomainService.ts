import Handlebars from 'handlebars';
import { z } from 'zod';

import { fieldSchema } from './FieldSchema.js';
import domainServiceTemplate from './templates/domainService.hbs';
import domainServiceParametersTemplate from './templates/domainServiceParameters.hbs';
import domainServiceErrorsTemplate from './templates/domainServiceErrors.hbs';
import testTemplate from './templates/domainServiceTests.hbs';
import { ScaffolderConfig } from './ScaffolderConfig.js';

const inputSchema = z.object({
    serviceName: z.string().describe('the name of the domain service'),
    parameters: z.array(fieldSchema).describe('the parameters of the domain service'),
    returns: z
        .string()
        .refine((val) => !['AsyncResult', 'AsyncOption'].some((substr) => val.includes(substr)), {
            message: [
                'This return type is not allowed',
                'as asynchronicity is handled internally.',
                'Use a simpler data type, it will automatically',
                'be wrapped into an asynchronous one.',
            ].join(' '),
        })
        .describe('the result type of what the domain service returns'),
    injectedDependencies: z
        .array(fieldSchema)
        .describe(
            [
                'the one-time injected dependencies that the service needs internally',
                'but which do not belong in its parameter list',
            ].join(' '),
        ),
    boundedContext: z.string().describe('The bounded context name (e.g., "stocks", "accounts")'),
    layer: z
        .enum(['domain', 'application'])
        .default('domain')
        .describe('The layer where the component should be generated'),
    aggregateName: z
        .string()
        .optional()
        .describe('the name of the aggregate if the service uses a repository'),
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

/**
 * MCP tool for generating domain services in Domain-Driven Design.
 * Generates TypeScript code for domain services including parameters, errors, and tests.
 */
export const generateDomainService = (env: ScaffolderConfig) => ({
    name: 'generateDomainService',
    config: {
        title: 'Domain Service generator',
        description: 'Generates a domain service as a function with optional injected dependencies',
        inputSchema: inputSchema.shape,
        outputSchema: outputSchema.shape,
    },
    async execute(params: z.infer<typeof inputSchema>): Promise<{
        content: Array<{ type: 'text'; text: string }>;
        structuredContent: z.infer<typeof outputSchema>;
    }> {
        const {
            serviceName,
            injectedDependencies,
            parameters,
            returns,
            boundedContext,
            layer,
            aggregateName,
        } = params;

        const formattedParameters = parameters.map((p) => `${p.name}: ${p.type}`).join(', ');
        const formattedParametersWithAnyTypes = parameters.map((p) => `${p.name}: any`).join(', ');
        const formattedParameterNames = parameters.map((p) => p.name).join(', ');
        const formattedInjectedDependencies = injectedDependencies
            .map((p) => `${p.name}: ${p.type}`)
            .join(', ');

        const typeToZod = (type: string): string => {
            switch (type) {
                case 'string':
                    return 'string';
                case 'number':
                    return 'number';
                case 'boolean':
                    return 'boolean';
                case 'Date':
                    return 'date';
                default:
                    return 'unknown'; // or handle custom types
            }
        };

        const serviceParametersAsZodSchema = parameters
            .map((p) => `${p.name}: z.${typeToZod(p.type)}()`)
            .join(', ');

        const capitalize = (str: string): string => {
            return str.charAt(0).toUpperCase() + str.slice(1);
        };

        const serviceType = capitalize(serviceName);
        const serviceErrorType = `${serviceType}Error`;

        const serviceParametersType = `${serviceType}Params`;
        const serviceParametersSchema = `${serviceName}Schema`;
        const validatedParametersType = `Branded<z.infer<typeof ${serviceParametersSchema}>, 'validated'>`;
        const wrappedServiceParametersType = `Result<${serviceParametersType}, ${serviceErrorType}>`;

        const wrappedResultType = `Result<${returns ?? 'void'}, ${serviceErrorType}>`;
        const asyncResultType = `Async${wrappedResultType}`;
        const promiseOfResultType = `Promise<${wrappedResultType}>`;

        const dataForPlaceholders = {
            serviceName,
            formattedParameters,
            formattedParametersWithAnyTypes,
            formattedParameterNames,
            formattedInjectedDependencies,
            returns,
            serviceType,
            serviceParametersSchema,
            serviceParametersAsZodSchema,
            serviceParametersType,
            validatedParametersType,
            wrappedServiceParametersType,
            serviceErrorType,
            wrappedResultType,
            asyncResultType,
            promiseOfResultType,
            aggregateName: aggregateName || 'Aggregate',
            repositoryName: aggregateName ? `${aggregateName}Repository` : 'Repository',
            aggregateNameLower: (aggregateName || 'Aggregate').toLowerCase(),
            idField: parameters[0]?.name || 'id',
            basicTypesFrom: env.basicTypesFrom,
            basicErrorTypesFrom: env.basicErrorTypesFrom,
        };

        const serviceContent = Handlebars.compile(domainServiceTemplate)(dataForPlaceholders);
        const serviceParametersContent = Handlebars.compile(domainServiceParametersTemplate)(
            dataForPlaceholders,
        );
        const serviceErrorsContent = Handlebars.compile(domainServiceErrorsTemplate)(
            dataForPlaceholders,
        );
        const testContent = Handlebars.compile(testTemplate)(dataForPlaceholders);

        const boundedContextsParentFolder = env.boundedContextsParentFolder;

        const files = [
            {
                path: `${boundedContextsParentFolder}/${boundedContext}/src/${layer}/${serviceErrorType}s.ts`,
                content: serviceErrorsContent,
            },
            {
                path: `${boundedContextsParentFolder}/${boundedContext}/src/${layer}/${serviceParametersType}.ts`,
                content: serviceParametersContent,
            },
            {
                path: `${boundedContextsParentFolder}/${boundedContext}/src/${layer}/${serviceName}.ts`,
                content: serviceContent,
            },
            {
                path: `${boundedContextsParentFolder}/${boundedContext}/test/${layer}/${serviceName}.spec.ts`,
                content: testContent,
            },
        ];

        const contentSummary = [
            `Prepared ${files.length} files for the domain service "${serviceName}".`,
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
