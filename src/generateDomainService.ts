import { z } from 'zod';

const inputSchema = z.object({
    serviceName: z.string(),
    operations: z.array(
        z.object({
            name: z.string(),
            parameters: z.array(z.string()),
            returns: z.string(),
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
            files: z.array(z.object({ path: z.string(), content: z.string() })),
        },
    },
    async execute(params: z.infer<typeof inputSchema>): Promise<{
        content: {
            type: 'text';
            text: string;
        }[];
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
            content: [{ type: 'text', text: JSON.stringify({ files }) }],
        };
    },
};
