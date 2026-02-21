import { z } from 'zod';

// Configuration settings for this plugin
export const scaffolderConfigSchema = z.object({
    basicTypesFrom: z.string().optional().default('@ddd-components/runtime'),
    basicErrorTypesFrom: z.string().optional().default('@ddd-components/runtime'),
    boundedContextsParentFolder: z.string().optional().default('packages'),
    dynamoDBConfigurationFrom: z.string().optional().default('@ddd-components/runtime'),
});

export type ScaffolderConfig = z.infer<typeof scaffolderConfigSchema>;

export const scaffolderMetadata = {
    name: 'ddd-scaffolder',
    version: '1.0.0',
};
