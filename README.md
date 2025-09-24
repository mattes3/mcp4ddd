# mcp4ddd

[![npm version](https://img.shields.io/npm/v/@ddd-components/runtime.svg)](https://npmjs.com/package/@ddd-components/runtime)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/mattes3/mcp4ddd/workflows/Build%20&%20Release/badge.svg)](https://github.com/mattes3/mcp4ddd/actions)

A monorepo containing an MCP server that generates code based on the Domain-Driven Design methodology, along with shared runtime utilities and a testbed for safe experimentation.

Matthias Bohlen wrote it so that students of his [Domain-Driven Design classes](https://mbohlen.de/domain-driven-design-cpsa-a/?utm_source=ddd-scaffolder) get a jumpstart with DDD.

## Core Purpose
This project provides an MCP (Model Context Protocol) server that scaffolds Domain-Driven Design (DDD) components including entities, value objects, repositories, and domain services. It uses Handlebars templates to generate TypeScript code with proper DDD patterns.

## Key Features
- Generate DDD entities (optionally as aggregate roots)
- Generate value objects
- Generate repository interfaces
- Generate domain services
- Generate DynamoDB repository implementations
- Generate PostgreSQL repository implementations
- Automatic test file generation
- Zod schema validation for inputs

## Environment Variables

The MCP server supports several environment variables to customize its behavior:

| Variable Name | Default Value | Meaning |
|---------------|---------------|---------|
| `BOUNDED_CONTEXTS_PARENT_FOLDER` | `packages/domainlogic` | Configures the parent folder for generated bounded contexts |
| `BASIC_TYPES_FROM` | `@ddd-components/runtime` | Specifies the import path for basic types used in domain services |
| `BASIC_ERROR_TYPES_FROM` | `@ddd-components/runtime` | Specifies the import path for basic error types used in domain services |
| `DYNAMODB_CONFIG_FROM` | `@ddd-components/runtime` | Specifies the import path for DynamoDB configuration used in repository implementations |

## Installation

### MCP Server
Download the latest release from [GitHub Releases](https://github.com/mattes3/mcp4ddd/releases) and take the file `index.js`. You need to have NodeJS installed on your machine to be able to run it.

### Runtime Library
```bash
npm install  @ddd-components/runtime
```

### Dependencies
```bash
npm install  ts-results-es  zod
```

| Library | What it does |
| ------- | -------- |
| [ts-results-es](https://ts-results-es.readthedocs.io/en/latest/) | A TypeScript implementation of Rust's Result and Option objects. Brings compile-time error checking and optional values to TypeScript. |
| [zod](https://zod.dev/) | TypeScript-first schema validation with static type inference |

## Usage

### MCP Server
The MCP server provides tools for generating DDD components. It can be integrated with MCP clients like Claude Desktop.

Configure your MCP client to use the server:
```json
{
    "mcpServers": {
        "ddd-scaffolder": {
            "command": "node",
            "args": ["./path/to/mcp4ddd/index.js"],
            "env": {
                "BASIC_TYPES_FROM": "@ddd-components/runtime",
                "BASIC_ERROR_TYPES_FROM": "@ddd-components/runtime",
                "DYNAMODB_CONFIG_FROM": "@ddd-components/runtime",
                "BOUNDED_CONTEXTS_PARENT_FOLDER": "packages/domainlogic"
            }
        }
    }
}
```

The AI assistant that you use with this MCP server will "see" that it can generate entities, value objects, services, and repositories. You can use the following environment variables to influence its behavior:

- The generated code will be written to subdirectories of `BOUNDED_CONTEXTS_PARENT_FOLDER`.
- The basic types that the generated code needs at runtime will be imported from `BASIC_TYPES_FROM`.
- The basic error types will be imported from `BASIC_ERROR_TYPES_FROM`.
- You can override these module names to fit your project environment.

### Runtime Library
The runtime library provides utilities for DDD components:

```typescript
import type { Branded, SingleError, TechError, ValidationError } from '@ddd-components/runtime';

import { beginWith, singleError, techError, validationError } from '@ddd-components/runtime';

// Use in generated and in hand-written code
```

## API Reference

### MCP Tools
- `generateEntity`: Creates DDD entities with optional aggregate root
- `generateValueObject`: Generates immutable value objects
- `generateRepository`: Creates repository interfaces
- `generateDomainService`: Generates domain services with dependency injection
- `generateDynamoDBRepository`: Generates DynamoDB repository implementations using ElectroDB
- `generatePostgreSQLRepository`: Generates PostgreSQL repository implementations using Objection.js

### Runtime Exports
- `BasicErrorTypes`: Error type definitions
- `BasicModelTypes`: Basic model utilities
- `WorkflowStart`: Workflow utilities

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT - see [LICENSE](LICENSE) for details.

## Target Users
Developers implementing Domain-Driven Design in TypeScript projects who want to quickly scaffold DDD components with consistent patterns.
