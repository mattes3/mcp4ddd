# @ddd-components/scaffolder

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
