import { AsyncResult, Err, Ok } from 'ts-results-es';
import { techError, type TechError } from './BasicErrorTypes.js';

/* my version of `return` or `unit` or `pure` */
export function pure<T>(t: T): AsyncResult<T, never> {
    return Ok(t).toAsyncResult();
}

/* lifts a Promise<T> into AsyncResult<T, TechError>, analogous to pure() */
export function pureAsync<T>(promise: Promise<T>): AsyncResult<T, TechError> {
    return new AsyncResult(
        promise
            .then((val) => new Ok(val))
            .catch((e) =>
                Err(
                    techError(
                        `Unexpected technical error: ${e instanceof Error ? e.message : String(e)}`,
                    ),
                ),
            ),
    );
}
