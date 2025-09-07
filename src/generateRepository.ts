import { z } from 'zod';

const inputSchema = z.object({
    aggregateName: z
        .string()
        .describe('name of the aggregate that is to be persisted in the repository'),
    methods: z.array(z.string()).describe('names of methods in the repository interface'),
    persistence: z
        .enum(['inMemory', 'typeorm', 'prisma'])
        .default('inMemory')
        .describe('technology for the repository'),
});

export const generateRepository = {
    name: 'generateRepository',
    config: {
        title: 'Repository generator',
        description: 'Generate a repository interface for an aggregate.',
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
            content: [
                {
                    type: 'text',
                    text: `Generated ${files.length} files for repository ${aggregateName}`,
                },
            ],
            structuredContent: { files },
        };
    },
};
