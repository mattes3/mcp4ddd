import { Ok, type AsyncResult } from 'ts-results-es';

/* my version of `return` or `unit` or `pure` */
export function beginWith<T>(t: T): AsyncResult<T, never> {
    return Ok(t).toAsyncResult();
}
