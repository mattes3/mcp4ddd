import { type ZodError } from 'zod';

export type SingleError<CODE> = { kind: 'single'; code: CODE; error: string; errors: string[] };
export type ValidationError = { kind: 'validation'; errors: string[] };
export type TechError = SingleError<'tech-error'>;

export function singleError<CODE>(code: CODE, message: string): SingleError<CODE> {
    return { kind: 'single', code, error: message, errors: [message] };
}

export function validationError(messages: string[]): ValidationError {
    return { kind: 'validation', errors: messages };
}

export const zodValidationError = (error: ZodError) =>
    validationError(error.errors.map((issue) => issue.message));

export const techError: (message: string) => TechError = (message) =>
    singleError('tech-error', message);
