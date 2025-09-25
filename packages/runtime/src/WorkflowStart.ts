import { Ok, Err, type AsyncResult, type Result } from 'ts-results-es';
import { techError, type TechError } from './BasicErrorTypes.js';

/* my version of `return` or `unit` or `pure` */
export function beginWith<T>(t: T): AsyncResult<T, never> {
    return Ok(t).toAsyncResult();
}

/**
 * Wraps an async function to return a Result type, converting exceptions to TechError.
 * This allows async operations to be composed using the Result monad pattern.
 * @param fn - The async function to wrap, should return a Promise<T>
 * @returns A Promise of Result<T, TechError> where success is Ok(value) and failure is Err(TechError)
 */
export function safeAsync<T>(fn: () => Promise<T>): Promise<Result<T, TechError>> {
    return fn()
        .then((t) => Ok(t))
        .catch((err) => Err(techError(`technical failure: ${err}`)));
}
