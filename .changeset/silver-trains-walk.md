---
'@ddd-components/scaffolder': minor
---

Updated PostgreSQL repository implementation template to use `WithUnitOfWork` and `withUnitOfWork`. Generated repositories now use `db.startTransaction()` with explicit commit/rollback, access Kysely via `trx.kyselyTrx`, and strip function-valued properties via a `withoutFunctions` helper before inserting or updating rows.
