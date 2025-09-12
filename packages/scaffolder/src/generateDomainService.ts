import Handlebars from 'handlebars';
import { z } from 'zod';

import { fieldSchema } from './FieldSchema.js';
import domainServiceTemplate from './templates/domainService.hbs';
import domainServiceParametersTemplate from './templates/domainServiceParameters.hbs';
import domainServiceErrorsTemplate from './templates/domainServiceErrors.hbs';
import testTemplate from './templates/domainServiceTests.hbs';

const inputSchema = z.object({
    serviceName: z.string().describe('the name of the domain service'),
    parameters: z.array(fieldSchema).describe('the parameters of the domain service'),
    returns: z.string().describe('the result type of what the domain service returns'),
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
});

const outputSchema = z.object({
    files: z.array(
        z.object({
            path: z
                .string()
                .describe('the path where the generated source file output should be written'),
            content: z.string().describe('the content to write into the source file'),
        }),
    ),
});

export const generateDomainService = {
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
        const { serviceName, injectedDependencies, parameters, returns, boundedContext, layer } =
            params;

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

        const getEnv = (key: string): string => process.env[key] ?? '@ddd-components/runtime';

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
            basicTypesFrom: getEnv('BASIC_TYPES_FROM'),
            basicErrorTypesFrom: getEnv('BASIC_ERROR_TYPES_FROM'),
        };

        const serviceContent = Handlebars.compile(domainServiceTemplate)(dataForPlaceholders);
        const serviceParametersContent = Handlebars.compile(domainServiceParametersTemplate)(
            dataForPlaceholders,
        );
        const serviceErrorsContent = Handlebars.compile(domainServiceErrorsTemplate)(
            dataForPlaceholders,
        );
        const testContent = Handlebars.compile(testTemplate)(dataForPlaceholders);

        const files = [
            {
                path: `packages/domainlogic/${boundedContext}/${layer}/src/domainmodel/${serviceErrorType}s.ts`,
                content: serviceErrorsContent,
            },
            {
                path: `packages/domainlogic/${boundedContext}/${layer}/src/domainmodel/${serviceParametersType}.ts`,
                content: serviceParametersContent,
            },
            {
                path: `packages/domainlogic/${boundedContext}/${layer}/src/domainmodel/${serviceName}.ts`,
                content: serviceContent,
            },
            {
                path: `packages/domainlogic/${boundedContext}/${layer}/test/${serviceName}.spec.ts`,
                content: testContent,
            },
        ];

        const contentSummary = [
            `Prepared ${files.length} files for the domain service "${serviceName}".`,
            `Write the files with the exact content provided.`,
        ].join(' ');

        const structuredContent = { contentSummary, files };

        return {
            content: [{ type: 'text', text: JSON.stringify(structuredContent) }],
            structuredContent,
        };
    },
};
