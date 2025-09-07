import { z } from 'zod';

const inputSchema = z.object({
    serviceName: z.string(),
    operations: z.array(
        z.object({
            name: z.string().describe('the name of the domain service'),
            parameters: z.array(z.string()).describe('the parameters of the domain service'),
            returns: z.string().describe('the result that the domain service returns'),
        }),
    ),
});

export const generateDomainService = {
    name: 'generateDomainService',
    config: {
        title: 'Domain Service generator',
        description: 'Generate a domain service with operations.',
        inputSchema: inputSchema.shape,
        outputSchema: {
            files: z.array(
                z.object({
                    path: z
                        .string()
                        .describe(
                            'the path where the generated source file output should be written',
                        ),
                    content: z.string().describe('the content to write into the source file'),
                }),
            ),
        },
    },
    async execute(params: z.infer<typeof inputSchema>): Promise<{
        content: {
            type: 'text';
            text: string;
        }[];
        structuredContent: {
            files: {
                path: string;
                content: string;
            }[];
        };
    }> {
        const { serviceName, operations } = params;

        const files = [
            {
                path: `src/domain/${serviceName.replace(/Service$/, '').toLowerCase()}s/${serviceName}.ts`,
                content: `// Service ${serviceName}\nexport class ${serviceName} { ${operations
                    .map((op) => `${op.name}(${op.parameters.join(', ')}): ${op.returns} {}`)
                    .join('\n')} }`,
            },
        ];

        return {
            content: [
                {
                    type: 'text',
                    text: `Generated ${files.length} files for domain service ${serviceName}`,
                },
            ],
            structuredContent: { files },
        };
    },
};
