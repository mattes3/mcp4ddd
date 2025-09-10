import Handlebars from 'handlebars';
import { z } from 'zod';

import { fieldSchema } from './FieldSchema.js';
import domainServiceTemplate from './templates/domainService.hbs';
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
        description: 'Generate a domain service as a function with optional injected dependencies',
        inputSchema: inputSchema.shape,
        outputSchema: outputSchema.shape,
    },
    async execute(params: z.infer<typeof inputSchema>): Promise<{
        content: Array<{ type: 'text'; text: string }>;
        structuredContent: z.infer<typeof outputSchema>;
    }> {
        const { serviceName, injectedDependencies, parameters, returns } = params;

        const formattedParameters = parameters.map((p) => `${p.name}: ${p.type}`).join(', ');
        const formattedInjectedDependencies = injectedDependencies
            .map((p) => `${p.name}: ${p.type}`)
            .join(', ');

        const capitalize = (str: string): string => {
            return str.charAt(0).toUpperCase() + str.slice(1);
        };

        const serviceErrorType = capitalize(`${serviceName}Error`);
        const wrappedResultType = `Result<${returns ?? 'void'}, ${serviceErrorType}>`;
        const asyncResultType = `Async${wrappedResultType}`;
        const promiseOfResultType = `Promise<${wrappedResultType}>`;

        const dataForPlaceholders = {
            serviceName,
            formattedParameters,
            formattedInjectedDependencies,
            returns,
            serviceErrorType,
            wrappedResultType,
            asyncResultType,
            promiseOfResultType,
        };

        const serviceContent = Handlebars.compile(domainServiceTemplate)(dataForPlaceholders);
        const testContent = Handlebars.compile(testTemplate)(dataForPlaceholders);

        const files = [
            {
                path: `src/domain/${serviceName.toLowerCase().replace('service', '')}/${serviceName}.ts`,
                content: serviceContent,
            },
            {
                path: `test/${serviceName.toLowerCase().replace('service', '')}/${serviceName}.spec.ts`,
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
