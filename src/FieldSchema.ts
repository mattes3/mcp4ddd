import { z } from 'zod';

export const FieldSchema = z.object({
    name: z.string(),
    type: z.string(),
    valueObject: z.boolean().default(false),
});
