# @ddd-components/scaffolder

## 2.5.0

### Minor Changes

- 7d9ea97: Removed redundant type declaration.

## 2.4.0

### Minor Changes

- ec40839: Renamed beginWith() to pure() to use established functional programming terminology. Added pureAsync() to have an async version of pure() as well.

### Patch Changes

- Updated dependencies [ec40839]
    - @ddd-components/runtime@0.9.0

## 2.3.0

### Minor Changes

- 9deee2e: Better type safety in Postgres repositories

## 2.2.0

### Minor Changes

- 14294bf: Fixed the generated path names in imports

## 2.1.0

### Minor Changes

- 8497cd2: Support the Unit of Work pattern
- 9cce4b6: Updated PostgreSQL repository implementation template to use `WithUnitOfWork` and `withUnitOfWork`. Generated repositories now use `db.startTransaction()` with explicit commit/rollback, access Kysely via `trx.kyselyTrx`, and strip function-valued properties via a `withoutFunctions` helper before inserting or updating rows.

### Patch Changes

- 7efa009: Refactored the domain service template to chain `.andThen()` calls directly on the `transact(...)` result instead of nesting them inside the `transact` callback. Generated code now follows a flatter, more readable `AsyncResult` chain when an aggregate is involved.

## 2.0.1

### Patch Changes

- e1f0fc3: Removed a default value so that the AI assistant needs to indicate the architectural layer ("domain" or "application") explicitly.

## 2.0.0

### Major Changes

- f47b845: Feature: Optional aggregate name parameter so generated code will be in aggregate-related output folders

## 1.0.2

### Patch Changes

- a3a323c: Cleaned up some minor style issues in the generated code.

## 1.0.1

### Patch Changes

- afd5a6b: Updated the documentation so readers know that there is a plugin for OpenClaw now as well.
- Updated dependencies [afd5a6b]
    - @ddd-components/runtime@0.8.3

## 1.0.0

### Major Changes

- d1a56ee: First version with Kysely as a query builder for PostgreSQL

### Patch Changes

- Updated dependencies [d1a56ee]
    - @ddd-components/runtime@0.8.2

## 0.13.1

### Patch Changes

- Updated dependencies [3bf43d7]
    - @ddd-components/runtime@0.8.1

## 0.13.0

### Minor Changes

- 9fb7441: Simplified the generated PostgreSQL repos

## 0.12.0

### Minor Changes

- 5cdc28c: The transaction function inside the repositories must return AsyncResult<T,E> again.

## 0.11.0

### Minor Changes

- 2c6c9d7: Some templates did not use the environment variables of the MCP server's configuration

## 0.10.2

### Patch Changes

- 78c7f32: Output file is now called mcp4ddd.js, not index.js anymore
- 4e3b907: Some cosmetic changes to the scaffolder templates

## 0.10.1

### Patch Changes

- 01e4aa3: Fixed a typo in the entity template.

## 0.10.0

### Minor Changes

- 12a56a2: Added automatic typed ID field generation for DDD entities

## 0.9.0

### Minor Changes

- de557dc: feat(scaffolder)!: add aggregate support to domain service generation
    - Added aggregateName parameter to generateDomainService input schema
    - Updated domainService.hbs template to conditionally generate transaction-based services
    - Improved error messages to include aggregate IDs
    - Fixed return type handling to prevent AsyncResult nesting

- ae2542e: Updated DynamoDB repository template to properly handle transaction failures using AsyncResult instead of throwing exceptions.
- 9fcc50d: Added write transactions for DynamoDB repositories.

## 0.8.0

### Minor Changes

- 39e07fd: Fixed bus in the DynamoDB generator that had to do with async functions.
- 8ab87a7: Made the generated PostgreSQL repositories transaction-aware.
- a398d86: Fixed the PostgreSQL repository generator so it generates compilable code now.
- 0bae369: Made the database table name for DynamoDB repositories configurable.

### Patch Changes

- Updated dependencies [0bae369]
    - @ddd-components/runtime@0.8.0

## 0.7.11

### Patch Changes

- Updated dependencies [11e093f]
    - @ddd-components/runtime@0.7.9

## 0.7.10

### Patch Changes

- 8f6299d: ci: Testing patch bump on the scaffolder

## 0.7.9

### Patch Changes

- Updated dependencies [5ccb8ad]
    - @ddd-components/runtime@0.7.8

## 0.7.8

### Patch Changes

- 5f11e8f: ci: Testing whether everything is now in sync.
- Updated dependencies [5f11e8f]
    - @ddd-components/runtime@0.7.7

## 0.7.7

### Patch Changes

- f792c5b: ci: Testing whether changesets are now properly removed.
- Updated dependencies [f792c5b]
    - @ddd-components/runtime@0.7.6

## 0.7.6

### Patch Changes

- ae69a64: chore: Updated GitHub actions file for better scaffolder releasing.
- 93b23aa: fix(scaffolder): Made the release tag resemble the runtime release tag schema.
- Updated dependencies [ae69a64]
- Updated dependencies [93b23aa]
    - @ddd-components/runtime@0.7.5

## 0.7.5

### Patch Changes

- 9e426ed: chore: updated the README to clarify the installation process

## 0.7.4

### Patch Changes

- 85733a2: Extracted `safeAsync` into the runtime library.
- 9df89c0: docs(runtime): Added README to document the usage of the package.
- Updated dependencies [85733a2]
- Updated dependencies [9df89c0]
    - @ddd-components/runtime@0.7.4

## 0.7.3

### Patch Changes

- 386672d: Brushed up the docs and updated the sample prompts in the testbed package.
- Updated dependencies [386672d]
    - @ddd-components/runtime@0.7.3

## 0.7.2

### Patch Changes

- Still fixing the version numbering problem.
- Updated dependencies
    - @ddd-components/runtime@0.7.2

## 0.7.1

### Patch Changes

- 93ea4a4: Preparing the first real release, still trying.
- Updated dependencies [93ea4a4]
    - @ddd-components/runtime@0.7.1
