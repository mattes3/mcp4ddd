import { AsyncResult, Err } from 'ts-results-es';
import { techError, type TechError } from './BasicErrorTypes.js';

/**
 * Represents a higher-order function that executes work within a Unit of Work
 * (i.e. a transactional boundary).
 *
 * The provided `work` callback receives a transaction-scoped repository and
 * must return an {@link AsyncResult}. The Unit of Work implementation is
 * responsible for:
 *
 * - Opening a transaction before invoking `work`
 * - Committing the transaction if `work` resolves to `Ok`
 * - Rolling back the transaction if `work` resolves to `Err`
 * - Propagating the resulting {@link AsyncResult} unchanged
 *
 * The repository instance MUST NOT escape the callback scope.
 *
 * @typeParam R - The type of the transaction-scoped repository.
 * @typeParam T - The successful result type returned by the work function.
 * @typeParam E - The error result type returned by the work function.
 */
export type WithUnitOfWork<R> = <T, E>(
    work: (repository: R) => AsyncResult<T, E | TechError>,
) => AsyncResult<T, E | TechError>;

/**
 * Creates a Unit of Work executor bound to a specific database instance.
 *
 * The returned function executes the provided `work` callback inside a
 * database transaction. A transaction is started before invoking `work`,
 * and a transaction-scoped repository is created using
 * `createRepositoryClosure`.
 *
 * Transaction semantics:
 *
 * - If `work` returns `Ok`, the transaction is committed.
 * - If `work` returns `Err`, the transaction is rolled back.
 * - The original {@link AsyncResult} value is propagated unchanged.
 *
 * The repository instance is scoped to the transaction and must not escape
 * the `work` callback. The functions inside the repository MUST NOT throw
 * but return Err().
 *
 * @typeParam TRANSACTION - The transaction type used by the concrete database.
 * @typeParam REPOSITORY - The repository type created for the transaction.
 *
 * @param startTransaction - Factory function that starts a transaction
 * @param createRepositoryClosure - Factory function that creates a
 * transaction-scoped repository from a Kysely `Transaction`.
 *
 * @returns A {@link WithUnitOfWork} function that executes work within a
 * transactional boundary.
 */
export function withUnitOfWork<
    TRANSACTION extends {
        commit: () => Promise<void>;
        rollback: () => Promise<void>;
    },
    REPOSITORY,
>(
    startTransaction: () => Promise<TRANSACTION>,
    createRepositoryClosure: (trx: TRANSACTION) => REPOSITORY,
): WithUnitOfWork<REPOSITORY> {
    return (work) =>
        new AsyncResult(
            startTransaction()
                .then((trx) =>
                    work(createRepositoryClosure(trx))
                        .map((val) => trx.commit().then(() => val))
                        .mapErr((err) => trx.rollback().then(() => err))
                        .then((res) => res),
                )
                .catch((error) =>
                    Err(
                        techError(
                            `Unhandled error in unit of work${error instanceof Error ? `: ${error.message}` : ''}`,
                        ),
                    ),
                ),
        );
}
