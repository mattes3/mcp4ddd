import { z } from 'zod';

const inputSchema = z.object({
    aggregateName: z.string(),
    methods: z.array(z.string()),
    persistence: z.enum(['inMemory', 'typeorm', 'prisma']).default('inMemory'),
});

export const generateRepository = {
    name: 'generateRepository',
    config: {
        title: 'Repository generator',
        description: 'Generate a repository interface for an aggregate.',
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
        const { aggregateName, methods, persistence } = params;
        const files = [
            {
                path: `src/domain/${aggregateName.toLowerCase()}s/${aggregateName}Repository.ts`,
                content: `// Repository interface for ${aggregateName}\nexport interface ${aggregateName}Repository { ${methods.join('; ')} }`,
            },
            {
                path: `src/infrastructure/${aggregateName.toLowerCase()}s/${persistence}Repository.ts`,
                content: `// ${persistence} implementation for ${aggregateName}Repository`,
            },
        ];

        return {
            content: [{ type: 'text', text: JSON.stringify({ files }) }],
        };
    },
};
