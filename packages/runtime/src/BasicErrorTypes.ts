import { type ZodError } from 'zod';

export type SingleError<CODE> = { kind: 'single'; code: CODE; error: string; errors: string[] };
export type ValidationError = { kind: 'validation'; errors: string[] };
export type TechError = SingleError<'tech-error'>;

/**
 * Creates a single error object with the specified code and message.
 * @param code - The error code.
 * @param message - The error message.
 * @returns A SingleError object.
 */
export function singleError<CODE>(code: CODE, message: string): SingleError<CODE> {
    return { kind: 'single', code, error: message, errors: [message] };
}

/**
 * Creates a validation error object with multiple error messages.
 * @param messages - Array of error messages.
 * @returns A ValidationError object.
 */
export function validationError(messages: string[]): ValidationError {
    return { kind: 'validation', errors: messages };
}

/**
 * Converts a ZodError to a ValidationError.
 * @param error - The ZodError to convert.
 * @returns A ValidationError object.
 */
export const zodValidationError = (error: ZodError) =>
    validationError(error.errors.map((issue) => issue.message));

/**
 * Creates a technical error object with the given message.
 * @param message - The error message.
 * @returns A TechError object.
 */
export const techError: (message: string) => TechError = (message) =>
    singleError('tech-error', message);
