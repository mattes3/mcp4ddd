import { z } from 'zod';

export const fieldSchema = z.object({
    name: z.string(),
    type: z.string(),
});
